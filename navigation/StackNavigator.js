import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {ActivityIndicator,  View} from 'react-native';
import HomeScreen from '../screens/HomeScreen';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {NavigationContainer} from '@react-navigation/native';
import { Entypo, Feather, Ionicons, MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import LikesScreen from '../screens/LikesScreen';
import ChatScreen from '../screens/ChatScreen';
import ProfileScreen from '../screens/ProfileScreen';
import BasicInfo from '../screens/BasicInfo';
import NameScreen from '../screens/NameScreen';
import EmailScreen from '../screens/EmailScreen';
import BirthScreen from '../screens/BirthScreen';
import LocationScreen from '../screens/LocationScreen';
import GenderScreen from '../screens/GenderScreen';
import TypeScreen from '../screens/TypeScreen';
import DatingType from '../screens/DatingType';
import AnimationScreen from '../screens/AnimationScreen';
import LookingFor from '../screens/LookingFor';
import HomeTownScreen from '../screens/HomeTownScreen';
import PhotoScreen from '../screens/PhotoScreen';
import PromptsScreen from '../screens/PromptsScreen';
import ShowPromptsScreen from '../screens/ShowPromptsScreen';
import LoginScreen from '../screens/LoginScreen';
import ChatRoom from '../screens/ChatRoom';
import SignupScreen from '../screens/SignupScreen';
import {useContext} from 'react';
import {AuthContext} from '../AuthContext';
import PreFinalScreen from '../screens/PreFinalScreen';
import TestScreen from '../screens/TestScreen';
import ProfileDetailsScreen from '../screens/ProfileDetailsScreen';
import PasswordScreen from '../screens/PasswordScreen';
import SendLikeScreen from '../screens/SendLikeScreen';
import HandleLikeScreen from '../screens/HandleLikeScreen';
import RegistrationProgressBar from '../components/RegistrationProgressBar';
import SettingsScreen from '../screens/SettingsScreen';
import SupportChatRoom from '../screens/SupportChatRoom';
import NotificationsScreen from '../screens/NotificationsScreen';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, typography, shadows } from '../theme/colors';

// Create wrapper components to avoid inline functions
const NameScreenWrapper = (props) => (
  <>
    <RegistrationProgressBar step={1} total={13} />
    <NameScreen {...props} />
  </>
);

const EmailScreenWrapper = (props) => (
  <>
    <RegistrationProgressBar step={2} total={13} />
    <EmailScreen {...props} />
  </>
);

const PasswordScreenWrapper = (props) => (
  <>
    <RegistrationProgressBar step={3} total={13} />
    <PasswordScreen {...props} />
  </>
);

const BirthScreenWrapper = (props) => (
  <>
    <RegistrationProgressBar step={4} total={13} />
    <BirthScreen {...props} />
  </>
);

const LocationScreenWrapper = (props) => (
  <>
    <RegistrationProgressBar step={5} total={13} />
    <LocationScreen {...props} />
  </>
);

const GenderScreenWrapper = (props) => (
  <>
    <RegistrationProgressBar step={6} total={13} />
    <GenderScreen {...props} />
  </>
);

const TypeScreenWrapper = (props) => (
  <>
    <RegistrationProgressBar step={7} total={13} />
    <TypeScreen {...props} />
  </>
);

const DatingTypeWrapper = (props) => (
  <>
    <RegistrationProgressBar step={8} total={13} />
    <DatingType {...props} />
  </>
);

const LookingForWrapper = (props) => (
  <>
    <RegistrationProgressBar step={9} total={13} />
    <LookingFor {...props} />
  </>
);

const HomeTownScreenWrapper = (props) => (
  <>
    <RegistrationProgressBar step={10} total={13} />
    <HomeTownScreen {...props} />
  </>
);

const PhotoScreenWrapper = (props) => (
  <>
    <RegistrationProgressBar step={11} total={13} />
    <PhotoScreen {...props} />
  </>
);

const PromptsScreenWrapper = (props) => (
  <>
    <RegistrationProgressBar step={12} total={13} />
    <PromptsScreen {...props} />
  </>
);

