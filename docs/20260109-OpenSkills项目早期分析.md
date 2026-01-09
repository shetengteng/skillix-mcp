# OpenSkills 项目分析

> 分析日期: 2026-01-09

## 一、项目概述

**OpenSkills** 是一个开源的 AI 技能加载器，旨在将 Anthropic 的 Claude Code 技能系统带到所有 AI 编码代理（Claude Code、Cursor、Windsurf、Aider 等）。

- **GitHub**: [numman-ali/openskills](https://github.com/numman-ali/openskills)
- **npm 包**: `openskills`
- **Stars**: 4.4k
- **许可证**: Apache 2.0

## 二、核心理念

### 2.1 什么是 Skills（技能）？

Skills 是 Anthropic 为 Claude Code 设计的一种**渐进式加载的指令系统**：

- 技能以 `SKILL.md` 文件形式存在
- 包含 YAML 前置元数据 + Markdown 指令
- 只在需要时加载，保持 Agent 上下文清洁
- 可以包含捆绑资源（脚本、模板、参考文档）

### 2.2 与 MCP 的区别

| 特性 | MCP (Model Context Protocol) | Skills (SKILL.md) |
|------|------------------------------|-------------------|
| 用途 | 动态工具、API 集成、数据库连接 | 静态指令、工作流程、模板 |
| 运行方式 | 需要运行服务器 | 只是文件，无需服务器 |
| 加载方式 | 实时调用 | 按需加载 Markdown 内容 |
| 适用场景 | 实时数据获取、外部服务集成 | PDF 处理、电子表格编辑等专业工作流 |

**关键洞察**: MCP 和 Skills 解决不同的问题，可以共存使用。

## 三、工作原理

### 3.1 Claude Code 原生技能系统

Claude Code 的系统提示中包含：

```xml
<skills_instructions>
When users ask you to perform tasks, check if any of the available skills below can help complete the task more effectively.

How to use skills:
- Invoke skills using this tool with the skill name only (no arguments)
- When you invoke a skill, you will see <command-message>The "{name}" skill is loading</command-message>
- The skill's prompt will expand and provide detailed instructions
</skills_instructions>

<available_skills>
<skill>
<name>pdf</name>
<description>Comprehensive PDF manipulation toolkit...</description>
<location>plugin</location>
</skill>
</available_skills>
```

**调用方式**: `Skill("pdf")` 工具调用

### 3.2 OpenSkills 实现

OpenSkills 在 `AGENTS.md` 中生成相同格式的 XML：

```xml
<skills_system priority="1">

## Available Skills

<usage>
When users ask you to perform tasks, check if any of the available skills below can help complete the task more effectively.

How to use skills:
- Invoke: Bash("openskills read <skill-name>")
- The skill content will load with detailed instructions
</usage>

<available_skills>
<skill>
<name>pdf</name>
<description>Comprehensive PDF manipulation toolkit...</description>
<location>project</location>
</skill>
</available_skills>

</skills_system>
```

**调用方式**: `Bash("openskills read pdf")` CLI 命令

### 3.3 对比总结

| 方面 | Claude Code | OpenSkills |
|------|-------------|------------|
| 系统提示 | 内置于 Claude Code | 在 AGENTS.md 中 |
| 调用方式 | `Skill("pdf")` 工具 | `openskills read pdf` CLI |
| 提示格式 | `<available_skills>` XML | 完全相同 |
| 文件夹结构 | `.claude/skills/` | 完全相同 |
| SKILL.md 格式 | YAML + Markdown | 完全相同 |

**唯一区别**: 调用方法不同，其他完全兼容。

## 四、SKILL.md 格式

### 4.1 最小结构

```
my-skill/
└── SKILL.md
```

```markdown
---
name: my-skill
description: What this does and when to use it
---

# Instructions in imperative form

When the user asks you to X, do Y...
```

### 4.2 带捆绑资源

```
my-skill/
├── SKILL.md
├── references/
│   └── api-docs.md      # 支持文档
├── scripts/
│   └── process.py       # 辅助脚本
└── assets/
    └── template.json    # 模板、配置
```

## 五、命令行使用

### 5.1 安装

```bash
npm i -g openskills
```

### 5.2 核心命令

```bash
# 从 GitHub 安装技能（交互式选择）
openskills install anthropics/skills

# 从任意 GitHub 仓库安装
openskills install your-org/custom-skills

# 从本地路径安装
openskills install ./local-skills/my-skill

# 从私有 Git 仓库安装
openskills install git@github.com:your-org/private-skills.git

# 同步到 AGENTS.md
openskills sync

# 列出已安装技能
openskills list

# 加载技能（供 Agent 使用）
openskills read <name>

# 管理/删除技能
openskills manage
openskills remove <name>
```

### 5.3 安装模式

| 模式 | 命令 | 安装位置 | 适用场景 |
|------|------|----------|----------|
| 项目级（默认） | `openskills install xxx` | `./.claude/skills/` | 单项目使用 |
| 全局 | `openskills install xxx --global` | `~/.claude/skills/` | 跨项目共享 |
| 通用 | `openskills install xxx --universal` | `./.agent/skills/` | Claude Code + 其他 Agent 混用 |

## 六、与 AI Hub Connector 的对比

### 6.1 定位差异

| 特性 | OpenSkills | AI Hub Connector |
|------|------------|------------------|
| 核心功能 | 技能加载器（静态指令） | MCP 服务器（动态工具） |
| 数据来源 | GitHub 仓库的 SKILL.md 文件 | AI Hub 平台的 Agent |
| 调用方式 | CLI 命令 | MCP 工具调用 |
| 实时性 | 静态文件 | 实时 API 调用 |
| 适用场景 | 工作流指令、模板、参考文档 | Agent 对话、实时交互 |

### 6.2 可借鉴之处

1. **渐进式加载**: 只在需要时加载完整内容，保持上下文清洁
2. **XML 格式**: 使用 `<available_skills>` 格式让 Agent 理解可用技能
3. **CLI 工具**: 提供简单的命令行接口
4. **多级安装**: 支持项目级、全局、通用三种安装模式
5. **交互式 TUI**: 美观的终端用户界面

### 6.3 潜在整合方向

1. **AI Hub Agent 作为 Skill**: 可以考虑将 AI Hub Agent 的描述以 SKILL.md 格式导出
2. **混合使用**: 用户可以同时使用 OpenSkills（静态指令）和 AI Hub Connector（动态 Agent）
3. **统一入口**: 考虑在 AGENTS.md 中同时列出 Skills 和 AI Hub Agents

## 七、技术实现要点

### 7.1 技能搜索优先级

OpenSkills 按以下顺序搜索技能：

1. `./.agent/skills/` (项目通用)
2. `~/.agent/skills/` (全局通用)
3. `./.claude/skills/` (项目)
4. `~/.claude/skills/` (全局)

同名技能只出现一次（优先级高的获胜）。

### 7.2 与 Claude Code 共存

- 可以同时使用 Claude Code 市场插件和 OpenSkills 项目技能
- 市场插件: `<location>plugin</location>`
- OpenSkills: `<location>project</location>`
- 两者不冲突，调用方式不同

## 八、Skill 与 Cursor Rules (.mdc) 的区别

### 8.1 本质相同

两者本质上都是**给 AI 的 Markdown 格式指令文本**，目的都是指导 AI 行为。

### 8.2 主要区别

| 方面 | Skill (SKILL.md) | Rules (.mdc) |
|------|------------------|--------------|
| **来源** | Anthropic 设计 | Cursor 设计 |
| **加载时机** | 按需加载（AI 判断） | 可配置（始终/文件匹配/AI 判断） |
| **加载深度** | 渐进式（元数据→正文→资源） | 一次性全部加载 |
| **资源支持** | 支持 scripts/references/assets | 仅文本 |
| **生态系统** | 跨平台标准 | Cursor 专属 |

### 8.3 使用场景

| 场景 | 用 Rules | 用 Skill |
|------|----------|----------|
| 代码风格规范 | ✅ | ❌ |
| 项目架构说明 | ✅ | ❌ |
| 处理 PDF 文件 | ❌ | ✅ |
| 创建 Excel 报表 | ❌ | ✅ |
| 复杂数据分析流程 | ❌ | ✅ |

### 8.4 类比理解

- **Rules** = 公司规章制度（每天都要遵守）
- **Skill** = 专业培训手册（需要时才查阅）

## 九、在 Cursor 中实现 Skill 能力

### 9.1 方案对比

| 方案 | 复杂度 | 兼容性 | 推荐场景 |
|------|--------|--------|----------|
| OpenSkills | 低 | 高（跨平台） | 想用 Anthropic 官方技能 |
| 纯 Rules 模拟 | 中 | Cursor 专属 | 自定义简单技能 |
| 自定义 Loader | 中 | 高 | 完全自定义需求 |

### 9.2 方案一：使用 OpenSkills

```bash
# 安装
npm i -g openskills

# 安装技能
openskills install anthropics/skills

# 同步到 AGENTS.md
openskills sync
```

然后在 `.cursor/rules/` 中添加规则让 Cursor 读取 AGENTS.md。

### 9.3 方案二：自定义 Skill Loader

#### 需要的组件

1. **技能加载脚本** (`scripts/skill-loader.sh`)
   - `list` - 列出所有可用技能，输出 `<available_skills>` XML
   - `read <name>` - 读取指定技能的 SKILL.md 内容
   - `info <name>` - 显示技能元数据

2. **技能目录** (`skills/`)
   - 每个技能一个文件夹
   - 每个文件夹包含 `SKILL.md`
   - 可选：`scripts/`、`references/`、`assets/` 子目录

3. **Cursor 规则** (`.cursor/rules/skills-system.mdc`)
   - 告诉 AI 如何使用技能系统
   - 何时执行 `skill-loader.sh list`
   - 何时执行 `skill-loader.sh read <name>`

#### 目录结构

```
your-project/
├── .cursor/
│   └── rules/
│       └── skills-system.mdc    # 技能系统规则
├── skills/                       # 技能目录
│   ├── pdf/
│   │   ├── SKILL.md
│   │   └── scripts/
│   └── xlsx/
│       └── SKILL.md
└── scripts/
    └── skill-loader.sh          # 技能加载器
```

#### 工作流程

1. AI 收到用户请求
2. AI 执行 `bash scripts/skill-loader.sh list` 查看可用技能
3. AI 判断是否需要某个技能
4. 如果需要，执行 `bash scripts/skill-loader.sh read <name>` 加载详细指令
5. AI 按照加载的指令完成任务

#### 关键设计点

- **渐进式加载**：元数据（name + description）始终可见，正文按需加载
- **标准格式**：使用 `<available_skills>` XML 格式，与 Anthropic 规范兼容
- **资源支持**：支持 scripts/references/assets 目录结构
- **简单接口**：通过 Bash 命令调用，无需额外依赖

## 十、总结

OpenSkills 是一个优秀的技能加载器实现，它：

1. **100% 兼容** Anthropic 的 Skills 规范
2. **跨平台支持** Claude Code、Cursor、Windsurf、Aider
3. **简单易用** 通过 CLI 命令管理技能
4. **灵活部署** 支持多种安装模式

对于 AI Hub Connector 项目，可以考虑：
- 学习其渐进式加载的设计理念
- 参考其 XML 格式的技能描述方式
- 探索与 Skills 系统的整合可能性

---

*本文档基于 OpenSkills v1.3.0 分析*
