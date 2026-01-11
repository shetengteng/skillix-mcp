/**
 * sx-config init 子命令
 * 初始化项目配置
 */

import type { ToolResponse } from '../../types/response/tool.js';
import type { SxConfigParams } from '../types.js';
import { configService } from '../../services/index.js';

/**
 * 初始化项目配置
 */
export function handleInit(params: SxConfigParams): ToolResponse {
  const { projectRoot } = params;
  
  if (!projectRoot) {
    return {
      success: false,
      message: '初始化项目配置需要指定项目根目录',
      errors: ['参数 projectRoot 是必需的'],
    };
  }
  
  try {
    // 检查是否已存在
    const existingConfig = configService.getProjectConfig(projectRoot);
    
    if (existingConfig) {
      return {
        success: true,
        message: '项目配置已存在',
        data: existingConfig,
        warnings: ['项目配置已存在，未进行覆盖'],
      };
    }
    
    const config = configService.initProjectConfig(projectRoot);
    
    return {
      success: true,
      message: '成功初始化项目配置',
      data: config,
    };
  } catch (error) {
    return {
      success: false,
      message: '初始化项目配置失败',
      errors: [error instanceof Error ? error.message : String(error)],
    };
  }
}
