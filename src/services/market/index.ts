/**
 * Market 服务统一导出
 */

// URL 解析
export { parseGitUrl, sourceIdToDirName, dirNameToSourceId } from './url.js';

// 缓存路径
export {
  getReposCacheDir,
  getRepoCacheDir,
  getRepoSkillsDir,
  getCachedSkillDir,
  getIndexesCacheDir,
  getSourcesIndexDir,
  getSourceIndexPath,
  getManifestPath,
  getDownloadsCacheDir,
  getGlobalInstalledPath,
  getProjectInstalledPath,
} from './paths.js';

// Git 操作
export { cloneRepo, pullRepo, repoExists, getCommitHash } from './git.js';
export type { GitOptions } from './git.js';

// 索引构建
export {
  buildSourceIndex,
  saveSourceIndex,
  loadSourceIndex,
  updateManifest,
  loadManifest,
  removeSourceFromManifest,
  getSourceStatus,
  getAllSourceStatus,
} from './index-builder.js';

// 同步
export { syncSource, syncAllSources, syncSourceByName, needsSync } from './sync.js';

// 搜索
export { searchSkills, findSkillByName } from './search.js';
export type { SearchOptions, SearchResult } from './search.js';

// 安装/卸载
export { installSkill, uninstallSkill, getInstalledRecord, isSkillInstalled } from './install.js';
export type { InstallOptions, InstallResult, UninstallOptions, UninstallResult } from './install.js';

// 状态
export { getStatus, isSourceOutdated } from './status.js';
export type { SourceStatusDetail, StatusResult } from './status.js';
