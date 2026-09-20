# Personal Agent Skills

这是我的个人 Agent Skills 仓库，主要用于把重复出现的学习与内容生产任务固化成可复用工作流。

这里的 Skill 不只是 Prompt：每个目录都以 `SKILL.md` 为入口，并按需配套参考契约、模板、脚本和评测用例。它们强调来源边界、阶段确认和可验证交付，适合个人长期使用与迭代。

## Skills 一览

| Skill | 用途 | 主要交付物 | 状态 |
|---|---|---|---|
| [finance-beginner](./finance-beginner/SKILL.md) | 为中文金融初学者生成循序渐进的每日课程 | 金融课程 Markdown、学习台账 | 可用 |
| [building-ppt-study-quests](./building-ppt-study-quests/SKILL.md) | 将 PPT、PDF 或已确认笔记转化为阶段式学习材料 | Obsidian 笔记、重要性评分页、离线闯关网页 | 可用，含验证脚本 |
| [wechat-draft-publisher](./wechat-draft-publisher/SKILL.md) | 将 Markdown 文章整理、预览并上传到微信公众号草稿箱 | 规范化文章、封面、预览页、草稿记录 | 可用，依赖已配置的发布项目与中继 |

## 1. Finance Beginner

[finance-beginner](./finance-beginner/SKILL.md) 面向中文金融投资新手。每节课围绕一个明确主题选择**恰好 5 个**彼此关联的概念，并将它们组织成一条可以复述的因果或递进链。

核心能力：

- 根据学习台账识别已学内容，统一中英文名称、缩写和别名后去重；
- 每次只提高一个合理的难度台阶；
- 使用一个最有教学价值的近期全球市场事件解释概念；
- 涉及最新市场事实时联网核验日期、市场状态、时区和来源；
- 用 ETF、股票、利率、国债、估值或组合管理等真实语境帮助理解；
- 通过应用问题、小测、总结和下一课建议形成学习闭环；
- 将完整课程写入独立 Markdown 文件，并更新学习台账。

基本流程：

```text
读取学习台账
    ↓
概念归一化与去重
    ↓
选择 5 个相连概念
    ↓
核验近期市场案例
    ↓
生成课程与小测
    ↓
更新学习台账
```

示例请求：

```text
今天的 5 个金融概念。沿着我之前学过的 PE、EPS 和自由现金流继续，难度提高一点。
```

```text
围绕“为什么利率会影响股票估值”安排今天的一课，并结合一个近期市场案例。
```

重要边界：该 Skill 用于金融知识教育，不提供具体证券的买卖指令、目标价、仓位建议或收益保证，也不替代个性化的投资、税务和法律建议。

相关文件：

- [SKILL.md](./finance-beginner/SKILL.md)：入口与执行流程；
- [课程契约](./finance-beginner/references/course-contract.md)：课程结构、市场核验、交付和质量标准；
- [学习台账](./finance-beginner/finance-learning-ledger.md)：用户拥有并持续更新的学习记录；
- [评测用例](./finance-beginner/evals/evals.json)：代表性触发和输出要求。

## 2. Building PPT Study Quests

[building-ppt-study-quests](./building-ppt-study-quests/SKILL.md) 将课程资料逐步加工为适合长期复习的学习系统。它只使用 PPT、PDF 或已确认笔记中能够可靠提取的内容，不用模型记忆补全缺失公式、条件或结论。

工作流分为三个阶段：

```text
PPT / PDF / 已确认笔记
            ↓
     ① Obsidian 学习笔记
            ↓
      是否需要重要性标注？
       ↙                 ↘
② 离线评分页          跳过评分并等权处理
       ↘                 ↙
        ③ 离线闯关答题网页
```

阶段规则：

1. **学习笔记**：遵循原资料顺序，保留最终公式、含义、条件、例子和限定；默认省略推导过程。
2. **重要性评分**：仅在用户选择需要时生成。用户导出并确认评分后，再收集题库偏好。
3. **闯关网页**：使用单选、多选和判断题；每关至少抽取 5 题，正确率达到 80% 才能解锁后续关卡。

评分步骤可以明确跳过。此时 Skill 会以统一的中性权重组织知识模块，并直接进入题库制作，不伪造用户评分。

闯关网页支持：

- 按知识模块加权且不重复抽题；
- 关卡依赖与解锁；
- 最高正确率和完成状态；
- 错题记录、掌握标记与再次答错回退；
- 学习记录持久化、备份、导入和重置；
- 单文件离线运行。

示例请求：

```text
请根据这份课程 PPT 整理一份适合 Obsidian 的学习笔记。
```

完成笔记后，Skill 会停在确认节点。确认内容后，可以选择：

```text
笔记内容已经确认，请继续制作重要性评分网页。
```

或：

```text
不需要重要性评注，直接根据这份笔记制作闯关答题网页。
```

相关文件：

