# API Connection Troubleshooting Guide

## Email Screen Error: "Error checking email. Please try again"

### Quick Fixes

1. **Ensure Backend Server is Running**
   ```bash
   cd api
   npm start
   ```
   You should see: "Server is running on 3000"

2. **Check Server Status**
   - Open browser and go to: `http://localhost:3000`
   - Or test with: `curl http://localhost:3000/check-email`

3. **Test API Connection**
   - In the Email Screen, tap the "Test API Connection" button
   - Check the console logs for detailed error information

### Platform-Specific Issues

#### Android
- **Emulator**: Uses `http://10.0.2.2:3000`
- **Physical Device**: May need to use your computer's IP address
- **Solution**: Update `services/api.js` to use your computer's IP if testing on physical device

#### iOS
- **Simulator**: Uses `http://localhost:3000`
- **Physical Device**: May need to use your computer's IP address
- **Solution**: Update `services/api.js` to use your computer's IP if testing on physical device

### Network Configuration

#### For Physical Devices
If testing on a physical device, update the API base URL in `services/api.js`:

```javascript
const getApiBaseUrl = () => {
  if (Platform.OS === 'android') {
    // Replace with your computer's IP address
    return 'http://192.168.1.XXX:3000'; // Your computer's IP
  } else if (Platform.OS === 'ios') {
    // Replace with your computer's IP address
    return 'http://192.168.1.XXX:3000'; // Your computer's IP
  } else {
    return 'http://localhost:3000';
  }
};
```

#### Find Your Computer's IP Address
- **Windows**: Run `ipconfig` in Command Prompt
- **Mac/Linux**: Run `ifconfig` in Terminal
- Look for your local IP (usually starts with 192.168.x.x or 10.0.x.x)

### Common Issues and Solutions

1. **"Network error" message**
   - Check if backend server is running
   - Verify firewall settings
   - Ensure device and computer are on same network

2. **"Request timeout" message**
   - Increase timeout in `services/api.js`
   - Check network connection
   - Restart backend server

3. **"Invalid request" message**
   - Check email format validation
   - Verify API endpoint is correct

### Debug Steps

1. **Check Console Logs**
   - Look for API connection logs
   - Check for error details

2. **Test Backend Directly**
   ```bash
   curl -X POST http://localhost:3000/check-email \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com"}'
   ```

3. **Verify Database Connection**
   - Check MongoDB connection in backend logs
   - Ensure `.env` file has correct MongoDB URI

### Environment Variables

Create a `.env` file in the `api` directory:
```
MONGODB_URI=mongodb+srv://your_username:your_password@your_cluster.mongodb.net/
JWT_SECRET=your_jwt_secret_here
```

### Still Having Issues?

1. Check the React Native Metro bundler console for errors
2. Verify all dependencies are installed: `npm install`
3. Clear React Native cache: `npx react-native start --reset-cache`
4. Restart the development server and app 