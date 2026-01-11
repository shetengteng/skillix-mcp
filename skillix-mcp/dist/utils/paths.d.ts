/**
 * 路径工具函数
 * 处理全局和项目级别的路径解析
 */
/**
 * 获取全局 Skillix 目录路径
 * ~/.skillix/
 */
export declare function getGlobalDir(): string;
/**
 * 获取全局配置文件路径
 * ~/.skillix/config.json
 */
export declare function getGlobalConfigPath(): string;
/**
 * 获取全局技能目录路径
 * ~/.skillix/skills/
 */
export declare function getGlobalSkillsDir(): string;
/**
 * 获取全局缓存目录路径
 * ~/.skillix/cache/
 */
export declare function getGlobalCacheDir(): string;
/**
 * 获取全局日志目录路径
 * ~/.skillix/logs/
 */
export declare function getGlobalLogsDir(): string;
/**
 * 获取项目 Skillix 目录路径
 * .skillix/
 */
export declare function getProjectDir(projectRoot: string): string;
/**
 * 获取项目配置文件路径
 * .skillix/config.json
 */
export declare function getProjectConfigPath(projectRoot: string): string;
/**
 * 获取项目技能目录路径
 * .skillix/skills/
 */
export declare function getProjectSkillsDir(projectRoot: string): string;
/**
 * 获取特定技能的目录路径
 */
export declare function getSkillDir(skillsDir: string, skillName: string): string;
/**
 * 获取技能的 SKILL.md 文件路径
 */
export declare function getSkillMdPath(skillDir: string): string;
/**
 * 获取技能的 scripts 目录路径
 */
export declare function getSkillScriptsDir(skillDir: string): string;
/**
 * 获取技能的 references 目录路径
 */
export declare function getSkillReferencesDir(skillDir: string): string;
/**
 * 获取技能的 assets 目录路径
 */
export declare function getSkillAssetsDir(skillDir: string): string;
/**
 * 获取技能的 logs 目录路径
 */
export declare function getSkillLogsDir(skillDir: string): string;
/**
 * 检查路径是否为绝对路径
 */
export declare function isAbsolutePath(p: string): boolean;
/**
 * 规范化路径
 */
export declare function normalizePath(p: string): string;
/**
 * 获取相对路径
 */
export declare function getRelativePath(from: string, to: string): string;
//# sourceMappingURL=paths.d.ts.map