/**
 * 文件系统工具函数测试
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as path from 'path';
import {
  setupTestEnv,
  cleanupTestEnv,
  TEST_BASE_DIR,
  createTestFile,
  readTestFile,
} from '../helpers/setup.js';
import * as fsUtils from '../../src/utils/fs.js';

describe('fs utils', () => {
  beforeEach(() => {
    setupTestEnv();
  });

  afterEach(() => {
    cleanupTestEnv();
  });

  describe('exists', () => {
    it('should return true for existing directory', () => {
      expect(fsUtils.exists(TEST_BASE_DIR)).toBe(true);
    });

    it('should return true for existing file', () => {
      const filePath = path.join(TEST_BASE_DIR, 'test.txt');
      createTestFile(filePath, 'content');
      expect(fsUtils.exists(filePath)).toBe(true);
    });

    it('should return false for non-existing path', () => {
      expect(fsUtils.exists(path.join(TEST_BASE_DIR, 'non-existing'))).toBe(false);
    });
  });

  describe('isDirectory', () => {
    it('should return true for directory', () => {
      expect(fsUtils.isDirectory(TEST_BASE_DIR)).toBe(true);
    });

    it('should return false for file', () => {
      const filePath = path.join(TEST_BASE_DIR, 'test.txt');
      createTestFile(filePath, 'content');
      expect(fsUtils.isDirectory(filePath)).toBe(false);
    });

    it('should return false for non-existing path', () => {
      expect(fsUtils.isDirectory(path.join(TEST_BASE_DIR, 'non-existing'))).toBe(false);
    });
  });

  describe('isFile', () => {
    it('should return true for file', () => {
      const filePath = path.join(TEST_BASE_DIR, 'test.txt');
      createTestFile(filePath, 'content');
      expect(fsUtils.isFile(filePath)).toBe(true);
    });

    it('should return false for directory', () => {
      expect(fsUtils.isFile(TEST_BASE_DIR)).toBe(false);
    });

    it('should return false for non-existing path', () => {
      expect(fsUtils.isFile(path.join(TEST_BASE_DIR, 'non-existing.txt'))).toBe(false);
    });
  });

  describe('readFile', () => {
    it('should read file content', () => {
      const filePath = path.join(TEST_BASE_DIR, 'test.txt');
      const content = 'Hello, World!';
      createTestFile(filePath, content);
      expect(fsUtils.readFile(filePath)).toBe(content);
    });

    it('should throw error for non-existing file', () => {
      expect(() => fsUtils.readFile(path.join(TEST_BASE_DIR, 'non-existing.txt'))).toThrow();
    });
  });

  describe('writeFile', () => {
    it('should write file content', () => {
      const filePath = path.join(TEST_BASE_DIR, 'write-test.txt');
      const content = 'Test content';
      fsUtils.writeFile(filePath, content);
      expect(readTestFile(filePath)).toBe(content);
    });

    it('should create parent directories automatically', () => {
      const filePath = path.join(TEST_BASE_DIR, 'subdir', 'nested', 'test.txt');
      const content = 'Nested content';
      fsUtils.writeFile(filePath, content);
      expect(readTestFile(filePath)).toBe(content);
    });

    it('should overwrite existing file', () => {
      const filePath = path.join(TEST_BASE_DIR, 'overwrite.txt');
      createTestFile(filePath, 'original');
      fsUtils.writeFile(filePath, 'updated');
      expect(readTestFile(filePath)).toBe('updated');
    });
  });

  describe('readJson', () => {
    it('should read and parse JSON file', () => {
      const filePath = path.join(TEST_BASE_DIR, 'test.json');
      const data = { key: 'value', number: 123 };
      createTestFile(filePath, JSON.stringify(data));
      expect(fsUtils.readJson(filePath)).toEqual(data);
    });

    it('should return null for non-existing file', () => {
      expect(fsUtils.readJson(path.join(TEST_BASE_DIR, 'non-existing.json'))).toBeNull();
    });

    it('should return null for invalid JSON', () => {
      const filePath = path.join(TEST_BASE_DIR, 'invalid.json');
      createTestFile(filePath, 'not valid json');
      expect(fsUtils.readJson(filePath)).toBeNull();
    });
  });

  describe('writeJson', () => {
    it('should write JSON file with formatting', () => {
      const filePath = path.join(TEST_BASE_DIR, 'write.json');
      const data = { key: 'value' };
      fsUtils.writeJson(filePath, data);
      
      const content = readTestFile(filePath);
      expect(content).toBe(JSON.stringify(data, null, 2));
    });
  });

  describe('ensureDir', () => {
    it('should create directory if not exists', () => {
      const dirPath = path.join(TEST_BASE_DIR, 'new-dir');
      fsUtils.ensureDir(dirPath);
      expect(fsUtils.isDirectory(dirPath)).toBe(true);
    });

    it('should create nested directories', () => {
      const dirPath = path.join(TEST_BASE_DIR, 'level1', 'level2', 'level3');
      fsUtils.ensureDir(dirPath);
      expect(fsUtils.isDirectory(dirPath)).toBe(true);
    });

    it('should not throw if directory already exists', () => {
      expect(() => fsUtils.ensureDir(TEST_BASE_DIR)).not.toThrow();
    });
  });

  describe('listDir', () => {
    it('should list directory contents', () => {
      createTestFile(path.join(TEST_BASE_DIR, 'file1.txt'), 'a');
      createTestFile(path.join(TEST_BASE_DIR, 'file2.txt'), 'b');
      fsUtils.ensureDir(path.join(TEST_BASE_DIR, 'subdir'));
      
      const contents = fsUtils.listDir(TEST_BASE_DIR);
      expect(contents).toContain('file1.txt');
      expect(contents).toContain('file2.txt');
      expect(contents).toContain('subdir');
    });

    it('should return empty array for non-existing directory', () => {
      expect(fsUtils.listDir(path.join(TEST_BASE_DIR, 'non-existing'))).toEqual([]);
    });
  });

  describe('listSubDirs', () => {
    it('should list only subdirectories', () => {
      createTestFile(path.join(TEST_BASE_DIR, 'file.txt'), 'content');
      fsUtils.ensureDir(path.join(TEST_BASE_DIR, 'dir1'));
      fsUtils.ensureDir(path.join(TEST_BASE_DIR, 'dir2'));
      
      const subdirs = fsUtils.listSubDirs(TEST_BASE_DIR);
      expect(subdirs).toContain('dir1');
      expect(subdirs).toContain('dir2');
      expect(subdirs).not.toContain('file.txt');
    });
  });

  describe('removeFile', () => {
    it('should remove existing file', () => {
      const filePath = path.join(TEST_BASE_DIR, 'to-remove.txt');
      createTestFile(filePath, 'content');
      
      const result = fsUtils.removeFile(filePath);
      expect(result).toBe(true);
      expect(fsUtils.exists(filePath)).toBe(false);
    });

    it('should return false for non-existing file', () => {
      const result = fsUtils.removeFile(path.join(TEST_BASE_DIR, 'non-existing.txt'));
      expect(result).toBe(false);
    });
  });

  describe('removeDir', () => {
    it('should remove directory recursively', () => {
      const dirPath = path.join(TEST_BASE_DIR, 'to-remove');
      fsUtils.ensureDir(dirPath);
      createTestFile(path.join(dirPath, 'file.txt'), 'content');
      fsUtils.ensureDir(path.join(dirPath, 'subdir'));
      createTestFile(path.join(dirPath, 'subdir', 'nested.txt'), 'nested');
      
      const result = fsUtils.removeDir(dirPath);
      expect(result).toBe(true);
      expect(fsUtils.exists(dirPath)).toBe(false);
    });

    it('should return false for non-existing directory', () => {
      const result = fsUtils.removeDir(path.join(TEST_BASE_DIR, 'non-existing'));
      expect(result).toBe(false);
    });
  });

  describe('copyFile', () => {
    it('should copy file to destination', () => {
      const srcPath = path.join(TEST_BASE_DIR, 'source.txt');
      const destPath = path.join(TEST_BASE_DIR, 'dest.txt');
      const content = 'copy content';
      createTestFile(srcPath, content);
      
      fsUtils.copyFile(srcPath, destPath);
      expect(readTestFile(destPath)).toBe(content);
    });

    it('should create destination directory if not exists', () => {
      const srcPath = path.join(TEST_BASE_DIR, 'source.txt');
      const destPath = path.join(TEST_BASE_DIR, 'new-dir', 'dest.txt');
      const content = 'copy content';
      createTestFile(srcPath, content);
      
      fsUtils.copyFile(srcPath, destPath);
      expect(readTestFile(destPath)).toBe(content);
    });
  });

  describe('copyDir', () => {
    it('should copy directory recursively', () => {
      const srcDir = path.join(TEST_BASE_DIR, 'src-dir');
      const destDir = path.join(TEST_BASE_DIR, 'dest-dir');
      
      fsUtils.ensureDir(srcDir);
      createTestFile(path.join(srcDir, 'file1.txt'), 'content1');
      fsUtils.ensureDir(path.join(srcDir, 'subdir'));
      createTestFile(path.join(srcDir, 'subdir', 'file2.txt'), 'content2');
      
      fsUtils.copyDir(srcDir, destDir);
      
      expect(fsUtils.isDirectory(destDir)).toBe(true);
      expect(readTestFile(path.join(destDir, 'file1.txt'))).toBe('content1');
      expect(readTestFile(path.join(destDir, 'subdir', 'file2.txt'))).toBe('content2');
    });
  });

  describe('getModifiedTime', () => {
    it('should return modification time for existing file', () => {
      const filePath = path.join(TEST_BASE_DIR, 'time-test.txt');
      createTestFile(filePath, 'content');
      
      const mtime = fsUtils.getModifiedTime(filePath);
      expect(mtime).toBeInstanceOf(Date);
    });

    it('should return null for non-existing file', () => {
      expect(fsUtils.getModifiedTime(path.join(TEST_BASE_DIR, 'non-existing.txt'))).toBeNull();
    });
  });
});
