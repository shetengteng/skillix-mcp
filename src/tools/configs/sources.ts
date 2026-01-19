/**
 * sx-config sources 子命令
 * 管理技能源
 */

import type { ToolResponse, SxConfigParams } from '../types.js';
import { configService } from '../../services/index.js';
import { success, error, errorFromException } from '../../utils/response.js';

/**
 * 管理技能源
 */
export function handleSources(params: SxConfigParams): ToolResponse {
  const { sourceAction = 'list', scope = 'global', projectRoot, source, sourceName } = params;
  
  try {
    switch (sourceAction) {
      case 'list': {
        // 获取有效配置（本地优先策略）
        const effectiveConfig = configService.getEffectiveConfig(projectRoot);
        const sources = effectiveConfig.effective.sources;
        
        // 确定源来自哪里
        const hasProjectSources = effectiveConfig.project?.sources && effectiveConfig.project.sources.length > 0;
        const sourceOrigin = hasProjectSources ? '项目配置' : '全局配置';
        
        return success({
          message: `找到 ${sources.length} 个技能源（来自${sourceOrigin}）`,
          data: {
            sources,
            origin: hasProjectSources ? 'project' : 'global',
            projectRoot: projectRoot || null,
          },
        });
      }
      
      case 'add': {
        if (!source) {
          return error({
            message: '添加技能源需要提供源配置',
            errors: ['参数 source 是必需的'],
          });
        }
        
        if (!source.name || !source.url) {
          return error({
            message: '技能源配置不完整',
            errors: ['source.name 和 source.url 是必需的'],
          });
        }
        
        if (scope === 'project' && !projectRoot) {
          return error({
            message: '添加项目级技能源需要指定项目根目录',
            errors: ['参数 projectRoot 是必需的'],
          });
        }
        
        configService.addSource(source, scope, projectRoot);
        
        return success({
          message: `成功添加技能源 "${source.name}"`,
          data: source,
        });
      }
      
      case 'remove': {
        if (!sourceName) {
          return error({
            message: '删除技能源需要提供源名称',
            errors: ['参数 sourceName 是必需的'],
          });
        }
        
        if (scope === 'project' && !projectRoot) {
          return error({
            message: '删除项目级技能源需要指定项目根目录',
            errors: ['参数 projectRoot 是必需的'],
          });
        }
        
        const removed = configService.removeSource(sourceName, scope, projectRoot);
        
        if (!removed) {
          return error({
            message: `技能源 "${sourceName}" 不存在`,
            errors: [`未找到名为 "${sourceName}" 的技能源`],
          });
        }
        
        return success({
          message: `成功删除技能源 "${sourceName}"`,
        });
      }
      
      default:
        return error({
          message: `未知的源操作: ${sourceAction}`,
          errors: ['支持的操作: list, add, remove'],
        });
    }
  } catch (e) {
    return errorFromException('管理技能源失败', e);
  }
}
