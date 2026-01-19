# OpenSkills CLI 项目分析文档

> 最后更新：2026-01-09

## 1. 项目概述

### 1.1 项目定位

**OpenSkills** 是一个通用技能加载器 CLI 工具，将 Anthropic 的技能系统带到所有 AI 编码代理（Claude Code、Cursor、Windsurf、Aider）。

- **仓库地址**: https://github.com/numman-ali/openskills
- **当前版本**: 1.3.0
- **许可证**: Apache-2.0
- **技术栈**: TypeScript / Node.js
- **NPM 包**: `openskills`

### 1.2 核心价值

**"与 Claude Code 技能系统最接近的实现"** — 相同的 prompt 格式、相同的市场、相同的文件夹，只是使用 CLI 而非工具调用。

```bash
npm i -g openskills
openskills install anthropics/skills
openskills sync
```

### 1.3 目标用户

**对于 Claude Code 用户**:
- 从任何 GitHub 仓库安装技能，不仅限于市场
- 从本地路径或私有 git 仓库安装
- 跨多个代理共享技能
- 在仓库中版本控制技能
- 通过符号链接进行本地开发

**对于其他代理 (Cursor, Windsurf, Aider)**:
- 获得 Claude Code 的技能系统
- 通过 GitHub 访问 Anthropic 市场技能
- 使用渐进式披露（按需加载技能）

---

## 2. 架构设计

### 2.1 与 Claude Code 的兼容性对比

| 方面 | Claude Code | OpenSkills |
|------|-------------|------------|
| **系统提示** | 内置于 Claude Code | 在 AGENTS.md 中 |
| **调用方式** | `Skill("pdf")` 工具 | `openskills read pdf` CLI |
| **Prompt 格式** | `<available_skills>` XML | `<available_skills>` XML (相同) |
| **文件夹结构** | `.claude/skills/` | `.claude/skills/` (相同) |
| **SKILL.md 格式** | YAML + markdown | YAML + markdown (相同) |
| **渐进式披露** | 是 | 是 |
| **捆绑资源** | `references/`, `scripts/`, `assets/` | 相同 |
| **市场** | Anthropic 市场 | GitHub (anthropics/skills) |

**唯一区别**: 调用方法不同，其他完全兼容。

### 2.2 工作流程

```
代理读取 AGENTS.md
        ↓
看到 <available_skills> 列表
        ↓
用户请求: "Extract data from this PDF"
        ↓
代理扫描 <available_skills> → 找到 "pdf" 技能
        ↓
代理执行: Bash("openskills read pdf")
        ↓
SKILL.md 内容输出到代理上下文
        ↓
代理遵循指令完成任务
```

### 2.3 生成的 AGENTS.md 格式

```xml
<skills_system priority="1">

## Available Skills

<!-- SKILLS_TABLE_START -->
<usage>
When users ask you to perform tasks, check if any of the available skills 
below can help complete the task more effectively.

How to use skills:
- Invoke: Bash("openskills read <skill-name>")
- The skill content will load with detailed instructions
- Base directory provided in output for resolving bundled resources

Usage notes:
- Only use skills listed in <available_skills> below
- Do not invoke a skill that is already loaded in your context
</usage>

<available_skills>

<skill>
<name>pdf</name>
<description>Comprehensive PDF manipulation toolkit...</description>
<location>project</location>
</skill>

<skill>
<name>xlsx</name>
<description>Spreadsheet creation and analysis...</description>
<location>project</location>
</skill>

</available_skills>
<!-- SKILLS_TABLE_END -->

</skills_system>
```

---

## 3. 目录结构

