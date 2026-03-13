/**
 * Session Controller
 * Обработка запросов на сохранение игровых сессий
 */

import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { prisma } from '../lib/prisma';
import { SessionData } from '../types/session';

/**
 * POST /api/sessions
 * Создаёт запись сессии и все связанные данные (ответы, выборы, тесты, просмотры)
 */
export async function createSession(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    // Валидация
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation Error',
        details: errors.array() 
      });
    }

    const sessionData: SessionData = req.body;

    console.log(`📊 Получена сессия: ${sessionData.sessionId}`);

    // Проверка дубликата
    const existing = await prisma.session.findUnique({
      where: { sessionId: sessionData.sessionId }
    });

    if (existing) {
      console.log(`⚠️  Сессия ${sessionData.sessionId} уже существует, пропускаем`);
      return res.status(200).json({ 
        status: 'ok',
        message: 'Session already exists',
        sessionId: sessionData.sessionId
      });
    }

    // Создаём сессию и все связанные записи в транзакции
    const session = await prisma.$transaction(async (tx) => {
      // 1. Создаём основную запись сессии
      const newSession = await tx.session.create({
        data: {
          sessionId: sessionData.sessionId,
          userId: sessionData.userId || null,
          startTime: new Date(sessionData.startTime),
          endTime: sessionData.endTime ? new Date(sessionData.endTime) : null,
          totalPlayTime: sessionData.totalPlayTime || 0,
          finalCoins: sessionData.finalCoins,
          finalWisdom: sessionData.finalWisdom,
          completedLevels: sessionData.completedLevels,
          achievements: sessionData.achievements,
          timePerLevel: sessionData.timePerLevel || {},
          rawJson: sessionData as any, // Полный dump
        }
      });

      // 2. Создаём записи ответов на викторины
      if (sessionData.quizAnswers && sessionData.quizAnswers.length > 0) {
        await tx.quizAnswer.createMany({
          data: sessionData.quizAnswers.map(answer => ({
            sessionId: sessionData.sessionId,
            levelId: answer.levelId,
            questionIndex: answer.questionIndex,
            questionText: answer.questionText,
            selectedAnswer: answer.selectedAnswer,
            isCorrect: answer.isCorrect,
            timestamp: new Date(answer.timestamp),
          }))
        });
        console.log(`  ✓ Сохранено ${sessionData.quizAnswers.length} ответов на викторины`);
      }

      // 3. Создаём записи выборов в диалогах
      if (sessionData.dialogueChoices && sessionData.dialogueChoices.length > 0) {
        await tx.dialogueChoice.createMany({
          data: sessionData.dialogueChoices.map(choice => ({
            sessionId: sessionData.sessionId,
            levelId: choice.levelId,
            dialogueIndex: choice.dialogueIndex,
            characterName: choice.characterName,
            choiceText: choice.choiceText,
            wisdomChange: choice.wisdomChange,
            coinChange: choice.coinChange,
            timestamp: new Date(choice.timestamp),
          }))
        });
        console.log(`  ✓ Сохранено ${sessionData.dialogueChoices.length} выборов в диалогах`);
      }

      // 4. Создаём записи результатов тестов
      if (sessionData.testResults && sessionData.testResults.length > 0) {
        await tx.testResult.createMany({
          data: sessionData.testResults.map(result => ({
            sessionId: sessionData.sessionId,
            testType: result.testType,
            score: result.score,
            totalQuestions: result.totalQuestions,
            rawAnswers: result.answers,
            timestamp: new Date(result.timestamp),
          }))
        });
        console.log(`  ✓ Сохранено ${sessionData.testResults.length} результатов тестов`);
      }

      // 5. Создаём записи просмотров материалов
      if (sessionData.materialViews && sessionData.materialViews.length > 0) {
        await tx.materialView.createMany({
          data: sessionData.materialViews.map(view => ({
            sessionId: sessionData.sessionId,
            materialId: view.materialId,
            materialTitle: view.materialTitle,
            viewDuration: view.viewDuration,
            timestamp: new Date(view.timestamp),
          }))
        });
        console.log(`  ✓ Сохранено ${sessionData.materialViews.length} просмотров материалов`);
      }

      return newSession;
    });

    console.log(`✅ Сессия ${sessionData.sessionId} успешно сохранена`);

    res.status(201).json({
      status: 'ok',
      message: 'Session saved successfully',
      sessionId: session.sessionId,
      id: session.id
    });

  } catch (error) {
    console.error('❌ Ошибка сохранения сессии:', error);
    next(error);
  }
}


