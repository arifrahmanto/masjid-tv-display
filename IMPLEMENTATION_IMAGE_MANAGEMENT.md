# Announcement Image Management Implementation

## Summary
Successfully implemented a complete image management system for announcements with the following features:
- Upload images to GitHub storage (`public-data/images/`)
- Store image metadata in announcements.json
- Enable/disable announcements from displaying in slideshow
- Admin panel UI for managing images and status

## Files Modified

### 1. Data Structure
**File**: `public-data/announcements.json`
- Updated schema to include `active` field
- Changed `image` field from full URL to filename reference
- Example:
  ```json
  {
    "id": 1,
    "title": "Pengumuman Penting",
    "image": "announcement-1.jpg",
    "duration": 5,
    "active": true
  }
  ```

### 2. Upload API Endpoint
**File**: `admin/pages/api/upload.js` (NEW)
**Methods**:
- **POST**: Upload image to GitHub
  - Accepts base64 encoded image data
  - Validates file type (jpg, png, gif) and size (max 5MB)
  - Generates timestamp-based filenames
  - Returns GitHub raw content URL
  - Requires authentication via NextAuth session

- **GET**: List available images
  - Returns all image files in `public-data/images/`
  - Includes GitHub raw URLs for each image

**Environment Variables Required**:
- `GITHUB_REPO_OWNER`
- `GITHUB_REPO_NAME`
- `GITHUB_DATA_PATH`
- `GITHUB_BRANCH`

### 3. Admin Component - Announcement Form
**File**: `admin/components/AnnouncementForm.jsx`
**Updates**:
- Added file input for image upload
- Added checkbox for "active/inactive" status
- Added image gallery showing available uploaded images
- Click to select from existing images without re-uploading
- Real-time preview of selected image
- Upload progress indicator
- File validation (type and size)

**Features**:
```jsx
- File Upload: Drag & drop or click to select JPG/PNG/GIF (max 5MB)
- Image Gallery: Browse previously uploaded images
- Active Toggle: Checkbox to enable/disable slideshow display
- Duration: Set display time (1-30 seconds)
- Real-time Preview: See image before saving
```

### 4. Admin Page - Announcements List
**File**: `admin/pages/announcements.js`
**Updates**:
- Display active/inactive status badge
- Show image filename instead of full URL
- Build correct GitHub raw URLs for image preview
- Color-coded status: Green (active), Red (inactive)

### 5. Admin Styles
**File**: `admin/styles/announcements.module.css`
**New Styles Added**:
```css
.uploadArea - Drag & drop zone styling
.fileInput - File input field styling
.imageGrid - Grid layout for available images
.imageItem - Individual image selection card
.statusBadge - Active/inactive status indicator
.titleRow - Layout for title + status badge
.filename - Image filename display
```

### 6. TV Display - Slideshow Component
**File**: `src/components/Slideshow.jsx`
**Updates**:
- Filter announcements to show only `active: true`
- Build GitHub raw content URLs from filenames
- Update image URL construction:
  ```jsx
  const imageUrl = current.image.startsWith('http')
    ? current.image
    : `https://raw.githubusercontent.com/{owner}/{repo}/main/public-data/images/{filename}`
  ```
- Error fallback SVG for missing images

### 7. Announcements API
**File**: `admin/pages/api/announcements.js`
**Updates**:
- POST method now includes `active` field
- Defaults `active: true` for new announcements
- Maintains backward compatibility

## Workflow

### Adding a New Announcement
1. Click "+ Add Announcement" in admin panel
2. Enter title and duration
3. Upload image or select from existing
4. Toggle "Active" checkbox if needed
5. Click "Save Announcement"
6. Image stored in GitHub → JSON updated → TV display refreshes

### Updating Announcement Status
1. Click "Edit" on announcement
2. Toggle "Active" checkbox
3. Click "Save Announcement"
4. Changes reflected immediately in slideshow

### Managing Images
- Images auto-uploaded to: `public-data/images/`
- Filenames: `{timestamp}-{original-filename}`
- Format: Base64 encoded via GitHub API
- Available images list refreshes after each upload

## File Organization
```
public-data/
├── announcements.json      (updated with active field)
├── images/                 (stores uploaded images)
│   ├── announcement-1.jpg
│   ├── announcement-2.jpg
│   └── ...

admin/
├── pages/
│   ├── api/
│   │   ├── announcements.js (updated for active field)
│   │   └── upload.js (NEW - image upload handler)
│   └── announcements.js (updated UI)
├── components/
│   └── AnnouncementForm.jsx (enhanced with file upload)
└── styles/
    └── announcements.module.css (new styles added)

src/
└── components/
    └── Slideshow.jsx (updated to filter active)
```

## Configuration Requirements

Add to `.env.local` or `.env` if not already present:
```
NEXT_PUBLIC_GITHUB_REPO_OWNER=your-github-username
NEXT_PUBLIC_GITHUB_REPO_NAME=your-repo-name
GITHUB_REPO_OWNER=your-github-username
GITHUB_REPO_NAME=your-repo-name
GITHUB_DATA_PATH=public-data
GITHUB_BRANCH=main
```

## Features Summary

✅ **Image Upload**
- Direct to GitHub storage
- File validation (type & size)
- Progress indication

✅ **Image Gallery**
- Browse uploaded images
- Click to select
- Thumbnail preview

✅ **Status Management**
- Toggle active/inactive
- Visual badges
- Instant filtering

✅ **Error Handling**
- File size validation
- File type validation
- Fallback error images
- Network error recovery

✅ **User Experience**
- Real-time preview
- Drag & drop support
- Responsive design
- Clear feedback messages

## Testing Checklist
- [ ] Upload new image
- [ ] Select existing image
- [ ] Toggle active status
- [ ] Verify only active announcements show in slideshow
- [ ] Test image error fallback
- [ ] Verify images persist after page refresh
- [ ] Test with various image formats (JPG, PNG, GIF)
- [ ] Verify filename generation prevents conflicts

## Notes
- All images stored in public GitHub repository
- Images accessible via GitHub raw content URLs
- Base64 encoding used for GitHub API transfers
- Image filenames auto-generated with timestamps to prevent conflicts
- Active field defaults to `true` for new announcements