```
openskills/
├── package.json                # 项目配置和依赖
├── tsconfig.json              # TypeScript 配置
├── tsup.config.ts             # 构建配置 (tsup 打包器)
├── vitest.config.ts           # 测试配置 (vitest)
│
├── src/                       # 源代码
│   ├── cli.ts                 # CLI 入口点 (Commander.js)
│   ├── types.ts               # TypeScript 类型定义
│   │
│   ├── commands/              # 命令实现
│   │   ├── install.ts         # 安装技能命令
│   │   ├── list.ts            # 列出已安装技能
│   │   ├── read.ts            # 读取技能内容 (供代理调用)
│   │   ├── sync.ts            # 同步到 AGENTS.md
│   │   ├── manage.ts          # 交互式管理技能
│   │   └── remove.ts          # 删除技能
│   │
│   └── utils/                 # 工具函数
│       ├── agents-md.ts       # AGENTS.md 生成/更新
│       ├── dirs.ts            # 目录路径处理
│       ├── marketplace-skills.ts  # Anthropic 市场技能列表
│       ├── skills.ts          # 技能发现和查找
│       └── yaml.ts            # YAML frontmatter 解析
│
├── tests/                     # 测试文件
│   ├── commands/              # 命令测试
│   │   ├── install.test.ts
│   │   └── read.test.ts
│   ├── integration/           # 集成测试
│   │   └── cli.test.ts
│   └── utils/                 # 工具测试
│       ├── agents-md.test.ts
│       ├── skills.test.ts
│       └── yaml.test.ts
│
├── examples/                  # 示例
│   └── my-first-skill/
│       ├── README.md
│       └── SKILL.md
│
├── CHANGELOG.md               # 版本变更记录
├── CONTRIBUTING.md            # 贡献指南
├── SECURITY.md                # 安全政策
├── LICENSE                    # Apache-2.0 许可证
└── README.md                  # 项目说明
```

---

## 4. 核心功能详解

### 4.1 CLI 命令

```bash
openskills install <source> [options]  # 从 GitHub、本地路径或私有仓库安装
openskills sync [-y] [-o <path>]       # 更新 AGENTS.md
openskills list                        # 显示已安装技能
openskills read <name>                 # 加载技能 (供代理使用)
openskills manage                      # 交互式管理 (删除技能)
openskills remove <name>               # 删除指定技能
```

### 4.2 安装选项

| 标志 | 说明 |
|------|------|
| `--global` | 全局安装到 `~/.claude/skills` (默认: 项目安装) |
| `--universal` | 安装到 `.agent/skills/` (高级用法) |
| `-y, --yes` | 跳过所有提示，安装所有找到的技能 |
| `-o, --output <path>` | 自定义 sync 输出文件 (默认: `AGENTS.md`) |

### 4.3 安装来源

```bash
# 从 Anthropic 市场 (交互选择)
openskills install anthropics/skills

# 从任意 GitHub 仓库
openskills install your-org/custom-skills

# 绝对路径
openskills install /path/to/my-skill

# 相对路径
openskills install ./local-skills/my-skill

# Home 目录
openskills install ~/my-skills/custom-skill

# SSH (使用 SSH 密钥)
openskills install git@github.com:your-org/private-skills.git

# HTTPS
openskills install https://github.com/your-org/private-skills.git
```

### 4.4 技能搜索优先级

OpenSkills 按以下优先级搜索 4 个位置：

1. `./.agent/skills/` (项目通用)
2. `~/.agent/skills/` (全局通用)
3. `./.claude/skills/` (项目)
4. `~/.claude/skills/` (全局)

同名技能只出现一次（最高优先级获胜）。

---

## 5. 关键代码分析

### 5.1 类型定义 (`src/types.ts`)

```typescript
// 技能基本信息
export interface Skill {
  name: string;
  description: string;
  location: 'project' | 'global';
  path: string;
}

// 技能位置信息
export interface SkillLocation {
  path: string;      // SKILL.md 完整路径
  baseDir: string;   // 技能目录
  source: string;    // 来源目录
}

// 安装选项
export interface InstallOptions {
  global?: boolean;    // 全局安装
  universal?: boolean; // 通用模式 (.agent/skills/)
  yes?: boolean;       // 跳过交互
}

// 技能元数据
export interface SkillMetadata {
  name: string;
  description: string;
  context?: string;
}
```

### 5.2 CLI 入口 (`src/cli.ts`)

