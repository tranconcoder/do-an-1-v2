import { Request, Response } from 'express';
import catchError from '@/middlewares/catchError.middleware.js';
import chatService from '@/services/chat.service.js';
import SuccessResponse, { OkResponse } from '@/response/success.response';

export default class ChatController {
    /* ---------------------------------------------------------- */
    /*                     Get Conversations                     */
    /* ---------------------------------------------------------- */
    public static getConversations = catchError(async (req: Request, res: Response) => {
        const userId = req.userId!;
        const { limit = 20, page = 1 } = req.query;

        const result = await chatService.getUserConversations({
            userId,
            limit: Number(limit),
            page: Number(page)
        });

        new OkResponse({
            message: 'Get conversations successfully',
            metadata: result
        }).send(res);
    });

    /* ---------------------------------------------------------- */
    /*                    Get Conversation Messages              */
    /* ---------------------------------------------------------- */
    public static getMessages = catchError(async (req: Request, res: Response) => {
        const userId = req.userId!;
        const { conversationId } = req.params;
        const { limit = 100, page = 1 } = req.query;

        const result = await chatService.getConversationMessages({
            userId,
            conversationId,
            limit: Number(limit),
            page: Number(page)
        });

        new OkResponse({
            message: 'Get messages successfully',
            metadata: result
        }).send(res);
    });

    /* ---------------------------------------------------------- */
    /*                   Start Direct Conversation               */
    /* ---------------------------------------------------------- */
    public static startConversation = catchError(async (req: Request, res: Response) => {
        const userId = req.userId!;
        const { targetUserId } = req.body;

        const result = await chatService.startDirectConversation({
            userId,
            targetUserId
        });

        new OkResponse({
            message: 'Conversation started successfully',
            metadata: result
        }).send(res);
    });

    /* ---------------------------------------------------------- */
    /*                      Search Users                         */
    /* ---------------------------------------------------------- */
    public static searchUsers = catchError(async (req: Request, res: Response) => {
        const userId = req.userId!;
        const { q: query, limit = 10 } = req.query;

        const result = await chatService.searchUsers({
            userId,
            query: String(query || ''),
            limit: Number(limit)
        });

        new OkResponse({
            message: 'Search users successfully',
            metadata: result
        }).send(res);
    });

    /* ---------------------------------------------------------- */
    /*                   Get Online Users                        */
    /* ---------------------------------------------------------- */
    public static getOnlineUsers = catchError(async (req: Request, res: Response) => {
        const result = await chatService.getOnlineUsers();

        new OkResponse({
            message: 'Get online users successfully',
            metadata: result
        }).send(res);
    });
} 