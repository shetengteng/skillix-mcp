/**
 * Skillix Cursor Rule 模板
 * 
 * 用于 sx-config init 时自动安装到项目的 .cursor/rules/ 目录
 */

/**
 * Skillix MDC 规则内容
 * 
 * 混合方案设计：
 * - 层级 1：Cursor Rule 引导 AI 何时调用 sx-dispatch
 * - 层级 2：sx-dispatch 智能分流
 * - 层级 3：Skill Description 匹配
 */
export const SKILLIX_RULE_CONTENT = `---
description: Skillix 智能分流规则 - 任务分析与技能管理
globs:
alwaysApply: true
---

# Skillix 使用规范

## 核心原则

**在处理任务之前**，先判断是否需要使用 Skill。

## 需要调用 sx-dispatch 的情况

以下情况应调用 \`sx-dispatch task="任务描述"\`：

1. **文件处理任务** - 用户提到特定文件类型（PDF、Excel、图片、Word 等）
2. **工具/框架相关** - 涉及特定工具或框架的操作（Git、Docker、数据库等）
3. **重复性工作** - 用户描述的任务可能有现成解决方案
4. **转换/处理动词** - 用户使用"帮我"、"处理"、"转换"、"生成"、"分析"等动词
5. **批量操作** - 涉及批量处理、自动化流程
6. **用户明确提到技能** - 用户说"使用技能"、"有没有技能"等

## 不需要调用的情况

以下情况可直接处理，无需调用 sx-dispatch：

1. **简单问答** - 纯粹的问答对话、解释概念
2. **基础代码编写** - 简单的代码编写（除非涉及特定框架/工具）
3. **用户明确说明** - 用户说"直接处理"、"不用技能"
4. **Skillix 自身操作** - 用户在操作 Skillix 本身（如创建技能、配置等）

## 决策流程

\`\`\`
用户输入
    ↓
是否为任务请求？（非问答）
    ↓ 是
是否涉及文件/工具/重复性工作？
    ↓ 是
调用 sx-dispatch task="用户输入"
    ↓
根据返回的 action 执行
\`\`\`

## 操作类型

| action | 说明 | 下一步操作 |
|--------|------|-----------|
| USE_EXISTING | 使用现有技能 | \`sx-skill action=read name="技能名"\` |
| IMPROVE_EXISTING | 改进现有技能 | 先读取再更新技能 |
| CREATE_NEW | 创建新技能 | 引导用户后 \`sx-skill action=create\` |
| INSTALL | 从市场安装 | \`sx-market action=install name="技能名"\` |
| COMPOSE | 组合多个技能 | 按顺序执行多个技能 |
| NO_SKILL_NEEDED | 无需技能 | 直接执行任务 |

## 可用工具

- **sx-dispatch** - 智能分流，分析任务并匹配技能
- **sx-skill** - 技能管理（list/read/create/update/delete）
- **sx-market** - 技能市场（search/install/sync/status）
- **sx-config** - 配置管理（get/set/init/sources）
- **sx-help** - 获取帮助

## 注意事项

- 优先使用本地技能（项目级 > 全局级）
- 置信度 < 0.5 时询问用户确认
- 技能命名使用 hyphen-case 格式
- 调用 \`sx-help\` 获取详细使用说明
`;

/**
 * 获取规则文件名
 */
export const SKILLIX_RULE_FILENAME = 'skillix.mdc';
