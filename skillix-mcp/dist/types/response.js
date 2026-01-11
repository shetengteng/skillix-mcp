"use strict";
/**
 * 响应相关类型定义
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorCodes = void 0;
/**
 * 错误码定义
 */
exports.ErrorCodes = {
    // 参数错误
    E001: 'E001', // 参数缺失
    E002: 'E002', // 名称无效
    E003: 'E003', // 描述无效
    // 技能错误
    E004: 'E004', // 技能已存在
    E005: 'E005', // 技能不存在
    E006: 'E006', // 写入失败
    E007: 'E007', // 验证失败
    // 配置错误
    E010: 'E010', // 配置不存在
    E011: 'E011', // 配置格式错误
    // 系统错误
    E099: 'E099', // 未知错误
};
//# sourceMappingURL=response.js.map