- [SKILL.md](./building-ppt-study-quests/SKILL.md)：阶段控制与主要规则；
- [references](./building-ppt-study-quests/references/)：笔记、评分、题库和交付契约；
- [assets](./building-ppt-study-quests/assets/)：评分页与闯关网页模板；
- [scripts](./building-ppt-study-quests/scripts/)：静态校验和回归测试；
- [evals](./building-ppt-study-quests/evals/)：公式型、概念型和资料不完整场景。

### 验证脚本

需要 Node.js。在仓库当前目录执行：

```bash
node building-ppt-study-quests/scripts/validate-artifacts.js --self-test
```

验证生成的具体产物：

```bash
node building-ppt-study-quests/scripts/validate-artifacts.js --markdown path/to/note.md
node building-ppt-study-quests/scripts/validate-artifacts.js --importance path/to/importance.html
node building-ppt-study-quests/scripts/validate-artifacts.js --quiz path/to/quiz.html
```

自动验证覆盖 Markdown 结构、离线资源、配置契约、抽题、评分、关卡锁定、最高分、错题本、持久化、备份和重置。来源忠实度、公式完整性与最终视觉效果仍需人工复核。

## 3. WeChat Draft Publisher

[wechat-draft-publisher](./wechat-draft-publisher/SKILL.md) 用于把一篇 Markdown 文章整理成经过预览确认的微信公众号草稿。流程保留原文副本，并严格执行“一篇文章、一次预览、一次明确确认”。

> [!IMPORTANT]
> 这个 Skill 是发布工作流的编排层，**不是独立的微信公众号排版器或云端服务**。它必须配合兼容的公众号发布项目使用；该项目需要提供 `src/cli.js`、主题注册表、渲染器、微信 relay 适配器和腾讯云 SCF 部署代码。仅复制本目录不会得到完整的上传能力。

工作流：

```text
Markdown 原文
    ↓
复制原文并规范 frontmatter
    ↓
本地化文章图片
    ↓
按项目模板生成预览
    ↓
生成 16:9 无文字封面
    ↓
用户确认当前文章
    ↓
通过腾讯云 SCF 中继创建草稿
    ↓
停止，最终发布由用户手动完成
```

核心约束：

- 不覆盖用户原始 Markdown；
- 模板以发布项目运行时返回的注册表为准，不在 Skill 中写死；
- 封面必须使用图像生成能力创建，保持 16:9、主体安全裁切且不含文字、Logo 或水印；
- 只有在用户查看封面和页面预览并确认当前文章后，才允许创建草稿；
- 一次只执行一次草稿写入，遇到歧义结果不自动重试；
- 工作流止于草稿箱，不调用正式发布接口；
- 中继密钥、AppID、AppSecret、访问令牌、签名和请求正文不得出现在聊天、文件、命令或日志中。

示例请求：

```text
请使用 wechat-draft-publisher，把 C:\articles\example.md 按“夜间刊物”排版并上传到微信公众号草稿箱。
```

Skill 会先生成封面和页面预览。用户查看后，需要针对当前文章明确回复“上传这篇”；初始请求、以前文章的确认或批量授权都不能代替这一步。确认后流程会自动读取本机加密配置、执行只读诊断并发起一次草稿创建请求，不会调用发表接口。

### 首次使用前提

- **本机系统：**Windows 10/11。凭据使用 Windows DPAPI 按当前用户加密，暂不支持 macOS 或 Linux；
- **本机运行时：**PowerShell 7（命令为 `pwsh`）和 Node.js 24；
- **配套项目：**包含 `src/cli.js`、主题注册表、渲染器和 relay 适配器，并能通过自身的测试与验证；
- **Agent 能力：**可以读写本地文件、联网核验来源，并提供内置图像生成能力；
- **微信权限：**公众号账号具备素材与草稿权限。此工作流不要求也不使用自动发表权限；
- **腾讯云：**使用者已经部署自己的 SCF 中继，并准备好自己的 Function URL、Relay Secret 和固定公网出口 IPv4。

### 第一次配置

1. 将本目录复制到 Codex Skills 目录：

   ```text
   %USERPROFILE%\.codex\skills\wechat-draft-publisher
   ```

   如果当前会话没有立即识别新 Skill，请重新打开 Codex 或开始一个新会话。

2. 在配套发布项目中构建 relay 部署包，并将其部署为腾讯云 SCF 事件函数。云端建议使用项目文档指定的 Node.js 20.19 运行时和 `index.main` 执行方法。

3. 在腾讯云函数环境变量中由使用者本人填写：

   ```text
   WECHAT_APP_ID
   WECHAT_APP_SECRET
   WECHAT_RELAY_SECRET
   ```

   不要把这些值发送给 Agent、写入仓库、截图或问题报告。

4. 为云函数配置自己的固定公网出口 IPv4，并将该地址加入自己公众号的微信 API 白名单。不能使用其他人的出口地址、Function URL 或 relay 凭据。

