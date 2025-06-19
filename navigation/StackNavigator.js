import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {ActivityIndicator,  View} from 'react-native';
import HomeScreen from '../screens/HomeScreen';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {NavigationContainer} from '@react-navigation/native';
import Entypo from 'react-native-vector-icons/Entypo';
import Feather from 'react-native-vector-icons/Feather';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
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
            headerShown:false,
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
            headerShown:false,
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
            headerShown:false,
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
        component={props => <><RegistrationProgressBar step={1} total={13} /><NameScreen {...props} /></>}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="Email"
        component={props => <><RegistrationProgressBar step={2} total={13} /><EmailScreen {...props} /></>}
        options={{headerShown: false}}
      />
        <Stack.Screen
        name="Password"
        component={props => <><RegistrationProgressBar step={3} total={13} /><PasswordScreen {...props} /></>}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="Birth"
        component={props => <><RegistrationProgressBar step={4} total={13} /><BirthScreen {...props} /></>}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="Location"
        component={props => <><RegistrationProgressBar step={5} total={13} /><LocationScreen {...props} /></>}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="Gender"
        component={props => <><RegistrationProgressBar step={6} total={13} /><GenderScreen {...props} /></>}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="Type"
        component={props => <><RegistrationProgressBar step={7} total={13} /><TypeScreen {...props} /></>}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="Dating"
        component={props => <><RegistrationProgressBar step={8} total={13} /><DatingType {...props} /></>}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="LookingFor"
        component={props => <><RegistrationProgressBar step={9} total={13} /><LookingFor {...props} /></>}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="Hometown"
        component={props => <><RegistrationProgressBar step={10} total={13} /><HomeTownScreen {...props} /></>}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="Photos"
        component={props => <><RegistrationProgressBar step={11} total={13} /><PhotoScreen {...props} /></>}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="Prompts"
        component={props => <><RegistrationProgressBar step={12} total={13} /><PromptsScreen {...props} /></>}
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
        name="Settings"
        component={SettingsScreen}
        options={{headerShown: false}}
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
          name="Main"
          component={BottomTabs}
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
