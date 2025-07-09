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
- **UI**: Custom admin interface for user management
- **Features**: Analytics, user management, support chat monitoring

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
│   │   ├── cloudinary-config.js  # Cloudinary setup
│   │   └── cloudinary.js         # Image upload utilities
│   ├── models/                   # MongoDB schemas
│   │   ├── user.js              # User model
│   │   ├── message.js           # Chat message model
│   │   ├── supportChat.js       # Support chat model
│   │   └── admin.js             # Admin model
│   ├── services/                # Business logic
│   │   └── imageModeration.js   # Image moderation service
│   └── index.js                 # Main server file
├── admin/                       # Admin dashboard
│   ├── src/
│   │   ├── components/          # Admin UI components
│   │   ├── pages/              # Admin pages
│   │   └── context/            # Admin state management
│   └── package.json
├── screens/                     # Main app screens
│   ├── Authentication/
│   │   ├── LoginScreen.js      # User login
│   │   ├── SignupScreen.js     # User registration
│   │   └── PasswordScreen.js   # Password setup
│   ├── Onboarding/
│   │   ├── BasicInfo.js        # Welcome screen
│   │   ├── NameScreen.js       # Name input
│   │   ├── EmailScreen.js      # Email input
│   │   ├── BirthScreen.js      # Date of birth
│   │   ├── GenderScreen.js     # Gender selection
│   │   ├── DatingType.js       # Dating preferences
│   │   ├── LookingFor.js       # Relationship goals
│   │   ├── LocationScreen.js   # Location setup
│   │   ├── PhotoScreen.js      # Photo upload
│   │   ├── PromptsScreen.js    # Profile prompts
│   │   └── PreFinalScreen.js   # Final setup
│   ├── Main/
│   │   ├── HomeScreen.js       # Main discovery screen
│   │   ├── ProfileScreen.js    # User profile
│   │   ├── ChatScreen.js       # Chat list
│   │   ├── ChatRoom.js         # Individual chat
│   │   ├── LikesScreen.js      # Received likes
│   │   └── SettingsScreen.js   # App settings
│   └── Support/
│       └── SupportChatRoom.js  # Customer support
├── components/                  # Reusable UI components
│   ├── SafeAreaWrapper.js      # Safe area handling
│   ├── GradientButton.js       # Themed button component
│   ├── ThemedCard.js           # Card component
│   ├── CustomButton.js         # Custom button
│   ├── InputField.js           # Input component
│   ├── LoadingSpinner.js       # Loading indicator
│   ├── NotificationBadge.js    # Notification badge
│   ├── NotificationCenter.js   # Notification panel
│   ├── OnboardingTutorial.js   # App tutorial
│   ├── ProfileCard.js          # Profile display
│   ├── SkeletonLoader.js       # Loading skeleton
│   ├── Toast.js                # Toast notifications
│   ├── UserChat.js             # Chat component
│   ├── DraggablePhotoGrid.js   # Photo management
│   ├── ErrorMessage.js         # Error display
│   └── RegistrationProgressBar.js # Progress indicator
├── navigation/                  # Navigation configuration
│   └── StackNavigator.js       # Main navigation stack
├── services/                   # API services
│   ├── api.js                  # API client
│   └── notificationService.js  # Push notifications
├── theme/                      # Design system
│   └── colors.js               # Colors, typography, spacing
├── utils/                      # Utility functions
│   ├── imageUtils.js           # Image processing
│   └── registrationUtils.js    # Registration helpers
├── assets/                     # Static assets
│   ├── images/                 # App images
│   └── animations/             # Lottie animations
├── AuthContext.js              # Authentication context
├── App.js                      # Main app component
└── package.json                # Dependencies
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
- **Font Sizes**: 12px to 40px (xs to display)

### Spacing
- **Scale**: 4px, 8px, 16px, 24px, 32px, 48px
- **Border Radius**: 8px, 12px, 16px, 24px, 50px

### Components
- **GradientButton**: Primary action buttons with gradients
- **ThemedCard**: Consistent card styling
- **SafeAreaWrapper**: Safe area handling for all screens

## 🔐 Authentication Flow

1. **Registration Process**:
   - Basic info → Name → Email → Password → Birth date
   - Gender → Dating type → Looking for → Location → Photos → Prompts
   - Email verification and profile completion

2. **Login Process**:
   - Email/password authentication
   - JWT token generation and storage
   - Automatic token refresh

3. **Security Features**:
   - Password hashing with bcrypt
   - JWT token authentication
   - Secure image upload with Cloudinary
   - Input validation and sanitization

## 💬 Chat System

### Features
- Real-time messaging with Socket.io
- Message history persistence
- Typing indicators
- Message status (sent, delivered, read)
- Image sharing in chats
- Support chat integration

