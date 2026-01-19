/**
 * 索引构建服务
 * 扫描仓库技能目录，构建索引文件
 */

import * as path from 'path';
import { exists, isDirectory, listSubDirs, readFile, writeJson, readJson } from '../../utils/fs.js';
import { parseSkillMetadata } from '../../utils/markdown.js';
import { getRepoSkillsDir, getSourceIndexPath, getManifestPath, getSourcesIndexDir } from './paths.js';
import { parseGitUrl } from './url.js';
import type { SkillSource, SourceIndex, SkillIndexItem, Manifest, ManifestSource, SourceStatus } from '../types.js';

/**
 * 构建单个源的索引
 */
export function buildSourceIndex(
  source: SkillSource,
  commit: string
): { success: boolean; index?: SourceIndex; error?: string } {
  const parsed = parseGitUrl(source.url);
  if (!parsed) {
    return { success: false, error: `无效的 Git URL: ${source.url}` };
  }

  const skillsDir = getRepoSkillsDir(parsed.dirName);
  
  if (!exists(skillsDir)) {
    return { success: false, error: `技能目录不存在: ${skillsDir}` };
  }

  const skills: SkillIndexItem[] = [];
  const skillDirs = listSubDirs(skillsDir);

  for (const skillName of skillDirs) {
    const skillDir = path.join(skillsDir, skillName);
    const skillMdPath = path.join(skillDir, 'SKILL.md');

    if (!exists(skillMdPath)) {
      continue; // 跳过没有 SKILL.md 的目录
    }

    try {
      const content = readFile(skillMdPath);
      const metadata = parseSkillMetadata(content);

      // 跳过元数据不完整的技能
      if (!metadata.name || !metadata.description) {
        continue;
      }

      skills.push({
        name: metadata.name,
        description: metadata.description,
        version: metadata.version || '1.0.0',
        author: metadata.author || '',
        tags: metadata.tags || [],
        path: `skills/${skillName}`,
        hasScripts: exists(path.join(skillDir, 'scripts')),
        hasReferences: exists(path.join(skillDir, 'references')),
        hasAssets: exists(path.join(skillDir, 'assets')),
      });
    } catch {
      // 跳过解析失败的技能
      continue;
    }
  }

  const index: SourceIndex = {
    version: '1.0.0',
    generatedAt: new Date().toISOString(),
    source: {
      id: parsed.sourceId,
      name: source.name,
      url: source.url,
      branch: source.branch || 'main',
      commit,
    },
    skills,
  };

  return { success: true, index };
}

/**
 * 保存源索引到文件
 */
export function saveSourceIndex(dirName: string, index: SourceIndex): void {
  const indexPath = getSourceIndexPath(dirName);
  writeJson(indexPath, index);
}

/**
 * 读取源索引
 */
export function loadSourceIndex(dirName: string): SourceIndex | null {
  const indexPath = getSourceIndexPath(dirName);
  return readJson<SourceIndex>(indexPath);
}

/**
 * 更新聚合清单
 */
export function updateManifest(sourceInfo: ManifestSource): void {
  const manifestPath = getManifestPath();
  let manifest = readJson<Manifest>(manifestPath);

  if (!manifest) {
    manifest = {
      version: '1.0.0',
      updatedAt: new Date().toISOString(),
      sources: [],
    };
  }

  // 查找并更新或添加源
  const existingIndex = manifest.sources.findIndex(s => s.id === sourceInfo.id);
  if (existingIndex >= 0) {
    manifest.sources[existingIndex] = sourceInfo;
  } else {
    manifest.sources.push(sourceInfo);
  }

  manifest.updatedAt = new Date().toISOString();
  writeJson(manifestPath, manifest);
}

/**
 * 读取聚合清单
 */
export function loadManifest(): Manifest | null {
  const manifestPath = getManifestPath();
  return readJson<Manifest>(manifestPath);
}

/**
 * 从清单中移除源
 */
export function removeSourceFromManifest(sourceId: string): void {
  const manifestPath = getManifestPath();
  const manifest = readJson<Manifest>(manifestPath);

  if (!manifest) {
    return;
  }

  manifest.sources = manifest.sources.filter(s => s.id !== sourceId);
  manifest.updatedAt = new Date().toISOString();
  writeJson(manifestPath, manifest);
}

/**
 * 获取源状态
 */
export function getSourceStatus(sourceId: string): ManifestSource | null {
  const manifest = loadManifest();
  if (!manifest) {
    return null;
  }
  return manifest.sources.find(s => s.id === sourceId) || null;
}

/**
 * 获取所有源状态
 */
export function getAllSourceStatus(): ManifestSource[] {
  const manifest = loadManifest();
  return manifest?.sources || [];
}
