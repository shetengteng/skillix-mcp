/**
 * sx-config refresh 子命令
 * 刷新项目 Cursor Rule
 */

import * as path from 'path';
import type { ToolResponse, SxConfigParams } from '../types.js';
import { success, error, errorFromException } from '../../utils/response.js';
import * as fs from '../../utils/fs.js';
import { SKILLIX_RULE_CONTENT, SKILLIX_RULE_FILENAME } from '../../templates/skillix-rule.js';

/**
 * 刷新 Cursor Rule
 */
function refreshCursorRule(projectRoot: string): { refreshed: boolean; path: string; message: string } {
  const cursorRulesDir = path.join(projectRoot, '.cursor', 'rules');
  const rulePath = path.join(cursorRulesDir, SKILLIX_RULE_FILENAME);
  
  // 确保目录存在
  fs.ensureDir(cursorRulesDir);
  
  // 检查是否已存在
  const existed = fs.exists(rulePath);
  
  // 写入规则文件（覆盖）
  fs.writeFile(rulePath, SKILLIX_RULE_CONTENT);
  
  return {
    refreshed: true,
    path: rulePath,
    message: existed ? '成功刷新 Cursor Rule' : '成功安装 Cursor Rule',
  };
}

/**
 * 刷新项目配置
 */
export function handleRefresh(params: SxConfigParams): ToolResponse {
  const { projectRoot } = params;
  
  if (!projectRoot) {
    return error({
      message: '刷新配置需要指定项目根目录',
      errors: ['参数 projectRoot 是必需的'],
    });
  }
  
  try {
    // 刷新 Cursor Rule
    const ruleResult = refreshCursorRule(projectRoot);
    
    // 构建响应数据
    const data = {
      cursorRule: {
        refreshed: ruleResult.refreshed,
        path: ruleResult.path,
      },
    };
    
    return success({
      message: ruleResult.message,
      data,
    });
  } catch (e) {
    return errorFromException('刷新配置失败', e);
  }
}
