/**
 * sx-help skill 主题
 * sx-skill 工具帮助信息
 */

/**
 * sx-skill 帮助内容
 */
export const SKILL_HELP = `
# sx-skill 工具帮助

本地技能管理工具，支持以下操作：

## 操作

### list - 列出技能
\`\`\`
sx-skill action=list [projectRoot=/path/to/project]
\`\`\`
列出所有全局和项目级技能。

### read - 读取技能
\`\`\`
sx-skill action=read name=skill-name [projectRoot=/path/to/project]
\`\`\`
读取指定技能的详细内容，包括元数据、正文和资源列表。

### create - 创建技能
\`\`\`
sx-skill action=create name=skill-name metadata={name, description, ...} body="..." [scope=global|project] [projectRoot=/path/to/project]
\`\`\`
创建新技能，会自动创建目录结构（scripts/, references/, assets/, logs/）。

### update - 更新技能
\`\`\`
sx-skill action=update name=skill-name [metadata={...}] [body="..."] [projectRoot=/path/to/project]
\`\`\`
更新现有技能的元数据或正文内容。

### delete - 删除技能
\`\`\`
sx-skill action=delete name=skill-name [projectRoot=/path/to/project]
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
