/**
 * sx-config get 子命令
 * 获取配置
 */

import type { ToolResponse, SxConfigParams } from '../types.js';
import { configService } from '../../services/index.js';
import {
  isValidGlobalConfigKey,
  isValidProjectConfigKey,
  VALID_GLOBAL_CONFIG_KEYS,
  VALID_PROJECT_CONFIG_KEYS,
} from '../../utils/validation.js';

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
        // 验证配置键是否有效
        if (!isValidProjectConfigKey(key)) {
          return {
            success: false,
            message: `无效的项目配置键: ${key}`,
            errors: [`有效的配置键: ${VALID_PROJECT_CONFIG_KEYS.join(', ')}`],
          };
        }
        
        const value = config[key];
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
      // 验证配置键是否有效
      if (!isValidGlobalConfigKey(key)) {
        return {
          success: false,
          message: `无效的全局配置键: ${key}`,
          errors: [`有效的配置键: ${VALID_GLOBAL_CONFIG_KEYS.join(', ')}`],
        };
      }
      
      const value = config[key];
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
