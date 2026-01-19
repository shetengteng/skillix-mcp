# Anthropic Skills 官方仓库分析文档

> 最后更新：2026-01-09

## 1. 项目概述

### 1.1 项目定位

**Skills** 是 Anthropic 官方的技能实现仓库，包含 Claude 动态加载的指令、脚本和资源文件夹，用于提升 Claude 在专业任务上的表现。

- **仓库地址**: https://github.com/anthropics/skills
- **许可证**: 混合许可 (Apache 2.0 + Proprietary)
- **规范地址**: https://agentskills.io/specification

### 1.2 什么是技能 (Skills)？

技能教会 Claude 如何以可重复的方式完成特定任务，包括：
- 使用公司品牌指南创建文档
- 使用组织特定工作流分析数据
- 自动化个人任务

### 1.3 官方资源链接

- [什么是技能？](https://support.claude.com/en/articles/12512176-what-are-skills)
- [在 Claude 中使用技能](https://support.claude.com/en/articles/12512180-using-skills-in-claude)
- [如何创建自定义技能](https://support.claude.com/en/articles/12512198-creating-custom-skills)
- [用 Agent Skills 装备现实世界的代理](https://anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills)

---

## 2. 仓库结构

```
skills/
├── README.md                  # 项目说明
├── THIRD_PARTY_NOTICES.md     # 第三方许可通知
│
├── skills/                    # 技能集合 (主目录)
│   ├── algorithmic-art/       # 🎨 算法艺术生成
│   ├── brand-guidelines/      # 📋 品牌指南
│   ├── canvas-design/         # 🎨 画布设计 (含 54 个字体文件)
│   ├── doc-coauthoring/       # 📝 文档协作
│   ├── docx/                  # 📄 Word 文档处理 (生产级)
│   ├── frontend-design/       # 💻 前端设计
│   ├── internal-comms/        # 📢 内部沟通
│   ├── mcp-builder/           # 🔧 MCP 服务器构建
│   ├── pdf/                   # 📑 PDF 处理 (生产级)
│   ├── pptx/                  # 📊 PowerPoint 处理 (生产级)
│   ├── skill-creator/         # 🛠️ 技能创建指南
│   ├── slack-gif-creator/     # 🎬 Slack GIF 创建
│   ├── theme-factory/         # 🎨 主题工厂
│   ├── web-artifacts-builder/ # 🌐 Web 工件构建
│   ├── webapp-testing/        # 🧪 Web 应用测试
│   └── xlsx/                  # 📊 Excel 处理 (生产级)
│
├── spec/                      # 规范文档
│   └── agent-skills-spec.md   # 指向 agentskills.io
│
└── template/                  # 技能模板
    └── SKILL.md               # 基础模板文件
```

---

## 3. 技能分类

### 3.1 文档技能 (生产级 - Source Available)

这些技能驱动 [Claude 的文档功能](https://www.anthropic.com/news/create-files)，是生产 AI 应用中实际使用的复杂技能：

| 技能 | 功能 | 许可 |
|------|------|------|
| **docx** | Word 文档创建、编辑、修订跟踪、评论 | Proprietary |
| **pdf** | PDF 提取、创建、合并、拆分、表单处理 | Proprietary |
| **pptx** | PowerPoint 创建、编辑 | Proprietary |
| **xlsx** | Excel 创建、编辑、公式、数据分析 | Proprietary |

### 3.2 创意与设计技能 (开源)

| 技能 | 功能 | 内容 |
|------|------|------|
| **algorithmic-art** | 生成算法艺术 | JS 模板、HTML 查看器 |
| **brand-guidelines** | 品牌指南遵循 | 仅 SKILL.md |
| **canvas-design** | 画布/海报设计 | 54 个 TTF 字体 |
| **frontend-design** | 前端 UI/UX 设计 | 仅 SKILL.md |
| **theme-factory** | 主题创建 | 10 个主题 MD、PDF 展示 |

### 3.3 开发与技术技能 (开源)

| 技能 | 功能 | 内容 |
|------|------|------|
| **mcp-builder** | 构建 MCP 服务器 | Node/Python 参考、最佳实践 |
| **skill-creator** | 创建自定义技能 | 工作流、输出模式、脚本 |
| **web-artifacts-builder** | 构建 Web 工件 | Shell 脚本 |
| **webapp-testing** | Web 应用测试 | Python 测试脚本 |
| **slack-gif-creator** | 创建 Slack GIF | Python 核心库 |

### 3.4 企业与沟通技能 (开源)

| 技能 | 功能 | 内容 |
|------|------|------|
| **internal-comms** | 内部沟通写作 | 4 个示例 (新闻稿、FAQ 等) |
| **doc-coauthoring** | 文档协作编辑 | 仅 SKILL.md |

---

## 4. 核心技能详解

### 4.1 PDF 技能 (`skills/pdf/`)

**结构**:
```
pdf/
├── SKILL.md           # 主技能文件 (~295 行)
├── LICENSE.txt        # Proprietary 许可
├── forms.md           # PDF 表单处理指南
├── reference.md       # 高级参考文档
└── scripts/           # Python 脚本 (8 个)
    ├── __init__.py
    ├── extract_text.py
    ├── merge_pdfs.py
    └── ...
```

**核心功能**:
- 文本和表格提取
- 创建新 PDF
- 合并/拆分文档
- 表单处理

**使用的库**:
- `pypdf` - 基本操作 (合并、拆分、旋转、元数据)
- `pdfplumber` - 文本和表格提取
- `reportlab` - 创建 PDF
- `pytesseract` + `pdf2image` - OCR 扫描件
- `qpdf` - 命令行工具

**快速参考**:

| 任务 | 最佳工具 | 代码/命令 |
|------|----------|----------|
| 合并 PDF | pypdf | `writer.add_page(page)` |
| 拆分 PDF | pypdf | 每页一个文件 |
| 提取文本 | pdfplumber | `page.extract_text()` |
| 提取表格 | pdfplumber | `page.extract_tables()` |
| 创建 PDF | reportlab | Canvas 或 Platypus |
| OCR 扫描件 | pytesseract | 先转图片 |
| 填写表单 | 见 forms.md | pdf-lib 或 pypdf |

### 4.2 XLSX 技能 (`skills/xlsx/`)

**结构**:
```
xlsx/
├── SKILL.md           # 主技能文件
├── LICENSE.txt        # Proprietary 许可
└── recalc.py          # 公式重算脚本
```

**核心功能**:
- 电子表格创建与编辑
- 公式支持
- 格式化
- 数据分析

### 4.3 MCP Builder 技能 (`skills/mcp-builder/`)

**结构**:
```
mcp-builder/
├── SKILL.md           # 主技能文件
├── LICENSE.txt        # Apache 2.0
├── reference/
│   ├── evaluation.md         # MCP 评估指南
│   ├── mcp_best_practices.md # 最佳实践
│   ├── node_mcp_server.md    # Node.js 服务器指南
│   └── python_mcp_server.md  # Python 服务器指南
└── scripts/
    ├── mcp_client.py
    ├── mcp_test.py
    ├── requirements.txt
    └── spec.xml
```

**用途**: 指导如何构建 Model Context Protocol (MCP) 服务器。

### 4.4 Skill Creator 技能 (`skills/skill-creator/`)

**结构**:
```
skill-creator/
├── SKILL.md           # 主技能文件
├── LICENSE.txt        # Apache 2.0
├── references/
│   ├── output-patterns.md    # 输出模式指南
│   └── workflows.md          # 工作流指南
└── scripts/
    ├── skill_packager.py     # 打包脚本
    ├── skill_validator.py    # 验证脚本
    └── yaml_validator.py     # YAML 验证
```

**用途**: 详细指导如何创作自定义技能。

---

## 5. 技能模板

### 5.1 基础模板 (`template/SKILL.md`)

```markdown
---
name: template-skill
description: Replace with description of the skill and when Claude should use it.
---

# Insert instructions below
```

### 5.2 完整技能格式

```markdown
---
name: my-skill-name
description: A clear description of what this skill does and when to use it
---

# My Skill Name

[Add your instructions here that Claude will follow when this skill is active]

## Examples
- Example usage 1
- Example usage 2

## Guidelines
- Guideline 1
- Guideline 2
```

**Frontmatter 必需字段**:
- `name` - 技能唯一标识符 (小写，连字符分隔)
- `description` - 技能功能和使用时机的完整描述

---

## 6. 使用方式

### 6.1 Claude Code 使用

```bash
# 注册为插件市场
/plugin marketplace add anthropics/skills

# 浏览并安装
# 1. 选择 "Browse and install plugins"
# 2. 选择 "anthropic-agent-skills"
# 3. 选择 "document-skills" 或 "example-skills"
# 4. 选择 "Install now"

# 或直接安装
/plugin install document-skills@anthropic-agent-skills
/plugin install example-skills@anthropic-agent-skills
```

**使用示例**:
```
"Use the PDF skill to extract the form fields from path/to/some-file.pdf"
```

### 6.2 Claude.ai 使用

付费计划用户可直接使用这些示例技能。上传自定义技能请参考官方文档。

### 6.3 Claude API 使用

参考 [Skills API Quickstart](https://docs.claude.com/en/api/skills-guide#creating-a-skill)。

---

## 7. 技能文件详解

### 7.1 OOXML 支持 (docx/pptx)

文档技能包含完整的 Office Open XML 支持：

```
docx/ooxml/
├── schemas/           # 39 个 XSD 文件
│   ├── dml-main.xsd
│   ├── shared-commonSimpleTypes.xsd
│   └── ...
└── scripts/           # 8 个 Python 脚本
    ├── doc_generator.py
    ├── style_handler.py
    └── ...

docx/scripts/
├── __init__.py
├── document.py        # 文档生成核心
├── utilities.py       # 工具函数
└── templates/         # 5 个 XML 模板
    ├── document.xml
    ├── styles.xml
    └── ...
```

### 7.2 Canvas Design 字体库

```
canvas-design/canvas-fonts/
├── fonts/             # 54 个 TTF 字体文件
│   ├── ABeeZee-Regular.ttf
│   ├── Abril Fatface-Regular.ttf
│   ├── Alfa Slab One-Regular.ttf
│   └── ...
└── *.txt              # 27 个许可/说明文件
```

### 7.3 Theme Factory 主题库

```
theme-factory/themes/
├── dark-industrial.md
├── dark-minimal.md
├── dark-neon.md
├── dark-vintage.md
├── light-bold.md
├── light-elegant.md
├── light-playful.md
├── light-professional.md
├── light-soft.md
└── light-vibrant.md
```

---

## 8. 许可说明

### 8.1 开源技能 (Apache 2.0)

大多数示例技能采用 Apache 2.0 许可：
- algorithmic-art
- brand-guidelines
- canvas-design
- frontend-design
- internal-comms
- mcp-builder
- skill-creator
- slack-gif-creator
- theme-factory
- web-artifacts-builder
- webapp-testing

### 8.2 Source Available 技能 (Proprietary)

文档技能是 Source Available 但非开源：
- docx
- pdf
- pptx
- xlsx

这些是 Claude 文档功能背后的生产级实现，仅供参考学习。

---

## 9. 合作伙伴技能

Anthropic 推荐的合作伙伴技能：

- **Notion** - [Notion Skills for Claude](https://www.notion.so/notiondevs/Notion-Skills-for-Claude-28da4445d27180c7af1df7d8615723d0)

---

## 10. 创建自定义技能

### 10.1 最小结构

```
my-skill/
└── SKILL.md
```

### 10.2 完整结构

```
my-skill/
├── SKILL.md           # 主技能文件 (必需)
├── LICENSE.txt        # 许可文件
├── references/        # 参考文档
│   └── api-docs.md
├── scripts/           # 辅助脚本
│   └── helper.py
└── assets/            # 资源文件
    └── template.json
```

### 10.3 最佳实践

1. **描述要清晰** - 说明技能做什么以及何时使用
2. **指令要具体** - 使用祈使句，步骤明确
3. **包含示例** - 展示典型用法
4. **提供指南** - 列出注意事项和限制
5. **捆绑资源** - 脚本和模板放在对应目录

---

## 11. 快速阅读指南

| 优先级 | 文件 | 阅读目的 |
|--------|------|----------|
| 🔴 高 | `template/SKILL.md` | 理解基础技能格式 |
| 🔴 高 | `skills/pdf/SKILL.md` | 参考生产级技能结构 |
| 🔴 高 | `skills/skill-creator/SKILL.md` | 学习技能创建方法 |
| 🟡 中 | `skills/mcp-builder/` | 理解 MCP 服务器构建 |
| 🟡 中 | `skills/pdf/scripts/` | 参考 Python 脚本编写 |
| 🟢 低 | `skills/internal-comms/examples/` | 查看文档示例 |
| 🟢 低 | `skills/theme-factory/themes/` | 查看主题配置 |

---

## 12. 技能统计

| 类别 | 数量 | 许可 |
|------|------|------|
| 文档技能 | 4 | Proprietary |
| 创意设计 | 5 | Apache 2.0 |
| 开发技术 | 5 | Apache 2.0 |
| 企业沟通 | 2 | Apache 2.0 |
| **总计** | **16** | 混合 |

**文件统计**:
- XSD Schema 文件: 78 个 (docx + pptx)
- Python 脚本: 约 40 个
- 字体文件: 54 个 TTF
- 主题文件: 10 个 MD

---

## 13. 与其他项目的关系

| 项目 | 关系 | 说明 |
|------|------|------|
| **SkillForge** | 创建工具 | 用于创建符合规范的新技能 |
| **OpenSkills** | 安装工具 | 用于安装和管理这些技能 |
| **本仓库** | 官方实现 | Anthropic 官方技能库和规范参考 |

---

## 14. 免责声明

> **这些技能仅供演示和教育目的。** 虽然这些功能可能在 Claude 中可用，但您从 Claude 获得的实现和行为可能与这些技能中展示的不同。这些技能旨在展示模式和可能性。在将技能用于关键任务之前，请务必在您自己的环境中进行充分测试。
