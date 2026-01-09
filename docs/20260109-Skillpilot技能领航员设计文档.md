# Skillpilot - 技能领航员设计文档

> 日期: 2026-01-09
> 更新: 借鉴 SkillForge 项目的优秀设计

## 一、项目概述

### 1.1 项目名称

**Skillpilot** (技能领航员)

> 注：原计划使用 SkillForge，但该名称已被 [tripleyak/SkillForge](https://github.com/tripleyak/SkillForge) 使用。

### 1.2 项目定位

Skillpilot 是一个基于 MCP (Model Context Protocol) 的技能管理系统，为 AI 编码代理（如 Cursor）提供技能的创建、管理、加载和进化能力。

### 1.3 核心理念

> "Navigate your skills, empower your AI"
> 领航技能，赋能 AI

### 1.4 项目目标

1. **简化技能管理** - 通过 MCP 工具原生集成，无需执行 Bash 命令
2. **智能分流** - 自动判断使用现有技能、改进技能或创建新技能
3. **支持技能进化** - AI 可以自动创建和更新技能
4. **兼容 Anthropic 规范** - 100% 兼容 SKILL.md 格式
5. **跨平台支持** - 支持 Cursor、Claude Code 等多种 AI 编码工具

### 1.5 与 SkillForge 的区别

| 方面 | SkillForge | Skillpilot |
|------|------------|------------|
| 定位 | 元技能（用于创建技能） | MCP Server（管理技能） |
| 实现方式 | SKILL.md + Python 脚本 | MCP 工具调用 |
| 运行环境 | Claude Code CLI | Cursor + MCP |
| 核心功能 | 技能创建流程 | 技能 CRUD + 管理 |
| 复杂度 | 高（4 阶段 + 多 Agent 审核） | 中（简化流程） |

## 二、命名规范

### 2.1 项目命名

| 类型 | 名称 | 说明 |
|------|------|------|
| 项目名 | **Skillpilot** | 技能领航员 |
| 仓库名 | `skillpilot` | GitHub 仓库 |
| npm 包 | `skillpilot-mcp` | MCP Server 包 |
| CLI 命令 | `skillpilot` 或 `sp` | 命令行工具（可选） |

### 2.2 相关命名

| 类型 | 名称 |
|------|------|
| 配置文件 | `.skillpilotrc.json` |
| 技能目录 | `.skillpilot/skills/` 或 `skills/` |
| 日志文件 | `.skillpilot/logs/` |

### 2.3 MCP 工具命名

| 工具名 | 说明 |
|--------|------|
| `sp_triage` | 智能分流（借鉴 SkillForge） |
| `sp_list` | 列出所有技能 |
| `sp_read` | 读取技能内容 |
| `sp_create` | 创建新技能 |
| `sp_update` | 更新技能 |
| `sp_delete` | 删除技能 |

## 三、系统架构

### 3.1 整体架构

```
┌─────────────────────────────────────────────────────────────┐
│                      Cursor IDE                              │
├─────────────────────────────────────────────────────────────┤
│                    MCP Protocol Layer                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│    ┌─────────────────────────────────────────────────┐      │
│    │              Skillpilot MCP Server               │      │
│    ├─────────────────────────────────────────────────┤      │
│    │  Tools:                                          │      │
│    │  ├── sp_triage    (智能分流)                    │      │
│    │  ├── sp_list      (列出技能)                    │      │
│    │  ├── sp_read      (读取技能)                    │      │
│    │  ├── sp_create    (创建技能)                    │      │
│    │  ├── sp_update    (更新技能)                    │      │
│    │  └── sp_delete    (删除技能)                    │      │
│    ├─────────────────────────────────────────────────┤      │
│    │  Resources:                                      │      │
│    │  └── skill://{name}                             │      │
│    └─────────────────────────────────────────────────┘      │
│                           │                                  │
│                           ▼                                  │
│    ┌─────────────────────────────────────────────────┐      │
│    │              Skills Directory                    │      │
│    │  skills/                                         │      │
│    │  ├── pdf/                                        │      │
│    │  │   └── SKILL.md                               │      │
│    │  ├── xlsx/                                       │      │
│    │  │   └── SKILL.md                               │      │
│    │  └── ...                                         │      │
│    └─────────────────────────────────────────────────┘      │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 3.2 智能分流机制（借鉴 SkillForge）

```
用户输入
    ↓
┌─────────────────────────────────────┐
│           sp_triage 工具            │
│  分析输入，返回建议动作：            │
│  ├── USE_EXISTING   使用现有技能    │
│  ├── IMPROVE_EXISTING 改进现有技能  │
│  ├── CREATE_NEW     创建新技能      │
│  └── COMPOSE        组合多个技能    │
└─────────────────────────────────────┘
    ↓
根据建议执行相应操作
```

### 3.3 目录结构

```
skillpilot/
├── src/
│   ├── index.ts                 # MCP Server 入口
│   ├── server.ts                # Server 实现
│   ├── tools/                   # 工具实现
│   │   ├── index.ts
│   │   ├── triage.ts            # 智能分流（新增）
│   │   ├── list.ts              # 列出技能
│   │   ├── read.ts              # 读取技能
│   │   ├── create.ts            # 创建技能
│   │   ├── update.ts            # 更新技能
│   │   └── delete.ts            # 删除技能
│   ├── resources/               # 资源实现
│   │   └── skill-resource.ts
│   ├── utils/                   # 工具函数
│   │   ├── skill-parser.ts      # SKILL.md 解析
│   │   ├── skill-matcher.ts     # 技能匹配（新增）
│   │   ├── file-utils.ts        # 文件操作
│   │   └── config.ts            # 配置管理
│   └── types/                   # 类型定义
│       └── index.ts
├── examples/                    # 示例技能
│   └── skills/
│       ├── pdf/
│       │   └── SKILL.md
│       └── xlsx/
│           └── SKILL.md
├── docs/                        # 文档
├── package.json
├── tsconfig.json
└── README.md
```

## 四、核心功能设计

### 4.1 工具定义

#### sp_triage（智能分流 - 借鉴 SkillForge）

分析用户输入，智能判断应该执行什么操作。

```typescript
{
  name: "sp_triage",
  description: "智能分流 - 分析输入，判断使用/改进/创建技能",
  inputSchema: {
    type: "object",
    properties: {
      input: {
        type: "string",
        description: "用户输入（任务描述、问题、代码等）"
      },
      context: {
        type: "string",
        description: "当前上下文（可选）"
      }
    },
    required: ["input"]
  }
}
```

**返回示例**：
```json
{
  "action": "USE_EXISTING",
  "skill": "pdf",
  "confidence": 0.95,
  "reason": "用户任务与 pdf 技能高度匹配"
}
```

**可能的 action 值**：
| Action | 说明 | 后续操作 |
|--------|------|----------|
| `USE_EXISTING` | 使用现有技能 | 调用 sp_read |
| `IMPROVE_EXISTING` | 改进现有技能 | 调用 sp_update |
| `CREATE_NEW` | 创建新技能 | 调用 sp_create |
| `COMPOSE` | 组合多个技能 | 返回技能列表 |
| `NO_SKILL_NEEDED` | 不需要技能 | 直接执行任务 |

---

#### sp_list

列出所有可用技能。

```typescript
{
  name: "sp_list",
  description: "列出所有可用技能，返回技能名称和描述",
  inputSchema: {
    type: "object",
    properties: {
      format: {
        type: "string",
        enum: ["json", "xml", "table"],
        description: "输出格式，默认 xml"
      }
    }
  }
}
```

**返回示例**：
```xml
<available_skills>
  <skill>
    <name>pdf</name>
    <description>PDF 处理工具包</description>
    <location>project</location>
  </skill>
  <skill>
    <name>xlsx</name>
    <description>Excel 电子表格处理</description>
    <location>project</location>
  </skill>
</available_skills>
```

#### sp_read

读取指定技能的详细内容。

```typescript
{
  name: "sp_read",
  description: "读取指定技能的 SKILL.md 内容",
  inputSchema: {
    type: "object",
    properties: {
      name: {
        type: "string",
        description: "技能名称"
      }
    },
    required: ["name"]
  }
}
```

**返回示例**：
```
Loading skill: pdf
Base directory: /path/to/skills/pdf

---

[SKILL.md 完整内容]
```

#### sp_create

创建新技能。

```typescript
{
  name: "sp_create",
  description: "创建新技能，生成 SKILL.md 文件",
  inputSchema: {
    type: "object",
    properties: {
      name: {
        type: "string",
        description: "技能名称（英文，小写，连字符分隔）"
      },
      description: {
        type: "string",
        description: "技能描述（说明何时使用）"
      },
      content: {
        type: "string",
        description: "技能正文内容（Markdown 格式）"
      }
    },
    required: ["name", "description", "content"]
  }
}
```

#### sp_update

更新现有技能。

```typescript
{
  name: "sp_update",
  description: "更新现有技能的内容",
  inputSchema: {
    type: "object",
    properties: {
      name: {
        type: "string",
        description: "技能名称"
      },
      content: {
        type: "string",
        description: "新的技能内容"
      },
      reason: {
        type: "string",
        description: "更新原因（可选）"
      }
    },
    required: ["name", "content"]
  }
}
```

#### sp_delete

删除技能。

```typescript
{
  name: "sp_delete",
  description: "删除指定技能",
  inputSchema: {
    type: "object",
    properties: {
      name: {
        type: "string",
        description: "技能名称"
      },
      confirm: {
        type: "boolean",
        description: "确认删除"
      }
    },
    required: ["name", "confirm"]
  }
}
```

#### sp_suggest

建议创建技能（用于 AI 自动检测）。

```typescript
{
  name: "sp_suggest",
  description: "分析当前上下文，建议是否应该创建技能",
  inputSchema: {
    type: "object",
    properties: {
      context: {
        type: "string",
        description: "当前任务上下文描述"
      },
      steps: {
        type: "array",
        items: { type: "string" },
        description: "任务步骤列表"
      }
    },
    required: ["context"]
  }
}
```

### 4.2 资源定义

```typescript
// 技能资源
{
  uri: "skill://pdf",
  name: "PDF Skill",
  description: "PDF 处理技能",
  mimeType: "text/markdown"
}
```

### 4.3 配置文件

`.skillpilotrc.json`:

```json
{
  "skillsDir": "./skills",
  "format": "xml",
  "autoSuggest": true,
  "suggestThreshold": {
    "repeatCount": 3,
    "stepCount": 5
  }
}
```

## 五、技能格式规范

### 5.1 SKILL.md 格式

```markdown
---
name: skill-name
description: 清晰描述技能用途和触发场景
version: 1.0.0
author: your-name
tags: [tag1, tag2]
---

# 技能标题

## 使用说明

[详细指令]

## 依赖

[依赖列表]

## 示例

[使用示例]
```

### 5.2 目录结构

```
skill-name/
├── SKILL.md           # 必需
├── scripts/           # 可选：辅助脚本
├── references/        # 可选：参考文档
└── assets/            # 可选：资源文件
```

## 六、使用方式

### 6.1 Cursor 配置

```json
// ~/.cursor/mcp.json
{
  "mcpServers": {
    "skill-craft": {
      "command": "npx",
      "args": ["skill-craft-mcp"],
      "env": {
        "SKILLS_DIR": "./skills"
      }
    }
  }
}
```

### 6.2 AI 调用示例

```
用户: 帮我处理这个 PDF 文件

AI: 让我先查看可用的技能...
[调用 sp_list]

AI: 发现有 pdf 技能，让我加载它...
[调用 sp_read name="pdf"]

AI: 根据技能指令，我来处理这个 PDF...
[执行任务]
```

### 6.3 创建技能示例

```
用户: 帮我创建一个处理 CSV 文件的技能

AI: 好的，我来创建这个技能...
[调用 sp_create 
  name="csv"
  description="CSV 文件处理 - 读取、写入、转换"
  content="..."
]

AI: 技能创建成功！
```

## 七、实现计划

### 7.1 阶段一：核心功能 (MVP)

- [ ] 项目初始化
- [ ] MCP Server 基础框架
- [ ] sp_list 工具
- [ ] sp_read 工具
- [ ] 基础配置支持

### 7.2 阶段二：完整功能

- [ ] sp_create 工具
- [ ] sp_update 工具
- [ ] sp_delete 工具
- [ ] 资源（Resource）支持
- [ ] 配置文件支持

### 7.3 阶段三：智能功能

- [ ] sp_suggest 工具
- [ ] 自动检测重复模式
- [ ] 反馈收集机制
- [ ] 技能版本管理

### 7.4 阶段四：生态建设

- [ ] npm 发布
- [ ] 文档完善
- [ ] 示例技能库
- [ ] 社区贡献指南

## 八、技术栈

| 技术 | 用途 |
|------|------|
| TypeScript | 主要开发语言 |
| @modelcontextprotocol/sdk | MCP SDK |
| Zod | 参数验证 |
| gray-matter | YAML frontmatter 解析 |
| fs-extra | 文件操作 |

## 九、与其他方案对比

| 特性 | Skillpilot (MCP) | SkillForge | OpenSkills (CLI) | Shell 脚本 |
|------|------------------|------------|------------------|------------|
| 调用方式 | 工具调用 | SKILL.md | Bash 命令 | Bash 命令 |
| Cursor 集成 | 原生 | Claude Code | 需要 Rules | 需要 Rules |
| 智能分流 | ✅ 支持 | ✅ 支持 | ❌ 不支持 | ❌ 不支持 |
| 创建技能 | ✅ 工具支持 | ✅ 4 阶段流程 | ❌ 手动 | ❌ 手动 |
| 更新技能 | ✅ 工具支持 | ✅ 支持 | ❌ 手动 | ❌ 手动 |
| 多 Agent 审核 | ❌ 简化 | ✅ 支持 | ❌ 不支持 | ❌ 不支持 |
| 依赖 | Node.js | Python | Node.js | 无 |

## 十、从 SkillForge 借鉴的设计

### 10.1 智能分流机制

SkillForge 的 Phase 0 "Universal Skill Triage" 是一个非常优秀的设计：

```
输入 → 分析 → 返回建议动作
         ├── USE_EXISTING
         ├── IMPROVE_EXISTING
         ├── CREATE_NEW
         └── COMPOSE
```

我们在 `sp_triage` 工具中实现了类似的机制。

### 10.2 领域匹配

SkillForge 使用**概念匹配**而非硬编码技能名称：

- 按领域分类（debugging、testing、spreadsheets 等）
- 智能同义词匹配
- 优雅降级（无匹配时返回 CREATE_NEW）

### 10.3 简化的设计

相比 SkillForge 的 4 阶段 + 多 Agent 审核，我们选择了更简化的方案：

| SkillForge | Skillpilot |
|------------|------------|
| 4 阶段架构 | 单步创建 |
| 11 个思维透镜 | 简化分析 |
| 多 Agent 审核 | 可选验证 |
| Python 脚本 | MCP 工具 |

原因：
1. MCP Server 定位是**管理工具**，不是**创建流程**
2. 简化流程更适合日常使用
3. 复杂的创建流程可以通过调用 SkillForge 实现

### 10.4 未来可能的整合

Skillpilot 和 SkillForge 可以互补：

```
Skillpilot (管理)          SkillForge (创建)
     │                           │
     │  sp_triage 返回           │
     │  CREATE_NEW               │
     │ ─────────────────────────>│
     │                           │
     │                    4 阶段创建流程
     │                           │
     │<─────────────────────────│
     │  返回新技能               │
     │                           │
     │  sp_create 保存           │
     ▼                           ▼
```

## 十一、总结

Skillpilot 是一个创新的技能管理 MCP Server，它：

1. **原生集成** - 通过 MCP 工具与 Cursor 深度集成
2. **智能分流** - 借鉴 SkillForge 的分流机制，自动判断操作
3. **功能完整** - 支持技能的完整生命周期管理
4. **简化设计** - 相比 SkillForge 更轻量，适合日常使用
5. **标准兼容** - 100% 兼容 Anthropic SKILL.md 规范

通过 Skillpilot，AI 编码代理可以更智能地管理和使用技能，提升开发效率。

---

*本文档为 Skillpilot 项目设计文档，具体实现可根据实际需求调整*
*借鉴了 [SkillForge](https://github.com/tripleyak/SkillForge) 的优秀设计*
