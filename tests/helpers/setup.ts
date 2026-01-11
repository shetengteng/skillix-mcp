/**
 * 测试辅助函数
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';

/**
 * 创建临时目录
 */
export function createTempDir(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'skillix-test-'));
}

/**
 * 清理临时目录
 */
export function cleanupTempDir(dir: string): void {
  if (fs.existsSync(dir)) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

/**
 * 创建测试技能
 */
export function createTestSkill(skillsDir: string, name: string, content: string): string {
  const skillDir = path.join(skillsDir, name);
  fs.mkdirSync(skillDir, { recursive: true });
  fs.writeFileSync(path.join(skillDir, 'SKILL.md'), content);
  return skillDir;
}

/**
 * 创建测试配置
 */
export function createTestConfig(configDir: string, config: object): string {
  fs.mkdirSync(configDir, { recursive: true });
  const configPath = path.join(configDir, 'config.json');
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
  return configPath;
}
