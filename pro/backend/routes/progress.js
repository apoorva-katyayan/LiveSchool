import express from 'express';
import { ObjectId } from 'mongodb';
import { getDB } from '../config/db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// All progress routes require authentication
router.use(authenticateToken);

// Get user progress for a course
router.get('/course/:courseId', async (req, res) => {
  try {
    const db = getDB();
    const userId = new ObjectId(req.user.id);
    const courseId = new ObjectId(req.params.courseId);

    const progress = await db.collection('progress')
      .find({ userId, courseId })
      .toArray();

    res.json(progress);
  } catch (error) {
    console.error('Error fetching progress:', error);
    res.status(500).json({ error: 'Failed to fetch progress' });
  }
});

// Mark lesson as complete
router.post('/complete', async (req, res) => {
  try {
    const { lessonId } = req.body;
    
    if (!lessonId) {
      return res.status(400).json({ error: 'Lesson ID required' });
    }

    const db = getDB();
    const userId = new ObjectId(req.user.id);
    const lessonObjectId = new ObjectId(lessonId);

    // Get lesson to find courseId
    const lesson = await db.collection('lessons').findOne({ _id: lessonObjectId });
    if (!lesson) {
      return res.status(404).json({ error: 'Lesson not found' });
    }

    // Upsert progress
    await db.collection('progress').updateOne(
      { userId, lessonId: lessonObjectId },
      {
        $set: {
          completed: true,
          completedAt: new Date(),
          courseId: lesson.courseId
        },
        $setOnInsert: {
          userId,
          lessonId: lessonObjectId,
          createdAt: new Date()
        }
      },
      { upsert: true }
    );

    res.json({ message: 'Lesson marked as complete' });
  } catch (error) {
    console.error('Error updating progress:', error);
    res.status(500).json({ error: 'Failed to update progress' });
  }
});

// Get user's overall progress
router.get('/overview', async (req, res) => {
  try {
    const db = getDB();
    const userId = new ObjectId(req.user.id);

    const completedLessons = await db.collection('progress')
      .find({ userId, completed: true })
      .toArray();

    const courseIds = [...new Set(completedLessons.map(p => p.courseId?.toString()))];
    
    const stats = {
      totalCompletedLessons: completedLessons.length,
      coursesInProgress: courseIds.length
    };

    res.json(stats);
  } catch (error) {
    console.error('Error fetching progress overview:', error);
    res.status(500).json({ error: 'Failed to fetch progress overview' });
  }
});

export default router;
