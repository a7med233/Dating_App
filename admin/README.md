# Lashwa Admin Panel

A comprehensive admin dashboard for managing the Lashwa dating app, built with React, Material-UI, and Vite.

## Features

- **User Management**: View, search, filter, and manage all users
- **Report Management**: Handle user reports with status updates and admin notes
- **Analytics Dashboard**: Comprehensive analytics and statistics
- **Real-time Data**: Live updates and refresh capabilities
- **Responsive Design**: Works on desktop and mobile devices
- **Role-based Access**: Different permissions for admins and moderators

## Prerequisites

- Node.js 18.0.0 or higher
- npm 8.0.0 or higher
- Access to the Lashwa API backend

## Installation

1. **Clone the repository** (if not already done):
   ```bash
   cd admin
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   Create a `.env` file in the admin directory:
   ```env
   # API Configuration
   VITE_API_BASE_URL=https://lashwa.com/api
   VITE_API_TIMEOUT=30000

   # App Configuration
   VITE_APP_NAME=Lashwa Admin Panel
   VITE_APP_VERSION=1.0.0

   # Feature Flags
   VITE_ENABLE_ANALYTICS=true
   VITE_ENABLE_NOTIFICATIONS=true
   VITE_ENABLE_REPORTS=true

   # Development/Production Mode
   VITE_NODE_ENV=development
   ```

   **Note**: The API is now configured to use the production domain. For local development, you can override this in `env.local`.

## Development

### Start Development Server
```bash
npm run dev
```

The admin panel will be available at `http://localhost:3001`

### Build for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

### Linting
```bash
# Check for linting issues
npm run lint

# Fix linting issues automatically
npm run lint:fix
```

## Deployment

### Local Production Build
```bash
npm run deploy
```

### Deploy to Hosting Services

#### Vercel
1. Install Vercel CLI: `npm i -g vercel`
2. Deploy: `vercel`

#### Netlify
1. Build the project: `npm run build`
2. Upload the `dist` folder to Netlify

#### Heroku
1. Add a `static.json` file in the root:
   ```json
   {
     "root": "dist",
     "routes": {
       "/**": "index.html"
     }
   }
   ```
2. Deploy using Heroku CLI

### Environment Variables for Production

Update your `.env` file with production values:
```env
VITE_API_BASE_URL=https://your-api-domain.com
VITE_NODE_ENV=production
```

## API Configuration

The admin panel communicates with the Lashwa API backend. Make sure the following endpoints are available:

### Authentication
- `POST /admin/login` - Admin login
- `GET /admin/me` - Get current admin info

### Users
- `GET /admin/users` - Get all users
- `GET /admin/users/:id` - Get user details
- `DELETE /admin/users/:id` - Delete user
- `PATCH /admin/users/:id/ban` - Ban/unban user
- `GET /admin/users/:id/matches` - Get user matches
- `GET /admin/users/:id/messages` - Get user messages
- `GET /admin/users/:id/reports` - Get user reports

### Reports
- `GET /admin/reports` - Get all reports
- `GET /admin/reports/:id` - Get report details
- `PATCH /admin/reports/:id` - Update report status
- `GET /admin/reports/stats` - Get report statistics

### Analytics
- `GET /admin/analytics` - Get analytics data
- `GET /admin/stats` - Get general statistics

## Project Structure

```
admin/
├── src/
│   ├── components/          # Reusable UI components
│   ├── context/            # React context providers
│   ├── pages/              # Page components
│   ├── config/             # Configuration files
│   ├── App.jsx             # Main app component
│   └── main.jsx            # App entry point
├── public/                 # Static assets
├── dist/                   # Production build output
├── package.json            # Dependencies and scripts
├── vite.config.js          # Vite configuration
└── README.md               # This file
```

## Features Overview

### Dashboard
- Real-time statistics
- User activity metrics
- Report summaries
- System health status

### User Management
- Search and filter users
- View detailed user profiles
- Ban/unban users
- View user matches and messages
- Delete users (admin only)

### Report Management
- View all user reports
- Filter by status and reason
- Update report status
- Add admin notes
- View reporter and reported user details

### Analytics
- User demographics
- Activity metrics
- Safety statistics
- System health monitoring

## Security

- JWT-based authentication
- Role-based access control
- Secure API communication
- Environment variable protection

## Troubleshooting

### Common Issues

1. **API Connection Error**
   - Check if the backend server is running on port 3000
   - Verify the `VITE_API_BASE_URL` in your `.env` file matches your current IP
   - Ensure CORS is properly configured on the backend
   - Make sure both devices are on the same WiFi network

2. **IP Address Changes**
   - If your WiFi IP changes, update the `VITE_API_BASE_URL` in your `.env` file
   - Current API: `https://lashwa.com/api`
   - Check your IP with: `ipconfig` (Windows) or `ifconfig` (Mac/Linux)

3. **Build Errors**
   - Clear node_modules and reinstall: `rm -rf node_modules && npm install`
   - Check for syntax errors in your code
   - Verify all dependencies are installed

4. **Authentication Issues**
   - Clear browser storage
   - Check if the JWT token is valid
   - Verify admin credentials

### Support

For issues and questions:
1. Check the browser console for error messages
2. Verify your environment configuration
3. Ensure the backend API is accessible at `https://lashwa.com/api`
4. Check the network tab for failed requests

## Contributing

1. Follow the existing code style
2. Add proper error handling
3. Test your changes thoroughly
4. Update documentation as needed

## License

This project is part of the Lashwa dating app ecosystem.
