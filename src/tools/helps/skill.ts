/**
 * sx-help skill 主题
 * sx-skill 工具帮助信息
 */

/**
 * sx-skill 帮助内容
 */
export const SKILL_HELP = `
# sx-skill 工具帮助

本地技能管理工具，支持以下操作：

## AI First 创建模式 ⭐

当用户想创建技能但不知道具体参数时，采用对话引导模式：

### 引导流程

\`\`\`
用户: "我想创建一个处理 PDF 的技能"

AI 引导问题（按顺序询问）:
1. "这个技能要解决什么问题？" → 明确核心功能
2. "什么情况下会触发这个技能？" → 定义触发场景
3. "需要执行哪些具体操作？" → 确定工作流程
4. "有什么特殊要求或限制？" → 识别约束条件
5. "需要什么辅助资源？" → 规划资源文件（可选）

收集完成后:
- 展示理解的需求摘要
- 请用户确认
- 生成 name/metadata/body 参数
- 调用 sx-skill action=create
\`\`\`

### 对话示例

\`\`\`
用户: 我想创建一个处理 Excel 文件的技能

AI: 好的，我来帮你创建 Excel 处理技能。请问你需要哪些功能？
    1. 读取和写入数据
    2. 格式转换（xlsx/csv/json）
    3. 数据分析和统计
    4. 图表生成

用户: 主要是 1 和 2，还需要支持批量处理

AI: 明白了。我为你规划了以下技能结构：

    技能名称: excel-handler
    核心功能:
    - 读取 Excel/CSV 文件
    - 写入和创建 Excel 文件
    - 格式转换（xlsx ↔ csv ↔ json）
    - 批量文件处理

    确认创建吗？[是/调整]

用户: 是

AI: [调用 sx-skill action=create name=excel-handler ...]
    ✅ 技能创建成功！
\`\`\`

### 上下文充分性判断

| 维度 | 最低要求 | 理想状态 |
|------|---------|---------|
| 核心问题 | ✅ 必须明确 | 具体到功能点 |
| 触发场景 | ✅ 必须明确 | 3-5 个触发词 |
| 操作流程 | ⚠️ 可以模糊 | 具体步骤 |
| 特殊要求 | ❌ 可选 | 明确约束 |

---

## 操作

### list - 列出技能
\`\`\`
sx-skill action=list [projectRoot=/path/to/project]
\`\`\`
列出所有全局和项目级技能。

### read - 读取技能
\`\`\`
sx-skill action=read name=skill-name [projectRoot=/path/to/project]
\`\`\`
读取指定技能的详细内容，包括元数据、正文和资源列表。

### create - 创建技能
\`\`\`
sx-skill action=create name=skill-name metadata={name, description, ...} body="..." [scope=global|project] [projectRoot=/path/to/project]
\`\`\`
创建新技能，会自动创建目录结构（scripts/, references/, assets/, logs/）。

**参数说明**:
- name: 技能名称（hyphen-case 格式，如 pdf-converter）
- metadata.description: 技能描述（包含触发场景）
- body: SKILL.md 正文（Markdown 格式）
- scope: 范围（global/project，默认 global）

### update - 更新技能
\`\`\`
sx-skill action=update name=skill-name [metadata={...}] [body="..."] [projectRoot=/path/to/project]
\`\`\`
更新现有技能的元数据或正文内容。

### delete - 删除技能
\`\`\`
sx-skill action=delete name=skill-name [projectRoot=/path/to/project]
\`\`\`
删除指定技能及其所有文件。

---

## 技能命名规范

| 规则 | 说明 | 有效示例 | 无效示例 |
|------|------|---------|---------|
| 格式 | hyphen-case | pdf-converter | PDF_Converter |
| 开头 | 小写字母 | my-skill | 1-skill |
| 长度 | 2-64 字符 | pdf | a |

---

## 技能结构

\`\`\`
skill-name/
├── SKILL.md          # 技能定义文件（必需）
├── scripts/          # 可执行脚本（可选）
├── references/       # 参考文档（可选）
├── assets/           # 资源文件（可选）
└── logs/             # 执行日志（可选）
\`\`\`

### SKILL.md 格式

\`\`\`markdown
---
name: skill-name
description: 技能描述（包含触发场景）
version: 1.0.0
tags: [tag1, tag2]
---

# 技能标题

## 使用说明

...

## 示例

...
\`\`\`
`;
