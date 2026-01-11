"use strict";
/**
 * 文件系统工具函数
 * 处理文件和目录的读写操作
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.exists = exists;
exports.isDirectory = isDirectory;
exports.isFile = isFile;
exports.readFile = readFile;
exports.writeFile = writeFile;
exports.readJson = readJson;
exports.writeJson = writeJson;
exports.ensureDir = ensureDir;
exports.listDir = listDir;
exports.listSubDirs = listSubDirs;
exports.removeFile = removeFile;
exports.removeDir = removeDir;
exports.copyFile = copyFile;
exports.copyDir = copyDir;
exports.getModifiedTime = getModifiedTime;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
/**
 * 检查路径是否存在
 */
function exists(p) {
    return fs.existsSync(p);
}
/**
 * 检查是否为目录
 */
function isDirectory(p) {
    try {
        return fs.statSync(p).isDirectory();
    }
    catch {
        return false;
    }
}
/**
 * 检查是否为文件
 */
function isFile(p) {
    try {
        return fs.statSync(p).isFile();
    }
    catch {
        return false;
    }
}
/**
 * 读取文件内容
 */
function readFile(filePath) {
    return fs.readFileSync(filePath, 'utf-8');
}
/**
 * 写入文件内容
 */
function writeFile(filePath, content) {
    const dir = path.dirname(filePath);
    if (!exists(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(filePath, content, 'utf-8');
}
/**
 * 读取 JSON 文件
 */
function readJson(filePath) {
    try {
        const content = readFile(filePath);
        return JSON.parse(content);
    }
    catch {
        return null;
    }
}
/**
 * 写入 JSON 文件
 */
function writeJson(filePath, data) {
    writeFile(filePath, JSON.stringify(data, null, 2));
}
/**
 * 创建目录（递归）
 */
function ensureDir(dirPath) {
    if (!exists(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
}
/**
 * 列出目录内容
 */
function listDir(dirPath) {
    try {
        return fs.readdirSync(dirPath);
    }
    catch {
        return [];
    }
}
/**
 * 列出目录中的子目录
 */
function listSubDirs(dirPath) {
    return listDir(dirPath).filter(name => isDirectory(path.join(dirPath, name)));
}
/**
 * 删除文件
 */
function removeFile(filePath) {
    try {
        fs.unlinkSync(filePath);
        return true;
    }
    catch {
        return false;
    }
}
/**
 * 删除目录（递归）
 */
function removeDir(dirPath) {
    try {
        fs.rmSync(dirPath, { recursive: true, force: true });
        return true;
    }
    catch {
        return false;
    }
}
/**
 * 复制文件
 */
function copyFile(src, dest) {
    const destDir = path.dirname(dest);
    ensureDir(destDir);
    fs.copyFileSync(src, dest);
}
/**
 * 复制目录（递归）
 */
function copyDir(src, dest) {
    ensureDir(dest);
    const entries = fs.readdirSync(src, { withFileTypes: true });
    for (const entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);
        if (entry.isDirectory()) {
            copyDir(srcPath, destPath);
        }
        else {
            copyFile(srcPath, destPath);
        }
    }
}
/**
 * 获取文件修改时间
 */
function getModifiedTime(filePath) {
    try {
        return fs.statSync(filePath).mtime;
    }
    catch {
        return null;
    }
}
//# sourceMappingURL=fs.js.map