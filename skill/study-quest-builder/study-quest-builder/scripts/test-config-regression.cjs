'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),{test}=require('node:test');
const validator=require('./validate-artifacts.js');
const html=fs.readFileSync(path.join(__dirname,'../assets/quiz-template.html'),'utf8');
const clone=value=>JSON.parse(JSON.stringify(value));

function fixture(drawCount=5,ratings=[5,5,5,2],counts=[3,4,4,2]){
  return {schemaVersion:1,courseId:'config-regression',courseTitle:'Config fixture',noteRevision:'r1',bankRevision:'r1',
    modules:ratings.map((rating,i)=>({id:`m${i}`,name:`Module ${i}`,rating,knowledgePoints:['fixture']})),
    levels:[{id:'level',name:'Concept fixture',description:'Objective questions across modules',kind:'concepts',prerequisites:[],drawCount,passRatio:0.8}],
    questions:counts.flatMap((count,i)=>Array.from({length:count},(_,j)=>({id:`q${i}-${j}`,levelId:'level',moduleId:`m${i}`,knowledgePoints:['fixture'],source:'Regression fixture',prompt:'Choose ok',type:'single',choices:[{id:'ok',text:'OK'},{id:'no',text:'No'}],answer:'ok',explanation:'Fixture answer'})))};
}
function configErrors(config){validator.errors.length=0;validator.warnings.length=0;validator.quizConfig(config,'config regression');return [...validator.errors];}
function differingDraws(config,seeds=500){
  const reversed=clone(config);reversed.modules.forEach(module=>module.rating=6-module.rating);
  const app=validator.loadEngine(html,config),reverseApp=validator.loadEngine(html,reversed);let differences=0;
  for(let seed=1;seed<=seeds;seed++){
    const rng=()=>{let state=seed;return ()=>{state=(Math.imul(state,1664525)+1013904223)>>>0;return state/4294967296;};};
    if(JSON.stringify(app.sample('level',rng()).sort())!==JSON.stringify(reverseApp.sample('level',rng()).sort()))differences++;
  }
  return differences;
}

test('reject a nominal weighted slot when the low-rated module has no residual candidate',()=>{
  const config=fixture(5,[5,5,5,2],[3,4,4,1]);
  assert.equal(differingDraws(config),0);
  assert.ok(configErrors(config).some(error=>error.includes('residual')));
});

test('accept a compliant objective bank with real residual rating influence',()=>{
  for(const config of [fixture(),fixture(5,[5,4,5,2],[3,4,4,1])]){
    assert.deepEqual(configErrors(config),[]);
    assert.ok(differingDraws(config)>0);
  }
});

test('reject complete unequal-rated bank exhaustion',()=>{
  assert.ok(configErrors(fixture(13)).some(error=>error.includes('exhaust')));
  assert.deepEqual(configErrors(fixture(13,[3,3,3,3])),[],'equal ratings need no cross-rating influence');
});

test('allow additional practice levels while keeping one concepts level',()=>{
  const config=fixture(),second={...clone(config.levels[0]),id:'second',name:'Practice',kind:'practice',prerequisites:['level']};
  config.levels.push(second);
  config.questions.push(...config.questions.map(question=>({...question,id:`second-${question.id}`,levelId:'second'})));
  assert.deepEqual(configErrors(config),[]);
});

test('reject forbidden types, short rounds and a weak threshold',()=>{
  const textType=fixture();textType.questions[0].type='text';delete textType.questions[0].choices;textType.questions[0].answer=['ok'];
  assert.ok(configErrors(textType).some(error=>error.includes('unsupported question type')));
  const short=fixture();short.levels[0].drawCount=4;assert.ok(configErrors(short).some(error=>error.includes('drawCount >= 5')));
  const weak=fixture();weak.levels[0].passRatio=0.7;assert.ok(configErrors(weak).some(error=>error.includes('passRatio must equal 0.8')));
});
