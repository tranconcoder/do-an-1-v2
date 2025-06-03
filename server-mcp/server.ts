import "dotenv/config";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js"
import { createServer } from 'http';
import { URL } from 'url';
import { WebSocketServer, WebSocket } from 'ws';

// Import tools and resources
import { introduceAliconconTool, getPopularProductsTool, paymentMethodsTool, getUserProfileTool } from './tools/index.js';
import { companyIntroductionResource } from './resources/index.js';

const mcpServer = new McpServer({
    name: "Aliconcon MCP Server",
    version: "1.0.0",
});

// Store tools for HTTP access
const registeredTools = new Map();

// WebSocket connections for real-time communication
const connectedClients = new Map<WebSocket, string>(); // ws -> clientId
const clientSockets = new Map<string, WebSocket>(); // clientId -> ws

// Register tools
mcpServer.tool(
    introduceAliconconTool.name,
    introduceAliconconTool.description,
    introduceAliconconTool.inputSchema,
    async (args) => introduceAliconconTool.handler(args)
);

mcpServer.tool(
    getPopularProductsTool.name,
    getPopularProductsTool.description,
    getPopularProductsTool.inputSchema,
    async (args) => getPopularProductsTool.handler(args)
);

mcpServer.tool(
    paymentMethodsTool.name,
    paymentMethodsTool.description,
    paymentMethodsTool.inputSchema,
    async (args) => paymentMethodsTool.handler(args)
);

mcpServer.tool(
    getUserProfileTool.name,
    getUserProfileTool.description,
    getUserProfileTool.inputSchema,
    async (args) => getUserProfileTool.handler(args)
);

// Store tools for HTTP access
registeredTools.set(introduceAliconconTool.name, introduceAliconconTool);
registeredTools.set(getPopularProductsTool.name, getPopularProductsTool);
registeredTools.set(paymentMethodsTool.name, paymentMethodsTool);
registeredTools.set(getUserProfileTool.name, getUserProfileTool);

// Register resources
mcpServer.resource(
    companyIntroductionResource.uri,
    companyIntroductionResource.uri,
    {
        name: companyIntroductionResource.name,
        description: companyIntroductionResource.description,
        mimeType: companyIntroductionResource.mimeType
    },
    companyIntroductionResource.handler
);

// Helper function to parse request body
async function parseRequestBody(req: any): Promise<any> {
    return new Promise((resolve, reject) => {
        let body = '';
        req.on('data', (chunk: any) => {
            body += chunk.toString();
        });
        req.on('end', () => {
            try {
                resolve(body ? JSON.parse(body) : {});
            } catch (error) {
                reject(error);
            }
        });
        req.on('error', reject);
    });
}

// Helper function to send JSON response
function sendJsonResponse(res: any, statusCode: number, data: any) {
    res.writeHead(statusCode, {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
    });
    res.end(JSON.stringify(data));
}

// WebSocket message handler
function handleWebSocketMessage(ws: WebSocket, clientId: string, message: any) {
    console.log(`📨 [WS] Message from client ${clientId}:`, message);

    switch (message.type) {
        case 'mcp_tool_call':
            handleMCPToolCall(ws, clientId, message);
            break;

        case 'ping':
            sendToClient(ws, {
                type: 'pong',
                timestamp: new Date().toISOString()
            });
            break;

        case 'get_tools':
            const toolsList = Array.from(registeredTools.values()).map(tool => ({
                name: tool.name,
                description: tool.description,
                inputSchema: tool.inputSchema
            }));

            sendToClient(ws, {
                type: 'tools_list',
                data: toolsList,
                timestamp: new Date().toISOString()
            });
            break;

        default:
            sendToClient(ws, {
                type: 'error',
                message: `Unknown message type: ${message.type}`,
                timestamp: new Date().toISOString()
            });
    }
}

