/**
 * sx-help dispatch 主题
 * sx-dispatch 工具帮助信息
 */

/**
 * sx-dispatch 帮助内容
 */
export const DISPATCH_HELP = `
# sx-dispatch 工具帮助

智能分流工具，分析任务并推荐最佳操作。

## 功能

- 分析用户输入的任务描述
- 匹配现有技能
- 推荐操作类型（使用/创建/安装等）
- 返回置信度和推荐理由

## 使用方法

\`\`\`
sx-dispatch task="任务描述" [context="上下文"] [hints=["提示1","提示2"]] [projectRoot="/path/to/project"]
\`\`\`

## 参数说明

| 参数 | 类型 | 必需 | 说明 |
|------|------|------|------|
| task | string | ✅ | 任务描述 |
| context | string | ❌ | 上下文信息 |
| hints | string[] | ❌ | 提示词列表 |
| projectRoot | string | ❌ | 项目根目录 |

## 返回的操作类型

| 操作类型 | 说明 |
|----------|------|
| USE_EXISTING | 使用现有技能 |
| IMPROVE_EXISTING | 改进现有技能 |
| CREATE_NEW | 创建新技能 |
| INSTALL | 从市场安装 |
| COMPOSE | 组合多个技能 |
| NO_SKILL_NEEDED | 无需技能 |

## 示例

### 基本使用

\`\`\`
sx-dispatch task="帮我把 PDF 转成图片"
\`\`\`

### 带上下文

\`\`\`
sx-dispatch task="处理数据文件" context="需要将 CSV 转换为 JSON 格式"
\`\`\`

### 带提示词

\`\`\`
sx-dispatch task="生成文档" hints=["api", "markdown", "自动化"]
\`\`\`

## 响应示例

\`\`\`json
{
  "success": true,
  "message": "推荐使用现有技能 \\"pdf-converter\\"",
  "data": {
    "action": "USE_EXISTING",
    "skill": "pdf-converter",
    "source": "global",
    "confidence": 0.85,
    "reason": "找到高度匹配的技能 \\"pdf-converter\\"（匹配度: 85%），建议直接使用",
    "nextSteps": [
      "使用 sx-skill action=read name=\\"pdf-converter\\" 查看技能内容",
      "按照技能指引执行任务"
    ]
  }
}
\`\`\`

## 匹配算法

分流工具使用以下算法计算匹配度：

1. **名称匹配** (权重 40%): 关键词与技能名称的匹配程度
2. **描述匹配** (权重 40%): 任务描述与技能描述的相似度
3. **标签匹配** (权重 20%): 关键词与技能标签的匹配程度

## 置信度级别

| 置信度 | 级别 | 建议操作 |
|--------|------|----------|
| >= 0.9 | 非常高 | 直接执行 |
| >= 0.7 | 高 | 建议执行 |
| >= 0.5 | 中等 | 询问确认 |
| < 0.5 | 低 | 提供选项 |

## IMPROVE_EXISTING 更新建议

当返回 \`IMPROVE_EXISTING\` 操作时，会额外提供 \`updateSuggestion\` 字段，包含具体的更新建议：

\`\`\`json
{
  "action": "IMPROVE_EXISTING",
  "skill": "data-processor",
  "confidence": 0.35,
  "reason": "找到部分匹配的技能...",
  "updateSuggestion": {
    "reason": "missing_feature",
    "confidence": 0.35,
    "suggestedChanges": [
      "技能可能缺少任务所需的功能，考虑扩展技能内容",
      "考虑在描述中添加以下关键词: csv, json, 转换",
      "先读取技能内容: sx-skill action=read name=\\"data-processor\\"",
      "分析差距后使用 sx-skill action=update 更新技能"
    ],
    "missingFeatures": ["csv", "json", "转换"],
    "matchedKeywords": ["数据", "处理"],
    "unmatchedKeywords": ["csv", "json", "转换", "格式"]
  }
}
\`\`\`

### updateSuggestion 字段说明

| 字段 | 类型 | 说明 |
|------|------|------|
| reason | string | 建议更新的原因类型 |
| confidence | number | 置信度 (0-1) |
| suggestedChanges | string[] | 具体的更新建议列表 |
| missingFeatures | string[] | 缺失的功能（可选） |
| matchedKeywords | string[] | 已匹配的关键词（可选） |
| unmatchedKeywords | string[] | 未匹配的关键词（可选） |

### reason 类型说明

| 类型 | 说明 |
|------|------|
| partial_match | 部分匹配，通用情况 |
| missing_feature | 功能缺失 |
| outdated | 技能过时 |
| low_description_match | 描述匹配度低 |
| low_tag_match | 标签匹配度低 |
`;
