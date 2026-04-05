# 🗑️ Delete Course - Visual Guide

## Admin Panel Layout

```
╔════════════════════════════════════════════════════════════════╗
║                      Admin Panel                               ║
╠════════════════════════════════════════════════════════════════╣
║                                                                ║
║  📥 Import YouTube Playlist                                   ║
║  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  ║
║  Enter a YouTube playlist URL to import it as a course         ║
║                                                                ║
║  ┌──────────────────────────────────────────────────────────┐ ║
║  │ Playlist URL                                              │ ║
║  │ https://www.youtube.com/playlist?list=...               │ ║
║  └──────────────────────────────────────────────────────────┘ ║
║                                                                ║
║  ┌──────────────────────────────────────────────────────────┐ ║
║  │            📥 Import Playlist                            │ ║
║  └──────────────────────────────────────────────────────────┘ ║
║                                                                ║
║  How it works:                                                ║
║  • Paste a YouTube playlist URL                               ║
║  • The system will fetch all videos from the playlist         ║
║  • Course metadata, lessons, and descriptions will be created ║
║  • Videos are embedded (not downloaded)                       ║
║                                                                ║
║ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ ║
║                                                                ║
║  🗑️ Manage Courses                                           ║
║  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  ║
║  View and delete existing courses                             ║
║                                                                ║
║  ┌──────────────────────────────────────────────────────────┐ ║
║  │ ┌──────┐ Python Basics               🗑️ Delete           │ ║
║  │ │ 🎓   │ 12 lessons • Beginner level                      │ ║
║  │ │ IMG  │ Learn Python from scratch...                     │ ║
║  │ └──────┘                                                  │ ║
║  └──────────────────────────────────────────────────────────┘ ║
║                                                                ║
║  ┌──────────────────────────────────────────────────────────┐ ║
║  │ ┌──────┐ JavaScript Advanced         🗑️ Delete           │ ║
║  │ │ 💻   │ 15 lessons • Advanced level                      │ ║
║  │ │ IMG  │ Master JavaScript concepts...                    │ ║
║  │ └──────┘                                                  │ ║
║  └──────────────────────────────────────────────────────────┘ ║
║                                                                ║
║  ┌──────────────────────────────────────────────────────────┐ ║
║  │ ┌──────┐ React Fundamentals         🗑️ Delete           │ ║
║  │ │ ⚛️   │ 8 lessons • Intermediate level                   │ ║
║  │ │ IMG  │ Introduction to React...                         │ ║
║  │ └──────┘                                                  │ ║
║  └──────────────────────────────────────────────────────────┘ ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝

                    🚪 [Home] [Courses] [Admin] 🚪
                         (Dock at bottom center)
```

---

## Step-by-Step Deletion Process

### Step 1: View Courses
```
You see all courses with:
  ✓ Thumbnail image
  ✓ Course title
  ✓ Number of lessons
  ✓ Course level
  ✓ Short description
  ✓ Delete button (red, on the right)
```

### Step 2: Click Delete Button
```
BEFORE:                      AFTER:
┌────────────────┐          ┌────────────────┐
│ Course Title   │   →      │ Course Title   │
│ Delete Button  │ (clicked)│ Delete Button  │
└────────────────┘          │ ⏳ Deleting..  │
                            └────────────────┘
                            (button disabled)
```

### Step 3: Confirm Deletion
```
╔════════════════════════════════════════╗
║         Delete Confirmation            ║
╠════════════════════════════════════════╣
║                                        ║
║  ⚠️  Are you sure you want to delete  ║
║      "Python Basics"?                 ║
║                                        ║
║  This action cannot be undone.        ║
║                                        ║
║  ┌──────────────┐  ┌──────────────┐  ║
║  │   Cancel     │  │   Delete     │  ║
║  └──────────────┘  └──────────────┘  ║
║                                        ║
╚════════════════════════════════════════╝
```

### Step 4: Deletion Complete
```
List updates in real-time:

BEFORE:                    AFTER:
┌─────────────┐           ┌─────────────┐
│ Python      │           │ JavaScript  │
│ JavaScript  │  Delete   │ React       │
│ React       │ "Python"  │             │
└─────────────┘           └─────────────┘

✅ Success Message:
   "Successfully deleted "Python Basics" 
    and 12 lessons"
```

---

## Delete Button States

### Normal State (Hover)
```
┌──────────────┐
│ 🗑️ Delete    │  ← Red border & background
└──────────────┘
   Clickable, with glow effect on hover
   Cursor changes to pointer
   Slight lift animation
```

### Deleting State
```
┌──────────────┐
│ ⏳ Deleting...│  ← Gray, disabled
└──────────────┘
   Disabled (no click)
   Shows loading state
   Button opacity reduced
```

### After Deletion
```
Course item disappears from list
Success message appears briefly
List automatically refreshes
```

---

## Course Item Card

