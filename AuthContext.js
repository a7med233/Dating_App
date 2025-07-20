import { createContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { jwtDecode } from "jwt-decode";
import { getAccountStatus } from "./services/api";
import { AppState } from "react-native";

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const isLoggedIn = async () => {
        try {
            setIsLoading(true);
            const userToken = await AsyncStorage.getItem('token');
            const keepLoggedIn = await AsyncStorage.getItem('keepLoggedIn');
            const sessionExpiry = await AsyncStorage.getItem('sessionExpiry');
            
            if (userToken) {
                // Check if session has expired (if keep logged in is false)
                if (keepLoggedIn === 'false' && sessionExpiry) {
                    const expiryDate = new Date(sessionExpiry);
                    const now = new Date();
                    
                    if (now > expiryDate) {
                        // Session has expired, clear all auth data
                        console.log('Session expired, clearing auth data');
                        await AsyncStorage.multiRemove(['token', 'keepLoggedIn', 'sessionExpiry']);
                        setToken(null);
                        return;
                    }
                }
                
                // For now, just set the token without checking account status
                // This will be added back later once we confirm the app loads
                setToken(userToken);
            } else {
                setToken(null);
            }
        } catch (error) {
            console.log('Error checking login status:', error);
            setToken(null);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        isLoggedIn();
    }, []); // Remove token dependency to avoid infinite re-renders

    const checkSessionExpiry = async () => {
        try {
            const keepLoggedIn = await AsyncStorage.getItem('keepLoggedIn');
            const sessionExpiry = await AsyncStorage.getItem('sessionExpiry');
            
            if (keepLoggedIn === 'false' && sessionExpiry) {
                const expiryDate = new Date(sessionExpiry);
                const now = new Date();
                
                if (now > expiryDate) {
                    // Session has expired, clear all auth data
                    console.log('Session expired on app foreground, clearing auth data');
                    await AsyncStorage.multiRemove(['token', 'keepLoggedIn', 'sessionExpiry']);
                    setToken(null);
                }
            }
        } catch (error) {
            console.log('Error checking session expiry:', error);
        }
    };

    const logout = async () => {
        try {
            await AsyncStorage.multiRemove(['token', 'keepLoggedIn', 'sessionExpiry']);
            setToken(null);
            // Small delay to ensure state update propagates
            await new Promise(resolve => setTimeout(resolve, 100));
        } catch (error) {
            console.log('Error during logout:', error);
        }
    };

    const extendSession = async () => {
        try {
            const keepLoggedIn = await AsyncStorage.getItem('keepLoggedIn');
            if (keepLoggedIn === 'false') {
                // Extend session by 24 hours from now
                const sessionExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
                await AsyncStorage.setItem('sessionExpiry', sessionExpiry);
            }
        } catch (error) {
            console.log('Error extending session:', error);
        }
    };

    return (
        <AuthContext.Provider value={{ token, setToken, isLoading, logout, extendSession }}>
            {children}
        </AuthContext.Provider>
    );
}

export { AuthContext, AuthProvider };