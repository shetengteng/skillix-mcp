/**
 * 测试环境设置辅助函数
 */

import * as fs from 'fs';
import * as path from 'path';
import { homedir } from 'os';
import { vi } from 'vitest';

/**
 * 测试基础目录 - 全局
 */
export const TEST_BASE_DIR = path.join(homedir(), '.skillix-test');

/**
 * 测试项目目录
 */
export const TEST_PROJECT_DIR = path.join(process.cwd(), '.skillix-test-project');

/**
 * 测试全局技能目录
 */
export const TEST_GLOBAL_SKILLS_DIR = path.join(TEST_BASE_DIR, 'skills');

/**
 * 测试全局配置路径
 */
export const TEST_GLOBAL_CONFIG_PATH = path.join(TEST_BASE_DIR, 'config.json');

/**
 * 测试项目技能目录
 */
export const TEST_PROJECT_SKILLS_DIR = path.join(TEST_PROJECT_DIR, '.skillix', 'skills');

/**
 * 测试项目配置路径
 */
export const TEST_PROJECT_CONFIG_PATH = path.join(TEST_PROJECT_DIR, '.skillix', 'config.json');

/**
 * 创建目录（递归）
 * 使用 maxRetries 处理可能的竞态条件
 */
export function ensureDir(dirPath: string, maxRetries = 3): void {
  for (let i = 0; i < maxRetries; i++) {
    try {
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }
      return;
    } catch (e) {
      if (i === maxRetries - 1) {
        throw e;
      }
      // 短暂等待后重试
    }
  }
}

/**
 * 删除目录（递归）
 * 使用 maxRetries 处理可能的竞态条件
 */
export function removeDir(dirPath: string, maxRetries = 3): void {
  for (let i = 0; i < maxRetries; i++) {
    try {
      if (fs.existsSync(dirPath)) {
        fs.rmSync(dirPath, { recursive: true, force: true });
      }
      return;
    } catch (e) {
      if (i === maxRetries - 1) {
        // 最后一次尝试，忽略错误
        console.warn(`Warning: Could not remove ${dirPath}: ${e}`);
      }
      // 短暂等待后重试
    }
  }
}

/**
 * 设置测试环境
 * 创建测试目录结构
 */
export function setupTestEnv(): void {
  // 清理旧的测试目录
  cleanupTestEnv();
  
  // 等待文件系统同步
  // 创建测试目录
  fs.mkdirSync(TEST_BASE_DIR, { recursive: true });
  fs.mkdirSync(TEST_GLOBAL_SKILLS_DIR, { recursive: true });
  fs.mkdirSync(TEST_PROJECT_DIR, { recursive: true });
  fs.mkdirSync(path.join(TEST_PROJECT_DIR, '.skillix'), { recursive: true });
  fs.mkdirSync(TEST_PROJECT_SKILLS_DIR, { recursive: true });
}

/**
 * 清理测试环境
 * 删除所有测试目录
 */
export function cleanupTestEnv(): void {
  removeDir(TEST_BASE_DIR);
  removeDir(TEST_PROJECT_DIR);
}

/**
 * 创建测试文件
 */
export function createTestFile(filePath: string, content: string): void {
  const dir = path.dirname(filePath);
  ensureDir(dir);
  fs.writeFileSync(filePath, content, 'utf-8');
}

/**
 * 读取测试文件
 */
export function readTestFile(filePath: string): string | null {
  try {
    return fs.readFileSync(filePath, 'utf-8');
  } catch {
    return null;
  }
}

/**
 * 检查文件是否存在
 */
export function fileExists(filePath: string): boolean {
  return fs.existsSync(filePath);
}

/**
 * 创建测试技能目录结构
 */
export function createTestSkillDir(
  baseDir: string,
  skillName: string,
  skillMdContent: string
): string {
  const skillDir = path.join(baseDir, skillName);
  ensureDir(skillDir);
  ensureDir(path.join(skillDir, 'scripts'));
  ensureDir(path.join(skillDir, 'references'));
  ensureDir(path.join(skillDir, 'assets'));
  ensureDir(path.join(skillDir, 'logs'));
  
  const skillMdPath = path.join(skillDir, 'SKILL.md');
  fs.writeFileSync(skillMdPath, skillMdContent, 'utf-8');
  
  return skillDir;
}

/**
 * 创建路径 mock
 * 将所有路径函数重定向到测试目录
 */
export function createPathsMock() {
  return {
    getGlobalDir: vi.fn(() => TEST_BASE_DIR),
    getGlobalConfigPath: vi.fn(() => TEST_GLOBAL_CONFIG_PATH),
    getGlobalSkillsDir: vi.fn(() => TEST_GLOBAL_SKILLS_DIR),
    getGlobalCacheDir: vi.fn(() => path.join(TEST_BASE_DIR, 'cache')),
    getGlobalLogsDir: vi.fn(() => path.join(TEST_BASE_DIR, 'logs')),
    getProjectDir: vi.fn((projectRoot: string) => path.join(projectRoot, '.skillix')),
    getProjectConfigPath: vi.fn((projectRoot: string) => path.join(projectRoot, '.skillix', 'config.json')),
    getProjectSkillsDir: vi.fn((projectRoot: string) => path.join(projectRoot, '.skillix', 'skills')),
    getProjectLogsDir: vi.fn((projectRoot: string) => path.join(projectRoot, '.skillix', 'logs')),
    getSkillDir: vi.fn((skillsDir: string, skillName: string) => path.join(skillsDir, skillName)),
    getSkillMdPath: vi.fn((skillDir: string) => path.join(skillDir, 'SKILL.md')),
    getSkillScriptsDir: vi.fn((skillDir: string) => path.join(skillDir, 'scripts')),
    getSkillReferencesDir: vi.fn((skillDir: string) => path.join(skillDir, 'references')),
    getSkillAssetsDir: vi.fn((skillDir: string) => path.join(skillDir, 'assets')),
    getSkillLogsDir: vi.fn((skillDir: string) => path.join(skillDir, 'logs')),
    isAbsolutePath: vi.fn((p: string) => path.isAbsolute(p)),
    normalizePath: vi.fn((p: string) => path.normalize(p)),
    getRelativePath: vi.fn((from: string, to: string) => path.relative(from, to)),
  };
}

/**
 * 等待一段时间
 */
export function wait(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
