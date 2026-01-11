/**
 * Schema 构建器
 * 
 * 从配置对象动态生成 Zod Schema
 */

import { z } from 'zod';
import type { PropertyDef, ToolSchemaDef } from './tool-schemas.js';

/**
 * 从属性定义构建 Zod Schema
 */
function buildPropertySchema(prop: PropertyDef): z.ZodTypeAny {
  let schema: z.ZodTypeAny;

  switch (prop.type) {
    case 'string':
      schema = z.string();
      break;

    case 'number':
      schema = z.number();
      break;

    case 'boolean':
      schema = z.boolean();
      break;

    case 'enum':
      if (!prop.values || prop.values.length === 0) {
        throw new Error('Enum type requires values array');
      }
      schema = z.enum(prop.values as [string, ...string[]]);
      break;

    case 'array':
      if (prop.items === 'string') {
        schema = z.array(z.string());
      } else {
        schema = z.array(z.any());
      }
      break;

    case 'object':
      if (prop.properties) {
        schema = buildObjectSchema(prop.properties);
      } else {
        schema = z.object({});
      }
      break;

    case 'any':
    default:
      schema = z.any();
      break;
  }

  // 添加描述
  if (prop.description) {
    schema = schema.describe(prop.description);
  }

  // 非必需字段设为 optional
  if (!prop.required) {
    schema = schema.optional();
  }

  return schema;
}

/**
 * 从属性集合构建 Zod Object Schema
 */
function buildObjectSchema(properties: Record<string, PropertyDef>): z.ZodObject<any> {
  const shape: Record<string, z.ZodTypeAny> = {};

  for (const [key, prop] of Object.entries(properties)) {
    shape[key] = buildPropertySchema(prop);
  }

  return z.object(shape);
}

/**
 * 从配置定义构建工具 Schema
 */
export function buildToolSchema(def: ToolSchemaDef): z.ZodObject<any> {
  return buildObjectSchema(def.properties);
}

/**
 * 批量构建工具 Schema
 */
export function buildToolSchemas(
  schemas: Record<string, ToolSchemaDef>
): Map<string, { description: string; schema: z.ZodObject<any> }> {
  const result = new Map();

  for (const [name, def] of Object.entries(schemas)) {
    result.set(name, {
      description: def.description,
      schema: buildToolSchema(def),
    });
  }

  return result;
}
