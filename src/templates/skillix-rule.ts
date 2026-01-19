/**
 * Skillix Cursor Rule 模板
 * 
 * 用于 sx-config init 时自动安装到项目的 .cursor/rules/ 目录
 */

/**
 * Skillix MDC 规则内容
 */
export const SKILLIX_RULE_CONTENT = `---
description: Skillix 智能分流规则 - 每次会话自动调用 sx-dispatch 进行任务分析
globs:
alwaysApply: true
---

# Skillix 使用规范

## 概述

Skillix 是一个基于 MCP 的技能管理系统，为 AI 编码代理提供技能的创建、管理、加载和进化能力。

## 会话启动流程

**重要**：每次新会话开始时，如果用户提出了一个任务需求，应该遵循以下流程：

### 1. 首先调用 sx-dispatch 分析任务

\`\`\`
sx-dispatch task="用户的任务描述"
\`\`\`

### 2. 根据返回结果决定下一步操作

| 操作类型 | 说明 | 下一步 |
|----------|------|--------|
| USE_EXISTING | 使用现有技能 | 调用 \`sx-skill action=read name="技能名"\` 读取技能内容 |
| IMPROVE_EXISTING | 改进现有技能 | 先读取技能，执行任务后调用 \`sx-skill action=update\` 更新 |
| CREATE_NEW | 创建新技能 | 引导用户创建新技能，使用 \`sx-skill action=create\` |
| INSTALL | 从市场安装 | 调用 \`sx-market action=install name="技能名"\` 安装 |
| COMPOSE | 组合多个技能 | 读取多个相关技能并组合使用 |
| NO_SKILL_NEEDED | 无需技能 | 直接执行任务，无需使用技能系统 |

### 3. 执行任务

根据技能内容执行用户的任务。

### 4. 反馈与进化（可选）

任务完成后，如果有改进建议，可以更新技能：

\`\`\`
sx-skill action=update name="技能名" body="更新后的内容"
\`\`\`

## 可用工具

| 工具 | 说明 |
|------|------|
| sx-dispatch | 智能分流，分析任务并推荐操作 |
| sx-skill | 技能管理（list, read, create, update, delete） |
| sx-market | 技能市场（search, install, uninstall, sync） |
| sx-config | 配置管理（get, set, init, sources） |
| sx-help | 帮助信息 |

## 示例工作流

### 场景：用户请求 "帮我把 PDF 转成图片"

1. **分析任务**
   \`\`\`
   sx-dispatch task="帮我把 PDF 转成图片"
   \`\`\`

2. **假设返回**：USE_EXISTING, skill=pdf-converter

3. **读取技能**
   \`\`\`
   sx-skill action=read name="pdf-converter"
   \`\`\`

4. **按照技能指引执行任务**

5. **任务完成后反馈**（如有改进）
   \`\`\`
   sx-skill action=update name="pdf-converter" body="更新后的内容"
   \`\`\`

## 注意事项

- 优先使用本地技能（项目级 > 全局级）
- 如果 sx-dispatch 返回低置信度，可以询问用户确认
- 创建新技能时，遵循 hyphen-case 命名规范
- 技能更新会自动创建备份，支持版本回退
`;

/**
 * 获取规则文件名
 */
export const SKILLIX_RULE_FILENAME = 'skillix.mdc';
