import { createContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { jwtDecode } from "jwt-decode";
import { getAccountStatus } from "./services/api";

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const isLoggedIn = async () => {
        try {
            setIsLoading(true);
            const userToken = await AsyncStorage.getItem('token');
            
            if (userToken) {
                // Check if the token is valid and account is active
                try {
                    const decodedToken = jwtDecode(userToken);
                    const accountStatus = await getAccountStatus(decodedToken.userId);
                    
                    if (accountStatus.status === 200) {
                        const { isActive, isDeleted } = accountStatus.data;
                        
                        if (isDeleted) {
                            // Account is deleted - clear token and force login
                            console.log('Account is deleted, clearing token');
                            await AsyncStorage.removeItem('token');
                            setToken(null);
                            return;
                        }
                        
                        if (!isActive) {
                            // Account is deactivated - clear token and force login
                            console.log('Account is deactivated, clearing token');
                            await AsyncStorage.removeItem('token');
                            setToken(null);
                            return;
                        }
                    }
                } catch (error) {
                    console.log('Error checking account status:', error);
                    // If there's an error checking account status, clear the token to be safe
                    await AsyncStorage.removeItem('token');
                    setToken(null);
                    return;
                }
            }
            
            setToken(userToken);
        } catch (error) {
            console.log('Error checking login status:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        isLoggedIn();
    }, []); // Remove token dependency to avoid infinite re-renders

    const logout = async () => {
        try {
            await AsyncStorage.removeItem('token');
            setToken(null);
            // Small delay to ensure state update propagates
            await new Promise(resolve => setTimeout(resolve, 100));
        } catch (error) {
            console.log('Error during logout:', error);
        }
    };

    return (
        <AuthContext.Provider value={{ token, setToken, isLoading, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export { AuthContext, AuthProvider };