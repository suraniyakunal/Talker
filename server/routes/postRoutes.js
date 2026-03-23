import express from 'express';
import { createPost, getPosts, likePost, addComment } from '../controllers/postController.js';
import protectedRoute from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/create', protectedRoute, createPost);
router.get('/getAllPosts', protectedRoute, getPosts);
router.post('/like/:id', protectedRoute, likePost);
router.post('/comment/:id', protectedRoute, addComment);

export default router;