### Implementation
- **Frontend**: React Native with Socket.io client
- **Backend**: Socket.io server with MongoDB storage
- **Real-time**: Live message delivery and notifications

## 📍 Location Features

### Implementation
- **Maps**: React Native Maps integration
- **Location Services**: Expo Location for GPS
- **Search**: Google Places API for location search
- **Privacy**: User consent and location permissions

### Features
- Location-based matching
- Distance calculation
- Location search and selection
- Privacy controls

## 🖼️ Image Management

### Features
- **Photo Upload**: Cloudinary integration
- **Drag & Drop**: Custom photo grid with reordering
- **Image Moderation**: AI-powered content filtering
- **Optimization**: Automatic image compression and resizing

### Implementation
- **Frontend**: Expo Image Picker with custom UI
- **Backend**: Cloudinary upload with moderation
- **Storage**: Cloudinary CDN for fast delivery

## 🔔 Notification System

### Types
- **Match Notifications**: New matches and likes
- **Chat Notifications**: New messages and typing indicators
- **System Notifications**: App updates and announcements
- **Support Notifications**: Customer service updates

### Implementation
- **Frontend**: Custom notification center
- **Backend**: In-memory notification store (Redis recommended for production)
- **Real-time**: Socket.io for instant delivery

## 👨‍💼 Admin Dashboard

### Features
- **User Management**: View, edit, and manage user accounts
- **Analytics**: User statistics and app metrics
- **Support Chat**: Monitor and respond to customer support
- **Content Moderation**: Review and moderate user content
- **System Settings**: App configuration and maintenance

### Access
- Admin authentication with role-based permissions
- Secure admin routes with JWT verification
- Real-time dashboard updates

## 🧪 Testing

### Frontend Testing
```bash
npm test
```

### Backend Testing
```bash
cd api
npm test
```

## 📱 Platform Support

### Mobile
- **iOS**: iOS 13+ with Expo SDK 53
- **Android**: Android 6+ (API level 23+)

### Development
- **Expo CLI**: Latest version
- **React Native**: 0.79.5
- **Node.js**: >= 18

## 🚀 Deployment

### Frontend (Expo)
1. **Build for production**:
   ```bash
   expo build:android
   expo build:ios
   ```

2. **Publish to Expo**:
   ```bash
   expo publish
   ```

### Backend (Node.js)
1. **Environment setup**:
   - Set production environment variables
   - Configure MongoDB Atlas
   - Set up Cloudinary production account

2. **Deploy to server**:
   ```bash
   cd api
   npm install --production
   npm start
   ```

### Admin Dashboard (Vite)
1. **Build for production**:
   ```bash
   cd admin
   npm run build
   ```

2. **Deploy to hosting service** (Netlify, Vercel, etc.)

## 🔧 Configuration

### API Configuration
- **Base URL**: Configure in `services/api.js`
- **Socket URL**: Configure in chat components
- **Image Upload**: Configure Cloudinary settings

### Navigation Configuration
- **Stack Navigator**: Configure in `navigation/StackNavigator.js`
- **Tab Navigator**: Configure bottom tabs
- **Deep Linking**: Configure app linking

### Theme Configuration
- **Colors**: Modify `theme/colors.js`
- **Typography**: Update font families and sizes
- **Spacing**: Adjust spacing scale

## 🐛 Troubleshooting

### Common Issues

1. **Metro bundler issues**:
   ```bash
   npx expo start --clear
   ```

2. **Dependencies conflicts**:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

3. **iOS build issues**:
   ```bash
   cd ios && pod install
   ```

4. **Android build issues**:
   ```bash
   cd android && ./gradlew clean
   ```

### Debug Mode
- Enable React Native Debugger
- Use Expo DevTools
- Check Metro bundler logs

## 📚 API Documentation

### Authentication Endpoints
- `POST /register` - User registration
- `POST /login` - User login
- `GET /user` - Get user profile
- `PUT /user` - Update user profile

### Matching Endpoints
- `GET /matches` - Get user matches
- `POST /like` - Like a user
- `POST /pass` - Pass on a user
- `GET /likes/received` - Get received likes

### Chat Endpoints
- `GET /chats` - Get user chats
- `GET /chats/:chatId/messages` - Get chat messages
- `POST /chats/:chatId/messages` - Send message

### Image Endpoints
- `POST /upload/image` - Upload image
- `DELETE /upload/image` - Delete image

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the troubleshooting section

## 🔄 Version History

- **v1.0.0**: Initial release with core features
- **v1.1.0**: Added admin dashboard
- **v1.2.0**: Enhanced chat system
- **v1.3.0**: Improved UI/UX and performance

---

**Note**: This documentation is maintained by the development team. For the most up-to-date information, always refer to the latest commit and release notes.
