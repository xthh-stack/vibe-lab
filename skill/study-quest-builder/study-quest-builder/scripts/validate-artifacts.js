#!/usr/bin/env node
'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const errors=[],warnings=[];
const fail=(label,message)=>errors.push(`${label}: ${message}`);
const warn=(label,message)=>warnings.push(`${label}: ${message}`);
const check=(ok,label,message)=>{if(!ok)fail(label,message);return !!ok;};
const obj=v=>v!==null&&typeof v==='object'&&!Array.isArray(v);
const text=v=>typeof v==='string'&&v.trim().length>0;
const id=v=>text(v)&&/^[A-Za-z0-9][A-Za-z0-9._-]*$/.test(v)&&!['__proto__','constructor','prototype'].includes(v);
const unique=(values,label)=>check(new Set(values).size===values.length,label,'duplicate IDs/values');
function scripts(html){return [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi)].map(m=>({attributes:m[1],body:m[2]}));}
function configuration(html,label,legacy){const block=scripts(html).find(s=>/\bid\s*=\s*["']study-config["']/i.test(s.attributes));if(!block){if(legacy){warn(label,'legacy HTML: no study-config; data contracts and engine behavior NOT VERIFIED');return null;}fail(label,'missing study-config JSON');return null;}try{return JSON.parse(block.body);}catch(e){fail(label,`invalid configuration JSON: ${e.message}`);return null;}}
function markdown(content,label){
  const lines=content.replace(/\r/g,'').split('\n');let block=false,fence=false;
  for(let i=0;i<lines.length;i++){const line=lines[i],loc=`${label}:${i+1}`;if(/^\s*```/.test(line)){fence=!fence;continue;}if(fence)continue;
    if(line.trim()==='$$'){block=!block;continue;}
    if(line.includes('$$'))fail(loc,'block math delimiters must occupy their own lines');
    if(/^\s*\|/.test(line)){check(!block,loc,'table inside block math');const cells=line.trim().replace(/^\||\|$/g,'').split(/(?<!\\)\|/);if(i&&/^\s*\|/.test(lines[i-1])){const prior=lines[i-1].trim().replace(/^\||\|$/g,'').split(/(?<!\\)\|/);check(cells.length===prior.length,loc,'inconsistent table cell count/unescaped pipe');}}
    if(!block)check((line.match(/(?<!\\)\$/g)||[]).length%2===0,loc,'unbalanced inline math');
  }
  check(!block,label,'unclosed block math');check(!fence,label,'unclosed code fence');
  check(!/\\vec(?:\s|\{)/.test(content)||/<!--\s*retained-vector:/.test(content),label,'vector decoration retained without explicit source reason');
  const firstSection=lines.findIndex(line=>/^#{1,6}\s+[一二三四五六七八九十0-9]/.test(line));
  check(firstSection>=0&&/^#{1,6}\s+一[、.．\s]/.test(lines[firstSection]),label,'first numbered section must begin 一');
  const opening=lines.slice(0,firstSection<0?lines.length:firstSection).join('\n');
  const table=/\|\s*定义量名称、符号\s*\|\s*物理意义\s*\|\s*包含该新定义量的本课公式\s*\|/.test(opening);
  check(table||opening.includes('本课无新增定义量'),label,'missing opening definition table or no-new-quantity statement');
  const openingContent=opening.split('\n').filter(line=>line.trim()&&!/^#{1,6}\s/.test(line)&&!/^\s*<!--.*-->\s*$/.test(line));
  check(!openingContent.length||openingContent[0].includes('本课无新增定义量')||openingContent[0].includes('定义量名称、符号'),label,'definition slot must precede introductory prose');
  check(!/\\\[|\\\]|\\n(?=[#|])/.test(content),label,'noncanonical block delimiter or literal escaped newline');
  if(table){const line=opening.split('\n').findIndex(v=>v.includes('定义量名称、符号'));check(/^\s*\|?\s*:?-{3,}/.test(lines[line+1]||''),label,'definition table needs a Markdown separator row');}
  warn(label,'source fidelity, definition completeness and rendered Obsidian layout require review');
}
function htmlChecks(html,label){
  const ids=[...html.replace(/<script\b[^>]*>[\s\S]*?<\/script\s*>/gi,'').matchAll(/\bid\s*=\s*["']([^"']+)["']/gi)].map(m=>m[1]);unique(ids,label);
  check(/<meta\b[^>]*name=["']viewport["']/i.test(html),label,'missing responsive viewport');
  check(!/<(?:script|link|iframe|img|audio|video|source)\b[^>]*(?:src|href)\s*=\s*["'](?!data:|#)[^"']+/i.test(html),label,'external resource dependency; embed assets in the single file');
  check(!/@import\b|url\(\s*["']?(?:https?:|\/\/)|\b(?:fetch|XMLHttpRequest|WebSocket|EventSource|sendBeacon|import)\s*\(/i.test(html),label,'network resource/API found');
  check(!/<script\b[^>]*\bsrc\s*=/i.test(html)&&!/<link\b[^>]*rel=["']stylesheet["']/i.test(html),label,'single HTML must embed scripts/styles');
  check(!/\.innerHTML\s*=|insertAdjacentHTML\s*\(/.test(html),label,'unsafe HTML injection API found; render structured course data with DOM APIs');
  for(const script of scripts(html)){if(/type\s*=\s*["']application\/json["']/i.test(script.attributes))continue;try{new vm.Script(script.body);}catch(e){fail(label,`JavaScript syntax: ${e.message}`);}}
  warn(label,'static IDs/syntax/offline inspection does not certify browser execution or mobile layout');
}
function modules(config,label,ratings){
  if(!check(obj(config),label,'config must be object'))return false;
  check(config.schemaVersion===1,label,'schemaVersion must be 1');check(id(config.courseId),label,'invalid stable courseId');check(text(config.courseTitle),label,'missing courseTitle');check(text(config.noteRevision),label,'missing noteRevision');
  if(!check(Array.isArray(config.modules)&&config.modules.length>=1&&config.modules.length<=10,label,'requires 1–10 modules'))return false;
  unique(config.modules.map(m=>m.id),label);
  for(const m of config.modules){check(id(m.id)&&text(m.name),label,'module ID/name invalid');check(Array.isArray(m.knowledgePoints)&&m.knowledgePoints.length>0&&m.knowledgePoints.every(text),label,`knowledgePoints missing for ${m.id}`);if(ratings)check(Number.isInteger(m.rating)&&m.rating>=1&&m.rating<=5,label,`rating invalid for ${m.id}`);}
  return true;
}
function ratingExport(data,config,label){
  if(!modules(data,label,true))return;
  check(data.kind==='study-importance',label,'wrong ratings kind');check(text(data.exportedAt)&&Number.isFinite(Date.parse(data.exportedAt)),label,'invalid exportedAt');
  check(data.courseId===config.courseId&&data.noteRevision===config.noteRevision,label,'course/revision mismatch');
  const expected=new Map(config.modules.map(m=>[m.id,m]));check(data.modules.length===expected.size,label,'module count mismatch');
  for(const m of data.modules){const original=expected.get(m.id);check(!!original,label,`unknown module ${m.id}`);if(original)check(m.name===original.name&&JSON.stringify(m.knowledgePoints)===JSON.stringify(original.knowledgePoints),label,`changed knowledge mapping ${m.id}`);}
}
function quizConfig(config,label){
  if(!modules(config,label,true))return;
  check(text(config.bankRevision),label,'missing bankRevision');
  if(!check(Array.isArray(config.levels)&&config.levels.length>0&&Array.isArray(config.questions)&&config.questions.length>0,label,'levels/questions must be nonempty arrays'))return;
  const levelIds=config.levels.map(l=>l.id),moduleIds=config.modules.map(m=>m.id);unique(levelIds,label);unique(config.questions.map(q=>q.id),label);
  check(config.levels.filter(level=>level.kind==='concepts').length===1,label,'requires exactly one dedicated kind:"concepts" level');
  for(const level of config.levels){check(id(level.id)&&text(level.name)&&text(level.description),label,'level ID/name/description missing');check(['concepts','practice'].includes(level.kind),label,`invalid level kind: ${level.id}`);if(!check(Array.isArray(level.prerequisites),label,'prerequisites must be array'))continue;unique(level.prerequisites,label);check(level.prerequisites.every(i=>levelIds.includes(i)&&i!==level.id),label,'unknown/self prerequisite');const bank=config.questions.filter(q=>q.levelId===level.id);check(Number.isInteger(level.drawCount)&&level.drawCount>=5&&level.drawCount<=bank.length,label,`drawCount >= 5 and <= bank size required: ${level.id}`);if(bank.length<level.drawCount*2)warn(label,`${level.id}: bank/draw below 2; justify from sparse source or reduce counts`);check(level.passCount===undefined,label,`passCount is not allowed: ${level.id}`);check(level.passRatio===0.8,label,`passRatio must equal 0.8: ${level.id}`);}
  const visiting=new Set(),visited=new Set();function walk(levelId){if(visiting.has(levelId)){fail(label,'cyclic level prerequisites');return;}if(visited.has(levelId))return;visiting.add(levelId);for(const next of config.levels.find(l=>l.id===levelId)?.prerequisites||[])walk(next);visiting.delete(levelId);visited.add(levelId);}levelIds.forEach(walk);
  // Diagnose the delivered configuration, not only the synthetic sampler fixture.
  // sample() reserves one draw per represented module when drawCount permits it.
  const ratings=new Map(config.modules.map(m=>[m.id,m.rating]));
  for(const level of config.levels){
    const bank=config.questions.filter(q=>q.levelId===level.id),counts=new Map();
    for(const q of bank)counts.set(q.moduleId,(counts.get(q.moduleId)||0)+1);
    const represented=[...counts.keys()];
    // Single-module/equal-rated levels have no cross-rating influence to demonstrate.
    if(new Set(represented.map(id=>ratings.get(id))).size<=1)continue;
    const coverage=level.drawCount>=represented.length,weightedSlots=level.drawCount-(coverage?represented.length:0);
    // Reservation identity is random, but exactly one candidate per module is removed.
    const residual=represented.map(id=>({id,count:counts.get(id)-(coverage?1:0),rating:ratings.get(id)})).filter(m=>m.count>0);
    const residualCount=residual.reduce((sum,m)=>sum+m.count,0);
    if(weightedSlots===0)
      fail(label,`${level.id}: no weighted slots; coverage consumes all ${level.drawCount} draws across ${represented.length} unequally rated modules, so actual sample() cannot use ratings. Increase drawCount when supported or reorganize/reduce levels; sparse evidence remains an unmet weighting requirement, not a PASS.`);
    else if(weightedSlots>=residualCount)
      fail(label,`${level.id}: weighted draws exhaust the residual bank (${weightedSlots} slots / ${residualCount} candidates); every question is included regardless of ratings. Reduce draws or add source-supported candidates with unequal residual ratings.`);
    else if(new Set(residual.map(m=>m.rating)).size<2)
      fail(label,`${level.id}: no residual cross-rating competition after coverage (${residual.map(m=>`${m.id}: ${m.count} candidates at rating ${m.rating}`).join('; ')}). ${weightedSlots} nominal weighted slot(s) cannot demonstrate rating influence. Add source-supported candidates from a differently rated module or reorganize the level; extra same-rated questions or more draws do not repair this pool.`);
  }
  const examples=Array.isArray(config.examples)?config.examples:[];unique(examples.map(example=>example.id),label);const exampleIds=new Set(examples.map(example=>example.id));
  for(const example of examples){const loc=`${label}:${example.id||'example'}`;check(id(example.id)&&Number.isInteger(example.page)&&example.page>0&&text(example.source)&&text(example.stem),loc,'incomplete PPT example identity/page/stem');check(Array.isArray(example.conditions)&&example.conditions.length>0&&example.conditions.every(text),loc,'incomplete PPT example conditions');check(Array.isArray(example.formulas)&&example.formulas.length>0&&example.formulas.every(text),loc,'incomplete PPT example formulas');const figureOk=obj(example.figure)&&['none','polyline','axes-points'].includes(example.figure?.kind);check(figureOk,loc,'incomplete PPT example figure');if(figureOk&&example.figure.kind!=='none'){const pair=value=>Array.isArray(value)&&value.length===2&&value.every(Number.isFinite),axis=value=>obj(value)&&pair(value.from)&&pair(value.to)&&text(value.label);check(text(example.figure.viewBox)&&axis(example.figure.xAxis)&&axis(example.figure.yAxis),loc,'incomplete PPT example axes/viewBox');check(Array.isArray(example.figure.points)&&example.figure.points.length>=2&&example.figure.points.every(pair),loc,'incomplete PPT example coordinates/key points');check(Array.isArray(example.figure.labels)&&example.figure.labels.every(item=>obj(item)&&pair(item.at)&&text(item.text)),loc,'incomplete PPT example labels');}}
  for(const q of config.questions){const loc=`${label}:${q.id}`;check(id(q.id)&&levelIds.includes(q.levelId)&&moduleIds.includes(q.moduleId),loc,'invalid question/level/module ID');check(text(q.prompt)&&text(q.explanation)&&text(q.source),loc,'prompt/explanation/source missing');check(Array.isArray(q.knowledgePoints)&&q.knowledgePoints.length>0&&q.knowledgePoints.every(text),loc,'question knowledgePoints missing');check(['single','multiple','boolean'].includes(q.type),loc,`unsupported question type: ${q.type}`);
    if(q.sourceKind==='ppt-example'||q.exampleId!==undefined)check(q.sourceKind==='ppt-example'&&id(q.exampleId)&&exampleIds.has(q.exampleId),loc,'PPT example question must reference a complete shared example');
    const choices=q.choices||[];if(['single','boolean','multiple'].includes(q.type)){check(Array.isArray(choices)&&choices.length>=2&&choices.every(c=>id(c.id)&&text(c.text)),loc,'invalid choices');unique(choices.map(c=>c.id),loc);}const ids=choices.map(c=>c.id);
    if(['single','boolean'].includes(q.type)){check(typeof q.answer==='string'&&ids.includes(q.answer),loc,'answer must identify a choice');if(q.type==='boolean')check(choices.length===2,loc,'boolean needs two choices');}
    else if(q.type==='multiple')check(Array.isArray(q.answer)&&q.answer.length>0&&new Set(q.answer).size===q.answer.length&&q.answer.every(a=>ids.includes(a)),loc,'invalid answer list');
    if(q.answerChecks!==undefined)check(Array.isArray(q.answerChecks)&&q.answerChecks.length>0&&q.answerChecks.every(c=>obj(c)&&text(c.form)&&Object.hasOwn(c,'accept')&&Object.hasOwn(c,'reject')),loc,'answerChecks requires nonempty {form,accept,reject} cases');
  }
}
function loadEngine(html,config,storage=new Map()){
  const context=vm.createContext({STUDY_CONFIG:config,localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v),removeItem:k=>storage.delete(k)}});
  for(const script of scripts(html))if(!/application\/json/.test(script.attributes))new vm.Script(script.body).runInContext(context,{timeout:2000});
  if(!context.studyQuest)throw Error('quiz must expose studyQuest validation API');return context.studyQuest;
}
function correctInput(q){return q.type==='text'?q.answer[0]:JSON.parse(JSON.stringify(q.answer));}
function wrongInput(q){if(['single','boolean'].includes(q.type))return q.choices.find(c=>c.id!==q.answer).id;if(q.type==='number')return q.answer+q.tolerance+1;if(q.type==='text')return '__incorrect__';if(q.type==='order')return [...q.answer].reverse();if(q.type==='multiple'){const all=q.choices.map(c=>c.id);return all.length===q.answer.length?[all[0]]:all;}const out={...q.answer};const key=q.left[0].id;out[key]=q.right.find(r=>r.id!==q.answer[key]).id;return out;}
function sampleRatingChecks(html){
  // Equal-sized banks isolate rating influence. drawCount=3 reserves one per module,
  // then leaves one weighted slot; drawCount=1 tests the branch without coverage.
  for(const drawCount of [3,1])for(const ratings of [[5,1],[1,5]]){
    const fixture={schemaVersion:1,courseId:'sampling-regression',courseTitle:'Sampling fixture',noteRevision:'r1',bankRevision:'r1',modules:['a','b'].map((id,i)=>({id,name:id,rating:ratings[i],knowledgePoints:['fixture']})),levels:[{id:'level',name:'Fixture',description:'Balanced bank',prerequisites:[],drawCount,passRatio:0.7}],questions:['a','b'].flatMap(moduleId=>Array.from({length:4},(_,i)=>({id:`${moduleId}-${i}`,levelId:'level',moduleId,knowledgePoints:['fixture'],source:'Regression fixture',type:'text',prompt:`${moduleId} ${i}`,answer:['ok'],explanation:'Fixture answer'})))};
    const app=loadEngine(html,fixture),counts={a:0,b:0};
    for(let i=0;i<600;i++){
      let call=0;const reserved=drawCount===3?2:0;
      const drawn=app.sample('level',()=>call++===reserved?(i+0.5)/600:0);
      assert.equal(drawn.length,drawCount);assert.equal(new Set(drawn).size,drawCount);
      for(const moduleId of ['a','b']){const count=drawn.filter(id=>id.startsWith(moduleId+'-')).length;if(reserved)assert.ok(count>=1,'sample must retain module coverage');counts[moduleId]+=count-(reserved?1:0);}
    }
    // Hand-derived 5:1 split of 600 equally spaced tickets, including positive low-weight draws.
    assert.deepEqual(counts,ratings[0]===5?{a:500,b:100}:{a:100,b:500},`sample rating influence: drawCount=${drawCount}, ratings=${ratings.join(':')}; low weight must remain possible and reversing ratings must reverse influence`);
  }
}
function engineChecks(html,config,label){
  try{
    sampleRatingChecks(html);
    const storage=new Map(),app=loadEngine(html,config,storage);let seed=17;const rng=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
    for(const level of config.levels){for(let i=0;i<30;i++){const drawn=app.sample(level.id,rng);assert.equal(drawn.length,level.drawCount);assert.equal(new Set(drawn).size,drawn.length);if(level.drawCount>=new Set(config.questions.filter(q=>q.levelId===level.id).map(q=>q.moduleId)).size)for(const module of new Set(config.questions.filter(q=>q.levelId===level.id).map(q=>q.moduleId)))assert.ok(drawn.some(id=>config.questions.find(q=>q.id===id).moduleId===module));}}
    for(const q of config.questions){assert.equal(app.grade(q,correctInput(q)),true,`${q.id} correct grading`);assert.equal(app.grade(q,wrongInput(q)),false,`${q.id} wrong grading`);
      if(q.type==='text')for(const answer of q.answer)assert.equal(app.grade(q,answer),true,`${q.id} configured variant grading`);
      for(const c of q.answerChecks||[]){assert.equal(app.grade(q,c.accept),true,`${q.id} answerChecks ${c.form}: source-supported answer rejected`);assert.equal(app.grade(q,c.reject),false,`${q.id} answerChecks ${c.form}: adversarial answer accepted`);}
    }
    const ordered=[],seen=new Set();while(ordered.length<config.levels.length){const next=config.levels.find(l=>!seen.has(l.id)&&l.prerequisites.every(id=>seen.has(id)));assert.ok(next,'acyclic levels');ordered.push(next);seen.add(next.id);}
    const dependent=config.levels.find(level=>level.prerequisites.length);if(dependent){const first=config.levels.find(level=>level.id===dependent.prerequisites[0]),failureApp=loadEngine(html,config);failureApp.start(first.id);const ids=failureApp.getState().session.questionIds;ids.forEach((qId,index)=>{const q=config.questions.find(item=>item.id===qId);failureApp.submit(index<Math.ceil(ids.length*0.8)-1?correctInput(q):wrongInput(q));failureApp.next();});assert.ok(!failureApp.getState().completed.includes(first.id),'below 80% completed a level');assert.ok(!failureApp.getState().unlocked.includes(dependent.id),'below 80% unlocked a dependent level');}
    for(const level of ordered){app.start(level.id);const ids=app.getState().session.questionIds;for(const qId of ids){const q=config.questions.find(q=>q.id===qId);app.submit(correctInput(q));const before=JSON.stringify(app.getState());app.submit(wrongInput(q));assert.equal(JSON.stringify(app.getState()),before,'repeat submit changed score');app.next();}assert.equal(app.getState().bestScores[level.id],100);assert.ok(app.getState().completed.includes(level.id));app.start(level.id);for(const qId of app.getState().session.questionIds){app.submit(wrongInput(config.questions.find(q=>q.id===qId)));app.next();}assert.equal(app.getState().bestScores[level.id],100,'lower score erased best');}
    const cover=app.coverModel();assert.deepEqual(cover.map(item=>({id:item.id,best:item.best,unlocked:item.unlocked,completed:item.completed})),config.levels.map(level=>({id:level.id,best:app.getState().bestScores[level.id],unlocked:app.getState().unlocked.includes(level.id),completed:app.getState().completed.includes(level.id)})),'cover model diverges from learning state');
    const wrongId=Object.keys(app.getState().wrongBook)[0];assert.ok(wrongId,'wrong record saved');const q=config.questions.find(q=>q.id===wrongId),count=app.getState().wrongBook[wrongId].wrongCount;
    app.mastery(wrongId);app.start(null,[wrongId]);app.submit(correctInput(q));app.next();assert.equal(app.getState().wrongBook[wrongId].mastered,true);app.start(null,[wrongId]);app.submit(wrongInput(q));assert.equal(app.getState().wrongBook[wrongId].wrongCount,count+1);assert.equal(app.getState().wrongBook[wrongId].mastered,false);
    const backup=JSON.stringify(app.exportData());assert.equal(app.validateBackup(backup).ok,true);assert.equal(loadEngine(html,config,storage).getState().wrongBook[wrongId].wrongCount,count+1,'reload lost record');assert.equal(loadEngine(html,config,storage).getState().session.answers.length,1,'reload lost submitted answer');
    const orderQuestion=config.questions.find(q=>q.type==='order');if(orderQuestion){app.start(null,[orderQuestion.id]);const partial=orderQuestion.answer.map((id,i)=>i?'':id);app.setDraft(partial);assert.equal(JSON.stringify(loadEngine(html,config,storage).getState().session.draft),JSON.stringify(partial),'reload lost partial ordering answer');app.importBackup(backup);}
    for(const mutate of [d=>d.courseId='wrong-course',d=>d.schemaVersion=999,d=>d.session.questionIds.push(d.session.questionIds[0]),d=>d.bestScores[config.levels[0].id]=-1,d=>d.wrongBook[wrongId].wrongCount=0,d=>d.session.options[wrongId]=['unknown']]){const invalid=JSON.parse(backup);mutate(invalid);assert.equal(app.validateBackup(invalid).ok,false,'accepted corrupt backup');const before=JSON.stringify(app.getState());assert.throws(()=>app.importBackup(invalid));assert.equal(JSON.stringify(app.getState()),before,'failed import mutated state');}
    assert.equal(app.validateBackup('{broken').ok,false);app.importBackup(backup);app.reset();assert.equal(Object.keys(app.getState().wrongBook).length,0);assert.equal(app.getState().session,null);assert.equal(app.getState().completed.length,0);assert.ok(Object.values(app.getState().bestScores).every(v=>v===0));assert.equal(app.config.questions.length,config.questions.length);assert.deepEqual(app.config.modules.map(m=>m.rating),config.modules.map(m=>m.rating));
    console.log(`PASS ${label}: engine draws, grading, lock, best scores, wrong book, reload, import and reset`);
  }catch(e){fail(label,`engine check failed: ${e.stack||e.message}`);}
}
function selfTest(){
  const root=path.resolve(__dirname,'..'),quiz=fs.readFileSync(path.join(root,'assets/quiz-template.html'),'utf8'),rating=fs.readFileSync(path.join(root,'assets/importance-checklist-template.html'),'utf8');
  const config=configuration(quiz,'quiz template');htmlChecks(quiz,'quiz template');quizConfig(config,'quiz template');if(!errors.length)engineChecks(quiz,config,'quiz template');htmlChecks(rating,'rating template');modules(configuration(rating,'rating template'),'rating template',false);
  // Hand-set weights ensure ignoring ratings fails, while the positive low weight still receives draws.
  const weightedConfig=JSON.parse(JSON.stringify(config));weightedConfig.modules[0].rating=5;weightedConfig.modules[1].rating=1;
  const app=loadEngine(quiz,weightedConfig),pool=[{id:'high',moduleId:weightedConfig.modules[0].id},{id:'low',moduleId:weightedConfig.modules[1].id}];let high=0,low=0;
  for(let i=0;i<600;i++){const chosen=app.weighted(pool,1,()=> (i+0.5)/600)[0];if(chosen.id==='high')high++;else low++;}
  check(high===500&&low===100,'self-test','weights must affect draws and low weight must stay possible');
  const before=errors.length;markdown('# 示例\n\n本课无新增定义量\n\n## 一、内容\n\n$$\nx=1\n$$\n','valid markdown fixture');check(errors.length===before,'self-test','valid Markdown rejected');
  for(const bad of ['# 示例\n## 1. 内容\n$broken','## 一、内容\n$$x=1$$','本课无新增定义量\n## 一、内容\n| a | b |\n| a | b | c |']){const index=errors.length,warningIndex=warnings.length;markdown(bad,'expected-invalid fixture');warnings.splice(warningIndex);if(errors.length===index)fail('self-test','invalid Markdown not rejected');else errors.splice(index);}
  const ratingConfig=configuration(rating,'rating template'),ratings={...ratingConfig,kind:'study-importance',exportedAt:'2026-09-06T12:00:00.000Z',modules:ratingConfig.modules.map(m=>({...m,rating:3}))};
  ratingExport(ratings,ratingConfig,'valid rating fixture');
  for(const mutate of [d=>d.courseId='other-course',d=>d.schemaVersion=99,d=>d.modules[0].rating=6,d=>d.modules[0].id=d.modules[1].id,d=>d.modules[0].knowledgePoints=['changed'],d=>d.exportedAt='invalid']){const invalid=JSON.parse(JSON.stringify(ratings)),index=errors.length;mutate(invalid);ratingExport(invalid,ratingConfig,'expected-invalid rating');if(errors.length===index)fail('self-test','invalid ratings not rejected');else errors.splice(index);}
}
function main(){const args=process.argv.slice(2),options={};if(args.includes('--help')){console.log('Usage: node validate-artifacts.js [--markdown FILE] [--importance FILE] [--ratings JSON] [--quiz FILE] [--legacy] [--self-test]');return;}for(let i=0;i<args.length;i++){const arg=args[i];if(['--self-test','--legacy'].includes(arg))options[arg]=true;else if(['--markdown','--importance','--ratings','--quiz'].includes(arg)&&args[i+1]&&!args[i+1].startsWith('--'))options[arg]=args[++i];else throw Error(`Unknown or incomplete argument: ${arg}`);}if(!args.length||args.includes('--help')){console.log('Usage: node validate-artifacts.js [--markdown FILE] [--importance FILE] [--ratings JSON] [--quiz FILE] [--legacy] [--self-test]');return;}
  if(options['--self-test'])selfTest();if(options['--markdown'])markdown(fs.readFileSync(options['--markdown'],'utf8'),options['--markdown']);let config=null;
  for(const flag of ['--importance','--quiz'])if(options[flag]){const label=options[flag],html=fs.readFileSync(label,'utf8');htmlChecks(html,label);if(flag==='--quiz'){check(html.includes('多选题 · 全部选对才得分'),label,'missing visible multiple-choice exact-set label');check(/function\s+coverModel\s*\(/.test(html)&&/createElementNS\s*\(/.test(html),label,'missing state-driven offline cover visualization');}const data=configuration(html,label,options['--legacy']);if(data){config=data;const prior=errors.length;if(flag==='--importance')modules(data,label,false);else{quizConfig(data,label);if(errors.length===prior)engineChecks(html,data,label);}}}
  if(options['--ratings']){if(!config)fail('--ratings','provide a configured --importance or --quiz for comparison');else ratingExport(JSON.parse(fs.readFileSync(options['--ratings'],'utf8')),config,options['--ratings']);}
}
if(require.main===module){try{main();}catch(e){fail('validator',e.message);}for(const message of warnings)console.log(`WARN ${message}`);for(const message of errors)console.error(`FAIL ${message}`);console.log(`${errors.length?'FAIL':'PASS'}: ${errors.length} error(s), ${warnings.length} warning(s)`);process.exitCode=errors.length?1:0;}
module.exports={markdown,htmlChecks,modules,ratingExport,quizConfig,loadEngine,engineChecks,errors,warnings};
