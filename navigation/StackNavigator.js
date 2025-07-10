import React, { useContext } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, ActivityIndicator } from 'react-native';
import { Ionicons, Entypo, MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';

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
import EditProfileScreen from '../screens/EditProfileScreen';
import AdditionalInfoScreen from '../screens/AdditionalInfoScreen';
import BlockedUsersScreen from '../screens/BlockedUsersScreen';
import TermsOfUseScreen from '../screens/TermsOfUseScreen';
import PrivacyPolicyScreen from '../screens/PrivacyPolicyScreen';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, typography, shadows } from '../theme/colors';
import { AuthContext } from '../AuthContext';
import CustomTabBar from '../components/CustomTabBar';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

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

  // Bottom Tabs Navigator
  function BottomTabs() {
    return (
      <Tab.Navigator
        screenOptions={() => ({
          tabBarShowLabel: false,
          headerShown: false,
        })}
        tabBar={props => <CustomTabBar {...props} />}
      >
        <Tab.Screen
          name="Home"
          component={HomeScreen}
        />

        <Tab.Screen
          name="Likes"
          component={LikesScreen}
        />
        
        <Tab.Screen
          name="Chat"
          component={ChatScreen}
        />

        <Tab.Screen
          name="Notifications"
          component={NotificationsScreen}
        />

        <Tab.Screen
          name="Profile"
          component={ProfileScreen}
        />
      </Tab.Navigator>
    );
  }

  // Auth Stack for unauthenticated users
  const AuthStack = () => (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Signup" component={SignupScreen} />
      <Stack.Screen name="BasicInfo" component={BasicInfo} />
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
      <Stack.Screen name="AdditionalInfo" component={AdditionalInfoScreen} />
      <Stack.Screen name="Photos" component={PhotoScreen} />
      <Stack.Screen name="Prompts" component={PromptsScreen} />
      <Stack.Screen name="ShowPrompts" component={ShowPromptsScreen} />
      <Stack.Screen name="PreFinal" component={PreFinalScreen} />
      <Stack.Screen name="TermsOfUse" component={TermsOfUseScreen} />
      <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
      <Stack.Screen name="SupportChatRoom" component={SupportChatRoom} />
    </Stack.Navigator>
  );

  // Main Stack for authenticated users
  function MainStack() {
    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen
          name="Main"
          component={BottomTabs}
        />
        <Stack.Screen name="Animation" component={AnimationScreen} />
        <Stack.Screen name="ProfileDetails" component={ProfileDetailsScreen} />
        <Stack.Screen name="EditProfile" component={EditProfileScreen} />
        <Stack.Screen name="SendLike" component={SendLikeScreen} />
        <Stack.Screen name="HandleLike" component={HandleLikeScreen} />
        <Stack.Screen name="ChatRoom" component={ChatRoom} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
        <Stack.Screen name="BlockedUsers" component={BlockedUsersScreen} />
        <Stack.Screen name="TermsOfUse" component={TermsOfUseScreen} />
        <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
        <Stack.Screen name="SupportChatRoom" component={SupportChatRoom} />
      </Stack.Navigator>
    );
  }

  return (
    <>
      {token === null || token === '' ? <AuthStack /> : <MainStack />}
    </>
  );
};

export default StackNavigator;