```
┌─────────────────────────────────────────────────────────┐
│ ┌────────┐  Title Here                              │   │
│ │        │  12 lessons • Beginner level  🗑️ Delete  │   │
│ │ IMAGE  │  Description of the course...            │   │
│ │        │                                           │   │
│ └────────┘                                           │   │
└─────────────────────────────────────────────────────────┘
     ↓           ↓                      ↓
  Thumbnail   Course Details        Delete Button
   (60×60)    (Text Info)          (Red Color)
```

### Card Styling

**Default:**
- Background: Dark blue with transparency
- Border: Light gray, subtle
- Text: White with good contrast
- Thumbnail: Small preview (60×60px)

**On Hover:**
- Background: Slightly lighter
- Border: Purple tint
- Transform: Slight horizontal slide
- Shadow: Larger shadow effect
- Smoother transition (0.3s ease)

---

## Color Scheme

```
Component          Color           Hex       Usage
─────────────────────────────────────────────────
Course Card        Dark Blue       #1e293b   Background
Card Border        Light Gray      #ffffff   Border (12% opacity)
Delete Button      Red             #ef4444   Alert color
Delete on Hover    Red             #ef4444   Stronger glow
Text Primary       White           #ffffff   Titles
Text Secondary     Light Gray      #a0a0a0   Meta info
Accent (Active)    Indigo          #6366f1   Hover state
```

---

## Responsive Design

### Desktop (> 1024px)
```
Full course cards visible
Multiple courses in view
Delete button on right side
Normal font sizes
```

### Tablet (768px - 1024px)
```
Slightly smaller cards
Smaller thumbnails
Smaller text
Delete button still accessible
```

### Mobile (< 768px)
```
Single column layout
Full-width cards
Large touch targets (44px minimum)
Delete button prominent
Vertically stacked items
```

---

## Success & Error Messages

### Success Message (Green)
```
┌─────────────────────────────────────────┐
│ ✅ Successfully deleted "Course Title"  │
│    and 12 lessons                       │
└─────────────────────────────────────────┘
   Background: Dark green with transparency
   Border: Green color
   Text: Green color
   Duration: Shows for 3-5 seconds
```

### Error Message (Red)
```
┌─────────────────────────────────────────┐
│ ❌ Failed to delete course              │
│    Admin access required                │
└─────────────────────────────────────────┘
   Background: Dark red with transparency
   Border: Red color
   Text: Red color
   Duration: Shows until dismissed
```

---

## Database Changes

### Before Deletion
```
MongoDB Collections:

courses:
  _id: 67581234567890abcdef1234
  title: "Python Basics"
  description: "..."
  lessonCount: 12

lessons:
  [12 lesson documents]
  all with courseId: 67581234567890abcdef1234
```

### After Deletion
```
MongoDB Collections:

courses:
  [Course document removed]

lessons:
  [All 12 lesson documents removed]

Result: Clean database, no orphaned data
```

---

## Animations

### Course Item Entry
```
Animation: slideInRight
Duration: 0.4s
Effect: Item slides in from right
         with smooth ease-out
```

### Delete Button on Hover
```
Effects applied:
  • Color change (red glow)
  • Scale: 1.02x (slight grow)
  • Shadow: Enhanced glow
  • Transform: translateY(-2px) (lift up)
  • Transition: 0.3s cubic-bezier
```

### Course Item on Hover
```
Effects applied:
  • Background: Slightly lighter
  • Border: Purple tint
  • Transform: translateX(4px) (shift right)
  • Box-shadow: Enhanced
```

---

## User Flow Diagram

```
┌─────────────────────┐
│  Login as Admin     │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Click Admin in Dock│
└──────────┬──────────┘
           │
           ▼
┌──────────────────────────┐
│  Admin Panel Loads       │
│  Courses auto-fetch      │
└──────────┬───────────────┘
           │
           ▼
┌──────────────────────────┐
│  Scroll to "Manage       │
│  Courses" Section        │
└──────────┬───────────────┘
           │
           ▼
┌──────────────────────────┐
│  Click 🗑️ Delete Button  │
└──────────┬───────────────┘
           │
           ▼
┌──────────────────────────┐
│  Confirm Dialog Appears  │
└────┬──────────┬──────────┘
     │          │
 Cancel      Confirm
     │          │
     ▼          ▼
  [Stay]    [Process]
            Delete
            Request
              │
              ▼
        ┌──────────────┐
        │ API Request  │
        │ DELETE /api/ │
        │ courses/:id  │
        └──────┬───────┘
               │
         ┌─────┴─────┐
         ▼           ▼
      Success      Error
         │           │
         ▼           ▼
      Remove     Show Error
      from List  Message
         │
         ▼
      ✅ Show Success
         Message
```

---

## Summary Table

| Feature | Details |
|---------|---------|
| **Location** | Admin Panel → Manage Courses |
| **Access** | Admin users only |
| **Action** | Click red delete button |
| **Confirmation** | Required (shows course name) |
| **Processing** | Button shows "⏳ Deleting..." |
| **Result** | Course & lessons permanently deleted |
| **Feedback** | Success/error message + instant list update |
| **Database** | MongoDB documents removed |
| **Speed** | Instant (< 1 second) |
| **Undo** | Not possible (use backups if needed) |

---

**Visual Guide Complete** ✅
**Ready to Use** ✅
