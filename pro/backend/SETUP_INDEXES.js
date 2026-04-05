// Database Indexes for Optimization
// Run these commands in MongoDB shell or Compass to improve query performance

// Courses collection indexes
db.courses.createIndex({ isPersonal: 1, createdBy: 1 }); // For privacy filtering
db.courses.createIndex({ createdAt: -1 }); // For sorting by date
db.courses.createIndex({ title: "text", description: "text" }); // For text search
db.courses.createIndex({ subjectId: 1 }); // For subject filtering
db.courses.createIndex({ level: 1 }); // For level filtering
db.courses.createIndex({ language: 1 }); // For language filtering
db.courses.createIndex({ tags: 1 }); // For tag filtering

// Lessons collection indexes
db.lessons.createIndex({ courseId: 1, order: 1 }); // For fetching lessons by course
db.lessons.createIndex({ courseId: 1 }); // For course deletion cascade

// Progress collection indexes (if exists)
db.progress.createIndex({ userId: 1, courseId: 1 }); // For user progress tracking
db.progress.createIndex({ userId: 1, lessonId: 1 }); // For lesson progress

console.log('✅ All indexes created successfully!');