// Handle MCP tool calls via WebSocket
async function handleMCPToolCall(ws: WebSocket, clientId: string, message: any) {
    const { toolName, toolArgs, requestId } = message;

    try {
        const tool = registeredTools.get(toolName);
        if (!tool) {
            sendToClient(ws, {
                type: 'mcp_tool_response',
                requestId,
                error: `Tool not found: ${toolName}`,
                timestamp: new Date().toISOString()
            });
            return;
        }

        console.log(`🔧 [WS] Executing tool ${toolName} for client ${clientId}`);

        // Execute the tool
        const result = await tool.handler(toolArgs || {});

        sendToClient(ws, {
            type: 'mcp_tool_response',
            requestId,
            result: result,
            timestamp: new Date().toISOString()
        });

    } catch (error: any) {
        console.error(`❌ [WS] Error executing tool ${toolName}:`, error);
        sendToClient(ws, {
            type: 'mcp_tool_response',
            requestId,
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
}

// Send message to specific WebSocket client
function sendToClient(ws: WebSocket, data: any): void {
    if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(data));
    }
}

// Broadcast message to all connected WebSocket clients
function broadcast(data: any): void {
    connectedClients.forEach((clientId, client) => {
        sendToClient(client, data);
    });
}

// Generate unique client ID
function generateClientId(): string {
    return `mcp_client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Create HTTP server for SSE and HTTP endpoints + WebSocket
const server = createServer(async (req, res) => {
    const url = new URL(req.url || '', `http://${req.headers.host}`);
    const pathname = url.pathname;
    const method = req.method;

    // Handle CORS preflight
    if (method === 'OPTIONS') {
        res.writeHead(200, {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type'
        });
        res.end();
        return;
    }

    // SSE endpoint for MCP protocol
    if (pathname === '/sse' && method === 'GET') {
        // Create SSE transport - it will handle headers automatically
        const transport = new SSEServerTransport("/message", res);
        mcpServer.connect(transport);

        // Handle client disconnect
        req.on('close', () => {
            console.log('SSE client disconnected');
        });
        return;
    }

    // HTTP endpoint for tool listing
    if (pathname === '/tools' && method === 'GET') {
        const toolsList = Array.from(registeredTools.values()).map(tool => ({
            name: tool.name,
            description: tool.description,
            inputSchema: tool.inputSchema
        }));

        sendJsonResponse(res, 200, {
            jsonrpc: "2.0",
            id: 1,
            result: {
                tools: toolsList
            }
        });
        return;
    }

    // HTTP endpoint for tool calls
    if (pathname === '/tools/call' && method === 'POST') {
        try {
            const body = await parseRequestBody(req);
            const { name, arguments: args } = body;

            if (!name) {
                sendJsonResponse(res, 400, {
                    jsonrpc: "2.0",
                    id: body.id || 1,
                    error: {
                        code: -32602,
                        message: "Invalid params: missing tool name"
                    }
                });
                return;
            }

            const tool = registeredTools.get(name);
            if (!tool) {
                sendJsonResponse(res, 404, {
                    jsonrpc: "2.0",
                    id: body.id || 1,
                    error: {
                        code: -32601,
                        message: `Tool not found: ${name}`
                    }
                });
                return;
            }

            // Call the tool
            const result = await tool.handler(args || {});

            sendJsonResponse(res, 200, {
                jsonrpc: "2.0",
                id: body.id || 1,
                result: result
            });

        } catch (error: any) {
            console.error('Error calling tool:', error);
            sendJsonResponse(res, 500, {
                jsonrpc: "2.0",
                id: 1,
                error: {
                    code: -32603,
                    message: "Internal error",
                    data: error.message
                }
            });
        }
        return;
    }

    // MCP JSON-RPC endpoint
    if (pathname === '/mcp' && method === 'POST') {
        try {
            const body = await parseRequestBody(req);
            const { method: rpcMethod, params, id } = body;

            if (rpcMethod === 'tools/list') {
                const toolsList = Array.from(registeredTools.values()).map(tool => ({
                    name: tool.name,
                    description: tool.description,
                    inputSchema: tool.inputSchema
                }));

                sendJsonResponse(res, 200, {
                    jsonrpc: "2.0",
                    id: id,
                    result: {
                        tools: toolsList
                    }
                });
                return;
            }

            if (rpcMethod === 'tools/call') {
                const { name, arguments: args } = params;
                const tool = registeredTools.get(name);

                if (!tool) {
                    sendJsonResponse(res, 200, {
                        jsonrpc: "2.0",
                        id: id,
                        error: {
                            code: -32601,
                            message: `Tool not found: ${name}`
                        }
                    });
                    return;
                }

                const result = await tool.handler(args || {});

                sendJsonResponse(res, 200, {
                    jsonrpc: "2.0",
                    id: id,
                    result: result
                });
                return;
            }

            // Unknown method
            sendJsonResponse(res, 200, {
                jsonrpc: "2.0",
                id: id,
                error: {
                    code: -32601,
                    message: `Method not found: ${rpcMethod}`
                }
            });

        } catch (error: any) {
            console.error('Error handling MCP request:', error);
            sendJsonResponse(res, 500, {
                jsonrpc: "2.0",
                id: 1,
                error: {
                    code: -32603,
                    message: "Internal error",
                    data: error.message
                }
            });
        }
        return;
    }

    // Health check endpoint with WebSocket info
    if (pathname === '/health' && method === 'GET') {
        sendJsonResponse(res, 200, {
            status: 'ok',
            server: 'Aliconcon MCP Server',
            tools: Array.from(registeredTools.keys()),
            websocket: {
                connected_clients: connectedClients.size,
                endpoint: '/ws'
            },
            timestamp: new Date().toISOString()
        });
        return;
    }

    // Default 404 for other requests
    res.writeHead(404, {
        'Content-Type': 'text/plain',
        'Access-Control-Allow-Origin': '*'
    });
    res.end('Not Found');
});

