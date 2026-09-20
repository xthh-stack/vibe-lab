# Learning Skills

这是一个面向个人学习场景的 AI Skill 仓库。这里的 Skill 不是单纯生成一次性答案，而是把学习任务组织成可以重复使用的流程：明确输入、约束生成边界、保存学习进度，并对关键产物进行轻量验证。

目前仓库包含两套 Skill：

| Skill | 适用场景 | 主要产物 |
|---|---|---|
| [初学金融 Skill](./finance_beginner/finance-beginner-skill.md) | 金融新手希望每天学习一组相互关联的概念，并结合近期市场理解实际应用 | 每日金融课程、概念知识链、小测、学习台账 |
| [Building PPT Study Quests](./building-ppt-study-questsv2/SKILL.md) | 将课程 PPT、PDF 或已确认的课程笔记逐步转化为复习材料 | Obsidian 笔记、重要性评分页、离线闯关答题网页 |

## Skill 介绍

### 1. 初学金融 Skill

`finance_beginner` 面向中文金融初学者。每节课围绕一个主题选择 5 个相互关联的金融概念，并把它们组织成一条由浅入深的知识链，而不是简单罗列术语。

主要特点：

- 每次固定讲解 5 个核心概念；
- 说明概念之间的因果关系、传导机制和失效条件；
- 结合全球股票、债券、利率、汇率或商品市场中的近期事件；
- 在合适时加入历史案例，帮助理解相似现象背后的不同原因；
- 使用 ETF、股票、国债、估值和资产配置等常见投资语境；
- 通过小测、总结和下一课建议形成学习闭环；
- 使用独立学习台账记录已学概念、掌握程度和后续方向，减少无意义重复。

目录内容：

```text
finance_beginner/
├── finance-beginner-skill.md   # Skill 规则与完整 Prompt 模板
└── finance-learning-ledger.md  # 独立学习台账模板
```

使用示例：

```text
今天的 5 个金融概念。沿着我之前学过的 PE、EPS、自由现金流继续，难度提高一点。
```

```text
围绕“为什么利率会影响股票估值”安排今天的一课，并结合一个近期市场案例。
```

首次使用时，请让 AI 同时读取 Skill 文件和学习台账。完成课程后，课程内容应保存为独立的 Markdown 文件，并更新 `finance-learning-ledger.md`。涉及近期市场信息时，应先查证可靠来源；本 Skill 用于金融教育，不构成投资、税务或法律建议。

### 2. Building PPT Study Quests

`building-ppt-study-questsv2` 用于把课程资料逐步加工成适合长期复习的学习系统。它强调忠于原始课件、按阶段确认，并避免在资料不足时凭常识补写内容。

完整流程如下：

```text
课程 PPT / PDF / 已确认笔记
            ↓
      Obsidian 学习笔记
            ↓
   是否需要重要性标注？
       ↙            ↘
 评分网页与确认       跳过评分
       ↘            ↙
       离线闯关答题网页
```

主要特点：

- 笔记遵循原课件顺序，并保留公式、条件、例子和重要限定；
- 默认省略冗长推导，只保留学习所需的最终结论和变量含义；
- 支持生成可离线打开的重要性评分网页；
- 根据已确认的知识范围和权重生成题库；
- 题型限定为单选、多选和判断题；
- 每关至少抽取 5 题，达到 80% 才能解锁后续关卡；
- 记录最高正确率、错题、掌握状态和学习进度；
- 支持学习记录导出、导入和重置；
- 提供模板、契约、评测样例和自动验证脚本。

目录内容：

```text
building-ppt-study-questsv2/
├── SKILL.md                    # 主流程与阶段规则
├── assets/
│   ├── importance-checklist-template.html
│   └── quiz-template.html
├── references/                # 笔记、评分、题库和交付规范
├── scripts/                   # 产物验证与回归测试
└── evals/                     # 代表性测试场景
```

使用示例：

```text
请根据这份课程 PPT 整理一份适合 Obsidian 的学习笔记。
```

笔记确认后，可以继续：

```text
笔记内容已经确认。请继续制作重要性评分网页。
```

也可以明确跳过重要性标注，直接使用等权重生成闯关网页：

```text
不需要重要性评注，直接根据这份笔记制作闯关答题网页。
```

这个 Skill 采用阶段式交付。AI 会先完成当前阶段并等待确认，不会在第一次请求时同时生成全部产物。这样可以避免错误从笔记阶段一路传递到题库。

## 使用方式

1. 下载或克隆本仓库。
2. 选择所需 Skill，并让支持自定义指令或 Skill 的 AI 工具读取对应文件。
3. 按上方示例提供课程资料、学习目标或当前学习记录。
4. 检查每个阶段的产物，并根据 Skill 中的交接提示继续。

`building-ppt-study-questsv2` 已采用标准的 `SKILL.md` 入口。`finance_beginner` 当前以可直接读取的 Markdown Skill 文件提供，使用时请同时带上同目录的学习台账。

## 验证

课件学习流水线附带轻量验证脚本。需要 [Node.js](https://nodejs.org/)；在仓库根目录执行：

```bash
node building-ppt-study-questsv2/scripts/validate-artifacts.js --self-test
```

也可以验证生成的具体产物：

```bash
node building-ppt-study-questsv2/scripts/validate-artifacts.js --markdown path/to/note.md
node building-ppt-study-questsv2/scripts/validate-artifacts.js --importance path/to/importance.html
node building-ppt-study-questsv2/scripts/validate-artifacts.js --quiz path/to/quiz.html
```

`scripts` 目录还包含配置、抽题策略、键盘焦点和题库规则的回归测试。自动检查不能替代人工确认：课程内容是否忠于原资料、公式是否完整，以及页面视觉效果是否合适，仍需要使用者检查。

## 设计原则

- **忠于来源：**资料没有提供的内容不擅自补全。
- **循序渐进：**从已掌握知识出发，每次只提高一个合理难度台阶。
- **阶段确认：**先确认上游产物，再生成依赖它的下游内容。
- **学习闭环：**不仅输出知识，还包含练习、反馈、记录和下一步建议。
- **本地优先：**学习笔记使用 Markdown，交互网页可离线运行，便于保存和迁移。
- **轻量验证：**通过少量代表性测试保证核心流程可用，不把个人学习工具过度工程化。

## 仓库说明

本仓库主要用于个人学习与 Skill 实践。不同 AI 工具对 Skill 的目录结构、安装方式和可用能力可能有所不同，请根据所使用平台进行适配。