const StackNavigator = () => {
  const Stack = createNativeStackNavigator();
  const Tab = createBottomTabNavigator();
  const {isLoading, token} = useContext(AuthContext);
  // Ensure token is properly initialized
  console.log('token:', token);

  if(isLoading){
    return (
      <View style={{flex:1,justifyContent:"center",alignItems:"center"}}>
        <ActivityIndicator size={"large"}/>
      </View>
    )
  }

  // Check if token is null or empty
  console.log('Is token null or empty?', token === null || token === '');

  function BottomTabs() {
    const insets = useSafeAreaInsets();
    
    return (
      <Tab.Navigator
        screenOptions={() => ({
          tabBarShowLabel: false,
          tabBarStyle: {
            backgroundColor: colors.navBackground,
            height: 60 + insets.bottom,
            paddingBottom: insets.bottom,
            paddingTop: 10,
            borderTopWidth: 0,
            ...shadows.medium,
          },
        })}>
        <Tab.Screen
          name="Home"
          component={HomeScreen}
          options={{
            tabBarLabelStyle: {color: colors.navActive},
            headerShown: false,
            tabBarIcon: ({focused}) =>
              focused ? (
                <MaterialCommunityIcons name="alpha" size={35} color={colors.primary} />
              ) : (
                <MaterialCommunityIcons
                  name="alpha"
                  size={35}
                  color={colors.navInactive}
                />
              ),
          }}
        />

        <Tab.Screen
          name="Likes"
          component={LikesScreen}
          options={{
            tabBarLabelStyle: {color: colors.navActive},
            headerShown:false,
            tabBarIcon: ({focused}) =>
              focused ? (
                <Entypo name="heart" size={30} color={colors.accent} />
              ) : (
                <Entypo name="heart" size={30} color={colors.navInactive} />
              ),
          }}
        />
        <Tab.Screen
          name="Chat"
          component={ChatScreen}
          options={{
            tabBarLabelStyle: {color: colors.navActive},
            headerShown:false,
            tabBarIcon: ({focused}) =>
              focused ? (
                <MaterialIcons
                  name="chat-bubble-outline"
                  size={30}
                  color={colors.primary}
                />
              ) : (
                <MaterialIcons
                  name="chat-bubble-outline"
                  size={30}
                  color={colors.navInactive}
                />
              ),
          }}
        />

        <Tab.Screen
          name="Notifications"
          component={NotificationsScreen}
          options={{
            tabBarLabelStyle: {color: colors.navActive},
            headerShown:false,
            tabBarIcon: ({focused}) =>
              focused ? (
                <Ionicons
                  name="notifications"
                  size={30}
                  color={colors.warmOrange}
                />
              ) : (
                <Ionicons
                  name="notifications-outline"
                  size={30}
                  color={colors.navInactive}
                />
              ),
          }}
        />

        <Tab.Screen
          name="Profile"
          component={ProfileScreen}
          options={{
            tabBarLabelStyle: {color: colors.navActive},
            headerShown:false,
            tabBarIcon: ({focused}) =>
              focused ? (
                <Ionicons
                  name="person-circle-outline"
                  size={30}
                  color={colors.primary}
                />
              ) : (
                <Ionicons
                  name="person-circle-outline"
                  size={30}
                  color={colors.navInactive}
                />
              ),
          }}
        />
      </Tab.Navigator>
    );
  }

  // New: Stack for tabs + settings
  function TabsWithSettingsStack() {
    return (
      <Stack.Navigator>
        <Stack.Screen name="MainTabs" component={BottomTabs} options={{ headerShown: false }} />
        <Stack.Screen name="Settings" component={SettingsScreen} options={{ headerShown: false }} />
      </Stack.Navigator>
    );
  }

  const AuthStack = () => (
    <Stack.Navigator>
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="Basic"
        component={BasicInfo}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="Name"
        component={NameScreenWrapper}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="Email"
        component={EmailScreenWrapper}
        options={{headerShown: false}}
      />
        <Stack.Screen
        name="Password"
        component={PasswordScreenWrapper}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="Birth"
        component={BirthScreenWrapper}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="Location"
        component={LocationScreenWrapper}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="Gender"
        component={GenderScreenWrapper}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="Type"
        component={TypeScreenWrapper}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="Dating"
        component={DatingTypeWrapper}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="LookingFor"
        component={LookingForWrapper}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="Hometown"
        component={HomeTownScreenWrapper}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="Photos"
        component={PhotoScreenWrapper}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="Prompts"
        component={PromptsScreenWrapper}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="ShowPrompts"
        component={ShowPromptsScreen}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="PreFinal"
        component={PreFinalScreen}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="SupportChatRoom"
        component={SupportChatRoom}
        options={{ title: 'Support Chat' }}
      />
      {/* <Stack.Screen
        name="Main"
        component={BottomTabs}
        options={{headerShown: false}}
      /> */}
      {/* Other authentication screens */}
    </Stack.Navigator>
  );
 
  function MainStack() {
    return (
      <Stack.Navigator>
        <Stack.Screen
          name="TabsWithSettings"
          component={TabsWithSettingsStack}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="Animation"
          component={AnimationScreen}
          options={{headerShown: false}}
        />
         <Stack.Screen
          name="Details"
          component={ProfileDetailsScreen}
          options={{headerShown: false}}
        />
         <Stack.Screen
          name="SendLike"
          component={SendLikeScreen}
          options={{headerShown: false}}
        />
           <Stack.Screen
          name="HandleLike"
          component={HandleLikeScreen}
          options={{headerShown: false}}
        />
          <Stack.Screen
          name="ChatRoom"
          component={ChatRoom}
        />
        <Stack.Screen
          name="SupportChatRoom"
          component={SupportChatRoom}
          options={{ title: 'Support Chat' }}
        />
      </Stack.Navigator>
    );
  }
  //   const MainStack = () => (
  //     <Stack.Navigator>
  //       <Stack.Screen
  //         name="Main"
  //         component={BottomTabs}
  //         options={{headerShown: false}}
  //       />
  //     </Stack.Navigator>
  //   );

  return token === null || token === '' ? <AuthStack /> : <MainStack />;
};

export default StackNavigator;
