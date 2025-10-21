# Upload Your Images Guide

## Images You Need to Upload

### 1. Acura Headlight Before & After Photos

**Save these with these exact filenames:**

#### Before Photo (Oxidized Headlight)
- **Filename**: `headlight-oxidized-before.jpg`
- **Location**: `images/before-after/headlight-oxidized-before.jpg`
- **Description**: Dark red Acura with severely oxidized, hazy headlight

#### After Photo (Restored Headlight)  
- **Filename**: `headlight-restored-after.jpg`
- **Location**: `images/before-after/headlight-restored-after.jpg`
- **Description**: Same Acura with crystal clear, restored headlight

### 2. Jason's Professional Headshot

**Save this with this exact filename:**
- **Filename**: `jason-headshot.jpg`
- **Location**: `images/jason-headshot.jpg`
- **Description**: Professional headshot of Jason in dark polo shirt

## How to Upload

### Option 1: Using Finder (Easiest)
1. **Open Finder** and navigate to your project folder:
   `/Users/br14r/Flawless-Finish-Ceramic-Coating/Flawless-Finish-Ceramic-Coating/images/`

2. **For Before/After photos**:
   - Go to `before-after/` folder
   - Drag and drop your "before" photo and rename it to `headlight-oxidized-before.jpg`
   - Drag and drop your "after" photo and rename it to `headlight-restored-after.jpg`

3. **For Jason's photo**:
   - Go to the main `images/` folder
   - Drag and drop Jason's photo and rename it to `jason-headshot.jpg`

### Option 2: Using Terminal
```bash
# Navigate to your project
cd /Users/br14r/Flawless-Finish-Ceramic-Coating/Flawless-Finish-Ceramic-Coating

# Copy your images (replace with actual filenames)
cp /path/to/your/before-photo.jpg images/before-after/headlight-oxidized-before.jpg
cp /path/to/your/after-photo.jpg images/before-after/headlight-restored-after.jpg
cp /path/to/your/jason-photo.jpg images/jason-headshot.jpg
```

## Test Your Upload

1. **Visit your website**: `http://localhost:3000`
2. **Check the Before & After Gallery** - you should see your Acura photos
3. **Check the About Me section** - you should see Jason's photo
4. **All images should load properly** without any broken image icons

## Current Status
- ✅ Website is running at `http://localhost:3000`
- ✅ All image paths are set up correctly
- ✅ Placeholder images are working
- ⏳ **Next**: Replace placeholders with your actual photos

Once you upload these 3 images, your website will be complete with your actual photos!
