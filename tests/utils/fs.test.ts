/**
 * fs 工具函数测试
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as path from 'node:path';
import * as nodeFs from 'node:fs';
import { createTempDir, cleanupTempDir } from '../helpers/setup.js';
import * as fs from '../../src/utils/fs.js';

describe('fs utils', () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = createTempDir();
  });

  afterEach(() => {
    cleanupTempDir(tempDir);
  });

  describe('exists', () => {
    it('should return true for existing file', () => {
      const filePath = path.join(tempDir, 'test.txt');
      nodeFs.writeFileSync(filePath, 'test');
      expect(fs.exists(filePath)).toBe(true);
    });

    it('should return false for non-existing file', () => {
      const filePath = path.join(tempDir, 'non-existing.txt');
      expect(fs.exists(filePath)).toBe(false);
    });

    it('should return true for existing directory', () => {
      expect(fs.exists(tempDir)).toBe(true);
    });
  });

  describe('isDirectory', () => {
    it('should return true for directory', () => {
      expect(fs.isDirectory(tempDir)).toBe(true);
    });

    it('should return false for file', () => {
      const filePath = path.join(tempDir, 'test.txt');
      nodeFs.writeFileSync(filePath, 'test');
      expect(fs.isDirectory(filePath)).toBe(false);
    });
  });

  describe('isFile', () => {
    it('should return true for file', () => {
      const filePath = path.join(tempDir, 'test.txt');
      nodeFs.writeFileSync(filePath, 'test');
      expect(fs.isFile(filePath)).toBe(true);
    });

    it('should return false for directory', () => {
      expect(fs.isFile(tempDir)).toBe(false);
    });
  });

  describe('readFile', () => {
    it('should read file content', () => {
      const filePath = path.join(tempDir, 'test.txt');
      nodeFs.writeFileSync(filePath, 'hello world');
      expect(fs.readFile(filePath)).toBe('hello world');
    });

    it('should throw for non-existing file', () => {
      const filePath = path.join(tempDir, 'non-existing.txt');
      expect(() => fs.readFile(filePath)).toThrow();
    });
  });

  describe('writeFile', () => {
    it('should write content to file', () => {
      const filePath = path.join(tempDir, 'test.txt');
      fs.writeFile(filePath, 'hello world');
      expect(nodeFs.readFileSync(filePath, 'utf-8')).toBe('hello world');
    });

    it('should create parent directories if not exist', () => {
      const filePath = path.join(tempDir, 'subdir', 'test.txt');
      fs.writeFile(filePath, 'hello');
      expect(nodeFs.existsSync(filePath)).toBe(true);
    });
  });

  describe('readJson', () => {
    it('should parse JSON file', () => {
      const filePath = path.join(tempDir, 'test.json');
      nodeFs.writeFileSync(filePath, '{"key": "value"}');
      expect(fs.readJson(filePath)).toEqual({ key: 'value' });
    });

    it('should return null for non-existing file', () => {
      const filePath = path.join(tempDir, 'non-existing.json');
      expect(fs.readJson(filePath)).toBeNull();
    });

    it('should return null for invalid JSON', () => {
      const filePath = path.join(tempDir, 'invalid.json');
      nodeFs.writeFileSync(filePath, 'not json');
      expect(fs.readJson(filePath)).toBeNull();
    });
  });

  describe('writeJson', () => {
    it('should write JSON with formatting', () => {
      const filePath = path.join(tempDir, 'test.json');
      fs.writeJson(filePath, { key: 'value' });
      const content = nodeFs.readFileSync(filePath, 'utf-8');
      expect(JSON.parse(content)).toEqual({ key: 'value' });
    });
  });

  describe('ensureDir', () => {
    it('should create directory recursively', () => {
      const dirPath = path.join(tempDir, 'a', 'b', 'c');
      fs.ensureDir(dirPath);
      expect(nodeFs.existsSync(dirPath)).toBe(true);
    });

    it('should not throw if directory exists', () => {
      expect(() => fs.ensureDir(tempDir)).not.toThrow();
    });
  });

  describe('removeDir', () => {
    it('should remove directory recursively', () => {
      const dirPath = path.join(tempDir, 'to-remove');
      nodeFs.mkdirSync(dirPath);
      nodeFs.writeFileSync(path.join(dirPath, 'file.txt'), 'content');
      
      const result = fs.removeDir(dirPath);
      expect(result).toBe(true);
      expect(nodeFs.existsSync(dirPath)).toBe(false);
    });

    it('should return true for non-existing directory (force mode)', () => {
      const dirPath = path.join(tempDir, 'non-existing');
      // rmSync with force: true 不会抛出错误
      expect(fs.removeDir(dirPath)).toBe(true);
    });
  });

  describe('listDir', () => {
    it('should list directory contents', () => {
      nodeFs.writeFileSync(path.join(tempDir, 'file1.txt'), '');
      nodeFs.writeFileSync(path.join(tempDir, 'file2.txt'), '');
      
      const files = fs.listDir(tempDir);
      expect(files).toContain('file1.txt');
      expect(files).toContain('file2.txt');
    });

    it('should return empty array for non-existing directory', () => {
      const dirPath = path.join(tempDir, 'non-existing');
      expect(fs.listDir(dirPath)).toEqual([]);
    });
  });

  describe('listSubDirs', () => {
    it('should list only subdirectories', () => {
      nodeFs.mkdirSync(path.join(tempDir, 'dir1'));
      nodeFs.mkdirSync(path.join(tempDir, 'dir2'));
      nodeFs.writeFileSync(path.join(tempDir, 'file.txt'), '');
      
      const dirs = fs.listSubDirs(tempDir);
      expect(dirs).toContain('dir1');
      expect(dirs).toContain('dir2');
      expect(dirs).not.toContain('file.txt');
    });

    it('should return empty array for non-existing directory', () => {
      const dirPath = path.join(tempDir, 'non-existing');
      expect(fs.listSubDirs(dirPath)).toEqual([]);
    });
  });

  describe('copyFile', () => {
    it('should copy file', () => {
      const srcPath = path.join(tempDir, 'src.txt');
      const destPath = path.join(tempDir, 'dest.txt');
      nodeFs.writeFileSync(srcPath, 'content');
      
      fs.copyFile(srcPath, destPath);
      
      expect(nodeFs.existsSync(destPath)).toBe(true);
      expect(nodeFs.readFileSync(destPath, 'utf-8')).toBe('content');
    });
  });

  describe('copyDir', () => {
    it('should copy directory recursively', () => {
      const srcDir = path.join(tempDir, 'src');
      const destDir = path.join(tempDir, 'dest');
      
      nodeFs.mkdirSync(srcDir);
      nodeFs.writeFileSync(path.join(srcDir, 'file.txt'), 'content');
      nodeFs.mkdirSync(path.join(srcDir, 'subdir'));
      nodeFs.writeFileSync(path.join(srcDir, 'subdir', 'nested.txt'), 'nested');
      
      fs.copyDir(srcDir, destDir);
      
      expect(nodeFs.existsSync(path.join(destDir, 'file.txt'))).toBe(true);
      expect(nodeFs.existsSync(path.join(destDir, 'subdir', 'nested.txt'))).toBe(true);
    });
  });
});
