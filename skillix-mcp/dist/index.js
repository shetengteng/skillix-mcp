"use strict";
/**
 * Skillix MCP Server 入口
 *
 * 提供 AI 技能管理功能的 MCP 服务器
 */
Object.defineProperty(exports, "__esModule", { value: true });
const index_js_1 = require("@modelcontextprotocol/sdk/server/index.js");
const stdio_js_1 = require("@modelcontextprotocol/sdk/server/stdio.js");
const types_js_1 = require("@modelcontextprotocol/sdk/types.js");
const index_js_2 = require("./tools/index.js");
/**
 * 创建 MCP Server
 */
function createServer() {
    const server = new index_js_1.Server({
        name: 'skillix-mcp',
        version: '1.0.0',
    }, {
        capabilities: {
            tools: {},
        },
    });
    // 注册工具列表处理器
    server.setRequestHandler(types_js_1.ListToolsRequestSchema, async () => {
        return {
            tools: [
                index_js_2.sxSkillDefinition,
                index_js_2.sxConfigDefinition,
                index_js_2.sxHelpDefinition,
            ],
        };
    });
    // 注册工具调用处理器
    server.setRequestHandler(types_js_1.CallToolRequestSchema, async (request) => {
        const { name, arguments: args } = request.params;
        try {
            let result;
            switch (name) {
                case 'sx_skill':
                    result = (0, index_js_2.sxSkill)(args);
                    break;
                case 'sx_config':
                    result = (0, index_js_2.sxConfig)(args);
                    break;
                case 'sx_help':
                    result = (0, index_js_2.sxHelp)(args);
                    break;
                default:
                    return {
                        content: [
                            {
                                type: 'text',
                                text: JSON.stringify({
                                    success: false,
                                    message: `未知工具: ${name}`,
                                    errors: ['可用工具: sx_skill, sx_config, sx_help'],
                                }),
                            },
                        ],
                    };
            }
            return {
                content: [
                    {
                        type: 'text',
                        text: JSON.stringify(result, null, 2),
                    },
                ],
            };
        }
        catch (error) {
            return {
                content: [
                    {
                        type: 'text',
                        text: JSON.stringify({
                            success: false,
                            message: '工具执行失败',
                            errors: [error instanceof Error ? error.message : String(error)],
                        }),
                    },
                ],
                isError: true,
            };
        }
    });
    return server;
}
/**
 * 主函数
 */
async function main() {
    const server = createServer();
    const transport = new stdio_js_1.StdioServerTransport();
    await server.connect(transport);
    console.error('Skillix MCP Server 已启动');
}
// 启动服务器
main().catch((error) => {
    console.error('服务器启动失败:', error);
    process.exit(1);
});
//# sourceMappingURL=index.js.map