# Image Management Feature - Setup & Testing Guide

## Prerequisites Check

### Environment Variables
Ensure these are set in `.env.local` or deployment config:
```
# For admin panel (next.js)
NEXT_PUBLIC_GITHUB_REPO_OWNER=<your-github-username>
NEXT_PUBLIC_GITHUB_REPO_NAME=<your-repo-name>
GITHUB_REPO_OWNER=<your-github-username>
GITHUB_REPO_NAME=<your-repo-name>
GITHUB_DATA_PATH=public-data
GITHUB_BRANCH=main

# NextAuth session (should already exist)
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=<your-secret>
```

### Dependencies
Required packages (should already exist):
- `next`: ^13.4.0
- `next-auth`: ^4.22.0
- `@octokit/rest`: ^19.0.0

## Feature Verification Checklist

### 1. Data Schema ✓
- [ ] Open `public-data/announcements.json`
- [ ] Verify all items have `active` field (boolean)
- [ ] Verify `image` field contains filename (not full URL)
- [ ] Example: `{ id: 1, title: "...", image: "filename.jpg", duration: 5, active: true }`

### 2. API Endpoints ✓
- [ ] File exists: `admin/pages/api/upload.js`
- [ ] File exists: `admin/pages/api/announcements.js`
- [ ] Upload endpoint supports POST and GET methods

### 3. Admin Panel Components ✓
- [ ] File: `admin/components/AnnouncementForm.jsx`
  - [ ] Has file input element
  - [ ] Has "Active" checkbox
  - [ ] Shows image gallery
  - [ ] Has image preview

- [ ] File: `admin/pages/announcements.js`
  - [ ] Shows active/inactive badge
  - [ ] Lists image filename (not URL)

### 4. TV Display ✓
- [ ] File: `src/components/Slideshow.jsx`
  - [ ] Filters `active !== false`
  - [ ] Builds GitHub image URLs correctly
  - [ ] Has error fallback

### 5. Styling ✓
- [ ] File: `admin/styles/announcements.module.css`
  - [ ] Contains `.uploadArea` styles
  - [ ] Contains `.imageGrid` styles
  - [ ] Contains `.statusBadge` styles
  - [ ] Contains `.imageItem` styles

## Testing Workflow

### Test 1: Add New Announcement with Image Upload
1. Start dev server: `npm run dev` (admin panel)
2. Navigate to Announcements page
3. Click "+ Add Announcement"
4. Fill in:
   - Title: "Test Announcement"
   - Duration: 5 seconds
   - Check "Active" checkbox
5. Upload test image (JPG/PNG, <5MB)
6. Verify:
   - [ ] Image uploads without error
   - [ ] Image appears in gallery
   - [ ] Preview shows uploaded image
   - [ ] Can click to select from gallery
7. Click "Save Announcement"
8. Verify:
   - [ ] Success message appears
   - [ ] Announcement listed with active badge (green)
   - [ ] Image thumbnail shows in list

### Test 2: Toggle Active Status
1. In announcements list, click "Edit"
2. Uncheck "Active" checkbox
3. Click "Save Announcement"
4. Verify:
   - [ ] Badge changes to "✗ Inactive" (red)
   - [ ] Check again and save
   - [ ] Badge changes back to "✓ Active" (green)

### Test 3: TV Display Filtering
1. In admin panel: Add 2 announcements
   - Announcement A: active = true
   - Announcement B: active = false
2. Start TV Display: `npm run dev` (in `src/` folder)
3. Navigate to Slideshow section
4. Verify:
   - [ ] Only Announcement A is visible
   - [ ] Announcement B is not shown
   - [ ] Image displays correctly
   - [ ] Slideshow rotates only active items

### Test 4: Image Error Handling
1. Edit an announcement
2. Manually change image filename to non-existent file
3. Save
4. Go to TV Display
5. Verify:
   - [ ] Error fallback SVG appears
   - [ ] Message shows "Image not found"
   - [ ] No console errors

### Test 5: File Validation
1. Try to upload:
   - [ ] File >5MB: Should show error "must be less than 5MB"
   - [ ] Non-image file (PDF): Should show error "must be JPG, PNG, or GIF"
   - [ ] Valid image: Should succeed

## GitHub Storage Verification

### Check Images in Repository
```bash
# Images should be stored at:
public-data/images/
├── 1710123456789-test-image.jpg
├── 1710123457890-announcement.png
└── ...
```

### Verify GitHub Raw URLs
- Files accessible at: `https://raw.githubusercontent.com/{owner}/{repo}/main/public-data/images/{filename}`
- Should load correctly in browser
- Should work in `<img>` tags

## Troubleshooting

### Images Not Uploading
- [ ] Check NextAuth session is active (GitHub OAuth)
- [ ] Verify environment variables are set
- [ ] Check browser console for errors
- [ ] Verify GitHub token has `repo` scope permissions

### Images Not Displaying in TV
- [ ] Check Slideshow.jsx filters active announcements
- [ ] Verify image URLs are built correctly
- [ ] Check GitHub raw URLs are accessible
- [ ] Verify announcements.json has correct data format

### Gallery Not Showing
- [ ] Check `/api/upload` GET endpoint works
- [ ] Verify images exist in GitHub repository
- [ ] Check network tab for fetch errors

### Active/Inactive Not Working
- [ ] Verify announcements.json has `active` field
- [ ] Check API saves active field correctly
- [ ] Verify Slideshow filters on active field

## Performance Notes
- Images stored in GitHub (public repository)
- No server-side processing needed
- Client-side Base64 encoding before upload
- Filename timestamps prevent conflicts
- Gallery loads from GitHub API (GET /repos/.../contents)

## Security Notes
- GitHub OAuth required for uploads
- File type validation (client + server)
- File size limit enforced (5MB)
- Filenames sanitized before storage
- Base64 encoding used for API transfers

## Next Steps (Optional Enhancements)
- [ ] Add image compression before upload
- [ ] Add image cropping tool
- [ ] Add bulk upload support
- [ ] Add image deletion from GitHub
- [ ] Add image reordering in slideshow
- [ ] Add image scheduling (date/time ranges)
