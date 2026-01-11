/**
 * sx-config set 子命令
 * 设置配置
 */

import type { ToolResponse, SxConfigParams } from '../types.js';
import { configService } from '../../services/index.js';

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
      
      let config = configService.getProjectConfig(projectRoot);
      
      if (!config) {
        config = configService.initProjectConfig(projectRoot);
      }
      
      (config as any)[key] = value;
      configService.saveProjectConfig(projectRoot, config);
      
      return {
        success: true,
        message: `成功设置项目配置 ${key}`,
        data: { [key]: value },
      };
    }
    
    // 默认设置全局配置
    const config = configService.getGlobalConfig();
    (config as any)[key] = value;
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