```typescript
#!/usr/bin/env node

import { Command } from 'commander';
import { listSkills } from './commands/list.js';
import { installSkill } from './commands/install.js';
import { readSkill } from './commands/read.js';
import { removeSkill } from './commands/remove.js';
import { manageSkills } from './commands/manage.js';
import { syncAgentsMd } from './commands/sync.js';

const program = new Command();

program
  .name('openskills')
  .description('Universal skills loader for AI coding agents')
  .version('1.2.1');

program.command('install <source>')
  .option('-g, --global', 'Install globally')
  .option('-u, --universal', 'Install to .agent/skills/')
  .option('-y, --yes', 'Skip interactive selection')
  .action(installSkill);

// ... 其他命令
```

### 5.3 技能发现 (`src/utils/skills.ts`)

```typescript
// 查找所有已安装技能
export function findAllSkills(): Skill[] {
  const skills: Skill[] = [];
  const seen = new Set<string>();
  const dirs = getSearchDirs();

  for (const dir of dirs) {
    if (!existsSync(dir)) continue;

    const entries = readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      // 支持目录和符号链接
      if (isDirectoryOrSymlinkToDirectory(entry, dir)) {
        if (seen.has(entry.name)) continue;  // 去重

        const skillPath = join(dir, entry.name, 'SKILL.md');
        if (existsSync(skillPath)) {
          const content = readFileSync(skillPath, 'utf-8');
          const isProjectLocal = dir.includes(process.cwd());

          skills.push({
            name: entry.name,
            description: extractYamlField(content, 'description'),
            location: isProjectLocal ? 'project' : 'global',
            path: join(dir, entry.name),
          });

          seen.add(entry.name);
        }
      }
    }
  }

  return skills;
}
```

### 5.4 安装命令 (`src/commands/install.ts`)

核心逻辑约 450 行，主要功能：

```typescript
export async function installSkill(source: string, options: InstallOptions) {
  // 1. 确定目标目录
  const folder = options.universal ? '.agent/skills' : '.claude/skills';
  const targetDir = options.global 
    ? join(homedir(), folder) 
    : join(process.cwd(), folder);

  // 2. 判断来源类型
  if (isLocalPath(source)) {
    await installFromLocal(localPath, targetDir, options);
  } else if (isGitUrl(source)) {
    // 克隆并安装
    execSync(`git clone --depth 1 --quiet "${repoUrl}" "${tempDir}/repo"`);
    await installFromRepo(repoDir, targetDir, options);
  } else {
    // GitHub shorthand: owner/repo
    repoUrl = `https://github.com/${source}`;
    // ...
  }
}

// 安全检查
const resolvedTargetPath = resolve(targetPath);
const resolvedTargetDir = resolve(targetDir);
if (!resolvedTargetPath.startsWith(resolvedTargetDir + '/')) {
  console.error('Security error: Installation path outside target directory');
  process.exit(1);
}
```

---

## 6. 技能结构规范

### 6.1 最小结构

```
my-skill/
└── SKILL.md
    ---
    name: my-skill
    description: What this does and when to use it
    ---

    # Instructions in imperative form

    When the user asks you to X, do Y...
```

### 6.2 完整结构（含捆绑资源）

```
my-skill/
├── SKILL.md               # 主技能文件
├── references/            # 支持文档
│   └── api-docs.md
├── scripts/               # 辅助脚本
│   └── process.py
└── assets/                # 模板、配置
    └── template.json
```

### 6.3 SKILL.md 格式

```markdown
---
name: pdf
description: Comprehensive PDF manipulation toolkit for extracting 
text and tables, creating new PDFs, merging/splitting documents...
---

# PDF Skill Instructions

When the user asks you to work with PDFs, follow these steps:

1. Install dependencies: `pip install pypdf2`
2. Extract text using the extract_text.py script in scripts/
3. For bundled resources, use the base directory provided
4. ...

