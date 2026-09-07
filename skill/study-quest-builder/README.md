# Building PPT Study Quests

把一份课程 PPT / PDF 课件或已确认的课堂笔记，变成一套**可离线使用、逐阶段确认**的学习材料：Obsidian 学习笔记 → 重要性评分清单 → 闯关答题网页。

这是一个 [Claude Code](https://claude.com/claude-code) skill（SKILL.md 格式），让 Claude 在一个有约束、可验证的流程里完成课程复习材料的产出，而不是一次性生成无法保证质量的结果。

---

## 它解决什么问题

直接把课件丢给模型「帮我做复习资料」，常见的问题：

- **凭空编造**：模型用记忆补全课件里缺失的公式、图表或结论。
- **一步到位不可控**：笔记、评分、题库一起产出，中间没有确认点，错了要整体返工。
- **题库注水**：为了凑关卡数量，把同一个知识点反复换说法堆数量。
- **评分不可信**：主观打分无法复现，权重形同虚设。

这个 skill 用「**证据约束 + 分阶段确认 + 可验证交付**」来应对这些问题：

| 原则 | 做法 |
|---|---|
| 只基于来源 | 缺失、模糊、冲突的内容不脑补，标记并请求补充来源 |
| 逐阶段门禁 | 每一阶段交付后**停下等待用户确认**，确认通过才进入下一阶段 |
| 可验证 | 附带 Node 校验器，静态检查 + 引擎行为测试，交付前跑通 |
| 客观判分 | 只允许单选 / 多选 / 判断三种客观题型，计算题转换为选择或判断 |
| 全离线 | 所有网页均为单文件，无网络依赖，`localStorage` 保存学习记录 |

---

## 工作流程（四个阶段）

| 阶段 | 产出 | 交付后等待 |
|---|---|---|
| **1. 课程笔记** | Obsidian `.md` 笔记（含开篇定义量表、中文章节编号） | 用户确认内容与格式 |
| **2. 重要性评分** | 离线评分网页 `.html` + 导出的评分 JSON | 用户完成评分并导出 JSON 确认 |
| **2.5 题库需求** | 一份四问式「题库简报」的明确回答 | 用户明确授权开始 |
| **3. 闯关答题** | 离线答题网页 `.html`（含学习记录、错题本、备份/重置） | 交付可用页面 |

关键约束：

- **阶段门禁**：一次请求「三个都要」不等于三个都已确认，每个产物只在其确认门通过后才会生成下一个。
- **评分确认 ≠ 题库授权**：即使评分已确认，生成题库前仍需收集并确认「题库简报」，无偏好也必须明确回复 `无特殊要求，可以开始`。
- **每关至少 5 题、通过线 80%**：不足 5 题就不建该关卡，宁可合并、请求更多来源或停止，也不注水凑数。
- **一道专属「新概念」关卡**（`kind:"concepts"`）：集中考察课件首次定义的概念、符号、公式与意义。

---

## 目录结构

```
study-quest-builder/
├── SKILL.md                          # skill 主入口：阶段判定与流程编排
├── references/                       # 各阶段的硬性契约
│   ├── markdown-contract.md          #   笔记格式契约（定义量表、公式、章节）
│   ├── importance-contract.md        #   评分模块与导出 JSON 契约
│   ├── quiz-contract.md              #   题库/引擎/学习记录契约
│   └── validation-contract.md        #   校验与交付契约
├── assets/                           # 交付物模板
│   ├── importance-checklist-template.html
│   └── quiz-template.html
├── scripts/                          # 校验与回归测试（Node，无第三方依赖）
│   ├── validate-artifacts.js         #   主校验器（静态 + 引擎行为）
│   ├── test-config-regression.cjs
│   ├── test-quiz-policy.cjs
│   ├── test-sampling-regression.cjs
│   └── test-keyboard-focus.cjs
└── evals/                            # skill 评估样例与评分标准
    ├── evals.json
    └── files/                        #   三类代表性课件样例
```

---

## 安装

1. 把整个目录放到你的 skill 目录，例如：

   ```text
   ~/.claude/skills/study-quest-builder/
   ```

   （项目级则放到 `<project>/.claude/skills/`）

2. 目录名需与 `SKILL.md` 里的 `name` 一致：`study-quest-builder`。

3. 之后在对话中提供课件（PPT / PDF / 已确认的课程笔记），并请求：
   - 做 Obsidian 学习笔记
   - 做重要性评分清单
   - 做题库 / 闯关复习网页
   - 或请求完整的课程学习流程

Claude 会自动触发该 skill。

---

## 校验与测试

交付物在交付前必须通过内置校验器（`node` 运行时，无 npm 依赖、无网络）：

```bash
# 校验 Obsidian 笔记
node scripts/validate-artifacts.js --markdown path/to/notes.md

# 校验评分网页 + 评分导出 JSON
node scripts/validate-artifacts.js --importance path/to/ratings.html --ratings path/to/export.json

# 校验闯关答题网页
node scripts/validate-artifacts.js --quiz path/to/quiz.html

# 自检（校验器自身一致性）
node scripts/validate-artifacts.js --self-test

# 回归测试
node scripts/test-config-regression.cjs
node scripts/test-quiz-policy.cjs
node scripts/test-sampling-regression.cjs
```

校验器覆盖的内容包括（但不限于）：

- **笔记**：`$$` 块级公式独占一行、表格内联公式、定义量表/「本课无新增定义量」、中文章节以「一」开头、向量装饰处理。
- **网页**：单文件离线（无外链资源、无网络 API）、嵌入 JSON 契约、无 `innerHTML` 注入、ID 唯一、响应式。
- **题库引擎**：每关 `drawCount >= 5`、`passRatio: 0.8`、专属 `concepts` 关、仅三种客观题型、多选精确匹配判分、按评分加权抽样且权重确有影响、答案锁定、最高分单调、错题持久化与掌握反转、导入校验/往返、重置状态。

> 注意：静态校验**不能**替代真实浏览器测试。交付前仍需在断网状态下用浏览器打开 HTML，检查桌面与窄屏（1280 / 320 CSS px）布局、焦点、键盘操作等；无法做浏览器 QA 时需如实说明哪些检查未验证。

---

## 设计契约（引用）

各阶段的具体规则在 `references/` 下，是 skill 的「硬约束」：

- [`markdown-contract.md`](references/markdown-contract.md) — 笔记的格式、定义量表、公式、章节、向量与 OCR 处理。
- [`importance-contract.md`](references/importance-contract.md) — 评分模块（1–10 个）、稳定语义 ID、导出 JSON 契约与校验规则。
- [`quiz-contract.md`](references/quiz-contract.md) — 题库结构、共享 PPT 例题数据、加权抽样、持久化与迁移、恢复默认。
- [`validation-contract.md`](references/validation-contract.md) — 校验器用法与交付前必须完成的检查清单。

---

## 评估

`evals/` 提供了三类代表性课件的评估样例，用于衡量 skill 在不同难度来源下的表现：

| 样例 | 场景 |
|---|---|
| `formula-heavy-science.md` | 公式密集的理科课件（完整流程） |
| `concept-heavy-course.md` | 概念为主的课程（按内容选择关卡与题型） |
| `sparse-unclear-source.md` | 稀疏/含模糊内容的摘录（来源不足时收缩范围、不注水） |

每个 eval 的 `expectations` 都是可判定的行为断言（例如「初始轮必须在笔记确认门停下」「评分确认不等于题库授权」），用于回归验证 skill 是否遵守约束。

---

## 许可

如需，在此补充许可证信息。