// Setup WebSocket Server
const wss = new WebSocketServer({
    server: server,
    path: '/ws'
});

wss.on('connection', (ws: WebSocket, request: any) => {
    const clientId = generateClientId();

    // Store client mapping
    connectedClients.set(ws, clientId);
    clientSockets.set(clientId, ws);

    console.log(`🔌 [WS] New client connected: ${clientId}`);

    // Send welcome message
    sendToClient(ws, {
        type: 'welcome',
        message: 'Connected to Aliconcon MCP Server',
        clientId: clientId,
        timestamp: new Date().toISOString()
    });

    // Handle incoming messages
    ws.on('message', (data: Buffer) => {
        try {
            const message = JSON.parse(data.toString());
            handleWebSocketMessage(ws, clientId, message);
        } catch (error) {
            console.error('❌ [WS] Error parsing message:', error);
            sendToClient(ws, {
                type: 'error',
                message: 'Invalid message format',
                timestamp: new Date().toISOString()
            });
        }
    });

    // Handle client disconnect
    ws.on('close', () => {
        console.log(`🔌 [WS] Client disconnected: ${clientId}`);

        // Cleanup mappings
        connectedClients.delete(ws);
        clientSockets.delete(clientId);
    });

    // Handle errors
    ws.on('error', (error: Error) => {
        console.error(`❌ [WS] Error for client ${clientId}:`, error);
        connectedClients.delete(ws);
        clientSockets.delete(clientId);
    });
});

const PORT = process.env.MCP_PORT || 8000;
server.listen(PORT, () => {
    console.log(`🚀 MCP Server running on http://localhost:${PORT}`);
    console.log(`📡 SSE endpoint: http://localhost:${PORT}/sse`);
    console.log(`🛠️ Tools endpoint: http://localhost:${PORT}/tools`);
    console.log(`🔧 MCP endpoint: http://localhost:${PORT}/mcp`);
    console.log(`🌐 WebSocket endpoint: ws://localhost:${PORT}/ws`);
    console.log(`❤️ Health check: http://localhost:${PORT}/health`);
});
