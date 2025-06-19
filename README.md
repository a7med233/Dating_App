# DatingApp

A modern, full-stack dating app built with **React Native** (frontend) and **Node.js/Express/MongoDB** (backend).  
This app provides a smooth, secure, and engaging dating experience, inspired by leading platforms.

---

## Features

- **User Registration & Login**  
  Secure sign-up and authentication with real-time validation and feedback.

- **Profile Creation & Editing**  
  Users can add personal info, preferences, and upload multiple photos from their device.

- **Photo Upload**  
  Upload photos directly from your device gallery.

- **Prompts & Personality**  
  Answer fun prompts to showcase your personality.

- **Matching & Likes**  
  Like profiles, see who liked you, and get matched with compatible users.

- **Chat & Messaging**  
  Real-time chat with your matches.

- **Filters & Discovery**  
  Filter profiles by compatibility, activity, and new users.

- **Security**  
  Passwords are hashed, JWT authentication, and sensitive data is never stored in git.

- **Responsive UI**  
  Modern, reusable components and smooth navigation.

---

## Getting Started

### Prerequisites

- Node.js & npm
- React Native CLI
- Android Studio or Xcode (for emulators/simulators)
- MongoDB (local or Atlas)

### 1. Clone the Repository

```sh
git clone https://github.com/yourusername/DatingApp.git
cd DatingApp
```

### 2. Install Dependencies

```sh
npm install
cd api
npm install
```

### 3. Set Up Environment Variables

Create a `.env` file in `/api` with your secrets:

```
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
```

### 4. Start the Backend

```sh
cd api
npm start
```

### 5. Start the Frontend

```sh
# In the project root
npm start
# Then run on Android or iOS
npm run android
# or
npm run ios
```

---

## Folder Structure

```
DatingApp/
  api/                # Node.js/Express backend
  components/         # Reusable React Native components
  screens/            # App screens (registration, profile, chat, etc.)
  services/           # API service helpers
  navigation/         # Navigation setup
  assets/             # Images, animations, etc.
```

---

## Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

---

## License

[MIT](LICENSE)

---

## Acknowledgements

- [React Native](https://reactnative.dev/)
- [Express](https://expressjs.com/)
- [MongoDB](https://www.mongodb.com/)
- [react-native-image-picker](https://github.com/react-native-image-picker/react-native-image-picker)
