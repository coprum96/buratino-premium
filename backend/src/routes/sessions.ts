/**
 * Session Routes
 * POST /api/sessions - Сохранить игровую сессию
 */

import { Router } from 'express';
import { body } from 'express-validator';
import { authenticateApiKey } from '../middleware/auth';
import { createSession } from '../controllers/sessionController';

export const sessionRouter = Router();

// Validation middleware
const sessionValidation = [
  body('sessionId').isString().notEmpty(),
  body('startTime').isISO8601(),
  body('completedLevels').isArray(),
  body('finalCoins').isInt({ min: 0 }),
  body('finalWisdom').isInt({ min: 0, max: 100 }),
];

// POST /api/sessions - Создать новую сессию
sessionRouter.post(
  '/',
  authenticateApiKey,
  sessionValidation,
  createSession
);


