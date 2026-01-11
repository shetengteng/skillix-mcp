/**
 * 文件系统工具函数
 * 处理文件和目录的读写操作
 */
/**
 * 检查路径是否存在
 */
export declare function exists(p: string): boolean;
/**
 * 检查是否为目录
 */
export declare function isDirectory(p: string): boolean;
/**
 * 检查是否为文件
 */
export declare function isFile(p: string): boolean;
/**
 * 读取文件内容
 */
export declare function readFile(filePath: string): string;
/**
 * 写入文件内容
 */
export declare function writeFile(filePath: string, content: string): void;
/**
 * 读取 JSON 文件
 */
export declare function readJson<T>(filePath: string): T | null;
/**
 * 写入 JSON 文件
 */
export declare function writeJson<T>(filePath: string, data: T): void;
/**
 * 创建目录（递归）
 */
export declare function ensureDir(dirPath: string): void;
/**
 * 列出目录内容
 */
export declare function listDir(dirPath: string): string[];
/**
 * 列出目录中的子目录
 */
export declare function listSubDirs(dirPath: string): string[];
/**
 * 删除文件
 */
export declare function removeFile(filePath: string): boolean;
/**
 * 删除目录（递归）
 */
export declare function removeDir(dirPath: string): boolean;
/**
 * 复制文件
 */
export declare function copyFile(src: string, dest: string): void;
/**
 * 复制目录（递归）
 */
export declare function copyDir(src: string, dest: string): void;
/**
 * 获取文件修改时间
 */
export declare function getModifiedTime(filePath: string): Date | null;
//# sourceMappingURL=fs.d.ts.map