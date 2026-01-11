"use strict";
/**
 * 路径工具函数
 * 处理全局和项目级别的路径解析
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
exports.getGlobalDir = getGlobalDir;
exports.getGlobalConfigPath = getGlobalConfigPath;
exports.getGlobalSkillsDir = getGlobalSkillsDir;
exports.getGlobalCacheDir = getGlobalCacheDir;
exports.getGlobalLogsDir = getGlobalLogsDir;
exports.getProjectDir = getProjectDir;
exports.getProjectConfigPath = getProjectConfigPath;
exports.getProjectSkillsDir = getProjectSkillsDir;
exports.getSkillDir = getSkillDir;
exports.getSkillMdPath = getSkillMdPath;
exports.getSkillScriptsDir = getSkillScriptsDir;
exports.getSkillReferencesDir = getSkillReferencesDir;
exports.getSkillAssetsDir = getSkillAssetsDir;
exports.getSkillLogsDir = getSkillLogsDir;
exports.isAbsolutePath = isAbsolutePath;
exports.normalizePath = normalizePath;
exports.getRelativePath = getRelativePath;
const path = __importStar(require("path"));
const os = __importStar(require("os"));
/**
 * 获取全局 Skillix 目录路径
 * ~/.skillix/
 */
function getGlobalDir() {
    return path.join(os.homedir(), '.skillix');
}
/**
 * 获取全局配置文件路径
 * ~/.skillix/config.json
 */
function getGlobalConfigPath() {
    return path.join(getGlobalDir(), 'config.json');
}
/**
 * 获取全局技能目录路径
 * ~/.skillix/skills/
 */
function getGlobalSkillsDir() {
    return path.join(getGlobalDir(), 'skills');
}
/**
 * 获取全局缓存目录路径
 * ~/.skillix/cache/
 */
function getGlobalCacheDir() {
    return path.join(getGlobalDir(), 'cache');
}
/**
 * 获取全局日志目录路径
 * ~/.skillix/logs/
 */
function getGlobalLogsDir() {
    return path.join(getGlobalDir(), 'logs');
}
/**
 * 获取项目 Skillix 目录路径
 * .skillix/
 */
function getProjectDir(projectRoot) {
    return path.join(projectRoot, '.skillix');
}
/**
 * 获取项目配置文件路径
 * .skillix/config.json
 */
function getProjectConfigPath(projectRoot) {
    return path.join(getProjectDir(projectRoot), 'config.json');
}
/**
 * 获取项目技能目录路径
 * .skillix/skills/
 */
function getProjectSkillsDir(projectRoot) {
    return path.join(getProjectDir(projectRoot), 'skills');
}
/**
 * 获取特定技能的目录路径
 */
function getSkillDir(skillsDir, skillName) {
    return path.join(skillsDir, skillName);
}
/**
 * 获取技能的 SKILL.md 文件路径
 */
function getSkillMdPath(skillDir) {
    return path.join(skillDir, 'SKILL.md');
}
/**
 * 获取技能的 scripts 目录路径
 */
function getSkillScriptsDir(skillDir) {
    return path.join(skillDir, 'scripts');
}
/**
 * 获取技能的 references 目录路径
 */
function getSkillReferencesDir(skillDir) {
    return path.join(skillDir, 'references');
}
/**
 * 获取技能的 assets 目录路径
 */
function getSkillAssetsDir(skillDir) {
    return path.join(skillDir, 'assets');
}
/**
 * 获取技能的 logs 目录路径
 */
function getSkillLogsDir(skillDir) {
    return path.join(skillDir, 'logs');
}
/**
 * 检查路径是否为绝对路径
 */
function isAbsolutePath(p) {
    return path.isAbsolute(p);
}
/**
 * 规范化路径
 */
function normalizePath(p) {
    return path.normalize(p);
}
/**
 * 获取相对路径
 */
function getRelativePath(from, to) {
    return path.relative(from, to);
}
//# sourceMappingURL=paths.js.map