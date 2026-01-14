/**
 * sx-config set 子命令
 * 设置配置
 */

import type { ToolResponse, SxConfigParams } from '../types.js';
import { configService } from '../../services/index.js';
import {
  isValidGlobalConfigKey,
  isValidProjectConfigKey,
  validateConfigValue,
  VALID_GLOBAL_CONFIG_KEYS,
  VALID_PROJECT_CONFIG_KEYS,
} from '../../utils/validation.js';

/**
 * 设置配置
 */
export function handleSet(params: SxConfigParams): ToolResponse {
  const { scope, projectRoot, key, value } = params;
  
  if (!key) {
    return {
      success: false,
      message: '缺少配置键',
      errors: ['参数 key 是必需的'],
    };
  }
  
  if (value === undefined) {
    return {
      success: false,
      message: '缺少配置值',
      errors: ['参数 value 是必需的'],
    };
  }
  
  try {
    if (scope === 'project') {
      if (!projectRoot) {
        return {
          success: false,
          message: '设置项目配置需要指定项目根目录',
          errors: ['参数 projectRoot 是必需的'],
        };
      }
      
      // 验证配置键是否有效
      if (!isValidProjectConfigKey(key)) {
        return {
          success: false,
          message: `无效的项目配置键: ${key}`,
          errors: [`有效的配置键: ${VALID_PROJECT_CONFIG_KEYS.join(', ')}`],
        };
      }
      
      // 验证配置值是否有效
      const valueValidation = validateConfigValue(key, value);
      if (!valueValidation.valid) {
        return {
          success: false,
          message: `配置值无效`,
          errors: [valueValidation.errorMessage!],
        };
      }
      
      let config = configService.getProjectConfig(projectRoot);
      
      if (!config) {
        config = configService.initProjectConfig(projectRoot);
      }
      
      config[key] = value;
      configService.saveProjectConfig(projectRoot, config);
      
      return {
        success: true,
        message: `成功设置项目配置 ${key}`,
        data: { [key]: value },
      };
    }
    
    // 验证全局配置键是否有效
    if (!isValidGlobalConfigKey(key)) {
      return {
        success: false,
        message: `无效的全局配置键: ${key}`,
        errors: [`有效的配置键: ${VALID_GLOBAL_CONFIG_KEYS.join(', ')}`],
      };
    }
    
    // 验证配置值是否有效
    const valueValidation = validateConfigValue(key, value);
    if (!valueValidation.valid) {
      return {
        success: false,
        message: `配置值无效`,
        errors: [valueValidation.errorMessage!],
      };
    }
    
    // 默认设置全局配置
    const config = configService.getGlobalConfig();
    config[key] = value;
    configService.saveGlobalConfig(config);
    
    return {
      success: true,
      message: `成功设置全局配置 ${key}`,
      data: { [key]: value },
    };
  } catch (error) {
    return {
      success: false,
      message: '设置配置失败',
      errors: [error instanceof Error ? error.message : String(error)],
    };
  }
}
