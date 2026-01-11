/**
 * sx-config get 子命令
 * 获取配置
 */

import type { ToolResponse } from '../../types/response/tool.js';
import type { SxConfigParams } from '../../types/tools/sx-config-params.js';
import { configService } from '../../services/index.js';

/**
 * 获取配置
 */
export function handleGet(params: SxConfigParams): ToolResponse {
  const { scope, projectRoot, key } = params;
  
  try {
    if (scope === 'project') {
      if (!projectRoot) {
        return {
          success: false,
          message: '获取项目配置需要指定项目根目录',
          errors: ['参数 projectRoot 是必需的'],
        };
      }
      
      const config = configService.getProjectConfig(projectRoot);
      
      if (!config) {
        return {
          success: false,
          message: '项目配置不存在',
          errors: ['请先使用 init 操作初始化项目配置'],
        };
      }
      
      if (key) {
        const value = (config as any)[key];
        return {
          success: true,
          message: `项目配置 ${key}`,
          data: { [key]: value },
        };
      }
      
      return {
        success: true,
        message: '项目配置',
        data: config,
      };
    }
    
    // 默认获取全局配置
    const config = configService.getGlobalConfig();
    
    if (key) {
      const value = (config as any)[key];
      return {
        success: true,
        message: `全局配置 ${key}`,
        data: { [key]: value },
      };
    }
    
    return {
      success: true,
      message: '全局配置',
      data: config,
    };
  } catch (error) {
    return {
      success: false,
      message: '获取配置失败',
      errors: [error instanceof Error ? error.message : String(error)],
    };
  }
}
