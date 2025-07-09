import React, { useContext } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { View, ActivityIndicator } from 'react-native';

// Import screens
import NameScreen from '../screens/NameScreen';
import EmailScreen from '../screens/EmailScreen';
import PasswordScreen from '../screens/PasswordScreen';
import BirthScreen from '../screens/BirthScreen';
import LocationScreen from '../screens/LocationScreen';
import GenderScreen from '../screens/GenderScreen';
import TypeScreen from '../screens/TypeScreen';
import DatingType from '../screens/DatingType';
import LookingFor from '../screens/LookingFor';
import HomeTownScreen from '../screens/HomeTownScreen';
import PhotoScreen from '../screens/PhotoScreen';
import PromptsScreen from '../screens/PromptsScreen';
import PreFinalScreen from '../screens/PreFinalScreen';
import SignupScreen from '../screens/SignupScreen';
import LoginScreen from '../screens/LoginScreen';
import HomeScreen from '../screens/HomeScreen';
import ProfileScreen from '../screens/ProfileScreen';
import ProfileDetailsScreen from '../screens/ProfileDetailsScreen';
import SettingsScreen from '../screens/SettingsScreen';
import ChatScreen from '../screens/ChatScreen';
import ChatRoom from '../screens/ChatRoom';
import LikesScreen from '../screens/LikesScreen';
import SendLikeScreen from '../screens/SendLikeScreen';
import HandleLikeScreen from '../screens/HandleLikeScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import AnimationScreen from '../screens/AnimationScreen';
import BasicInfo from '../screens/BasicInfo';
import ShowPromptsScreen from '../screens/ShowPromptsScreen';
import SupportChatRoom from '../screens/SupportChatRoom';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, typography, shadows } from '../theme/colors';
import { AuthContext } from '../AuthContext';

const Stack = createStackNavigator();

const StackNavigator = () => {
  const { token, isLoading } = useContext(AuthContext);

  // Show loading screen while checking authentication
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <Stack.Navigator
      initialRouteName={token ? "Home" : "Login"}
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: colors.background },
      }}>
      
      {/* Auth Screens - Only show when not logged in */}
      {!token && (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Signup" component={SignupScreen} />
          <Stack.Screen name="BasicInfo" component={BasicInfo} />
        </>
      )}
      
      {/* Registration Flow - Only show when not logged in */}
      {!token && (
        <>
          <Stack.Screen name="Name" component={NameScreen} />
          <Stack.Screen name="Email" component={EmailScreen} />
          <Stack.Screen name="Password" component={PasswordScreen} />
          <Stack.Screen name="Birth" component={BirthScreen} />
          <Stack.Screen name="Location" component={LocationScreen} />
          <Stack.Screen name="Gender" component={GenderScreen} />
          <Stack.Screen name="Type" component={TypeScreen} />
          <Stack.Screen name="Dating" component={DatingType} />
          <Stack.Screen name="LookingFor" component={LookingFor} />
          <Stack.Screen name="Hometown" component={HomeTownScreen} />
          <Stack.Screen name="Photos" component={PhotoScreen} />
          <Stack.Screen name="Prompts" component={PromptsScreen} />
          <Stack.Screen name="PreFinal" component={PreFinalScreen} />
          <Stack.Screen name="ShowPrompts" component={ShowPromptsScreen} />
        </>
      )}
      
      {/* Main App Screens - Only show when logged in */}
      {token && (
        <>
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Profile" component={ProfileScreen} />
          <Stack.Screen name="ProfileDetails" component={ProfileDetailsScreen} />
          <Stack.Screen name="Settings" component={SettingsScreen} />
          <Stack.Screen name="Chat" component={ChatScreen} />
          <Stack.Screen name="ChatRoom" component={ChatRoom} />
          <Stack.Screen name="Likes" component={LikesScreen} />
          <Stack.Screen name="SendLike" component={SendLikeScreen} />
          <Stack.Screen name="HandleLike" component={HandleLikeScreen} />
          <Stack.Screen name="Notifications" component={NotificationsScreen} />
          <Stack.Screen name="Animation" component={AnimationScreen} />
          <Stack.Screen name="SupportChatRoom" component={SupportChatRoom} />
        </>
      )}
      
    </Stack.Navigator>
  );
};

export default StackNavigator;
