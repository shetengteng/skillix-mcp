/**
 * 测试夹具 - 技能数据
 */

export const TEST_SKILL_METADATA = {
  name: 'test-skill',
  description: 'A test skill for unit testing',
  version: '1.0.0',
  author: 'test',
  tags: ['test', 'unit'],
};

export const TEST_SKILL_BODY = `
# Test Skill

## Usage

This is a test skill for unit testing.

## Example

\`\`\`bash
echo "Hello, World!"
\`\`\`
`;

// 使用多行数组格式，与解析器兼容
export const TEST_SKILL_MD = `---
name: test-skill
description: A test skill for unit testing
version: 1.0.0
author: test
tags:
  - test
  - unit
---

# Test Skill

## Usage

This is a test skill for unit testing.

## Example

\`\`\`bash
echo "Hello, World!"
\`\`\`
`;

export const SIMPLE_SKILL_MD = `---
name: simple-skill
description: A simple test skill
---

# Simple Skill

Basic content.
`;

export const INVALID_SKILL_MD = `
# No Frontmatter Skill

This skill has no YAML frontmatter.
`;
