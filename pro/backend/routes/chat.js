import express from 'express';
import { ObjectId } from 'mongodb';
import { getDB } from '../config/db.js';
import { authenticateToken } from '../middleware/auth.js';
import { calculateTFIDF, cosineSimilarity, findRelevantContent } from '../utils/tfidf.js';

const router = express.Router();

router.use(authenticateToken);

// Chat endpoint
router.post('/', async (req, res) => {
  try {
    const { message, courseId } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message required' });
    }

    const db = getDB();
    const userId = new ObjectId(req.user.id);

    // Store user message
    await db.collection('messages').insertOne({
      userId,
      message,
      courseId: courseId ? new ObjectId(courseId) : null,
      role: 'user',
      createdAt: new Date()
    });

    // Get course content for context
    let lessons = [];
    let course = null;

    if (courseId) {
      course = await db.collection('courses').findOne({ _id: new ObjectId(courseId) });
      if (course) {
        lessons = await db.collection('lessons')
          .find({ courseId: course._id })
          .sort({ order: 1 })
          .toArray();
      }
    } else {
      // Get all lessons from user's courses (or all if no course specified)
      lessons = await db.collection('lessons').find({}).limit(100).toArray();
    }

    if (lessons.length === 0) {
      return res.json({
        response: "I don't have any course content to reference. Please make sure courses have been imported.",
        sources: []
      });
    }

    // Find relevant content using TF-IDF
    const relevantContent = findRelevantContent(message, lessons, 3);

    // Generate response with citations
    let response = "Based on the course content:\n\n";
    const sources = [];

    relevantContent.forEach((item, index) => {
      const lesson = lessons.find(l => l._id.toString() === item.lessonId);
      if (lesson) {
        response += `${index + 1}. ${lesson.title}\n`;
        
        // Extract relevant snippet (first 200 chars of description or title)
        const snippet = lesson.description.substring(0, 200) || lesson.title;
        response += `   ${snippet}...\n\n`;

        sources.push({
          videoId: lesson.videoId,
          lessonId: lesson._id.toString(),
          title: lesson.title,
          timestamp: 0 // Could be enhanced to find specific timestamps
        });
      }
    });

    if (relevantContent.length === 0) {
      response = "I couldn't find specific information about that in the course content. Could you rephrase your question or be more specific?";
    }

    // Store assistant response
    await db.collection('messages').insertOne({
      userId,
      message: response,
      courseId: courseId ? new ObjectId(courseId) : null,
      role: 'assistant',
      sources,
      createdAt: new Date()
    });

    res.json({
      response,
      sources
    });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: 'Failed to process chat message' });
  }
});

// Get chat history
router.get('/history/:courseId?', async (req, res) => {
  try {
    const db = getDB();
    const userId = new ObjectId(req.user.id);
    const { courseId } = req.params;

    const query = { userId };
    if (courseId) {
      query.courseId = new ObjectId(courseId);
    }

    const messages = await db.collection('messages')
      .find(query)
      .sort({ createdAt: 1 })
      .limit(50)
      .toArray();

    res.json(messages);
  } catch (error) {
    console.error('Error fetching chat history:', error);
    res.status(500).json({ error: 'Failed to fetch chat history' });
  }
});

export default router;
