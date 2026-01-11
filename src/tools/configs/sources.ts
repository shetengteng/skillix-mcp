/**
 * sx-config sources 子命令
 * 管理技能源
 */

import type { ToolResponse, SxConfigParams } from '../types.js';
import { configService } from '../../services/index.js';

/**
 * 管理技能源
 */
export function handleSources(params: SxConfigParams): ToolResponse {
  const { sourceAction = 'list', scope = 'global', projectRoot, source, sourceName } = params;
  
  try {
    switch (sourceAction) {
      case 'list': {
        const sources = configService.getAllSources(projectRoot);
        return {
          success: true,
          message: `找到 ${sources.length} 个技能源`,
          data: sources,
        };
      }
      
      case 'add': {
        if (!source) {
          return {
            success: false,
            message: '添加技能源需要提供源配置',
            errors: ['参数 source 是必需的'],
          };
        }
        
        if (!source.name || !source.url) {
          return {
            success: false,
            message: '技能源配置不完整',
            errors: ['source.name 和 source.url 是必需的'],
          };
        }
        
        if (scope === 'project' && !projectRoot) {
          return {
            success: false,
            message: '添加项目级技能源需要指定项目根目录',
            errors: ['参数 projectRoot 是必需的'],
          };
        }
        
        configService.addSource(source, scope, projectRoot);
        
        return {
          success: true,
          message: `成功添加技能源 "${source.name}"`,
          data: source,
        };
      }
      
      case 'remove': {
        if (!sourceName) {
          return {
            success: false,
            message: '删除技能源需要提供源名称',
            errors: ['参数 sourceName 是必需的'],
          };
        }
        
        if (scope === 'project' && !projectRoot) {
          return {
            success: false,
            message: '删除项目级技能源需要指定项目根目录',
            errors: ['参数 projectRoot 是必需的'],
          };
        }
        
        const success = configService.removeSource(sourceName, scope, projectRoot);
        
        if (!success) {
          return {
            success: false,
            message: `技能源 "${sourceName}" 不存在`,
            errors: [`未找到名为 "${sourceName}" 的技能源`],
          };
        }
        
        return {
          success: true,
          message: `成功删除技能源 "${sourceName}"`,
        };
      }
      
      default:
        return {
          success: false,
          message: `未知的源操作: ${sourceAction}`,
          errors: ['支持的操作: list, add, remove'],
        };
    }
  } catch (error) {
    return {
      success: false,
      message: '管理技能源失败',
      errors: [error instanceof Error ? error.message : String(error)],
    };
  }
}
