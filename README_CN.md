# Skillix MCP Server

> Skill + Mix = Skillix — 混合技能，智能赋能

Skillix 是一个基于 MCP (Model Context Protocol) 的技能管理系统，为 AI 编码代理（如 Cursor）提供技能的创建、管理、加载和进化能力。

## 🚀 Cursor 快速安装

### 一键安装

点击下方按钮，自动将 Skillix 添加到你的 Cursor MCP 配置：

[![在 Cursor 中安装](https://img.shields.io/badge/安装到-Cursor-blue?style=for-the-badge&logo=cursor)](cursor://anysphere.cursor-deeplink/mcp/install?name=skillix&config=eyJjb21tYW5kIjoibnB4IiwiYXJncyI6WyJza2lsbGl4LW1jcCJdfQ==)

### 手动安装

复制以下 JSON 配置，添加到你的 Cursor MCP 设置中：

```json
{
  "mcpServers": {
    "skillix": {
      "command": "npx",
      "args": ["skillix-mcp"]
    }
  }
}
```

**配置文件位置：** `~/.cursor/mcp.json`

## 功能特性

- 🎯 **技能管理** - 创建、读取、更新、删除本地技能，支持版本控制
- 🔍 **智能分流** - 智能任务分析和技能推荐
- 🛒 **技能市场** - 从远程源搜索、安装和卸载技能
- ⚙️ **配置管理** - 支持全局和项目级配置
- 📦 **本地优先策略** - 项目技能优先于全局技能
- 🔧 **MCP 集成** - 与 AI 编码助手无缝集成
- 🔄 **版本回退** - 内置备份和版本历史支持

## 安装

### 前置要求

- Node.js >= 18.0.0
- npm 或 yarn

### 使用 npx（推荐）

无需安装！只需将配置添加到你的 MCP 设置中：

```json
{
  "mcpServers": {
    "skillix": {
      "command": "npx",
      "args": ["skillix-mcp"]
    }
  }
}
```

### 从 npm 安装

```bash
npm install -g skillix-mcp
```

然后配置：

```json
{
  "mcpServers": {
    "skillix": {
      "command": "skillix-mcp"
    }
  }
}
```

### 从源码安装

```bash
# 克隆仓库
git clone https://github.com/shetengteng/skillix-mcp.git
cd skillix-mcp

# 安装依赖
npm install

# 构建
npm run build
```

然后配置：

```json
{
  "mcpServers": {
    "skillix": {
      "command": "node",
      "args": ["/path/to/skillix-mcp/dist/index.js"]
    }
  }
}
```

## 可用工具

### sx-dispatch

智能分流工具，用于任务分析和技能推荐。

| 参数 | 类型 | 必需 | 说明 |
|------|------|------|------|
| task | string | ✅ | 任务描述 |
| context | string | ❌ | 上下文信息 |
| hints | string[] | ❌ | 提示关键词 |
| projectRoot | string | ❌ | 项目根目录 |

**操作类型：**
- `USE_EXISTING` - 使用现有技能
- `IMPROVE_EXISTING` - 改进现有技能
- `CREATE_NEW` - 创建新技能
- `INSTALL` - 从市场安装
- `COMPOSE` - 组合多个技能
- `NO_SKILL_NEEDED` - 无需技能

**使用示例：**

```bash
# 分析任务
sx-dispatch task="将 PDF 转换为图片"
```

### sx-skill

本地技能管理工具。

| 操作 | 说明 |
|------|------|
| `list` | 列出所有全局和项目技能 |
| `read` | 读取技能详情，包括元数据和内容 |
| `create` | 创建新技能及目录结构 |
| `update` | 更新现有技能的元数据或内容（自动备份） |
| `delete` | 删除技能及其所有文件 |

**使用示例：**

```bash
# 列出所有技能
sx-skill action=list

# 读取技能
sx-skill action=read name=my-skill

# 创建新技能
sx-skill action=create name=my-skill metadata={"name":"my-skill","description":"我的第一个技能"} body="# 我的技能\n\n技能内容..."

# 更新技能（支持部分更新）
sx-skill action=update name=my-skill metadata={"version":"1.1.0"}

# 更新技能内容
sx-skill action=update name=my-skill body="# 更新后的内容"

# 删除技能
sx-skill action=delete name=my-skill
```

### sx-market

技能市场工具，用于搜索、安装和管理远程技能。

| 操作 | 说明 |
|------|------|
| `search` | 在市场中搜索技能 |
| `install` | 从市场安装技能 |
| `uninstall` | 卸载已安装的技能 |
| `sync` | 同步技能源缓存 |
| `status` | 查看源状态 |

**使用示例：**

```bash
# 搜索技能
sx-market action=search query=pdf

# 安装技能
sx-market action=install name=pdf-converter scope=global

# 强制覆盖安装
sx-market action=install name=pdf-converter force=true

# 卸载技能
sx-market action=uninstall name=pdf-converter

# 同步所有源
sx-market action=sync

# 查看源状态
sx-market action=status
```

### sx-config

配置管理工具。

| 操作 | 说明 |
|------|------|
| `get` | 获取全局或项目配置 |
| `set` | 设置配置值 |
| `init` | 初始化项目配置 |
| `sources` | 管理技能源（列出/添加/删除） |

**使用示例：**

```bash
# 获取配置
sx-config action=get scope=global

# 初始化项目
sx-config action=init projectRoot=/path/to/project

# 添加技能源
sx-config action=sources sourceAction=add source={"name":"my-source","url":"https://github.com/user/skills"}

# 列出技能源
sx-config action=sources sourceAction=list

# 删除技能源
sx-config action=sources sourceAction=remove sourceName=my-source
```

### sx-help

帮助信息工具。

| 主题 | 说明 |
|------|------|
| `overview` | Skillix 概述 |
| `skill` | sx-skill 工具帮助 |
| `config` | sx-config 工具帮助 |
| `market` | sx-market 工具帮助 |
| `dispatch` | sx-dispatch 工具帮助 |
| `all` | 所有帮助主题 |

**使用示例：**

```bash
# 获取概述帮助
sx-help topic=overview

# 获取技能工具帮助
sx-help topic=skill
```

## 技能格式

技能使用带有 YAML frontmatter 的 Markdown 文件定义：

```markdown
---
name: my-skill
description: 技能功能描述
version: 1.0.0
author: 作者名
tags: [标签1, 标签2]
---

# 我的技能

技能内容和指令...
```

### 技能目录结构

```
my-skill/
├── SKILL.md          # 必需：技能定义文件
├── scripts/          # 可选：可执行脚本
├── references/       # 可选：参考文档
├── assets/           # 可选：资源文件
├── logs/             # 可选：执行日志
│   ├── execution.log # 执行历史
│   └── evolution.log # 进化历史
└── .backup/          # 自动生成：版本备份
```

### 命名规则

- 格式：hyphen-case（小写字母、数字、连字符）
- 必须以小写字母开头
- 长度：2-64 字符
- 示例：✅ `pdf-converter` ❌ `PDF_Converter`

## 存储位置

### 全局目录 (`~/.skillix/`)

```
~/.skillix/
├── config.json       # 全局配置
├── skills/           # 全局技能目录
├── installed.json    # 安装记录
├── logs/             # 系统日志
├── cache/            # 缓存目录
│   ├── repos/        # Git 仓库缓存
│   └── indexes/      # 源索引
└── data/             # 数据目录
```

### 项目目录 (`.skillix/`)

```
project/
└── .skillix/
    ├── config.json   # 项目配置
    ├── skills/       # 项目级技能
    └── logs/         # 项目日志
```

## 本地优先策略

1. **技能查找顺序**：项目技能 → 全局技能 → 远程市场
2. **配置优先级**：项目配置 → 全局配置 → 默认配置
3. **同名技能**：项目级技能覆盖全局技能

## 工作流示例

### 智能分流工作流

```
用户: 帮我把 PDF 转换成图片
  ↓
AI → sx-dispatch: 分析任务
  ↓
Dispatch: USE_EXISTING, skill=pdf-converter
  ↓
AI → sx-skill read: 获取技能内容
  ↓
AI: 按照技能指令执行任务
```

### 从市场安装

```
用户: 我需要处理 Excel 文件
  ↓
AI → sx-dispatch: 分析任务
  ↓
Dispatch: INSTALL, skill=excel-handler
  ↓
AI → sx-market install: 安装技能
  ↓
AI → sx-skill read: 获取技能内容
  ↓
AI: 执行任务
```

## 开发

```bash
# 开发模式
npm run dev

# 构建
npm run build

# 运行测试
npm test

# 运行测试并生成覆盖率报告
npm run test:coverage

# 启动服务器
npm start
```

## 架构

```
skillix-mcp/
├── src/
│   ├── index.ts           # MCP Server 入口
│   ├── services/          # 业务逻辑层
│   │   ├── skill/         # 技能管理
│   │   ├── config/        # 配置管理
│   │   ├── market/        # 市场操作
│   │   └── dispatch/        # 智能分流
│   ├── tools/             # MCP 工具实现
│   │   ├── skills/        # sx-skill 工具
│   │   ├── configs/       # sx-config 工具
│   │   ├── markets/       # sx-market 工具
│   │   ├── dispatchs/       # sx-dispatch 工具
│   │   └── helps/         # sx-help 工具
│   └── utils/             # 工具函数
├── tests/                 # 测试文件
└── docs/                  # 设计文档
```

## 故障排除

### npx skillix-mcp: command not found

如果运行 `npx skillix-mcp` 时遇到此错误：

```
sh: skillix-mcp: command not found
```

或者看到大量 `TAR_ENTRY_ERROR` 警告：

```
npm warn tar TAR_ENTRY_ERROR ENOENT: no such file or directory...
```

**原因：** npx 缓存损坏。

**解决方案：**

```bash
# 清理 npm 缓存
npm cache clean --force

# 删除损坏的 npx 缓存（如果上述方法无效）
rm -rf ~/.npm/_npx/*

# 重新尝试
npx skillix-mcp
```

### MCP Server 无法连接

如果 Cursor 无法连接到 Skillix MCP Server：

1. **检查配置文件位置：**
   - macOS/Linux: `~/.cursor/mcp.json`
   - Windows: `%USERPROFILE%\.cursor\mcp.json`

2. **验证 JSON 语法：**
   ```json
   {
     "mcpServers": {
       "skillix": {
         "command": "npx",
         "args": ["skillix-mcp"]
       }
     }
   }
   ```

3. 修改配置后**重启 Cursor**。

4. **检查 Node.js 版本：**
   ```bash
   node --version  # 应该 >= 18.0.0
   ```

### 权限错误

如果遇到权限错误：

```bash
# 在 macOS/Linux 上，确保 npm 全局目录可写
sudo chown -R $(whoami) ~/.npm
```

## 许可证

MIT

## 贡献

欢迎贡献！请随时提交 Pull Request。

## 作者

shetengteng