[详细指令供 Claude/代理遵循]
```

---

## 7. 依赖说明

### 7.1 运行时依赖

```json
{
  "dependencies": {
    "@inquirer/prompts": "^7.9.0",  // 交互式选择
    "chalk": "^5.6.2",              // 彩色输出
    "commander": "^12.1.0",         // CLI 框架
    "ora": "^9.0.0"                 // 加载动画
  }
}
```

### 7.2 开发依赖

```json
{
  "devDependencies": {
    "@types/node": "^24.9.1",       // Node.js 类型
    "tsup": "^8.5.0",               // 打包器
    "typescript": "^5.9.3",         // TypeScript
    "vitest": "^4.0.3"              // 测试框架
  }
}
```

### 7.3 系统要求

- **Node.js**: 20.6+ (for ora dependency)
- **Git**: 用于克隆仓库

---

## 8. 使用示例

### 8.1 基本工作流

```bash
# 1. 安装 CLI
npm i -g openskills

# 2. 安装 Anthropic 官方技能
openskills install anthropics/skills

# 3. 查看已安装技能
openskills list

# 4. 同步到 AGENTS.md
openskills sync

# 5. 代理调用技能
openskills read pdf
```

### 8.2 本地开发工作流

```bash
# 克隆开发中的技能仓库
git clone git@github.com:your-org/my-skills.git ~/dev/my-skills

# 通过符号链接添加到项目
mkdir -p .claude/skills
ln -s ~/dev/my-skills/my-skill .claude/skills/my-skill

# 修改后立即生效
openskills list  # 显示 my-skill
openskills sync  # 更新 AGENTS.md
```

### 8.3 CI/CD 非交互式安装

```bash
# 跳过所有提示
openskills install anthropics/skills -y
openskills sync -y
```

---

## 9. 高级功能

### 9.1 Universal 模式

解决 Claude Code + 其他代理共存时的冲突问题：

```bash
# 安装到 .agent/skills/ 而非 .claude/skills/
openskills install anthropics/skills --universal
```

**使用场景**:
- ✅ 使用 Claude Code + Cursor/Windsurf/Aider 共享 AGENTS.md
- ✅ 避免重复技能定义
- ✅ 保持 `.claude/` 仅供 Claude Code 使用

### 9.2 自定义同步输出

```bash
# 同步到默认 AGENTS.md
openskills sync

# 同步到自定义文件
openskills sync --output .ruler/AGENTS.md
openskills sync -o custom-rules.md
```

### 9.3 市场冲突警告

全局安装与 Anthropic 市场同名技能时会警告：

```
⚠️  Warning: 'pdf' matches an Anthropic marketplace skill
   Installing globally may conflict with Claude Code plugins.
   Recommend: Use --project flag for conflict-free installation.
```

---

## 10. 快速阅读指南

| 优先级 | 文件 | 阅读目的 |
|--------|------|----------|
| 🔴 高 | `src/cli.ts` | 理解 CLI 结构和命令定义 |
| 🔴 高 | `src/commands/install.ts` | 理解安装逻辑（核心功能） |
| 🔴 高 | `src/types.ts` | 理解数据结构 |
| 🟡 中 | `src/utils/skills.ts` | 理解技能发现机制 |
| 🟡 中 | `src/commands/sync.ts` | 理解 AGENTS.md 生成 |
| 🟢 低 | `src/utils/agents-md.ts` | AGENTS.md 模板细节 |
| 🟢 低 | `examples/my-first-skill/` | 技能结构示例 |

---

## 11. 与 MCP 的关系

**为什么使用 CLI 而非 MCP？**

| 方面 | MCP | Skills (SKILL.md) |
|------|-----|-------------------|
| **用途** | 数据库连接、API 集成、实时数据 | 专业工作流、捆绑资源、渐进式披露 |
| **实现** | 服务器-客户端连接 | Markdown 文件 + 指令 |
| **依赖** | 需要运行服务器 | 只是文件 |
| **兼容性** | 需要 MCP 支持 | 任何代理可用 |
| **复杂度** | 配置服务器、认证、生命周期管理 | `openskills install` 即可 |

**结论**: MCP 和技能解决不同问题。OpenSkills 实现 Anthropic 的技能规范（SKILL.md 格式）——设计为渐进式加载的 markdown 指令。

---

## 12. 归属说明

实现 [Anthropic's Agent Skills](https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills) 规范。

**不隶属于 Anthropic。** Claude、Claude Code 和 Agent Skills 是 Anthropic, PBC 的商标。
