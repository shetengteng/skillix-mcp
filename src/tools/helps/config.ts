/**
 * sx-help config 主题
 * sx-config 工具帮助信息
 */

/**
 * sx-config 帮助内容
 */
export const CONFIG_HELP = `
# sx-config 工具帮助

配置管理工具，支持以下操作：

## 操作

### get - 获取配置
\`\`\`
sx-config action=get [scope=global|project] [projectRoot=/path/to/project] [key=configKey]
\`\`\`
获取全局或项目配置，可指定特定键。

### set - 设置配置
\`\`\`
sx-config action=set key=configKey value=configValue [scope=global|project] [projectRoot=/path/to/project]
\`\`\`
设置配置值。

### init - 初始化项目配置
\`\`\`
sx-config action=init projectRoot=/path/to/project
\`\`\`
在项目中初始化 .skillix/ 目录和配置文件。

### sources - 管理技能源
\`\`\`
sx-config action=sources sourceAction=list|add|remove [source={name, url, ...}] [sourceName=name] [scope=global|project] [projectRoot=/path/to/project]
\`\`\`
管理技能源（列出、添加、删除）。

## 配置文件位置

- 全局配置: ~/.skillix/config.json
- 项目配置: .skillix/config.json

## 本地优先策略

项目配置优先于全局配置，不存在时使用全局配置。
`;
