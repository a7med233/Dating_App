# IP Configuration Guide

## Overview

When you change WiFi networks, your computer's IP address changes. This guide helps you easily update your app's API configuration to work with any network.

## Quick Start

### 1. Find Your Current IP Address

Run this command in your terminal:

```bash
npm run find-ip
```

This will show you all available IP addresses on your computer.

### 2. Update Your App Configuration

Use the IP Configuration screen in your app:

1. Open your app
2. Navigate to the IP Configuration screen
3. Enter your current IP address
4. Save and test the connection

## Manual IP Address Finding

### Windows
1. Open Command Prompt (cmd)
2. Type: `ipconfig`
3. Look for "IPv4 Address" under your WiFi adapter
4. It will look like: `192.168.x.x` or `10.0.x.x`

### Mac
1. Open Terminal
2. Type: `ifconfig | grep "inet " | grep -v 127.0.0.1`
3. Look for your local IP address (usually starts with 192.168 or 10.0)

### Linux
1. Open Terminal
2. Type: `ip addr show | grep "inet " | grep -v 127.0.0.1`
3. Look for your local IP address

## Common IP Address Patterns

- **Home WiFi**: Usually starts with `192.168.1.x` or `192.168.0.x`
- **Mobile Hotspot**: Usually starts with `172.20.10.x`
- **Office Network**: Usually starts with `10.0.x.x`

## Troubleshooting

### Connection Issues

1. **Make sure your API server is running**:
   ```bash
   cd api
   npm start
   ```

2. **Check that both devices are on the same network**:
   - Your phone and computer must be connected to the same WiFi
   - Try disconnecting and reconnecting to the network

3. **Verify your computer's firewall**:
   - Allow connections on port 3000
   - Temporarily disable firewall for testing

4. **Test the connection**:
   - Use the "Test Connection" button in the IP Configuration screen
   - Check the console for error messages

### Common Error Messages

- **"Network error"**: Check your internet connection and IP address
- **"Request timeout"**: Server might not be running or IP is incorrect
- **"Connection refused"**: Firewall blocking the connection

## Advanced Configuration

### Environment Variables

You can set your IP address using an environment variable:

```bash
export API_IP_ADDRESS=192.168.1.100
```

### Programmatic IP Detection

The app now automatically detects and stores your IP address. When you change networks:

1. The app will try to use the stored IP
2. If that fails, it will use the default fallback
3. You can manually update it using the IP Configuration screen

## Files Modified

- `services/api.js` - Updated to use dynamic IP configuration
- `utils/ipConfig.js` - New utility for IP management
- `screens/IPConfigScreen.js` - New screen for IP configuration
- `scripts/find-ip.js` - Script to find current IP addresses

## Best Practices

1. **Always test the connection** after changing networks
2. **Keep your API server running** on the same port (3000)
3. **Use the same network** for both devices
4. **Update IP address** whenever you change WiFi networks
5. **Check firewall settings** if connections fail

## Support

If you're still having issues:

1. Check the console logs for detailed error messages
2. Verify your API server is running and accessible
3. Try using `localhost` if testing on the same device
4. Ensure both devices are on the same network segment 