import 'dotenv/config';

export default {
  expo: {
    name: "lashwa",
    slug: "lashwa",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    splash: {
      image: "./assets/splash.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },
    assetBundlePatterns: ["**/*"],
    owner: "lashwa",
    extra: {
      eas: {
        projectId: "cce286b8-fc8c-41bf-9441-c75aa00316c1"
      }
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.lashwa.app",
      config: {
        googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY
      },
      infoPlist: {
        NSLocationWhenInUseUsageDescription: "This app needs access to location to show your current location on the map and help you set your location for dating preferences.",
        NSLocationAlwaysAndWhenInUseUsageDescription: "This app needs access to location to show your current location on the map and help you set your location for dating preferences.",
        NSPhotoLibraryUsageDescription: "This app needs access to your photo library to select profile pictures.",
        NSCameraUsageDescription: "This app needs access to your camera to take profile pictures."
      }
    },
    android: {
      package: "com.lashwa.app",
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#ffffff"
      },
      permissions: [
        "android.permission.INTERNET",
        "android.permission.ACCESS_FINE_LOCATION",
        "android.permission.ACCESS_COARSE_LOCATION",
        "android.permission.CAMERA",
        "android.permission.READ_EXTERNAL_STORAGE",
        "android.permission.WRITE_EXTERNAL_STORAGE"
      ],
      config: {
        googleMaps: {
          apiKey: process.env.GOOGLE_MAPS_API_KEY
        }
      }
    },
    web: {
      favicon: "./assets/favicon.png"
    },
    plugins: [
      [
        "expo-location",
        {
          locationAlwaysAndWhenInUsePermission: "Allow $(PRODUCT_NAME) to use your location."
        }
      ],
      [
        "expo-image-picker",
        {
          photosPermission: "The app accesses your photos to let you share them with your friends."
        }
      ]
    ]
  }
};
