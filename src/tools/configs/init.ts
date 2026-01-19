/**
 * sx-config init 子命令
 * 初始化项目配置
 */

import * as path from 'path';
import type { ToolResponse, SxConfigParams } from '../types.js';
import { configService } from '../../services/index.js';
import { success, error, errorFromException } from '../../utils/response.js';
import * as fs from '../../utils/fs.js';
import { SKILLIX_RULE_CONTENT, SKILLIX_RULE_FILENAME } from '../../templates/skillix-rule.js';

/**
 * 安装 Cursor Rule 到项目
 */
function installCursorRule(projectRoot: string): { installed: boolean; path: string; message: string } {
  const cursorRulesDir = path.join(projectRoot, '.cursor', 'rules');
  const rulePath = path.join(cursorRulesDir, SKILLIX_RULE_FILENAME);
  
  // 检查是否已存在
  if (fs.exists(rulePath)) {
    return {
      installed: false,
      path: rulePath,
      message: 'Cursor Rule 已存在，跳过安装',
    };
  }
  
  // 确保目录存在
  fs.ensureDir(cursorRulesDir);
  
  // 写入规则文件
  fs.writeFile(rulePath, SKILLIX_RULE_CONTENT);
  
  return {
    installed: true,
    path: rulePath,
    message: '成功安装 Cursor Rule',
  };
}

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
    const warnings: string[] = [];
    let configCreated = false;
    let config;
    
    // 检查项目配置是否已存在
    const existingConfig = configService.getProjectConfig(projectRoot);
    
    if (existingConfig) {
      config = existingConfig;
      warnings.push('项目配置已存在，未进行覆盖');
    } else {
      config = configService.initProjectConfig(projectRoot);
      configCreated = true;
    }
    
    // 安装 Cursor Rule
    const ruleResult = installCursorRule(projectRoot);
    if (!ruleResult.installed) {
      warnings.push(ruleResult.message);
    }
    
    // 构建响应数据
    const data = {
      config,
      cursorRule: {
        installed: ruleResult.installed,
        path: ruleResult.path,
      },
    };
    
    // 构建响应消息
    const messages: string[] = [];
    if (configCreated) {
      messages.push('成功初始化项目配置');
    }
    if (ruleResult.installed) {
      messages.push('成功安装 Cursor Rule');
    }
    
    const message = messages.length > 0 
      ? messages.join('，') 
      : '项目已初始化';
    
    return success({
      message,
      data,
      warnings: warnings.length > 0 ? warnings : undefined,
    });
  } catch (e) {
    return errorFromException('初始化项目配置失败', e);
  }
}
