/**
 * sx-help 工具测试
 */

import { describe, it, expect } from 'vitest';
import { sxHelp } from '../../src/tools/helps/index.js';

describe('sx-help tool', () => {
  describe('overview topic', () => {
    it('should return overview help', () => {
      const result = sxHelp({ topic: 'overview' });
      
      expect(result.success).toBe(true);
      expect(result.message).toBeDefined();
      // 检查返回的帮助内容
      expect(result.data || result.message).toBeDefined();
    });
  });

  describe('skill topic', () => {
    it('should return skill help', () => {
      const result = sxHelp({ topic: 'skill' });
      
      expect(result.success).toBe(true);
      expect(result.message).toBeDefined();
    });
  });

  describe('config topic', () => {
    it('should return config help', () => {
      const result = sxHelp({ topic: 'config' });
      
      expect(result.success).toBe(true);
      expect(result.message).toBeDefined();
    });
  });

  describe('default topic', () => {
    it('should return overview for undefined topic', () => {
      const result = sxHelp({});
      
      expect(result.success).toBe(true);
      expect(result.message).toBeDefined();
    });
  });

  describe('unknown topic', () => {
    it('should handle unknown topic gracefully', () => {
      const result = sxHelp({ topic: 'unknown' as any });
      
      // 应该返回默认帮助或错误
      expect(result).toBeDefined();
      expect(result.success).toBeDefined();
    });
  });
});
