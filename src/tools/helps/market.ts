/**
 * sx-market 帮助信息
 */

export const MARKET_HELP = `
# sx-market 技能市场帮助

## 概述

sx-market 是 Skillix 的技能市场工具，负责从远程技能源搜索、安装和卸载技能。

## 支持的操作

| 操作 | 说明 | 主要参数 |
|------|------|----------|
| search | 搜索技能市场 | query, tags, source |
| install | 安装技能 | name, source, scope, force |
| uninstall | 卸载技能 | name, scope |
| sync | 同步源缓存 | source, force |
| status | 查看源状态 | source |

## 搜索技能

\`\`\`
sx-market({
  action: "search",
  query: "pdf",           // 搜索关键词
  tags: ["converter"],    // 可选：按标签筛选
  source: "official",     // 可选：指定源
  limit: 10               // 可选：结果数量限制
})
\`\`\`

## 安装技能

\`\`\`
// 安装到全局
sx-market({
  action: "install",
  name: "pdf-converter",
  scope: "global"         // 默认
})

// 安装到项目
sx-market({
  action: "install",
  name: "pdf-converter",
  scope: "project",
  projectRoot: "/path/to/project"
})

// 强制覆盖已存在的技能
sx-market({
  action: "install",
  name: "pdf-converter",
  force: true
})
\`\`\`

## 卸载技能

\`\`\`
sx-market({
  action: "uninstall",
  name: "pdf-converter",
  scope: "global"         // 或 "project"
})
\`\`\`

## 同步源缓存

\`\`\`
// 同步所有源
sx-market({
  action: "sync"
})

// 同步指定源
sx-market({
  action: "sync",
  source: "official"
})

// 强制同步（忽略缓存有效期）
sx-market({
  action: "sync",
  force: true
})
\`\`\`

## 查看源状态

\`\`\`
// 查看所有源状态
sx-market({
  action: "status"
})

// 查看指定源状态
sx-market({
  action: "status",
  source: "official"
})
\`\`\`

## 更新已安装技能

1. 先同步缓存：\`sx-market({ action: "sync" })\`
2. 重新安装：\`sx-market({ action: "install", name: "skill-name", force: true })\`

## 安装位置

| scope | 安装路径 | 说明 |
|-------|----------|------|
| global | ~/.skillix/skills/{name}/ | 全局安装，所有项目可用 |
| project | .skillix/skills/{name}/ | 项目安装，仅当前项目可用 |

## 技能源配置

使用 sx-config 管理技能源：

\`\`\`
// 添加源
sx-config({
  action: "sources",
  sourceAction: "add",
  source: {
    name: "team",
    url: "https://github.com/company/team-skills",
    branch: "main"
  }
})

// 列出源
sx-config({
  action: "sources",
  sourceAction: "list"
})
\`\`\`
`;
