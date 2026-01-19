/**
 * sx-config init 子命令
 * 初始化项目配置
 */

import type { ToolResponse, SxConfigParams } from '../types.js';
import { configService } from '../../services/index.js';
import { success, error, errorFromException } from '../../utils/response.js';

/**
 * 初始化项目配置
 */
export function handleInit(params: SxConfigParams): ToolResponse {
  const { projectRoot } = params;
  
  if (!projectRoot) {
    return error({
      message: '初始化项目配置需要指定项目根目录',
      errors: ['参数 projectRoot 是必需的'],
    });
  }
  
  try {
    // 检查是否已存在
    const existingConfig = configService.getProjectConfig(projectRoot);
    
    if (existingConfig) {
      return success({
        message: '项目配置已存在',
        data: existingConfig,
        warnings: ['项目配置已存在，未进行覆盖'],
      });
    }
    
    const config = configService.initProjectConfig(projectRoot);
    
    return success({
      message: '成功初始化项目配置',
      data: config,
    });
  } catch (e) {
    return errorFromException('初始化项目配置失败', e);
  }
}
