const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const validator = require('./validate-artifacts.js');

const html = fs.readFileSync(path.join(__dirname, '../assets/quiz-template.html'), 'utf8');
const match = html.match(/<script id="study-config" type="application\/json">([\s\S]*?)<\/script>/);
assert.ok(match, 'quiz template must expose study-config');
const config = JSON.parse(match[1]);

function errorsFor(candidate) {
  validator.errors.length = 0;
  validator.warnings.length = 0;
  validator.quizConfig(candidate, 'policy fixture');
  return [...validator.errors];
}

function expectRejected(candidate, fragment) {
  const errors = errorsFor(candidate);
  assert.ok(errors.some(error => error.includes(fragment)), `expected rejection containing “${fragment}”; got ${errors.join(' | ')}`);
}

assert.ok(config.levels.some(level => level.kind === 'concepts'), 'template needs a dedicated concepts level');
assert.ok(config.levels.every(level => level.drawCount >= 5), 'every level must draw at least five questions');
assert.ok(config.levels.every(level => level.passRatio === 0.8 && level.passCount === undefined), 'every level must use the 80% pass ratio');
assert.ok(config.questions.every(question => ['single', 'multiple', 'boolean'].includes(question.type)), 'template must contain only objective question types');
assert.match(html, /多选题 · 全部选对才得分/, 'multiple-choice label must be visible');
assert.match(html, /function coverModel\(/, 'cover must derive unlock and best-score visualization data from state');

const noConcept = structuredClone(config);
noConcept.levels.forEach(level => delete level.kind);
expectRejected(noConcept, 'concepts');

const tooShort = structuredClone(config);
tooShort.levels[0].drawCount = 4;
expectRejected(tooShort, 'drawCount >= 5');

const weakThreshold = structuredClone(config);
weakThreshold.levels[0].passRatio = 0.7;
expectRejected(weakThreshold, 'passRatio must equal 0.8');

const forbiddenType = structuredClone(config);
forbiddenType.questions[0].type = 'text';
forbiddenType.questions[0].answer = ['x'];
delete forbiddenType.questions[0].choices;
expectRejected(forbiddenType, 'unsupported question type');

const brokenExample = structuredClone(config);
brokenExample.examples = [{id: 'ppt-example', source: 'PPT 第 8 页', stem: '题干', conditions: [], formulas: [], figure: null}];
brokenExample.questions[0].sourceKind = 'ppt-example';
brokenExample.questions[0].exampleId = 'ppt-example';
expectRejected(brokenExample, 'incomplete PPT example');

const script = html.match(/<script>\s*([\s\S]*?)<\/script>\s*<\/body>/)[1];
const context = {console, structuredClone, Blob, URL: {createObjectURL() {}, revokeObjectURL() {}}, setTimeout, clearTimeout};
vm.createContext(context);
vm.runInContext(script.replace(/document\.addEventListener\('DOMContentLoaded',[\s\S]*$/,'').replace(/^\s*const config=.*$/m, `const config=${JSON.stringify(config)};`), context);
assert.ok(context.studyQuest, 'template must expose studyQuest API');
const multiple = config.questions.find(question => question.type === 'multiple');
assert.ok(multiple, 'fixture requires a multiple-choice question');
assert.equal(context.studyQuest.grade(multiple, multiple.answer.slice(0, -1)), false, 'missing selection must fail');
assert.equal(context.studyQuest.grade(multiple, [...multiple.answer, multiple.choices.find(choice => !multiple.answer.includes(choice.id)).id]), false, 'extra selection must fail');
assert.equal(context.studyQuest.grade(multiple, [...multiple.answer]), true, 'exact answer set must pass');

console.log('PASS quiz policy regression');
