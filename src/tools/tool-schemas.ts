/**
 * 工具 Schema 配置
 * 
 * 使用 JSON 风格的配置定义工具参数
 */

/**
 * JSON Schema 属性定义
 */
export interface PropertyDef {
  type: 'string' | 'number' | 'boolean' | 'enum' | 'array' | 'object' | 'any';
  description?: string;
  required?: boolean;
  values?: string[];           // enum 类型使用
  items?: string;              // array 类型使用
  properties?: Record<string, PropertyDef>;  // object 类型使用
}

/**
 * JSON Schema 工具定义
 */
export interface ToolSchemaDef {
  description: string;
  properties: Record<string, PropertyDef>;
}

/**
 * 工具 Schema 配置
 */
export const toolSchemas: Record<string, ToolSchemaDef> = {
  'sx-skill': {
    description: '本地技能管理工具，支持列出、读取、创建、更新、删除技能',
    properties: {
      action: {
        type: 'enum',
        values: ['list', 'read', 'create', 'update', 'delete'],
        required: true,
        description: '操作类型',
      },
      name: {
        type: 'string',
        description: '技能名称（read/create/update/delete 时必需）',
      },
      scope: {
        type: 'enum',
        values: ['global', 'project'],
        description: '技能范围（create 时使用，默认 global）',
      },
      projectRoot: {
        type: 'string',
        description: '项目根目录路径（项目级操作时需要）',
      },
      metadata: {
        type: 'object',
        description: '技能元数据（create/update 时使用）',
        properties: {
          name: { type: 'string', required: true },
          description: { type: 'string', required: true },
          version: { type: 'string' },
          author: { type: 'string' },
          tags: { type: 'array', items: 'string' },
        },
      },
      body: {
        type: 'string',
        description: 'SKILL.md 正文内容（create/update 时使用）',
      },
    },
  },

  'sx-config': {
    description: '配置管理工具，支持获取、设置配置和管理技能源',
    properties: {
      action: {
        type: 'enum',
        values: ['get', 'set', 'init', 'sources'],
        required: true,
        description: '操作类型',
      },
      scope: {
        type: 'enum',
        values: ['global', 'project'],
        description: '配置范围（默认 global）',
      },
      projectRoot: {
        type: 'string',
        description: '项目根目录路径（项目级操作时需要）',
      },
      key: {
        type: 'string',
        description: '配置键（get/set 时使用）',
      },
      value: {
        type: 'any',
        description: '配置值（set 时使用）',
      },
      sourceAction: {
        type: 'enum',
        values: ['list', 'add', 'remove'],
        description: '源操作类型（sources 时使用）',
      },
      source: {
        type: 'object',
        description: '技能源配置（sources add 时使用）',
        properties: {
          name: { type: 'string', required: true },
          url: { type: 'string', required: true },
          branch: { type: 'string' },
          default: { type: 'boolean' },
        },
      },
      sourceName: {
        type: 'string',
        description: '技能源名称（sources remove 时使用）',
      },
    },
  },

  'sx-help': {
    description: '帮助信息工具，提供 Skillix 使用指南',
    properties: {
      topic: {
        type: 'enum',
        values: ['overview', 'skill', 'config', 'market', 'triage', 'all'],
        description: '帮助主题（默认 overview）',
      },
    },
  },
};
