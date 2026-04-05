# Live School

A modern, world-class free education platform that organizes YouTube playlists into structured courses.

## Features

- **Admin Playlist Importer**: Import YouTube playlists and automatically create courses with lessons
- **Browse & Search**: Filter courses by subject, level, language, and tags. Full-text search powered by MongoDB
- **Course Learning**: Watch embedded YouTube videos, track progress, and mark lessons as complete
- **Local AI Chatbot**: Ask questions about course content using TF-IDF and cosine similarity (no external APIs)
- **Fun Breaks**: Box breathing exercises, Pomodoro timer, and ambient sound toggles
- **Authentication**: Secure email/password authentication with JWT and admin roles
- **Mac-style UI**: Beautiful frosted glass interface with smooth animations

## Tech Stack

- **Frontend**: React + Vite (plain CSS / CSS Modules only)
- **Backend**: Node.js + Express
- **Database**: MongoDB (official driver only - no Mongoose)
- **Authentication**: JWT

## Prerequisites

- Node.js 18+ installed
- MongoDB instance running (local or Atlas)
- YouTube Data API v3 key

## Setup Instructions

### 1. Clone and Install Dependencies

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the `backend` directory:

```bash
cd backend
cp env.example .env
```

The MongoDB connection is already configured for your Atlas cluster. Edit `.env` to add your remaining configuration:

```env
MONGODB_URI=mongodb+srv://My-self:5M1flVTEBU9vzl5i@livecourses.3eepasl.mongodb.net/live-school?retryWrites=true&w=majority
JWT_SECRET=your-secret-key-change-this-in-production-minimum-32-characters-long
YT_API_KEY=your-youtube-api-key-here
PORT=3001
```

**Important Notes:**
- The MongoDB connection string is already configured for MongoDB Atlas
- Make sure your IP address is whitelisted in MongoDB Atlas Network Access settings (or allow access from anywhere `0.0.0.0/0` for development)
- Generate a secure JWT_SECRET (at least 32 characters). You can use: `openssl rand -base64 32`
- The YouTube API key is required for importing playlists

**Getting a YouTube API Key:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable "YouTube Data API v3"
4. Create credentials (API Key)
5. Copy the API key to your `.env` file

### 3. MongoDB Atlas Setup

The project is configured to use MongoDB Atlas. Ensure:

1. Your IP address is whitelisted in MongoDB Atlas (Network Access)
2. The database user credentials are correct
3. The connection string in `.env` matches your Atlas cluster

If you prefer local MongoDB, change `MONGODB_URI` to `mongodb://localhost:27017/live-school` and start MongoDB locally.

### 4. Start the Backend Server

```bash
cd backend
npm run dev
```

The backend will run on `http://localhost:3001`

### 5. Start the Frontend Development Server

In a new terminal:

```bash
cd frontend
npm run dev
```

The frontend will run on `http://localhost:3000`

### 6. Create Your First Admin User

1. Register a regular user at `http://localhost:3000/register`
2. Connect to MongoDB and update the user's role:

```javascript
// In MongoDB shell or Compass
use live-school
db.users.updateOne(
  { email: "your-email@example.com" },
  { $set: { role: "admin" } }
)
```

Or use MongoDB Compass to manually edit the user document.

## Usage

### Admin: Import a Playlist

1. Log in as an admin user
2. Navigate to the Admin page (via Dock or `/admin`)
3. Paste a YouTube playlist URL (format: `https://www.youtube.com/playlist?list=...`)
4. Click "Import Playlist"
5. The system will fetch all videos and create a course

### Student: Browse and Learn

1. Browse courses on the home page
2. Use filters to find courses by subject, level, language, or tags
3. Click on a course to view lessons
4. Watch videos and mark lessons as complete
5. Use the Chat Assistant tab to ask questions about the course
6. Take breaks with Fun Breaks features

## Project Structure

```
pro/
├── backend/
│   ├── config/
│   │   └── db.js              # MongoDB connection
│   ├── middleware/
│   │   └── auth.js            # JWT authentication
│   ├── routes/
│   │   ├── auth.js            # Login/register
│   │   ├── courses.js         # Course browsing
│   │   ├── progress.js        # Progress tracking
│   │   ├── ingest.js          # Playlist import (admin)
│   │   └── chat.js            # AI chatbot
│   ├── utils/
│   │   └── tfidf.js           # TF-IDF search implementation
│   ├── server.js              # Express server
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/        # Reusable components
│   │   ├── pages/             # Page components
│   │   ├── context/           # Auth context
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   └── package.json
└── README.md
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (protected)
- `POST /api/auth/logout` - Logout (protected)

### Courses
- `GET /api/courses` - List courses (supports query params: search, subject, level, language, tags)
- `GET /api/courses/:id` - Get single course with lessons
- `GET /api/courses/meta/filters` - Get filter metadata

### Progress
- `GET /api/progress/course/:courseId` - Get user progress for course (protected)
- `POST /api/progress/complete` - Mark lesson as complete (protected)
- `GET /api/progress/overview` - Get user progress overview (protected)

### Admin
- `POST /api/ingest/playlist` - Import YouTube playlist (admin only)

### Chat
- `POST /api/chat` - Send chat message (protected)
- `GET /api/chat/history/:courseId?` - Get chat history (protected)

## MongoDB Collections

- `users` - User accounts and authentication
- `subjects` - Course subjects/categories
- `providers` - YouTube channels/providers
- `courses` - Course metadata
- `lessons` - Individual lesson/video data
- `progress` - User lesson completion tracking
- `messages` - Chat conversation history

## Development

### Backend Development
```bash
cd backend
npm run dev  # Uses --watch for auto-reload
```

### Frontend Development
```bash
cd frontend
npm run dev  # Vite dev server with HMR
```

### Build for Production

Frontend:
```bash
cd frontend
npm run build
```

The built files will be in `frontend/dist/`. You can serve them with any static file server or configure the backend to serve them.

## Notes

- Videos are embedded (not downloaded) - you need an internet connection to watch
- The local chatbot uses TF-IDF and cosine similarity for semantic search
- All UI animations use CSS transforms/opacity for smooth performance
- The app is fully responsive and accessible

## Troubleshooting

**MongoDB Connection Error (Authentication Failed):**
- See detailed troubleshooting guide: `backend/SETUP_MONGODB.md`
- Common fixes:
  - Verify username/password in MongoDB Atlas Database Access
  - Get the connection string directly from Atlas (Database → Connect → Connect your application)
  - Ensure your IP is whitelisted in Network Access
  - Check if cluster is paused (free tier pauses after inactivity)
  - URL-encode special characters in password if needed

**YouTube API Errors:**
- Verify your API key is correct
- Check API quota limits in Google Cloud Console
- Ensure "YouTube Data API v3" is enabled

**Port Already in Use:**
- Change `PORT` in backend `.env`
- Update frontend `vite.config.js` proxy target if needed

## License

MIT

## Contributing

Contributions welcome! Please ensure code follows the project's tech stack requirements (no Mongoose, Tailwind, UI kits, etc.).
