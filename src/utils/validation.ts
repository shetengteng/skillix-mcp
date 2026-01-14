/**
 * 验证工具函数
 * 用于验证技能名称、描述等
 */

// ============================================
// 错误码定义
// ============================================

export enum ErrorCode {
  /** 参数缺失 */
  MISSING_PARAM = 'E001',
  /** 名称无效 */
  INVALID_NAME = 'E002',
  /** 描述无效 */
  INVALID_DESCRIPTION = 'E003',
  /** 技能已存在 */
  ALREADY_EXISTS = 'E004',
  /** 写入失败 */
  WRITE_FAILED = 'E005',
  /** 验证失败 */
  VALIDATION_FAILED = 'E006',
}

/**
 * 验证结果
 */
export interface ValidationResult {
  valid: boolean;
  errorCode?: ErrorCode;
  errorMessage?: string;
}

// ============================================
// 技能名称验证
// ============================================

/**
 * 保留词列表
 */
const RESERVED_WORDS = [
  'skillix',
  'sx-skill',
  'sx-config',
  'sx-help',
  'sx-market',
  'sx-triage',
  'config',
  'help',
  'system',
  'admin',
  'root',
  'null',
  'undefined',
];

/**
 * 技能名称正则表达式
 * - 必须以小写字母开头
 * - 只能包含小写字母、数字、连字符
 * - 连字符不能连续出现
 * - 不能以连字符结尾
 */
const SKILL_NAME_REGEX = /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/;

/**
 * 验证技能名称
 * 
 * 规则：
 * - 格式：hyphen-case（小写字母、数字、连字符）
 * - 开头：必须以小写字母开头
 * - 连字符：不能连续或在首尾
 * - 长度：2-64 字符
 * - 保留：不能使用保留词
 */
export function validateSkillName(name: string): ValidationResult {
  // 检查是否为空
  if (!name || name.trim() === '') {
    return {
      valid: false,
      errorCode: ErrorCode.MISSING_PARAM,
      errorMessage: '技能名称不能为空',
    };
  }

  const trimmedName = name.trim();

  // 检查长度
  if (trimmedName.length < 2) {
    return {
      valid: false,
      errorCode: ErrorCode.INVALID_NAME,
      errorMessage: '技能名称长度至少为 2 个字符',
    };
  }

  if (trimmedName.length > 64) {
    return {
      valid: false,
      errorCode: ErrorCode.INVALID_NAME,
      errorMessage: '技能名称长度不能超过 64 个字符',
    };
  }

  // 检查是否为保留词
  if (RESERVED_WORDS.includes(trimmedName.toLowerCase())) {
    return {
      valid: false,
      errorCode: ErrorCode.INVALID_NAME,
      errorMessage: `"${trimmedName}" 是保留词，不能作为技能名称`,
    };
  }

  // 检查格式（hyphen-case）
  if (!SKILL_NAME_REGEX.test(trimmedName)) {
    // 提供更详细的错误信息
    if (/[A-Z]/.test(trimmedName)) {
      return {
        valid: false,
        errorCode: ErrorCode.INVALID_NAME,
        errorMessage: '技能名称必须使用小写字母（hyphen-case 格式）',
      };
    }
    if (/[_]/.test(trimmedName)) {
      return {
        valid: false,
        errorCode: ErrorCode.INVALID_NAME,
        errorMessage: '技能名称应使用连字符而非下划线（hyphen-case 格式）',
      };
    }
    if (/^[0-9]/.test(trimmedName)) {
      return {
        valid: false,
        errorCode: ErrorCode.INVALID_NAME,
        errorMessage: '技能名称必须以小写字母开头',
      };
    }
    if (/--/.test(trimmedName)) {
      return {
        valid: false,
        errorCode: ErrorCode.INVALID_NAME,
        errorMessage: '技能名称中不能有连续的连字符',
      };
    }
    if (/^-|-$/.test(trimmedName)) {
      return {
        valid: false,
        errorCode: ErrorCode.INVALID_NAME,
        errorMessage: '技能名称不能以连字符开头或结尾',
      };
    }
    return {
      valid: false,
      errorCode: ErrorCode.INVALID_NAME,
      errorMessage: '技能名称格式无效，请使用 hyphen-case 格式（如 pdf-converter）',
    };
  }

  return { valid: true };
}

// ============================================
// 技能描述验证
// ============================================

/**
 * 验证技能描述
 * 
 * 规则：
 * - 最大长度：1024 字符
 * - 不能包含尖括号 `<` 或 `>`
 * - 至少 3 个词（或 10 个中文字符）
 */
export function validateSkillDescription(description: string): ValidationResult {
  // 检查是否为空
  if (!description || description.trim() === '') {
    return {
      valid: false,
      errorCode: ErrorCode.MISSING_PARAM,
      errorMessage: '技能描述不能为空',
    };
  }

  const trimmedDesc = description.trim();

  // 检查长度
  if (trimmedDesc.length > 1024) {
    return {
      valid: false,
      errorCode: ErrorCode.INVALID_DESCRIPTION,
      errorMessage: '技能描述长度不能超过 1024 个字符',
    };
  }

  // 检查是否包含尖括号
  if (/<|>/.test(trimmedDesc)) {
    return {
      valid: false,
      errorCode: ErrorCode.INVALID_DESCRIPTION,
      errorMessage: '技能描述不能包含尖括号 < 或 >',
    };
  }

  // 检查词数（支持中文）
  // 英文按空格分词，中文按字符数（10个中文字符约等于3个词）
  const englishWords = trimmedDesc.split(/\s+/).filter(w => w.length > 0);
  const chineseChars = (trimmedDesc.match(/[\u4e00-\u9fa5]/g) || []).length;
  
  const effectiveWordCount = englishWords.length + Math.floor(chineseChars / 3);
  
  if (effectiveWordCount < 3) {
    return {
      valid: false,
      errorCode: ErrorCode.INVALID_DESCRIPTION,
      errorMessage: '技能描述至少需要 3 个词（或 10 个中文字符）',
    };
  }

  return { valid: true };
}

// ============================================
// 综合验证
// ============================================

/**
 * 验证创建技能的参数
 */
export function validateCreateParams(
  name: string,
  description: string
): ValidationResult {
  // 验证名称
  const nameResult = validateSkillName(name);
  if (!nameResult.valid) {
    return nameResult;
  }

  // 验证描述
  const descResult = validateSkillDescription(description);
  if (!descResult.valid) {
    return descResult;
  }

  return { valid: true };
}

/**
 * 格式化错误消息（带错误码）
 */
export function formatError(errorCode: ErrorCode, message: string): string {
  return `[${errorCode}] ${message}`;
}
