/**
 * sx-help feedback 主题
 * sx-feedback 工具帮助信息
 */

/**
 * sx-feedback 帮助内容
 */
export const FEEDBACK_HELP = `
# sx-feedback 工具帮助

技能反馈管理工具，记录和分析技能使用反馈。

## 功能

- 记录技能执行结果（成功/失败/部分成功）
- 查看技能反馈历史
- 分析技能表现，判断是否需要更新
- 清除反馈记录

## 使用方法

\`\`\`
sx-feedback action="操作类型" [skillName="技能名"] [result="结果"] [其他参数]
\`\`\`

## 操作类型

| 操作 | 说明 | 必需参数 |
|------|------|----------|
| record | 记录反馈 | skillName, result |
| list | 列出反馈 | - |
| analyze | 分析反馈 | skillName |
| clear | 清除反馈 | - |

## 参数说明

| 参数 | 类型 | 说明 |
|------|------|------|
| action | string | 操作类型（必需） |
| skillName | string | 技能名称 |
| result | string | 执行结果: success, failure, partial |
| task | string | 任务描述（可选） |
| notes | string | 备注信息（可选） |
| scope | string | 范围: global, project（默认 global） |
| projectRoot | string | 项目根目录 |
| days | number | 时间范围（天） |

## 示例

### 记录成功反馈

\`\`\`
sx-feedback action=record skillName="pdf-converter" result="success" task="转换 PDF 为图片"
\`\`\`

### 记录失败反馈

\`\`\`
sx-feedback action=record skillName="pdf-converter" result="failure" notes="pdftoppm 命令不存在"
\`\`\`

### 记录部分成功

\`\`\`
sx-feedback action=record skillName="data-processor" result="partial" notes="只处理了部分数据"
\`\`\`

### 列出所有反馈

\`\`\`
sx-feedback action=list
\`\`\`

### 列出指定技能的反馈

\`\`\`
sx-feedback action=list skillName="pdf-converter" days=7
\`\`\`

### 分析技能反馈

\`\`\`
sx-feedback action=analyze skillName="pdf-converter"
\`\`\`

### 清除技能反馈

\`\`\`
sx-feedback action=clear skillName="pdf-converter"
\`\`\`

## 响应示例

### 分析结果示例

\`\`\`json
{
  "success": true,
  "message": "技能 \\"pdf-converter\\" 建议更新: 近期失败 3 次，建议检查技能是否需要更新",
  "data": {
    "analysis": {
      "skillName": "pdf-converter",
      "totalCount": 10,
      "successCount": 5,
      "failureCount": 3,
      "partialCount": 2,
      "successRate": "50.0%",
      "shouldUpdate": true,
      "updateReason": "近期失败 3 次，建议检查技能是否需要更新"
    },
    "nextSteps": [
      "使用 sx-skill action=read name=\\"pdf-converter\\" 查看技能内容",
      "分析失败原因后使用 sx-skill action=update 更新技能"
    ]
  }
}
\`\`\`

## 更新判断规则

系统会根据以下规则判断技能是否需要更新：

| 规则 | 条件 | 说明 |
|------|------|------|
| 多次失败 | 失败次数 >= 3 | 技能可能存在问题 |
| 低成功率 | 成功率 < 50% 且样本 >= 5 | 技能表现不佳 |
| 频繁部分成功 | 部分成功 >= 3 且 > 成功次数 | 技能功能可能不完整 |

## 最佳实践

1. **及时记录反馈**：每次使用技能后记录结果
2. **定期分析**：定期使用 analyze 检查技能健康度
3. **关注失败**：失败时记录详细的 notes 便于后续分析
4. **清理过期数据**：定期清理不再需要的反馈记录
`;
