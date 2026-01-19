/**
 * MCP 工具统一导出和配置
 */

import { sxSkillDefinition } from './skills/index.js';
import { sxConfigDefinition } from './configs/index.js';
import { sxHelpDefinition } from './helps/index.js';
import { sxMarketDefinition } from './markets/index.js';
import { sxDispatchDefinition } from './dispatches/index.js';

// 导出工具函数和类型
export { sxSkill, sxSkillDefinition, type SxSkillParams } from './skills/index.js';
export { sxConfig, sxConfigDefinition, type SxConfigParams } from './configs/index.js';
export { sxHelp, sxHelpDefinition, type SxHelpParams } from './helps/index.js';
export { sxMarket, sxMarketDefinition, type SxMarketParams } from './markets/index.js';
export { sxDispatch, sxDispatchDefinition, type SxDispatchParams } from './dispatches/index.js';

/**
 * 工具配置列表
 * 
 * 直接使用各工具的 definition（已包含 handler）
 */
export const toolDefinitions = [
  sxSkillDefinition,
  sxConfigDefinition,
  sxHelpDefinition,
  sxMarketDefinition,
  sxDispatchDefinition,
];

/**
 * 获取所有可用工具名称
 */
export function getToolNames(): string[] {
  return toolDefinitions.map(t => t.name);
}
