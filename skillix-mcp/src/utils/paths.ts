/**
 * 路径工具函数
 * 处理全局和项目级别的路径解析
 */

import * as path from 'path';
import * as os from 'os';

/**
 * 获取全局 Skillix 目录路径
 * ~/.skillix/
 */
export function getGlobalDir(): string {
  return path.join(os.homedir(), '.skillix');
}

/**
 * 获取全局配置文件路径
 * ~/.skillix/config.json
 */
export function getGlobalConfigPath(): string {
  return path.join(getGlobalDir(), 'config.json');
}

/**
 * 获取全局技能目录路径
 * ~/.skillix/skills/
 */
export function getGlobalSkillsDir(): string {
  return path.join(getGlobalDir(), 'skills');
}

/**
 * 获取全局缓存目录路径
 * ~/.skillix/cache/
 */
export function getGlobalCacheDir(): string {
  return path.join(getGlobalDir(), 'cache');
}

/**
 * 获取全局日志目录路径
 * ~/.skillix/logs/
 */
export function getGlobalLogsDir(): string {
  return path.join(getGlobalDir(), 'logs');
}

/**
 * 获取项目 Skillix 目录路径
 * .skillix/
 */
export function getProjectDir(projectRoot: string): string {
  return path.join(projectRoot, '.skillix');
}

/**
 * 获取项目配置文件路径
 * .skillix/config.json
 */
export function getProjectConfigPath(projectRoot: string): string {
  return path.join(getProjectDir(projectRoot), 'config.json');
}

/**
 * 获取项目技能目录路径
 * .skillix/skills/
 */
export function getProjectSkillsDir(projectRoot: string): string {
  return path.join(getProjectDir(projectRoot), 'skills');
}

/**
 * 获取特定技能的目录路径
 */
export function getSkillDir(skillsDir: string, skillName: string): string {
  return path.join(skillsDir, skillName);
}

/**
 * 获取技能的 SKILL.md 文件路径
 */
export function getSkillMdPath(skillDir: string): string {
  return path.join(skillDir, 'SKILL.md');
}

/**
 * 获取技能的 scripts 目录路径
 */
export function getSkillScriptsDir(skillDir: string): string {
  return path.join(skillDir, 'scripts');
}

/**
 * 获取技能的 references 目录路径
 */
export function getSkillReferencesDir(skillDir: string): string {
  return path.join(skillDir, 'references');
}

/**
 * 获取技能的 assets 目录路径
 */
export function getSkillAssetsDir(skillDir: string): string {
  return path.join(skillDir, 'assets');
}

/**
 * 获取技能的 logs 目录路径
 */
export function getSkillLogsDir(skillDir: string): string {
  return path.join(skillDir, 'logs');
}

/**
 * 检查路径是否为绝对路径
 */
export function isAbsolutePath(p: string): boolean {
  return path.isAbsolute(p);
}

/**
 * 规范化路径
 */
export function normalizePath(p: string): string {
  return path.normalize(p);
}

/**
 * 获取相对路径
 */
export function getRelativePath(from: string, to: string): string {
  return path.relative(from, to);
}
