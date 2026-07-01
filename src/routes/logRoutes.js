import express from 'express';
import { logEvent } from '../controllers/logController.js';
import { optionalProtect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/', optionalProtect, logEvent);

export default router;
