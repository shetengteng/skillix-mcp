/**
 * 技能服务
 * 处理技能的 CRUD 操作
 */

import type { Skill, SkillMetadata, SkillScope } from '../types/skill.js';
import type { ListedSkill, ListSkillsResponse } from '../types/response.js';
import * as paths from '../utils/paths.js';
import * as fs from '../utils/fs.js';
import * as markdown from '../utils/markdown.js';

/**
 * 从目录加载技能
 */
function loadSkillFromDir(skillDir: string, scope: SkillScope): Skill | null {
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
  } catch {
    return null;
  }
}

/**
 * 列出全局技能
 */
export function listGlobalSkills(): Skill[] {
  const skillsDir = paths.getGlobalSkillsDir();
  
  if (!fs.exists(skillsDir)) {
    return [];
  }
  
  const skills: Skill[] = [];
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
export function listProjectSkills(projectRoot: string): Skill[] {
  const skillsDir = paths.getProjectSkillsDir(projectRoot);
  
  if (!fs.exists(skillsDir)) {
    return [];
  }
  
  const skills: Skill[] = [];
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
export function listAllSkills(projectRoot?: string): ListSkillsResponse {
  const globalSkills = listGlobalSkills();
  const projectSkills = projectRoot ? listProjectSkills(projectRoot) : [];
  
  const toListedSkill = (skill: Skill): ListedSkill => ({
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
export function getSkill(skillName: string, projectRoot?: string): Skill | null {
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
export function readSkillContent(skillName: string, projectRoot?: string): {
  metadata: SkillMetadata;
  body: string;
  scripts?: string[];
  references?: string[];
  assets?: string[];
} | null {
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
export function createSkill(
  skillName: string,
  metadata: SkillMetadata,
  body: string,
  scope: SkillScope,
  projectRoot?: string
): Skill {
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
export function updateSkill(
  skillName: string,
  updates: {
    metadata?: Partial<SkillMetadata>;
    body?: string;
  },
  projectRoot?: string
): Skill | null {
  const skill = getSkill(skillName, projectRoot);
  
  if (!skill) {
    return null;
  }
  
  const { body: currentBody } = markdown.parseFrontmatter(skill.content || '');
  
  const newMetadata: SkillMetadata = {
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
export function deleteSkill(skillName: string, projectRoot?: string): boolean {
  const skill = getSkill(skillName, projectRoot);
  
  if (!skill) {
    return false;
  }
  
  return fs.removeDir(skill.path);
}

/**
 * 检查技能是否存在
 */
export function skillExists(skillName: string, projectRoot?: string): boolean {
  return getSkill(skillName, projectRoot) !== null;
}

/**
 * 搜索技能
 */
export function searchSkills(
  query: string,
  projectRoot?: string
): ListedSkill[] {
  const { global_skills, project_skills } = listAllSkills(projectRoot);
  const allSkills = [...project_skills, ...global_skills];
  
  const lowerQuery = query.toLowerCase();
  
  return allSkills.filter(skill => 
    skill.name.toLowerCase().includes(lowerQuery) ||
    skill.description.toLowerCase().includes(lowerQuery)
  );
}
