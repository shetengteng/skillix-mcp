/**
 * MCP 工具统一导出
 */

export { sxSkill, sxSkillDefinition, type SxSkillParams } from './skills/index.js';
export { sxConfig, sxConfigDefinition, type SxConfigParams } from './configs/index.js';
export { sxHelp, sxHelpDefinition, type SxHelpParams } from './helps/index.js';

// 工具注册表
export { toolRegistry, getAvailableTools, type ToolConfig } from './registry.js';

// Schema 配置和构建器
export { toolSchemas, type PropertyDef, type ToolSchemaDef } from './tool-schemas.js';
export { buildToolSchema, buildToolSchemas } from './schema-builder.js';
