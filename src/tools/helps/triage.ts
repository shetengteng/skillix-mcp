/**
 * sx-help triage 主题
 * sx-triage 工具帮助信息
 */

/**
 * sx-triage 帮助内容
 */
export const TRIAGE_HELP = `
# sx-triage 工具帮助

智能分流工具，分析任务并推荐最佳操作。

## 功能

- 分析用户输入的任务描述
- 匹配现有技能
- 推荐操作类型（使用/创建/安装等）
- 返回置信度和推荐理由

## 使用方法

\`\`\`
sx-triage task="任务描述" [context="上下文"] [hints=["提示1","提示2"]] [projectRoot="/path/to/project"]
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
sx-triage task="帮我把 PDF 转成图片"
\`\`\`

### 带上下文

\`\`\`
sx-triage task="处理数据文件" context="需要将 CSV 转换为 JSON 格式"
\`\`\`

### 带提示词

\`\`\`
sx-triage task="生成文档" hints=["api", "markdown", "自动化"]
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
`;
