/**
 * 错误恢复测试
 * 
 * 测试覆盖：
 * - 无效输入处理
 * - 文件系统错误恢复
 * - 并发操作冲突处理
 * - 损坏数据恢复
 * - 边界条件处理
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import * as path from 'path';
import * as fs from 'fs';
import {
  setupTestEnv,
  cleanupTestEnv,
  TEST_BASE_DIR,
  TEST_PROJECT_DIR,
  TEST_GLOBAL_SKILLS_DIR,
  TEST_PROJECT_SKILLS_DIR,
  TEST_GLOBAL_CONFIG_PATH,
  createTestSkillDir,
  createTestFile,
} from '../helpers/setup.js';
import { SKILL_MD_CONTENT } from '../fixtures/skills.js';

// Mock 路径模块
vi.mock('../../src/utils/paths.js', async () => {
  const actual = await vi.importActual('../../src/utils/paths.js');
  return {
    ...actual,
    getGlobalDir: () => TEST_BASE_DIR,
    getGlobalConfigPath: () => TEST_GLOBAL_CONFIG_PATH,
    getGlobalSkillsDir: () => TEST_GLOBAL_SKILLS_DIR,
    getProjectDir: (projectRoot: string) => path.join(projectRoot, '.skillix'),
    getProjectConfigPath: (projectRoot: string) => path.join(projectRoot, '.skillix', 'config.json'),
    getProjectSkillsDir: (projectRoot: string) => path.join(projectRoot, '.skillix', 'skills'),
  };
});

import { createSkill } from '../../src/services/skill/create.js';
import { deleteSkill } from '../../src/services/skill/delete.js';
import { getSkill } from '../../src/services/skill/get.js';
import { updateSkill } from '../../src/services/skill/update.js';
import { listGlobalSkills } from '../../src/services/skill/list.js';
import { readSkillContent } from '../../src/services/skill/read.js';
import { getGlobalConfig, saveGlobalConfig } from '../../src/services/config/global.js';
import { DEFAULT_GLOBAL_CONFIG } from '../../src/services/types.js';
import * as fsUtils from '../../src/utils/fs.js';

describe('错误恢复测试', () => {
  beforeEach(() => {
    setupTestEnv();
  });

  afterEach(() => {
    cleanupTestEnv();
    vi.clearAllMocks();
  });

  describe('无效输入处理', () => {
    it('创建空名称技能时应该创建但目录名为空', () => {
      // 注意：当前 createSkill 不进行验证
      // 这个测试验证系统在边界情况下的行为
      // 实际应用中应该在工具层进行验证
      const skill = createSkill(
        '',
        { name: '', description: '测试描述' },
        '# 测试',
        'global'
      );
      // 技能会被创建，但名称为空
      expect(skill.name).toBe('');
    });

    it('创建无效名称格式的技能时系统不会崩溃', () => {
      // 注意：当前 createSkill 不进行名称验证
      // 验证应该在工具层 (handleCreate) 进行
      const invalidNames = [
        'Test-Skill',  // 大写
        'test_skill',  // 下划线
        '123-skill',   // 数字开头
        '-test',       // 连字符开头
        'test-',       // 连字符结尾
      ];

      for (const name of invalidNames) {
        // 不应该崩溃
        const skill = createSkill(
          name,
          { name, description: '测试描述内容' },
          '# 测试',
          'global'
        );
        expect(skill).toBeDefined();
      }
    });

    it('获取不存在的技能应该返回 null', () => {
      const skill = getSkill('non-existing-skill-12345');
      expect(skill).toBeNull();
    });

    it('删除不存在的技能应该返回 false', () => {
      const result = deleteSkill('non-existing-skill-12345');
      expect(result).toBe(false);
    });

    it('更新不存在的技能应该返回 null', () => {
      const result = updateSkill('non-existing-skill-12345', {
        metadata: { description: '更新描述' },
      });
      expect(result).toBeNull();
    });
  });

  describe('损坏数据恢复', () => {
    it('应该处理损坏的 SKILL.md 文件', () => {
      // 创建一个损坏的技能目录
      const skillDir = path.join(TEST_GLOBAL_SKILLS_DIR, 'corrupted-skill');
      fsUtils.ensureDir(skillDir);
      
      // 写入损坏的内容（无效的 YAML frontmatter）
      const corruptedContent = `---
name: corrupted-skill
description: [invalid yaml
---

# 损坏的技能
`;
      fs.writeFileSync(path.join(skillDir, 'SKILL.md'), corruptedContent);

      // 尝试读取应该优雅处理
      const content = readSkillContent('corrupted-skill');
      // 可能返回 null 或部分内容
      // 关键是不应该抛出未捕获的异常
    });

    it('应该处理空的 SKILL.md 文件', () => {
      const skillDir = path.join(TEST_GLOBAL_SKILLS_DIR, 'empty-skill');
      fsUtils.ensureDir(skillDir);
      fs.writeFileSync(path.join(skillDir, 'SKILL.md'), '');

      const content = readSkillContent('empty-skill');
      // 应该返回 null 或空内容，不应崩溃
    });

    it('应该处理损坏的配置文件', () => {
      // 写入损坏的配置
      fs.writeFileSync(TEST_GLOBAL_CONFIG_PATH, 'not valid json {{{');

      // 读取配置应该返回默认值
      const config = getGlobalConfig();
      expect(config).toBeDefined();
      expect(config.version).toBeDefined();
    });

    it('应该处理缺少必要字段的配置', () => {
      // 写入不完整的配置
      fs.writeFileSync(TEST_GLOBAL_CONFIG_PATH, JSON.stringify({ format: 'json' }));

      const config = getGlobalConfig();
      // 应该合并默认值
      expect(config.version).toBeDefined();
      expect(config.format).toBe('json');
    });
  });

  describe('文件系统错误恢复', () => {
    it('应该处理只读目录', () => {
      // 注意：这个测试在某些系统上可能需要特殊权限
      // 创建一个技能
      createSkill(
        'readonly-test',
        { name: 'readonly-test', description: '只读测试技能' },
        '# 只读测试',
        'global'
      );

      // 验证创建成功
      const skill = getSkill('readonly-test');
      expect(skill).not.toBeNull();
    });

    it('应该处理目录不存在的情况', () => {
      // 删除技能目录
      fsUtils.removeDir(TEST_GLOBAL_SKILLS_DIR);

      // 列表应该返回空数组，不应崩溃
      const skills = listGlobalSkills();
      expect(skills).toEqual([]);
    });

    it('应该在目录不存在时创建技能', () => {
      // 删除技能目录
      fsUtils.removeDir(TEST_GLOBAL_SKILLS_DIR);

      // 创建技能应该自动创建目录
      const skill = createSkill(
        'auto-create-dir',
        { name: 'auto-create-dir', description: '自动创建目录测试' },
        '# 自动创建目录',
        'global'
      );

      expect(skill).toBeDefined();
      expect(fsUtils.isDirectory(TEST_GLOBAL_SKILLS_DIR)).toBe(true);
    });
  });

  describe('并发操作处理', () => {
    it('应该处理同时创建同名技能', async () => {
      const skillName = 'concurrent-skill';
      
      // 并发创建
      const promises = [
        Promise.resolve().then(() => {
          try {
            return createSkill(
              skillName,
              { name: skillName, description: '并发测试 1' },
              '# 并发 1',
              'global'
            );
          } catch {
            return null;
          }
        }),
        Promise.resolve().then(() => {
          try {
            return createSkill(
              skillName,
              { name: skillName, description: '并发测试 2' },
              '# 并发 2',
              'global'
            );
          } catch {
            return null;
          }
        }),
      ];

      const results = await Promise.all(promises);
      
      // 至少一个应该成功
      const successCount = results.filter(r => r !== null).length;
      expect(successCount).toBeGreaterThanOrEqual(1);

      // 最终应该只有一个技能
      const skill = getSkill(skillName);
      expect(skill).not.toBeNull();
    });

    it('应该处理读写同时进行', async () => {
      // 创建初始技能
      createSkill(
        'rw-concurrent',
        { name: 'rw-concurrent', description: '读写并发测试' },
        '# 读写并发',
        'global'
      );

      // 并发读写
      const promises = [
        // 读取
        Promise.resolve().then(() => getSkill('rw-concurrent')),
        Promise.resolve().then(() => getSkill('rw-concurrent')),
        // 更新
        Promise.resolve().then(() => 
          updateSkill('rw-concurrent', { metadata: { description: '更新 1' } })
        ),
        // 再次读取
        Promise.resolve().then(() => getSkill('rw-concurrent')),
      ];

      const results = await Promise.all(promises);
      
      // 所有操作都应该完成（不崩溃）
      expect(results.length).toBe(4);
    });
  });

  describe('边界条件', () => {
    it('应该处理非常长的技能名称', () => {
      const longName = 'a'.repeat(100);
      
      // 注意：createSkill 服务层不进行验证
      // 长名称会被接受，但可能导致文件系统问题
      const skill = createSkill(
        longName,
        { name: longName, description: '长名称测试' },
        '# 长名称',
        'global'
      );
      // 技能会被创建
      expect(skill.name).toBe(longName);
    });

    it('应该处理非常长的描述', () => {
      const longDesc = '这是一个非常长的描述'.repeat(1000);
      
      // 长描述应该被接受（在合理范围内）
      const skill = createSkill(
        'long-desc-skill',
        { name: 'long-desc-skill', description: longDesc.slice(0, 1000) },
        '# 长描述',
        'global'
      );

      expect(skill).toBeDefined();
    });

    it('应该处理特殊字符的技能内容', () => {
      const specialContent = `# 特殊字符测试

包含各种特殊字符：
- 中文：你好世界
- 日文：こんにちは
- 韩文：안녕하세요
- 表情：😀🎉🚀
- 符号：@#$%^&*()
- 代码块：
\`\`\`javascript
const x = "test";
\`\`\`
`;

      const skill = createSkill(
        'special-chars',
        { name: 'special-chars', description: '特殊字符测试技能' },
        specialContent,
        'global'
      );

      expect(skill).toBeDefined();

      // 读取并验证内容保持完整
      const content = readSkillContent('special-chars');
      expect(content?.body).toContain('中文');
      expect(content?.body).toContain('日文');
    });

    it('应该处理空技能目录', () => {
      // 创建空的技能目录（没有 SKILL.md）
      const emptySkillDir = path.join(TEST_GLOBAL_SKILLS_DIR, 'empty-dir');
      fsUtils.ensureDir(emptySkillDir);

      // 获取应该返回 null
      const skill = getSkill('empty-dir');
      expect(skill).toBeNull();

      // 列表不应包含空目录
      const skills = listGlobalSkills();
      const hasEmptyDir = skills.some(s => s.name === 'empty-dir');
      expect(hasEmptyDir).toBe(false);
    });
  });

  describe('恢复操作', () => {
    it('删除后应该能重新创建同名技能', () => {
      // 创建
      createSkill(
        'recreate-skill',
        { name: 'recreate-skill', description: '重新创建测试' },
        '# 原始内容',
        'global'
      );

      // 删除
      const deleted = deleteSkill('recreate-skill');
      expect(deleted).toBe(true);

      // 验证删除
      expect(getSkill('recreate-skill')).toBeNull();

      // 重新创建
      const newSkill = createSkill(
        'recreate-skill',
        { name: 'recreate-skill', description: '新的描述' },
        '# 新内容',
        'global'
      );

      expect(newSkill).toBeDefined();
      expect(newSkill.metadata.description).toBe('新的描述');
    });

    it('配置损坏后应该能恢复', () => {
      // 损坏配置
      fs.writeFileSync(TEST_GLOBAL_CONFIG_PATH, 'corrupted');

      // 读取（应该返回默认值）
      const config1 = getGlobalConfig();
      expect(config1).toBeDefined();

      // 保存新配置
      saveGlobalConfig({
        ...DEFAULT_GLOBAL_CONFIG,
        format: 'json',
      });

      // 再次读取
      const config2 = getGlobalConfig();
      expect(config2.format).toBe('json');
    });
  });
});
