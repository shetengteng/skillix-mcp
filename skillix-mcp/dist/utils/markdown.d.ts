/**
 * Markdown 解析工具函数
 * 处理 SKILL.md 文件的解析
 */
import type { SkillMetadata } from '../types/skill.js';
/**
 * 解析 YAML frontmatter
 * 简单实现，不依赖外部库
 */
export declare function parseFrontmatter(content: string): {
    metadata: Record<string, any>;
    body: string;
};
/**
 * 从 SKILL.md 内容解析技能元数据
 */
export declare function parseSkillMetadata(content: string): SkillMetadata;
/**
 * 获取 SKILL.md 的正文内容
 */
export declare function getSkillBody(content: string): string;
/**
 * 生成 SKILL.md 内容
 */
export declare function generateSkillMd(metadata: SkillMetadata, body: string): string;
/**
 * 从 Markdown 内容提取标题
 */
export declare function extractTitle(content: string): string | null;
/**
 * 从 Markdown 内容提取所有章节
 */
export declare function extractSections(content: string): Array<{
    level: number;
    title: string;
    content: string;
}>;
//# sourceMappingURL=markdown.d.ts.map