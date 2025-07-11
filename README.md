# Lashwa - Dating App

A modern, feature-rich dating application built with React Native (Expo) and Node.js, designed to help users find meaningful connections through an intuitive and engaging interface.

## 📱 Project Overview

Lashwa is a comprehensive dating app that includes user registration, profile management, matching algorithms, real-time chat, location-based features, and an admin dashboard. The app features a vibrant purple and coral color scheme with smooth animations and modern UI components.

## 🏗️ Architecture

### Frontend (React Native/Expo)
- **Framework**: React Native with Expo SDK 53
- **Navigation**: React Navigation v7
- **State Management**: React Context API
- **UI Components**: Custom themed components with consistent design system
- **Maps**: React Native Maps for location features
- **Animations**: Lottie React Native for smooth animations

### Backend (Node.js/Express)
- **Framework**: Express.js v5
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT tokens with bcrypt password hashing
- **Real-time**: Socket.io for live chat and notifications
- **File Upload**: Cloudinary for image storage
- **Email**: Nodemailer for email verification

### Admin Dashboard (React)
- **Framework**: React with Vite
- **UI**: Material-UI components for admin interface
- **Features**: Analytics, user management, support chat monitoring, report management

## 🚀 Quick Start

### Prerequisites
- Node.js >= 18
- npm or yarn
- Expo CLI
- MongoDB database
- Cloudinary account (for image uploads)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd DatingApp
   ```

2. **Install frontend dependencies**
   ```bash
   npm install
   ```

3. **Install backend dependencies**
   ```bash
   cd api
   npm install
   ```

4. **Install admin dashboard dependencies**
   ```bash
   cd admin
   npm install
   ```

### Environment Setup

1. **Create environment files**

   **Backend (.env in api/ folder):**
   ```env
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_email_app_password
   ```

2. **Configure API endpoints**
   
   Update `services/api.js` with your backend URL:
   ```javascript
   const BASE_URL = 'http://your-backend-url:3000';
   ```

### Running the Application

1. **Start the backend server**
   ```bash
   cd api
   npm start
   ```

2. **Start the frontend app**
   ```bash
   npm start
   ```

3. **Start the admin dashboard**
   ```bash
   cd admin
   npm run dev
   ```

## 📁 Project Structure

```
DatingApp/
├── api/                          # Backend server
│   ├── config/                   # Configuration files
│   ├── models/                   # MongoDB schemas
│   └── index.js                  # Main server file
├── admin/                        # Admin dashboard
│   ├── src/
│   │   ├── components/           # Admin UI components
│   │   ├── pages/               # Admin pages
│   │   └── context/             # Admin state management
│   └── package.json
├── screens/                      # Main app screens
│   ├── Authentication/           # Login, signup, password screens
│   ├── Onboarding/              # Registration flow screens
│   ├── Main/                    # Home, profile, chat, settings
│   └── Support/                 # Customer support
├── components/                   # Reusable UI components
├── navigation/                   # Navigation configuration
├── services/                    # API services
├── theme/                       # Design system
├── utils/                       # Utility functions
├── assets/                      # Static assets
├── AuthContext.js               # Authentication context
├── App.js                       # Main app component
└── package.json                 # Dependencies
```

## 🎨 Design System

### Color Palette
- **Primary**: `#A142F4` (Vivid Purple)
- **Accent**: `#FF5F6D` (Vibrant Coral Red)
- **Warm Orange**: `#FFB347`
- **Background**: `#FDF5E6` (Soft Cream)
- **Text Primary**: `#2E2E2E` (Charcoal)

### Typography
- **Font Family**: Poppins (Regular, Medium, SemiBold, Bold, Light)
- **Sizes**: xs (12px), sm (14px), md (16px), lg (18px), xl (24px), xxl (32px)

## 🔧 Key Features

### User Features
- **Profile Management**: Complete profile setup with photos, bio, and preferences
- **Matching System**: Location-based matching with swipe interface
- **Real-time Chat**: Instant messaging with Socket.io
- **Location Services**: GPS-based user discovery
- **Photo Upload**: Cloudinary integration for image storage
- **Push Notifications**: Real-time notifications for matches and messages

### Admin Features
- **User Management**: View, edit, and manage user accounts
- **Analytics Dashboard**: Comprehensive user statistics and insights
- **Report Management**: Handle user reports and violations
- **Support Chat**: Monitor and respond to user support requests
- **Subscription Management**: Manage user subscriptions and payments

## 🛠️ Development

### Code Style
- ESLint configuration for code quality
- Prettier for code formatting
- Consistent component structure
- TypeScript support

### Testing
- Manual testing for user flows
- API endpoint testing
- Component testing as needed

## 📱 Platform Support

- **iOS**: Native iOS app with Expo
- **Android**: Native Android app with Expo
- **Web**: React Native Web support (limited)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is private and proprietary.

## 🆘 Support

For support and questions, please contact the development team.
