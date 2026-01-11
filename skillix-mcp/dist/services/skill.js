"use strict";
/**
 * 技能服务
 * 处理技能的 CRUD 操作
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
exports.listGlobalSkills = listGlobalSkills;
exports.listProjectSkills = listProjectSkills;
exports.listAllSkills = listAllSkills;
exports.getSkill = getSkill;
exports.readSkillContent = readSkillContent;
exports.createSkill = createSkill;
exports.updateSkill = updateSkill;
exports.deleteSkill = deleteSkill;
exports.skillExists = skillExists;
exports.searchSkills = searchSkills;
const paths = __importStar(require("../utils/paths.js"));
const fs = __importStar(require("../utils/fs.js"));
const markdown = __importStar(require("../utils/markdown.js"));
/**
 * 从目录加载技能
 */
function loadSkillFromDir(skillDir, scope) {
    const skillMdPath = paths.getSkillMdPath(skillDir);
    if (!fs.exists(skillMdPath)) {
        return null;
    }
    try {
        const content = fs.readFile(skillMdPath);
        const metadata = markdown.parseSkillMetadata(content);
        const skillName = metadata.name || skillDir.split('/').pop() || '';
        return {
            name: skillName,
            description: metadata.description || '',
            scope,
            path: skillDir,
            metadata,
            content,
            hasScripts: fs.exists(paths.getSkillScriptsDir(skillDir)),
            hasReferences: fs.exists(paths.getSkillReferencesDir(skillDir)),
            hasAssets: fs.exists(paths.getSkillAssetsDir(skillDir)),
        };
    }
    catch {
        return null;
    }
}
/**
 * 列出全局技能
 */
function listGlobalSkills() {
    const skillsDir = paths.getGlobalSkillsDir();
    if (!fs.exists(skillsDir)) {
        return [];
    }
    const skills = [];
    const dirs = fs.listSubDirs(skillsDir);
    for (const dir of dirs) {
        const skillDir = paths.getSkillDir(skillsDir, dir);
        const skill = loadSkillFromDir(skillDir, 'global');
        if (skill) {
            skills.push(skill);
        }
    }
    return skills;
}
/**
 * 列出项目技能
 */
function listProjectSkills(projectRoot) {
    const skillsDir = paths.getProjectSkillsDir(projectRoot);
    if (!fs.exists(skillsDir)) {
        return [];
    }
    const skills = [];
    const dirs = fs.listSubDirs(skillsDir);
    for (const dir of dirs) {
        const skillDir = paths.getSkillDir(skillsDir, dir);
        const skill = loadSkillFromDir(skillDir, 'project');
        if (skill) {
            skills.push(skill);
        }
    }
    return skills;
}
/**
 * 列出所有技能
 */
function listAllSkills(projectRoot) {
    const globalSkills = listGlobalSkills();
    const projectSkills = projectRoot ? listProjectSkills(projectRoot) : [];
    const toListedSkill = (skill) => ({
        name: skill.metadata.name || skill.name,
        description: skill.metadata.description || '',
        source: skill.scope === 'global' ? 'global' : 'project',
        path: skill.path,
    });
    return {
        global_skills: globalSkills.map(toListedSkill),
        project_skills: projectSkills.map(toListedSkill),
    };
}
/**
 * 获取技能详情
 */
function getSkill(skillName, projectRoot) {
    // 先查找项目级技能（本地优先）
    if (projectRoot) {
        const projectSkillsDir = paths.getProjectSkillsDir(projectRoot);
        const projectSkillDir = paths.getSkillDir(projectSkillsDir, skillName);
        const projectSkill = loadSkillFromDir(projectSkillDir, 'project');
        if (projectSkill) {
            return projectSkill;
        }
    }
    // 再查找全局技能
    const globalSkillsDir = paths.getGlobalSkillsDir();
    const globalSkillDir = paths.getSkillDir(globalSkillsDir, skillName);
    return loadSkillFromDir(globalSkillDir, 'global');
}
/**
 * 读取技能内容
 */
function readSkillContent(skillName, projectRoot) {
    const skill = getSkill(skillName, projectRoot);
    if (!skill || !skill.content) {
        return null;
    }
    const { metadata, body } = markdown.parseFrontmatter(skill.content);
    // 获取附加资源
    const scriptsDir = paths.getSkillScriptsDir(skill.path);
    const referencesDir = paths.getSkillReferencesDir(skill.path);
    const assetsDir = paths.getSkillAssetsDir(skill.path);
    return {
        metadata: skill.metadata,
        body,
        scripts: fs.exists(scriptsDir) ? fs.listDir(scriptsDir) : undefined,
        references: fs.exists(referencesDir) ? fs.listDir(referencesDir) : undefined,
        assets: fs.exists(assetsDir) ? fs.listDir(assetsDir) : undefined,
    };
}
/**
 * 创建技能
 */
function createSkill(skillName, metadata, body, scope, projectRoot) {
    const skillsDir = scope === 'global'
        ? paths.getGlobalSkillsDir()
        : projectRoot
            ? paths.getProjectSkillsDir(projectRoot)
            : paths.getGlobalSkillsDir();
    const skillDir = paths.getSkillDir(skillsDir, skillName);
    // 确保目录存在
    fs.ensureDir(skillDir);
    fs.ensureDir(paths.getSkillScriptsDir(skillDir));
    fs.ensureDir(paths.getSkillReferencesDir(skillDir));
    fs.ensureDir(paths.getSkillAssetsDir(skillDir));
    fs.ensureDir(paths.getSkillLogsDir(skillDir));
    // 生成 SKILL.md 内容
    const content = markdown.generateSkillMd(metadata, body);
    const skillMdPath = paths.getSkillMdPath(skillDir);
    fs.writeFile(skillMdPath, content);
    return {
        name: skillName,
        description: metadata.description || '',
        scope,
        path: skillDir,
        metadata,
        content,
        hasScripts: true,
        hasReferences: true,
        hasAssets: true,
    };
}
/**
 * 更新技能
 */
function updateSkill(skillName, updates, projectRoot) {
    const skill = getSkill(skillName, projectRoot);
    if (!skill) {
        return null;
    }
    const { body: currentBody } = markdown.parseFrontmatter(skill.content || '');
    const newMetadata = {
        ...skill.metadata,
        ...updates.metadata,
    };
    const newBody = updates.body ?? currentBody;
    const newContent = markdown.generateSkillMd(newMetadata, newBody);
    const skillMdPath = paths.getSkillMdPath(skill.path);
    fs.writeFile(skillMdPath, newContent);
    return {
        ...skill,
        description: newMetadata.description || skill.description,
        metadata: newMetadata,
        content: newContent,
    };
}
/**
 * 删除技能
 */
function deleteSkill(skillName, projectRoot) {
    const skill = getSkill(skillName, projectRoot);
    if (!skill) {
        return false;
    }
    return fs.removeDir(skill.path);
}
/**
 * 检查技能是否存在
 */
function skillExists(skillName, projectRoot) {
    return getSkill(skillName, projectRoot) !== null;
}
/**
 * 搜索技能
 */
function searchSkills(query, projectRoot) {
    const { global_skills, project_skills } = listAllSkills(projectRoot);
    const allSkills = [...project_skills, ...global_skills];
    const lowerQuery = query.toLowerCase();
    return allSkills.filter(skill => skill.name.toLowerCase().includes(lowerQuery) ||
        skill.description.toLowerCase().includes(lowerQuery));
}
//# sourceMappingURL=skill.js.map