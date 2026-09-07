'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const validator=require('./validate-artifacts.js');
const html=fs.readFileSync(path.join(__dirname,'../assets/quiz-template.html'),'utf8');
const config=JSON.parse(html.match(/<script id="study-config" type="application\/json">([\s\S]*?)<\/script>/)[1]);
validator.engineChecks(html,config,'original sampler');
assert.equal(validator.errors.length,0,validator.errors.join('\n'));
// Mutate only sample()'s actual fill step; weighted() remains fully functional.
const target='weighted(pool.filter(q=>!used.has(q.id)),level.drawCount-selected.length,rng)';
assert.ok(html.includes(target),'sample mutation target must exist');
const mutant=html.replace(target,'shuffle(pool.filter(q=>!used.has(q.id)),rng).slice(0,level.drawCount-selected.length)');
validator.engineChecks(mutant,config,'uniform sample mutant');
assert.ok(validator.errors.some(error=>error.includes('sample rating influence')),'engineChecks must reject uniform sampling inside actual sample()');
console.log('PASS sampling mutation regression: original accepted; uniform sample() rejected');
