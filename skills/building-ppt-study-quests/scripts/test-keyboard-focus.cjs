'use strict';
const path=require('node:path'),assert=require('node:assert/strict'),{pathToFileURL}=require('node:url');
// Set PLAYWRIGHT_MODULE / EDGE_PATH for other test environments. No runtime dependency is added to the template.
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'C:/Users/zxt_o/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{
  const browser=await chromium.launch({executablePath:process.env.EDGE_PATH||'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true});
  const context=await browser.newContext({offline:true,viewport:{width:320,height:800}}),page=await context.newPage(),failures=[],pageErrors=[],requests=[];
  page.on('pageerror',error=>pageErrors.push(error.message));page.on('request',request=>{if(/^https?:/.test(request.url()))requests.push(request.url());});
  const activate=async locator=>{await locator.focus();await page.keyboard.press('Enter');};
  const active=()=>page.evaluate(()=>({id:document.activeElement.id,tag:document.activeElement.tagName,text:document.activeElement.textContent,outline:getComputedStyle(document.activeElement).outlineWidth}));
  async function check(name,run){try{await run();console.log('PASS '+name);}catch(error){failures.push(name+': '+error.message);console.error('FAIL '+name+': '+error.message);}}
  try{
    await page.goto(pathToFileURL(path.join(__dirname,'../assets/quiz-template.html')).href);
    await check('submit moves keyboard focus to feedback',async()=>{
      await page.evaluate(()=>studyQuest.start(null,['q-concept-1','q-concept-2']));
      await activate(page.locator('#home-button'));await activate(page.getByRole('button',{name:'继续未完成答题',exact:true}));
      await page.locator('fieldset input').first().focus();await page.keyboard.press('Space');
      await page.keyboard.press('Tab');assert.equal((await active()).text,'提交答案');await page.keyboard.press('Enter');
      assert.equal((await active()).id,'feedback');assert.equal((await active()).outline,'3px');
      await page.keyboard.press('Tab');assert.equal((await active()).text,'下一题');
    });
    await check('next question receives keyboard focus',async()=>{
      await activate(page.getByRole('button',{name:'下一题',exact:true}));
      assert.equal((await active()).tag,'H2');assert.equal((await active()).text,await page.locator('#quiz-view h2').innerText());
      assert.equal((await active()).outline,'3px');await page.keyboard.press('Tab');assert.equal((await active()).tag,'INPUT');
    });
    await check('result heading receives keyboard focus',async()=>{
      await page.locator('fieldset input').first().focus();await page.keyboard.press('Space');
      await activate(page.getByRole('button',{name:'提交答案',exact:true}));await activate(page.getByRole('button',{name:'查看结果',exact:true}));
      assert.equal((await active()).tag,'H2');assert.equal((await active()).text,'复习完成');
    });
    await check('cancel reset restores trigger focus and preserves state',async()=>{
      const before=await page.evaluate(()=>studyQuest.getState());await activate(page.locator('#reset-button'));
      assert.equal((await active()).id,'confirm-reset');await page.keyboard.press('Tab');assert.equal((await active()).id,'cancel-reset');await page.keyboard.press('Enter');
      assert.equal((await active()).id,'reset-button');assert.deepEqual(await page.evaluate(()=>studyQuest.getState()),before);
    });
    await check('cancel import restores trigger focus and preserves state',async()=>{
      const before=await page.evaluate(()=>studyQuest.getState()),backup=await page.evaluate(()=>studyQuest.exportData());await activate(page.locator('#backup-button'));
      await page.locator('#import-file').setInputFiles({name:'backup.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(backup))});
      await page.locator('#confirm-import').waitFor({state:'visible'});await page.locator('#confirm-import').focus();await page.keyboard.press('Tab');assert.equal((await active()).id,'cancel-import');await page.keyboard.press('Enter');
      assert.equal((await active()).id,'backup-button');assert.deepEqual(await page.evaluate(()=>studyQuest.getState()),before);
    });
    assert.deepEqual(pageErrors,[]);assert.deepEqual(requests,[]);assert.deepEqual(failures,[]);console.log('PASS keyboard regression: 5 checks, 0 page errors, 0 HTTP(S) requests');
  }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
