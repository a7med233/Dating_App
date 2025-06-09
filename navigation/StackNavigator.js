import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '../screens/HomeScreen';
import ProfileScreen from '../screens/ProfileScreen';
import LikesScreen from '../screens/LikesScreen';
import ChatScreen from '../screens/ChatScreen';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Entypo from 'react-native-vector-icons/Entypo';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { NavigationContainer } from '@react-navigation/native';


const StackNavigator = () => {
    const Stack = createNativeStackNavigator();
    const Tab = createBottomTabNavigator();

    function BottomTabs() {
        return (
            <Tab.Navigator 
                screenOptions={{
                    tabBarShowLabel: false,
                }}>
                <Tab.Screen
                    name="Home"
                    component={HomeScreen}
                    options={{
                        tabBarStyle: { backgroundColor: "#101010" },
                        headerShown: false,
                        tabBarIcon: ({ focused }) =>

                            focused ? (
                                <MaterialCommunityIcons name="alpha" size={35} color="white" />
                            ) : (
                                <MaterialCommunityIcons name="alpha" size={35} color="#989898" />

                            )
                    }}
                />
                <Tab.Screen
                    name="Likes"
                    component={LikesScreen}
                    options={{
                        tabBarStyle: { backgroundColor: "#101010" },
                        headerShown: false,
                        tabBarIcon: ({ focused }) =>

                            focused ? (
                                <Entypo name="heart" size={30} color="white" />
                            ) : (
                                <Entypo name="heart" size={30} color="#989898" />
                            )
                    }}
                />
                <Tab.Screen
                    name="Chat"
                    component={ChatScreen}
                    options={{
                        tabBarStyle: { backgroundColor: "#101010" },
                        headerShown: false,
                        tabBarIcon: ({ focused }) =>

                            focused ? (
                                <MaterialIcons name="chat-bubble-outline" size={30} color="white" />
                            ) : (
                                <MaterialIcons name="chat-bubble-outline" size={30} color="#989898" />
                            )
                    }}
                />
                <Tab.Screen
                    name="Profile"
                    component={ProfileScreen}
                    options={{
                        tabBarStyle: { backgroundColor: "#101010" },
                        headerShown: false,
                        tabBarIcon: ({ focused }) =>

                            focused ? (
                                <Ionicons name="person-circle-outline" size={30} color="white" />
                            ) : (
                                <Ionicons name="person-circle-outline" size={30} color="#989898" />
                            )
                    }}
                />

            </Tab.Navigator>
        );
    }

    function MainStack() {
        return (
            <Stack.Navigator>
                <Stack.Screen
                    name="Main"
                    component={BottomTabs}
                    options={{ headerShown: false }}
                />
                {/*<Stack.Screen
                    name="Profile"
                    component={ProfileScreen}
                    options={{ headerShown: false }}
                />
                <Stack.Screen
                    name="Likes"
                    component={LikesScreen}
                    options={{ headerShown: false }}
                />
                <Stack.Screen
                    name="Chat"
                    component={ChatScreen}
                    options={{ headerShown: false }}
                />*/}
            </Stack.Navigator>
        );
    }
    return (
        <NavigationContainer>
            <MainStack />
        </NavigationContainer>
    )
}

export default StackNavigator

const styles = StyleSheet.create({})