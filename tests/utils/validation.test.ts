/**
 * 验证工具函数测试
 * 
 * 测试覆盖：
 * - 技能名称验证
 * - 技能描述验证
 * - 创建参数组合验证
 * - 配置键验证
 * - 配置值验证
 * - 错误格式化
 */

import { describe, it, expect } from 'vitest';
import {
  validateSkillName,
  validateSkillDescription,
  validateCreateParams,
  isValidGlobalConfigKey,
  isValidProjectConfigKey,
  validateConfigValue,
  ErrorCode,
  formatError,
} from '../../src/utils/validation.js';
import {
  INVALID_SKILL_NAMES,
  VALID_SKILL_NAMES,
  INVALID_DESCRIPTIONS,
  VALID_DESCRIPTIONS,
} from '../fixtures/skills.js';

describe('验证工具函数', () => {
  describe('validateSkillName - 技能名称验证', () => {
    describe('有效名称', () => {
      it.each(VALID_SKILL_NAMES)('应该接受有效名称: %s', (name) => {
        const result = validateSkillName(name);
        expect(result.valid).toBe(true);
        expect(result.errorCode).toBeUndefined();
      });
    });

    describe('无效名称', () => {
      it('应该拒绝空名称', () => {
        const result = validateSkillName('');
        expect(result.valid).toBe(false);
        expect(result.errorCode).toBe(ErrorCode.MISSING_PARAM);
      });

      it('应该拒绝仅包含空白字符的名称', () => {
        const result = validateSkillName('   ');
        expect(result.valid).toBe(false);
        expect(result.errorCode).toBe(ErrorCode.MISSING_PARAM);
      });

      it('应该拒绝过短的名称', () => {
        const result = validateSkillName('a');
        expect(result.valid).toBe(false);
        expect(result.errorCode).toBe(ErrorCode.INVALID_NAME);
      });

      it('应该拒绝过长的名称', () => {
        const result = validateSkillName('a'.repeat(65));
        expect(result.valid).toBe(false);
        expect(result.errorCode).toBe(ErrorCode.INVALID_NAME);
      });

      it('应该拒绝包含大写字母的名称', () => {
        const result = validateSkillName('Test-Skill');
        expect(result.valid).toBe(false);
        expect(result.errorCode).toBe(ErrorCode.INVALID_NAME);
        expect(result.errorMessage).toContain('小写');
      });

      it('应该拒绝包含下划线的名称', () => {
        const result = validateSkillName('test_skill');
        expect(result.valid).toBe(false);
        expect(result.errorCode).toBe(ErrorCode.INVALID_NAME);
        expect(result.errorMessage).toContain('下划线');
      });

      it('应该拒绝以数字开头的名称', () => {
        const result = validateSkillName('123-skill');
        expect(result.valid).toBe(false);
        expect(result.errorCode).toBe(ErrorCode.INVALID_NAME);
        expect(result.errorMessage).toContain('小写字母开头');
      });

      it('应该拒绝以连字符开头的名称', () => {
        const result = validateSkillName('-test');
        expect(result.valid).toBe(false);
        expect(result.errorCode).toBe(ErrorCode.INVALID_NAME);
        expect(result.errorMessage).toContain('连字符');
      });

      it('应该拒绝以连字符结尾的名称', () => {
        const result = validateSkillName('test-');
        expect(result.valid).toBe(false);
        expect(result.errorCode).toBe(ErrorCode.INVALID_NAME);
        expect(result.errorMessage).toContain('连字符');
      });

      it('应该拒绝包含连续连字符的名称', () => {
        const result = validateSkillName('test--skill');
        expect(result.valid).toBe(false);
        expect(result.errorCode).toBe(ErrorCode.INVALID_NAME);
        expect(result.errorMessage).toContain('连续');
      });

      it('应该拒绝保留词', () => {
        const reservedWords = ['skillix', 'sx-skill', 'config', 'system', 'admin'];
        for (const word of reservedWords) {
          const result = validateSkillName(word);
          expect(result.valid).toBe(false);
          expect(result.errorCode).toBe(ErrorCode.INVALID_NAME);
          expect(result.errorMessage).toContain('保留词');
        }
      });
    });
  });

  describe('validateSkillDescription - 技能描述验证', () => {
    describe('有效描述', () => {
      it.each(VALID_DESCRIPTIONS)('应该接受有效描述: %s', (desc) => {
        const result = validateSkillDescription(desc);
        expect(result.valid).toBe(true);
      });
    });

    describe('无效描述', () => {
      it('应该拒绝空描述', () => {
        const result = validateSkillDescription('');
        expect(result.valid).toBe(false);
        expect(result.errorCode).toBe(ErrorCode.MISSING_PARAM);
      });

      it('应该拒绝仅包含空白字符的描述', () => {
        const result = validateSkillDescription('   ');
        expect(result.valid).toBe(false);
        expect(result.errorCode).toBe(ErrorCode.MISSING_PARAM);
      });

      it('应该拒绝过长的描述', () => {
        const result = validateSkillDescription('a'.repeat(1025));
        expect(result.valid).toBe(false);
        expect(result.errorCode).toBe(ErrorCode.INVALID_DESCRIPTION);
      });

      it('应该拒绝包含 < 字符的描述', () => {
        const result = validateSkillDescription('Test <script> injection');
        expect(result.valid).toBe(false);
        expect(result.errorCode).toBe(ErrorCode.INVALID_DESCRIPTION);
        expect(result.errorMessage).toContain('尖括号');
      });

      it('应该拒绝包含 > 字符的描述', () => {
        const result = validateSkillDescription('Hello > world');
        expect(result.valid).toBe(false);
        expect(result.errorCode).toBe(ErrorCode.INVALID_DESCRIPTION);
        expect(result.errorMessage).toContain('尖括号');
      });

      it('应该拒绝词数过少的描述', () => {
        const result = validateSkillDescription('ab');
        expect(result.valid).toBe(false);
        expect(result.errorCode).toBe(ErrorCode.INVALID_DESCRIPTION);
        expect(result.errorMessage).toContain('3 个词');
      });
    });

    describe('中文内容', () => {
      it('应该接受有效的中文描述', () => {
        const result = validateSkillDescription('这是一个有效的中文技能描述');
        expect(result.valid).toBe(true);
      });

      it('应该拒绝过短的中文描述', () => {
        const result = validateSkillDescription('中文');
        expect(result.valid).toBe(false);
      });
    });
  });

  describe('validateCreateParams - 创建参数验证', () => {
    it('应该通过有效的名称和描述', () => {
      const result = validateCreateParams('my-skill', '一个有效的技能描述用于测试');
      expect(result.valid).toBe(true);
    });

    it('应该因无效名称而失败', () => {
      const result = validateCreateParams('InvalidName', '一个有效的描述');
      expect(result.valid).toBe(false);
      expect(result.errorCode).toBe(ErrorCode.INVALID_NAME);
    });

    it('应该因无效描述而失败', () => {
      const result = validateCreateParams('valid-name', 'ab');
      expect(result.valid).toBe(false);
      expect(result.errorCode).toBe(ErrorCode.INVALID_DESCRIPTION);
    });
  });

  describe('isValidGlobalConfigKey - 全局配置键验证', () => {
    it('应该对有效的全局配置键返回 true', () => {
      const validKeys = ['version', 'sources', 'defaultScope', 'format', 'autoSuggest', 'suggestThreshold', 'logging', 'cache'];
      for (const key of validKeys) {
        expect(isValidGlobalConfigKey(key)).toBe(true);
      }
    });

    it('应该对无效键返回 false', () => {
      const invalidKeys = ['invalid', 'foo', 'bar', 'feedback'];
      for (const key of invalidKeys) {
        expect(isValidGlobalConfigKey(key)).toBe(false);
      }
    });
  });

  describe('isValidProjectConfigKey - 项目配置键验证', () => {
    it('应该对有效的项目配置键返回 true', () => {
      const validKeys = ['sources', 'format', 'autoSuggest', 'feedback'];
      for (const key of validKeys) {
        expect(isValidProjectConfigKey(key)).toBe(true);
      }
    });

    it('应该对无效键返回 false', () => {
      const invalidKeys = ['invalid', 'version', 'defaultScope', 'logging', 'cache'];
      for (const key of invalidKeys) {
        expect(isValidProjectConfigKey(key)).toBe(false);
      }
    });
  });

  describe('validateConfigValue - 配置值验证', () => {
    describe('format 格式', () => {
      it('应该接受 xml 或 json', () => {
        expect(validateConfigValue('format', 'xml').valid).toBe(true);
        expect(validateConfigValue('format', 'json').valid).toBe(true);
      });

      it('应该拒绝其他值', () => {
        const result = validateConfigValue('format', 'yaml');
        expect(result.valid).toBe(false);
      });
    });

    describe('autoSuggest 自动建议', () => {
      it('应该接受布尔值', () => {
        expect(validateConfigValue('autoSuggest', true).valid).toBe(true);
        expect(validateConfigValue('autoSuggest', false).valid).toBe(true);
      });

      it('应该拒绝非布尔值', () => {
        expect(validateConfigValue('autoSuggest', 'true').valid).toBe(false);
        expect(validateConfigValue('autoSuggest', 1).valid).toBe(false);
      });
    });

    describe('defaultScope 默认作用域', () => {
      it('应该接受 global 或 project', () => {
        expect(validateConfigValue('defaultScope', 'global').valid).toBe(true);
        expect(validateConfigValue('defaultScope', 'project').valid).toBe(true);
      });

      it('应该拒绝其他值', () => {
        expect(validateConfigValue('defaultScope', 'invalid').valid).toBe(false);
      });
    });

    describe('version 版本号', () => {
      it('应该接受语义化版本格式', () => {
        expect(validateConfigValue('version', '1.0.0').valid).toBe(true);
        expect(validateConfigValue('version', '2.3.4').valid).toBe(true);
      });

      it('应该拒绝无效的版本格式', () => {
        expect(validateConfigValue('version', '1.0').valid).toBe(false);
        expect(validateConfigValue('version', 'v1.0.0').valid).toBe(false);
        expect(validateConfigValue('version', 123).valid).toBe(false);
      });
    });

    describe('对象类型', () => {
      it('应该接受 sources 的对象值', () => {
        expect(validateConfigValue('sources', []).valid).toBe(true);
      });

      it('应该接受 suggestThreshold 的对象值', () => {
        expect(validateConfigValue('suggestThreshold', { repeatCount: 3 }).valid).toBe(true);
      });

      it('应该接受 logging 的对象值', () => {
        expect(validateConfigValue('logging', { level: 'info' }).valid).toBe(true);
      });

      it('应该接受 cache 的对象值', () => {
        expect(validateConfigValue('cache', { enabled: true }).valid).toBe(true);
      });

      it('应该接受 feedback 的对象值', () => {
        expect(validateConfigValue('feedback', { enabled: true }).valid).toBe(true);
      });

      it('应该拒绝非对象值', () => {
        expect(validateConfigValue('logging', 'string').valid).toBe(false);
        expect(validateConfigValue('cache', null).valid).toBe(false);
      });
    });
  });

  describe('formatError - 错误格式化', () => {
    it('应该格式化错误码和消息', () => {
      const formatted = formatError(ErrorCode.INVALID_NAME, '名称无效');
      expect(formatted).toBe('[E002] 名称无效');
    });
  });
});
