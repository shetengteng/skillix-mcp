/**
 * sx-help overview 主题
 * 概述帮助信息
 */

/**
 * 概述帮助内容
 */
export const OVERVIEW_HELP = `
# Skillix MCP Server 帮助

Skillix 是一个 AI 技能管理系统，帮助 AI 编程助手更好地完成任务。

## 核心概念

- **技能 (Skill)**: 一组指导 AI 完成特定任务的知识和规则
- **技能源 (Source)**: 技能的来源仓库，可以是官方市场或自定义仓库
- **范围 (Scope)**: 技能可以是全局的或项目级的

## 可用工具

1. **sx-skill** - 本地技能管理（list/read/create/update/delete）
2. **sx-config** - 配置管理（get/set/init/sources）
3. **sx-help** - 帮助信息

## 快速开始

1. 初始化项目配置：
   \`sx-config action=init projectRoot=/path/to/project\`

2. 列出所有技能：
   \`sx-skill action=list\`

3. 创建新技能：
   \`sx-skill action=create name=my-skill metadata={...} body="..."\`
`;
