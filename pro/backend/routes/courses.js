import express from 'express';
import { ObjectId } from 'mongodb';
import { getDB } from '../config/db.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Get all courses with filters and search
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { 
      subject, 
      level, 
      language, 
      tags, 
      search,
      page = 1,
      limit = 20
    } = req.query;

    const userId = req.user?.userId;
    const db = getDB();
    let query = {};

    // Privacy filter: show public courses OR user's personal courses
    if (userId) {
      query.$or = [
        { isPersonal: { $ne: true } }, // Public courses
        { isPersonal: true, createdBy: new ObjectId(userId) } // User's personal courses
      ];
    } else {
      query.isPersonal = { $ne: true }; // Only public for non-authenticated
    }

    // Subject filter
    if (subject) {
      try {
        query.subjectId = new ObjectId(subject);
      } catch (e) {
        // Invalid ObjectId, skip filter
      }
    }

    // Level filter
    if (level) {
      query.level = level;
    }

    // Language filter
    if (language) {
      query.language = language;
    }

    // Tags filter
    if (tags) {
      const tagArray = Array.isArray(tags) ? tags : tags.split(',');
      query.tags = { $in: tagArray };
    }

    // Text search
    if (search) {
      query.$text = { $search: search };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build sort criteria
    let sortCriteria = {};
    if (search) {
      sortCriteria = { score: { $meta: 'textScore' } };
    } else {
      // Sort by createdAt if it exists, otherwise by _id
      sortCriteria = { createdAt: -1, _id: -1 };
    }

    const courses = await db.collection('courses')
      .find(query)
      .sort(sortCriteria)
      .skip(skip)
      .limit(parseInt(limit))
      .toArray();
    
    console.log(`Found ${courses.length} courses`);

    // Populate provider and subject
    for (const course of courses) {
      if (course.providerId) {
        try {
          const provider = await db.collection('providers').findOne({ _id: course.providerId });
          course.provider = provider;
        } catch (e) {
          console.error('Error fetching provider:', e);
        }
      }
      if (course.subjectId) {
        try {
          const subject = await db.collection('subjects').findOne({ _id: course.subjectId });
          course.subject = subject;
        } catch (e) {
          console.error('Error fetching subject:', e);
        }
      }

      // Get lesson count
      try {
        const lessonCount = await db.collection('lessons').countDocuments({ courseId: course._id });
        course.lessonCount = lessonCount;
      } catch (e) {
        course.lessonCount = 0;
      }
    }

    const total = await db.collection('courses').countDocuments(query);

    res.json({
      courses,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching courses:', error);
    // Return empty array instead of error to prevent frontend issues
    res.json({
      courses: [],
      pagination: {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 20,
        total: 0,
        pages: 0
      },
      error: error.message
    });
  }
});

// Get single course with lessons
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const db = getDB();
    const courseId = new ObjectId(req.params.id);
    const userId = req.user?.userId;

    const course = await db.collection('courses').findOne({ _id: courseId });

    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    // Check if user has access to personal course
    if (course.isPersonal && course.createdBy?.toString() !== userId?.toString()) {
      return res.status(403).json({ error: 'Access denied to this personal course' });
    }

    // Populate provider and subject
    if (course.providerId) {
      const provider = await db.collection('providers').findOne({ _id: course.providerId });
      course.provider = provider;
    }
    if (course.subjectId) {
      const subject = await db.collection('subjects').findOne({ _id: course.subjectId });
      course.subject = subject;
    }

    // Get lessons ordered by order field
    const lessons = await db.collection('lessons')
      .find({ courseId })
      .sort({ order: 1 })
      .toArray();

    course.lessons = lessons;

    res.json(course);
  } catch (error) {
    console.error('Error fetching course:', error);
    res.status(500).json({ error: 'Failed to fetch course' });
  }
});

// Get filters metadata
router.get('/meta/filters', async (req, res) => {
  try {
    const db = getDB();

    const subjects = await db.collection('subjects').find({}).toArray();
    const levels = await db.collection('courses').distinct('level');
    const languages = await db.collection('courses').distinct('language');
    const allTags = await db.collection('courses').distinct('tags');

    res.json({
      subjects,
      levels,
      languages,
      tags: allTags.filter(t => t) // Remove null/undefined
    });
  } catch (error) {
    console.error('Error fetching filters:', error);
    res.status(500).json({ error: 'Failed to fetch filters' });
  }
});

// Delete a course (admin can delete public, users can delete their personal)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const db = getDB();
    const courseId = new ObjectId(req.params.id);
    const userId = req.user.userId;
    const userRole = req.user.role;

    // Check if course exists
    const course = await db.collection('courses').findOne({ _id: courseId });
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    // Authorization check
    if (course.isPersonal) {
      // Personal course: only creator can delete
      if (course.createdBy?.toString() !== userId?.toString()) {
        return res.status(403).json({ error: 'You can only delete your own personal playlists' });
      }
    } else {
      // Public course: only admins can delete
      if (userRole !== 'admin') {
        return res.status(403).json({ error: 'Only admins can delete public playlists' });
      }
    }

    // Delete all lessons for this course
    const lessonsResult = await db.collection('lessons').deleteMany({ courseId });

    // Delete the course itself
    const courseResult = await db.collection('courses').deleteOne({ _id: courseId });

    if (courseResult.deletedCount === 0) {
      return res.status(500).json({ error: 'Failed to delete course' });
    }

    res.json({
      message: 'Course deleted successfully',
      course: {
        id: course._id,
        title: course.title,
        lessonsDeleted: lessonsResult.deletedCount
      }
    });
  } catch (error) {
    console.error('Error deleting course:', error);
    res.status(500).json({ error: 'Failed to delete course' });
  }
});

export default router;
