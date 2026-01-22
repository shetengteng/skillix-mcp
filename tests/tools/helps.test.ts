/**
 * sx-help 工具测试
 */

import { describe, it, expect } from 'vitest';
import { sxHelp } from '../../src/tools/helps/index.js';

describe('sx-help tools', () => {
  describe('sxHelp', () => {
    it('should return overview help by default', () => {
      const response = sxHelp({});
      
      expect(response.success).toBe(true);
      expect(response.data).toBeDefined();
      const data = response.data as { topic: string; content: string };
      expect(data.content).toContain('Skillix');
    });

    it('should return overview help when topic is overview', () => {
      const response = sxHelp({ topic: 'overview' });
      
      expect(response.success).toBe(true);
      const data = response.data as { topic: string; content: string };
      expect(data.content).toContain('Skillix');
    });

    it('should return skill help', () => {
      const response = sxHelp({ topic: 'skill' });
      
      expect(response.success).toBe(true);
      const data = response.data as { topic: string; content: string };
      expect(data.content).toContain('sx-skill');
    });

    it('should return config help', () => {
      const response = sxHelp({ topic: 'config' });
      
      expect(response.success).toBe(true);
      const data = response.data as { topic: string; content: string };
      expect(data.content).toContain('sx-config');
    });

    it('should return market help', () => {
      const response = sxHelp({ topic: 'market' });
      
      expect(response.success).toBe(true);
      const data = response.data as { topic: string; content: string };
      expect(data.content).toContain('sx-market');
    });

    it('should return dispatch help', () => {
      const response = sxHelp({ topic: 'dispatch' });
      
      expect(response.success).toBe(true);
      const data = response.data as { topic: string; content: string };
      expect(data.content).toContain('sx-dispatch');
    });

    it('should return all help when topic is all', () => {
      const response = sxHelp({ topic: 'all' });
      
      expect(response.success).toBe(true);
      const data = response.data as { topic: string; content: string };
      expect(data.content).toContain('sx-skill');
      expect(data.content).toContain('sx-config');
      expect(data.content).toContain('sx-market');
    });
  });
});
