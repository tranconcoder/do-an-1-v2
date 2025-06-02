import { Router } from 'express';
import { authenticate } from '@/middlewares/jwt.middleware.js';
import ChatController from '@/controllers/chat.controller.js';

const chatRoute = Router();

/* ---------------------------------------------------------- */
/*                      Authentication                        */
/* ---------------------------------------------------------- */
chatRoute.use(authenticate);

/* ---------------------------------------------------------- */
/*                          Routes                           */
/* ---------------------------------------------------------- */

// Get user conversations
chatRoute.get('/conversations', ChatController.getConversations);

// Get messages in a conversation  
chatRoute.get('/conversations/:conversationId/messages', ChatController.getMessages);

// Start a direct conversation
chatRoute.post('/conversations', ChatController.startConversation);

// Search users for starting conversations
chatRoute.get('/users/search', ChatController.searchUsers);

// Get online users
chatRoute.get('/users/online', ChatController.getOnlineUsers);

export default chatRoute; 