/**
 * 文件系统工具函数
 * 处理文件和目录的读写操作
 */

import * as fs from 'fs';
import * as path from 'path';

/**
 * 检查路径是否存在
 */
export function exists(p: string): boolean {
  return fs.existsSync(p);
}

/**
 * 检查是否为目录
 */
export function isDirectory(p: string): boolean {
  try {
    return fs.statSync(p).isDirectory();
  } catch {
    return false;
  }
}

/**
 * 检查是否为文件
 */
export function isFile(p: string): boolean {
  try {
    return fs.statSync(p).isFile();
  } catch {
    return false;
  }
}

/**
 * 读取文件内容
 */
export function readFile(filePath: string): string {
  return fs.readFileSync(filePath, 'utf-8');
}

/**
 * 写入文件内容
 */
export function writeFile(filePath: string, content: string): void {
  const dir = path.dirname(filePath);
  if (!exists(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(filePath, content, 'utf-8');
}

/**
 * 读取 JSON 文件
 */
export function readJson<T>(filePath: string): T | null {
  try {
    const content = readFile(filePath);
    return JSON.parse(content) as T;
  } catch {
    return null;
  }
}

/**
 * 写入 JSON 文件
 */
export function writeJson<T>(filePath: string, data: T): void {
  writeFile(filePath, JSON.stringify(data, null, 2));
}

/**
 * 创建目录（递归）
 */
export function ensureDir(dirPath: string): void {
  if (!exists(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

/**
 * 列出目录内容
 */
export function listDir(dirPath: string): string[] {
  try {
    return fs.readdirSync(dirPath);
  } catch {
    return [];
  }
}

/**
 * 列出目录中的子目录
 */
export function listSubDirs(dirPath: string): string[] {
  return listDir(dirPath).filter(name => 
    isDirectory(path.join(dirPath, name))
  );
}

/**
 * 删除文件
 */
export function removeFile(filePath: string): boolean {
  try {
    fs.unlinkSync(filePath);
    return true;
  } catch {
    return false;
  }
}

/**
 * 删除目录（递归）
 */
export function removeDir(dirPath: string): boolean {
  try {
    fs.rmSync(dirPath, { recursive: true, force: true });
    return true;
  } catch {
    return false;
  }
}

/**
 * 复制文件
 */
export function copyFile(src: string, dest: string): void {
  const destDir = path.dirname(dest);
  ensureDir(destDir);
  fs.copyFileSync(src, dest);
}

/**
 * 复制目录（递归）
 */
export function copyDir(src: string, dest: string): void {
  ensureDir(dest);
  const entries = fs.readdirSync(src, { withFileTypes: true });
  
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      copyFile(srcPath, destPath);
    }
  }
}

/**
 * 获取文件修改时间
 */
export function getModifiedTime(filePath: string): Date | null {
  try {
    return fs.statSync(filePath).mtime;
  } catch {
    return null;
  }
}
