import express from 'express';
import roomController from '../controllers/roomController.js';
import protectedRoute from '../middlewares/authMiddleware.js';
const router = express.Router();

router.post('/createRoom', protectedRoute, roomController.createRoom);
router.delete('/delete/:id', protectedRoute, roomController.deleteRoom);
router.get('/getAllRooms', protectedRoute, roomController.getAllRooms);
router.get('/:id', protectedRoute, roomController.getThisRoom);

export default router;
