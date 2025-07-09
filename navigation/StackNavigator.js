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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, typography, shadows } from '../theme/colors';
import { AuthContext } from '../AuthContext';

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
        })}>
        <Tab.Screen
          name="Home"
          component={HomeScreen}
          options={{
            tabBarStyle: {backgroundColor: '#101010'},
            tabBarLabelStyle: {color: '#008E97'},
            headerShown: false,
            tabBarIcon: ({focused}) =>
              focused ? (
                <MaterialCommunityIcons name="alpha" size={35} color="white" />
              ) : (
                <MaterialCommunityIcons
                  name="alpha"
                  size={35}
                  color="#989898"
                />
              ),
          }}
        />

        <Tab.Screen
          name="Likes"
          component={LikesScreen}
          options={{
            tabBarStyle: {backgroundColor: '#101010'},
            tabBarLabelStyle: {color: '#008E97'},
            headerShown: false,
            tabBarIcon: ({focused}) =>
              focused ? (
                <Entypo name="heart" size={30} color="white" />
              ) : (
                <Entypo name="heart" size={30} color="#989898" />
              ),
          }}
        />
        <Tab.Screen
          name="Chat"
          component={ChatScreen}
          options={{
            tabBarStyle: {backgroundColor: '#101010'},
            tabBarLabelStyle: {color: '#008E97'},
            headerShown: false,
            tabBarIcon: ({focused}) =>
              focused ? (
                <MaterialIcons
                  name="chat-bubble-outline"
                  size={30}
                  color="white"
                />
              ) : (
                <MaterialIcons
                  name="chat-bubble-outline"
                  size={30}
                  color="#989898"
                />
              ),
          }}
        />

        <Tab.Screen
          name="Profile"
          component={ProfileScreen}
          options={{
            tabBarStyle: {backgroundColor: '#101010'},
            tabBarLabelStyle: {color: '#008E97'},
            headerShown: false,
            tabBarIcon: ({focused}) =>
              focused ? (
                <Ionicons
                  name="person-circle-outline"
                  size={30}
                  color="white"
                />
              ) : (
                <Ionicons
                  name="person-circle-outline"
                  size={30}
                  color="#989898"
                />
              ),
          }}
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
      <Stack.Screen name="Photos" component={PhotoScreen} />
      <Stack.Screen name="Prompts" component={PromptsScreen} />
      <Stack.Screen name="ShowPrompts" component={ShowPromptsScreen} />
      <Stack.Screen name="PreFinal" component={PreFinalScreen} />
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
        <Stack.Screen name="SendLike" component={SendLikeScreen} />
        <Stack.Screen name="HandleLike" component={HandleLikeScreen} />
        <Stack.Screen name="ChatRoom" component={ChatRoom} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
        <Stack.Screen name="Notifications" component={NotificationsScreen} />
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
