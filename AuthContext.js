import { createContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
    const [token, setToken] = useState('');
    const [isLoading, setIsLoading] = useState('');

    const isLoggedIn = async () => {
        try {
            setIsLoading(true);
            const userToken = await AsyncStorage.getItem('token');
            setToken(userToken);
            setIsLoading(false);
        } catch (error) {
            console.log('Error checking login status:', error);
        }
    };

    useEffect(() => {
        isLoggedIn();
    }, [token]);

    return (
        <AuthContext.Provider value={{ token, setToken, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
}

export { AuthContext, AuthProvider };