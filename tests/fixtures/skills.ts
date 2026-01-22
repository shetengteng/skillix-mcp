/**
 * 测试用技能数据
 * 
 * 包含：
 * - 基础测试技能
 * - 多技能场景数据
 * - 项目级技能数据
 * - 验证测试数据（有效/无效名称、描述）
 * - 配置测试数据
 * - 技能源测试数据
 */

import type { SkillMetadata } from '../../src/services/types.js';

/**
 * 基础测试技能数据
 */
export const TEST_SKILL = {
  name: 'test-skill',
  metadata: {
    name: 'test-skill',
    description: '用于单元测试的测试技能',
    version: '1.0.0',
    author: 'test-author',
    tags: ['test', 'unit'],
  } as SkillMetadata,
  body: '# 测试技能\n\n这是一个用于单元测试的测试技能。',
};

/**
 * 第二个测试技能（用于多技能场景）
 */
export const TEST_SKILL_2 = {
  name: 'another-skill',
  metadata: {
    name: 'another-skill',
    description: '用于测试多技能场景的另一个测试技能',
    version: '2.0.0',
    author: 'test-author',
    tags: ['test', 'multiple'],
  } as SkillMetadata,
  body: '# 另一个技能\n\n这是另一个测试技能。',
};

/**
 * 项目级测试技能
 */
export const PROJECT_SKILL = {
  name: 'project-skill',
  metadata: {
    name: 'project-skill',
    description: '用于测试项目作用域的项目级测试技能',
    version: '1.0.0',
    author: 'project-author',
    tags: ['project', 'test'],
  } as SkillMetadata,
  body: '# 项目技能\n\n这是一个项目级技能。',
};

/**
 * SKILL.md 文件内容示例
 * 用于创建测试技能目录
 */
export const SKILL_MD_CONTENT = `---
name: test-skill
description: 用于单元测试的测试技能
version: 1.0.0
author: test-author
tags:
  - test
  - unit
---

# 测试技能

这是一个用于单元测试的测试技能。
`;

/**
 * 无 frontmatter 的 Markdown 内容
 * 用于测试解析错误处理
 */
export const NO_FRONTMATTER_CONTENT = `# 简单内容

这个内容没有 frontmatter。
`;

/**
 * 无效的技能名称列表
 * 用于验证名称校验逻辑
 */
export const INVALID_SKILL_NAMES = [
  '',              // 空字符串
  'a',             // 太短（最少 2 个字符）
  'A',             // 大写字母开头
  'Test-Skill',    // 包含大写字母
  'test_skill',    // 使用下划线（应使用连字符）
  '123-skill',     // 数字开头
  '-test-skill',   // 连字符开头
  'test-skill-',   // 连字符结尾
  'test--skill',   // 连续连字符
  'skillix',       // 保留词
  'sx-skill',      // 保留词
  'a'.repeat(65),  // 太长（最多 64 个字符）
];

/**
 * 有效的技能名称列表
 * 用于验证名称校验逻辑
 */
export const VALID_SKILL_NAMES = [
  'ab',                // 最短有效名称
  'test',              // 简单名称
  'test-skill',        // 带连字符
  'my-awesome-skill',  // 多段连字符
  'skill123',          // 包含数字
  'a1b2c3',            // 字母数字混合
  'pdf-converter',     // 典型工具名称
  'api-client',        // 典型客户端名称
];

/**
 * 无效的技能描述列表
 * 用于验证描述校验逻辑
 */
export const INVALID_DESCRIPTIONS = [
  '',                    // 空字符串
  'ab',                  // 太短
  'A',                   // 单词太少（至少 3 个词）
  'Test <script>',       // 包含尖括号（安全风险）
  'Hello > world',       // 包含尖括号
  'a'.repeat(1025),      // 太长（最多 1024 个字符）
];

/**
 * 有效的技能描述列表
 * 用于验证描述校验逻辑
 */
export const VALID_DESCRIPTIONS = [
  '这是一个有效的测试描述',
  '这是一个有效的中文技能描述测试',
  '将 PDF 文件转换为文本的技能',
  '当你需要分析代码时，使用这个技能帮助理解代码库',
];

/**
 * 测试配置数据
 */
export const TEST_CONFIG = {
  format: 'json' as const,
  autoSuggest: false,
};

/**
 * 测试技能源
 */
export const TEST_SOURCE = {
  name: 'test-source',
  url: 'https://github.com/test/test-skills',
  branch: 'main',
  default: false,
};

/**
 * PDF 转换器技能示例
 * 用于分流测试
 */
export const PDF_CONVERTER_SKILL = {
  name: 'pdf-converter',
  metadata: {
    name: 'pdf-converter',
    description: 'PDF 文件转换工具，支持 PDF 转图片、PDF 转文本',
    version: '1.0.0',
    author: 'test-author',
    tags: ['pdf', 'converter', 'document'],
  } as SkillMetadata,
  body: `# PDF 转换器

将 PDF 文件转换为其他格式。

## 功能

- PDF 转图片
- PDF 转文本
- PDF 合并
`,
};

/**
 * 图片处理器技能示例
 * 用于分流测试
 */
export const IMAGE_PROCESSOR_SKILL = {
  name: 'image-processor',
  metadata: {
    name: 'image-processor',
    description: '图片处理工具，支持图片压缩、格式转换、尺寸调整',
    version: '1.0.0',
    author: 'test-author',
    tags: ['image', 'processor', 'media'],
  } as SkillMetadata,
  body: `# 图片处理器

处理各种图片格式。

## 功能

- 图片压缩
- 格式转换
- 尺寸调整
`,
};
