# TMD cPanel Deployment Guide

## Prerequisites
- TMD cPanel access
- Node.js support enabled on your hosting
- MongoDB Atlas database (already configured)
- Cloudinary account (already configured)

## Step 1: API Deployment

### 1.1 Prepare API Files
1. Create a zip file of your `api` folder (excluding node_modules)
2. Files to include:
   - `index.js`
   - `package.json`
   - `package-lock.json`
   - `models/` folder
   - `config/` folder
   - `services/` folder

### 1.2 Upload to cPanel
1. Login to TMD cPanel
2. Go to File Manager
3. Navigate to your domain folder (e.g., `lashwa.com`)
4. Create a folder called `api`
5. Upload the API files to this folder

### 1.3 Install Dependencies
1. Open Terminal in cPanel (or use SSH)
2. Navigate to your API folder:
   ```bash
   cd public_html/api
   ```
3. Install dependencies:
   ```bash
   npm install --production
   ```

### 1.4 Set Environment Variables
1. Create a `.env` file in your API folder with:
   ```
   JWT_SECRET=your_jwt_secret_here
   MONGODB_URI=your_mongodb_atlas_uri
   CLOUDINARY_CLOUD_NAME=your_cloudinary_name
   CLOUDINARY_API_KEY=your_cloudinary_key
   CLOUDINARY_API_SECRET=your_cloudinary_secret
   GOOGLE_MAPS_API_KEY=your_google_maps_key
   PORT=3000
   NODE_ENV=production
   ```

### 1.5 Start the API
1. Use PM2 to manage the Node.js process:
   ```bash
   npm install -g pm2
   pm2 start index.js --name "lashwa-api"
   pm2 save
   pm2 startup
   ```

## Step 2: Admin Panel Deployment

### 2.1 Build Admin Panel
1. Navigate to admin folder:
   ```bash
   cd admin
   npm install
   npm run build
   ```

### 2.2 Upload Admin Panel
1. Upload the `dist` folder contents to:
   `public_html/admin/`

### 2.3 Configure Admin Panel
1. Update API URLs in the built files to point to your production API
2. Ensure CORS is properly configured

## Step 3: Domain Configuration

### 3.1 API Domain
- Your API will be available at: `https://lashwa.com/api/`
- Update your mobile app to use this URL

### 3.2 Admin Panel Domain
- Your admin panel will be available at: `https://lashwa.com/admin/`

## Step 4: SSL and Security
1. Enable SSL certificate for your domain
2. Configure proper CORS settings
3. Set up proper file permissions

## Step 5: Testing
1. Test API endpoints: `https://lashwa.com/api/test`
2. Test admin panel: `https://lashwa.com/admin/`
3. Test mobile app connectivity

## Troubleshooting
- Check PM2 logs: `pm2 logs lashwa-api`
- Check file permissions
- Verify environment variables
- Test database connectivity 