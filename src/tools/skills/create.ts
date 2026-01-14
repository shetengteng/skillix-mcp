/**
 * sx-skill create 子命令
 * 创建新技能
 * 
 * 设计参考: docs/02-设计/20260114-07-sx-create设计.md
 */

import type { ToolResponse, SxSkillParams } from '../types.js';
import { skillService } from '../../services/index.js';
import {
  validateSkillName,
  validateSkillDescription,
  ErrorCode,
  formatError,
} from '../../utils/validation.js';

/**
 * 创建技能
 * 
 * 支持两种模式：
 * 1. AI First 模式：AI 引导用户收集信息后调用
 * 2. 直接模式：用户明确知道参数时直接创建
 * 
 * @param params - 创建参数
 * @returns 工具响应
 */
export function handleCreate(params: SxSkillParams): ToolResponse {
  const { name, scope = 'global', projectRoot, metadata, body = '' } = params;
  
  // ============================================
  // 参数存在性检查
  // ============================================
  
  if (!name) {
    return {
      success: false,
      message: '缺少技能名称',
      errors: [formatError(ErrorCode.MISSING_PARAM, '参数 name 是必需的')],
    };
  }
  
  if (!metadata) {
    return {
      success: false,
      message: '缺少技能元数据',
      errors: [formatError(ErrorCode.MISSING_PARAM, '参数 metadata 是必需的')],
    };
  }
  
  if (!metadata.description) {
    return {
      success: false,
      message: '缺少技能描述',
      errors: [formatError(ErrorCode.MISSING_PARAM, 'metadata.description 是必需的')],
    };
  }
  
  if (scope === 'project' && !projectRoot) {
    return {
      success: false,
      message: '项目级技能需要指定项目根目录',
      errors: [formatError(ErrorCode.MISSING_PARAM, '参数 projectRoot 是必需的')],
    };
  }
  
  // ============================================
  // 验证技能名称
  // ============================================
  
  const nameValidation = validateSkillName(name);
  if (!nameValidation.valid) {
    return {
      success: false,
      message: '技能名称无效',
      errors: [formatError(
        nameValidation.errorCode || ErrorCode.INVALID_NAME,
        nameValidation.errorMessage || '技能名称格式无效'
      )],
    };
  }
  
  // ============================================
  // 验证技能描述
  // ============================================
  
  const descValidation = validateSkillDescription(metadata.description);
  if (!descValidation.valid) {
    return {
      success: false,
      message: '技能描述无效',
      errors: [formatError(
        descValidation.errorCode || ErrorCode.INVALID_DESCRIPTION,
        descValidation.errorMessage || '技能描述格式无效'
      )],
    };
  }
  
  // ============================================
  // 检查技能是否已存在
  // ============================================
  
  if (skillService.skillExists(name, projectRoot)) {
    return {
      success: false,
      message: `技能 "${name}" 已存在`,
      errors: [formatError(
        ErrorCode.ALREADY_EXISTS,
        `名为 "${name}" 的技能已存在，请使用 update 操作或选择其他名称`
      )],
    };
  }
  
  // ============================================
  // 创建技能
  // ============================================
  
  try {
    // 确保 metadata 中的 name 与参数一致
    const finalMetadata = {
      ...metadata,
      name: metadata.name || name,
    };
    
    const skill = skillService.createSkill(name, finalMetadata, body, scope, projectRoot);
    
    // 构建响应
    const skillPath = scope === 'global'
      ? `~/.skillix/skills/${name}/`
      : `.skillix/skills/${name}/`;
    
    return {
      success: true,
      message: `成功创建技能 "${name}"`,
      data: {
        name: skill.name,
        scope: skill.scope,
        path: skillPath,
        absolutePath: skill.path,
        metadata: {
          name: skill.metadata.name,
          description: skill.metadata.description,
          version: skill.metadata.version || '1.0.0',
          author: skill.metadata.author,
          tags: skill.metadata.tags || [],
        },
        structure: {
          skillMd: 'SKILL.md',
          directories: ['scripts/', 'references/', 'assets/', 'logs/'],
        },
        usage: [
          `使用 sx-skill action=read name="${name}" 查看技能内容`,
          `使用 sx-skill action=update name="${name}" 更新技能`,
          `使用 sx-skill action=delete name="${name}" 删除技能`,
        ],
      },
    };
  } catch (error) {
    return {
      success: false,
      message: `创建技能 "${name}" 失败`,
      errors: [formatError(
        ErrorCode.WRITE_FAILED,
        error instanceof Error ? error.message : String(error)
      )],
    };
  }
}