5. 在私密 PowerShell 7 窗口运行一次本地配置：

   ```powershell
   pwsh -NoProfile -File "$env:USERPROFILE\.codex\skills\wechat-draft-publisher\scripts\configure-relay.ps1"
   ```

   Function URL 以普通文本输入，Relay Secret 使用遮蔽输入。本地只会在仓库之外创建：

   ```text
   %LOCALAPPDATA%\wechat-draft-publisher\relay.json
   %LOCALAPPDATA%\wechat-draft-publisher\relay-secret.dpapi
   ```

   `relay.json` 只保存 Function URL；Secret 使用当前 Windows 用户的 DPAPI 加密。更换电脑、Windows 账户，或密钥轮换后，需要重新配置，不能复制旧的 `relay-secret.dpapi` 继续使用。

6. 首次真实使用先完成只读诊断。前 5 篇草稿建议逐篇检查标题、摘要、封面、正文图片、模板和来源链接，再到公众号后台手动发表。

### 使用与安全注意事项

- 每位使用者必须部署并维护自己的 SCF、微信公众号凭据、固定出口和白名单；不要共享作者的云函数或密钥；
- 本地系统时间需保持准确，relay 签名只接受有限时间窗口内的请求；
- 文章和封面图片只支持 PNG、JPEG、GIF，单张不超过 4 MiB；
- 如果发现多个同名同来源草稿，或创建结果不明确，流程会停止并要求人工检查，不会自动重试；
- `relay.json`、`relay-secret.dpapi`、`.env`、访问令牌、真实文章产物和部署 ZIP 不应提交到 Git；
- 删除本机 relay 配置可运行：

  ```powershell
  pwsh -NoProfile -File "$env:USERPROFILE\.codex\skills\wechat-draft-publisher\scripts\configure-relay.ps1" -Remove
  ```

- 自动化止于微信公众号草稿箱，最终发表始终由用户在公众号后台完成。

### 自定义模板

模板由配套发布项目的主题注册表维护，而不是写死在 Skill 中。新增模板时，应在项目中添加稳定 ID、中文名称、别名、正文样式 token 和封面视觉提示，并通过项目测试；Skill 主流程不需要修改。使用时可传入模板 ID、中文名称或已登记别名，未知模板会列出候选项而不会自行猜测。

相关文件：

- [SKILL.md](./wechat-draft-publisher/SKILL.md)：入口、确认门和停止条件；
- [工作流契约](./wechat-draft-publisher/references/workflow.md)：文章格式、产物结构、封面和凭据规则；
- [scripts](./wechat-draft-publisher/scripts/)：中继配置、凭据处理和草稿调用脚本；
- [评测用例](./wechat-draft-publisher/evals/evals.json)：流程触发与安全边界。

## 仓库结构

```text
skills/
├── finance-beginner/
│   ├── SKILL.md
│   ├── finance-learning-ledger.md
│   ├── references/
│   └── evals/
├── building-ppt-study-quests/
│   ├── SKILL.md
│   ├── assets/
│   ├── references/
│   ├── scripts/
│   └── evals/
└── wechat-draft-publisher/
    ├── SKILL.md
    ├── agents/
    ├── references/
    ├── scripts/
    └── evals/
```

每个一级目录都是一个独立 Skill。`SKILL.md` 是唯一入口；`references/` 保存详细契约，`assets/` 保存可复用模板，`scripts/` 保存确定性工具，`evals/` 保存代表性测试场景。并非每个 Skill 都需要包含全部目录。

## 使用方式

1. 克隆或下载本仓库。
2. 将需要的 Skill 目录放入所用 Agent 平台支持的 Skills 路径，或让 Agent 直接读取该目录中的 `SKILL.md`。
3. 确认平台具备对应 Skill 所需的文件读写、联网、文档解析、浏览器或图像生成能力。
4. 使用示例请求启动任务，并按照 Skill 给出的阶段交接继续。

不同 Agent 平台的安装位置、自动触发机制和工具权限可能不同，请以所用平台的官方说明为准。

## 共同设计原则

- **来源优先**：事实来自输入资料、当前运行态或可核验来源，不靠模型记忆补齐关键内容。
- **单一入口**：执行规则从 `SKILL.md` 开始，细节下沉到明确链接的参考契约。
- **阶段确认**：下游产物依赖上游确认，外部写入前必须经过对应确认门。
- **用户数据分离**：学习台账、文章原稿和生成产物不混入稳定 Skill 规则。
- **本地可交付**：优先使用 Markdown 和单文件离线 HTML，方便保存、检查与迁移。
- **轻量验证**：优先验证核心流程和代表性场景，不为个人工具引入不必要的工程负担。
- **安全边界明确**：金融内容不替用户投资，公众号流程不替用户正式发布，凭据不进入产物和日志。

## 说明

本仓库用于个人学习与工作流实践。Skill 会持续随实际使用调整，目录中的当前文件是功能与约束的权威来源。
