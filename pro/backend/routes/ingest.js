import express from 'express';
import axios from 'axios';
import { ObjectId } from 'mongodb';
import { getDB } from '../config/db.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// All ingest routes require authentication
router.use(authenticateToken);

// Ingest YouTube playlist
router.post('/playlist', async (req, res) => {
  try {
    const { playlistUrl, isPersonal } = req.body;
    const userId = req.user.userId;
    const userRole = req.user.role;

    // Only admins can create public playlists
    if (!isPersonal && userRole !== 'admin') {
      return res.status(403).json({ error: 'Only admins can create public playlists' });
    }

    if (!playlistUrl) {
      return res.status(400).json({ error: 'Playlist URL required' });
    }

    // Extract playlist ID from URL
    const playlistIdMatch = playlistUrl.match(/[?&]list=([a-zA-Z0-9_-]+)/);
    if (!playlistIdMatch) {
      return res.status(400).json({ error: 'Invalid playlist URL' });
    }

    const playlistId = playlistIdMatch[1];
    const db = getDB();

    // Fetch playlist metadata
    const playlistResponse = await axios.get(
      'https://www.googleapis.com/youtube/v3/playlists',
      {
        params: {
          part: 'snippet,contentDetails',
          id: playlistId,
          key: process.env.YT_API_KEY
        }
      }
    );

    if (!playlistResponse.data.items || playlistResponse.data.items.length === 0) {
      return res.status(404).json({ error: 'Playlist not found' });
    }

    const playlistData = playlistResponse.data.items[0];
    const channelId = playlistData.snippet.channelId;

    // Get or create provider (channel)
    let provider = await db.collection('providers').findOne({ channelId });
    if (!provider) {
      const providerResult = await db.collection('providers').insertOne({
        name: playlistData.snippet.channelTitle,
        channelId,
        thumbnail: playlistData.snippet.thumbnails?.default?.url,
        createdAt: new Date()
      });
      provider = { _id: providerResult.insertedId };
    }

    // Get or create subject (default to "General" if not specified)
    let subject = await db.collection('subjects').findOne({ name: 'General' });
    if (!subject) {
      const subjectResult = await db.collection('subjects').insertOne({
        name: 'General',
        description: 'General courses',
        createdAt: new Date()
      });
      subject = { _id: subjectResult.insertedId };
    }

    // Get or create course
    let course = await db.collection('courses').findOne({ playlistId });
    const courseData = {
      title: playlistData.snippet.title,
      description: playlistData.snippet.description || '',
      thumbnail: playlistData.snippet.thumbnails?.high?.url || playlistData.snippet.thumbnails?.default?.url,
      playlistId,
      providerId: provider._id,
      subjectId: subject._id,
      level: 'Beginner', // Default
      language: 'en', // Default
      tags: [],
      isPersonal: isPersonal || false,
      createdBy: isPersonal ? new ObjectId(userId) : null,
      updatedAt: new Date()
    };

    if (course) {
      await db.collection('courses').updateOne(
        { _id: course._id },
        { $set: courseData }
      );
      course = await db.collection('courses').findOne({ _id: course._id });
    } else {
      courseData.createdAt = new Date();
      const courseResult = await db.collection('courses').insertOne(courseData);
      course = await db.collection('courses').findOne({ _id: courseResult.insertedId });
    }

    // Fetch playlist items
    let nextPageToken = null;
    let allItems = [];
    
    do {
      const itemsResponse = await axios.get(
        'https://www.googleapis.com/youtube/v3/playlistItems',
        {
          params: {
            part: 'snippet,contentDetails',
            playlistId,
            maxResults: 50,
            pageToken: nextPageToken,
            key: process.env.YT_API_KEY
          }
        }
      );

      allItems = allItems.concat(itemsResponse.data.items);
      nextPageToken = itemsResponse.data.nextPageToken;
    } while (nextPageToken);

    // Get video IDs
    const videoIds = allItems.map(item => item.contentDetails.videoId);

    // Fetch video details for duration
    const videosResponse = await axios.get(
      'https://www.googleapis.com/youtube/v3/videos',
      {
        params: {
          part: 'contentDetails,snippet',
          id: videoIds.join(','),
          key: process.env.YT_API_KEY
        }
      }
    );

    const videoMap = {};
    videosResponse.data.items.forEach(video => {
      const duration = parseDuration(video.contentDetails.duration);
      videoMap[video.id] = {
        duration,
        title: video.snippet.title,
        description: video.snippet.description
      };
    });

    // Delete existing lessons for this course
    await db.collection('lessons').deleteMany({ courseId: course._id });

    // Create lessons
    const lessons = allItems.map((item, index) => ({
      courseId: course._id,
      videoId: item.contentDetails.videoId,
      title: videoMap[item.contentDetails.videoId]?.title || item.snippet.title,
      description: videoMap[item.contentDetails.videoId]?.description || item.snippet.description || '',
      order: index + 1,
      duration: videoMap[item.contentDetails.videoId]?.duration || 0,
      thumbnail: item.snippet.thumbnails?.medium?.url || item.snippet.thumbnails?.default?.url,
      createdAt: new Date()
    }));

    if (lessons.length > 0) {
      await db.collection('lessons').insertMany(lessons);
    }

    res.json({
      message: 'Playlist ingested successfully',
      course: {
        id: course._id,
        title: course.title,
        lessonCount: lessons.length
      }
    });
  } catch (error) {
    console.error('Playlist ingestion error:', error);
    if (error.response) {
      return res.status(error.response.status).json({ 
        error: 'YouTube API error',
        details: error.response.data 
      });
    }
    res.status(500).json({ error: 'Failed to ingest playlist' });
  }
});

// Helper function to parse ISO 8601 duration
function parseDuration(duration) {
  const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
  if (!match) return 0;

  const hours = (match[1] || '').replace('H', '') || 0;
  const minutes = (match[2] || '').replace('M', '') || 0;
  const seconds = (match[3] || '').replace('S', '') || 0;

  return parseInt(hours) * 3600 + parseInt(minutes) * 60 + parseInt(seconds);
}

export default router;
