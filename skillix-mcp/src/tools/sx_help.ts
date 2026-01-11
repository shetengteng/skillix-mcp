/**
 * sx_help 工具
 * 帮助信息和使用指南
 */

import type { ToolResponse } from '../types/response.js';

/**
 * sx_help 工具参数
 */
export interface SxHelpParams {
  topic?: 'overview' | 'skill' | 'config' | 'market' | 'triage' | 'all';
}

/**
 * 概述帮助
 */
const OVERVIEW_HELP = `
# Skillix MCP Server 帮助

Skillix 是一个 AI 技能管理系统，帮助 AI 编程助手更好地完成任务。

## 核心概念

- **技能 (Skill)**: 一组指导 AI 完成特定任务的知识和规则
- **技能源 (Source)**: 技能的来源仓库，可以是官方市场或自定义仓库
- **范围 (Scope)**: 技能可以是全局的或项目级的

## 可用工具

1. **sx_skill** - 本地技能管理（list/read/create/update/delete）
2. **sx_config** - 配置管理（get/set/init/sources）
3. **sx_help** - 帮助信息

## 快速开始

1. 初始化项目配置：
   \`sx_config action=init projectRoot=/path/to/project\`

2. 列出所有技能：
   \`sx_skill action=list\`

3. 创建新技能：
   \`sx_skill action=create name=my-skill metadata={...} body="..."\`
`;

/**
 * sx_skill 帮助
 */
const SKILL_HELP = `
# sx_skill 工具帮助

本地技能管理工具，支持以下操作：

## 操作

### list - 列出技能
\`\`\`
sx_skill action=list [projectRoot=/path/to/project]
\`\`\`
列出所有全局和项目级技能。

### read - 读取技能
\`\`\`
sx_skill action=read name=skill-name [projectRoot=/path/to/project]
\`\`\`
读取指定技能的详细内容，包括元数据、正文和资源列表。

### create - 创建技能
\`\`\`
sx_skill action=create name=skill-name metadata={name, description, ...} body="..." [scope=global|project] [projectRoot=/path/to/project]
\`\`\`
创建新技能，会自动创建目录结构（scripts/, references/, assets/, logs/）。

### update - 更新技能
\`\`\`
sx_skill action=update name=skill-name [metadata={...}] [body="..."] [projectRoot=/path/to/project]
\`\`\`
更新现有技能的元数据或正文内容。

### delete - 删除技能
\`\`\`
sx_skill action=delete name=skill-name [projectRoot=/path/to/project]
\`\`\`
删除指定技能及其所有文件。

## 技能结构

\`\`\`
skill-name/
├── SKILL.md          # 技能定义文件
├── scripts/          # 脚本目录
├── references/       # 参考资料目录
├── assets/           # 资源文件目录
└── logs/             # 日志目录
\`\`\`
`;

/**
 * sx_config 帮助
 */
const CONFIG_HELP = `
# sx_config 工具帮助

配置管理工具，支持以下操作：

## 操作

### get - 获取配置
\`\`\`
sx_config action=get [scope=global|project] [projectRoot=/path/to/project] [key=configKey]
\`\`\`
获取全局或项目配置，可指定特定键。

### set - 设置配置
\`\`\`
sx_config action=set key=configKey value=configValue [scope=global|project] [projectRoot=/path/to/project]
\`\`\`
设置配置值。

### init - 初始化项目配置
\`\`\`
sx_config action=init projectRoot=/path/to/project
\`\`\`
在项目中初始化 .skillix/ 目录和配置文件。

### sources - 管理技能源
\`\`\`
sx_config action=sources sourceAction=list|add|remove [source={name, url, ...}] [sourceName=name] [scope=global|project] [projectRoot=/path/to/project]
\`\`\`
管理技能源（列出、添加、删除）。

## 配置文件位置

- 全局配置: ~/.skillix/config.json
- 项目配置: .skillix/config.json

## 本地优先策略

项目配置优先于全局配置，不存在时使用全局配置。
`;

/**
 * sx_help 工具主入口
 */
export function sxHelp(params: SxHelpParams): ToolResponse {
  const { topic = 'overview' } = params;
  
  let helpContent: string;
  
  switch (topic) {
    case 'overview':
      helpContent = OVERVIEW_HELP;
      break;
    case 'skill':
      helpContent = SKILL_HELP;
      break;
    case 'config':
      helpContent = CONFIG_HELP;
      break;
    case 'all':
      helpContent = [OVERVIEW_HELP, SKILL_HELP, CONFIG_HELP].join('\n\n---\n\n');
      break;
    default:
      return {
        success: false,
        message: `未知主题: ${topic}`,
        errors: ['支持的主题: overview, skill, config, all'],
      };
  }
  
  return {
    success: true,
    message: `帮助信息: ${topic}`,
    data: {
      topic,
      content: helpContent.trim(),
    },
  };
}

/**
 * 工具定义（用于 MCP 注册）
 */
export const sxHelpDefinition = {
  name: 'sx_help',
  description: '帮助信息工具，提供 Skillix 使用指南',
  inputSchema: {
    type: 'object',
    properties: {
      topic: {
        type: 'string',
        enum: ['overview', 'skill', 'config', 'market', 'triage', 'all'],
        description: '帮助主题（默认 overview）',
      },
    },
  },
};
