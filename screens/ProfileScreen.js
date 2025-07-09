import {StyleSheet,
  Text,
  View,
  Image,
  Pressable,
  Modal,
  TouchableOpacity,
  ScrollView,
  Platform,
  StatusBar,} from 'react-native';
import React, {useContext, useEffect, useState} from 'react';
import {AuthContext} from '../AuthContext';
import { Feather, AntDesign, Ionicons, MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useNavigation} from '@react-navigation/native';
import {jwtDecode} from 'jwt-decode';
import { atob, btoa } from 'base-64';
import { getUserDetails } from '../services/api';
import CustomButton from '../components/CustomButton';
import SafeAreaWrapper from '../components/SafeAreaWrapper';
import { colors, typography, shadows, borderRadius, spacing } from '../theme/colors';

if (typeof global.atob === 'undefined') {
  global.atob = atob;
}
if (typeof global.btoa === 'undefined') {
  global.btoa = btoa;
}

const ProfileScreen = () => {
  console.log('ProfileScreen rendered');
  // const {isLoading, token} = useContext(AuthContext);
  const navigation = useNavigation();
  const [userId, setUserId] = useState('');
  useEffect(() => {
    console.log('hi');
    const fetchUser = async () => {
      const token = await AsyncStorage.getItem('token');
      const decodedToken = jwtDecode(token);
      const userId = decodedToken.userId;
      setUserId(userId);
    };

    fetchUser();
  }, []);

  console.log('token');
  const [currentProfile, setCurrentProfile] = useState(null);
  useEffect(() => {
    if (userId) {
      getUserDetailsHandler();
    }
  }, [userId]);

  const { token, isLoading,setToken } = useContext(AuthContext);

  console.log(token)

  useEffect(() => {
    // Check if the token is set and not in loading state
    if (!token) {
      // Navigate to the main screen
      navigation.navigate('AuthStack', { screen: 'Login' });
    }
  }, [token,navigation]);
  
  const getUserDetailsHandler = async () => {
    try {
      const response = await getUserDetails(userId);
      if (response.status === 200) {
        const userData = response.data.user;
        setCurrentProfile(userData);
      } else {
        console.error('Error fetching user details:', response.data.message);
      }
    } catch (error) {
      console.error('Error fetching user details:', error.message);
    }
  };
  const logout = () => {
    clearAuthToken();
  }
  const clearAuthToken = async () => {
    try {
      await AsyncStorage.removeItem('token');
      console.log('AuthToken cleared successfully');

      setToken("");
      // Perform any necessary actions after clearing the authToken
    } catch (error) {
      console.error('Failed to clear AuthToken:', error);
    }
  };
  
  const [infoVisible, setInfoVisible] = useState(false);

  return (
    <SafeAreaWrapper backgroundColor={colors.background} style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: spacing.md,
            paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight || 16 : 16,
            paddingBottom: 8,
            backgroundColor: colors.textInverse,
          }}
        >
          <Image
            style={{ width: 80, height: 60, resizeMode: 'contain' }}
            source={{
              uri: 'https://branditechture.agency/brand-logos/wp-content/uploads/wpdm-cache/lashwa-app-900x0.png',
            }}
          />
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Pressable onPress={() => setInfoVisible(true)} style={{ marginRight: 16 }}>
              <AntDesign name="infocirlce" size={24} color="black" />
            </Pressable>
            <Pressable
              style={{ padding: 8 }}
              onPress={() => {
                navigation.navigate('Settings');
              }}
            >
              <AntDesign name="setting" size={28} color="black" />
            </Pressable>
          </View>
        </View>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <Pressable
            onPress={() =>
              navigation.navigate('Details', {
                currentProfile: currentProfile,
              })
            }>
            <Image
              style={{
                width: 100,
                height: 100,
                borderRadius: borderRadius.round,
                resizeMode: 'cover',
                borderColor: colors.primary,
                borderWidth: 3,
                alignSelf: 'center',
              }}
              source={{
                uri: currentProfile?.imageUrls[0],
              }}
            />
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 10,
                marginTop: spacing.md,
              }}>
              <Text style={{fontSize: typography.fontSize.xl, fontFamily: typography.fontFamily.semiBold}}>
                {currentProfile?.firstName}
              </Text>
              <MaterialIcons name="verified" size={22} color="colors.primary" />
            </View>
          </Pressable>
        </View>

        <View style={{marginTop: spacing.xl, marginHorizontal: 20}}>
          <Image
            style={{height: 250, width: '100%', borderRadius: borderRadius.medium}}
            source={{
              uri: 'https://cdn.sanity.io/images/l7pj44pm/production/5f4e26a82da303138584cff340f3eff9e123cd56-1280x720.jpg',
            }}
          />
        </View>

        <View
          style={{
            marginVertical: 20,
            marginHorizontal: 20,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
            borderColor: '#E0E0E0',
            borderWidth: 1,
            padding: 10,
            borderRadius: borderRadius.small,
          }}>
          <View
            style={{
              height: 40,
              width: 40,
              borderRadius: borderRadius.xlarge,
              backgroundColor: '#006A4E',
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <MaterialCommunityIcons
              name="lightning-bolt-outline"
              size={22}
              color="white"
            />
          </View>
          <View>
            <Text style={{fontSize: typography.fontSize.md, fontFamily: typography.fontFamily.semiBold}}>Boost</Text>
            <Text style={{color: 'gray', marginTop: spacing.xs}}>
              Get seen by 11x more people
            </Text>
          </View>
        </View>

        <View
          style={{
            marginHorizontal: 20,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
            borderColor: '#E0E0E0',
            borderWidth: 1,
            padding: 10,
            borderRadius: borderRadius.small,
          }}>
          <View
            style={{
              height: 40,
              width: 40,
              borderRadius: borderRadius.xlarge,
              backgroundColor: '#F9629F',
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <Ionicons name="rose-outline" size={22} color="white" />
          </View>
          <View>
            <Text style={{fontSize: typography.fontSize.md, fontFamily: typography.fontFamily.semiBold}}>Roses</Text>
            <Text style={{color: 'gray', marginTop: spacing.xs}}>
              2x as likely to lead to a date
            </Text>
          </View>
        </View>

        <Pressable
        onPress={logout}
          style={{
            borderColor: '#E0E0E0',
            marginTop: spacing.xxl,
            marginBottom: spacing.xxl,
            padding: 12,
            borderRadius: borderRadius.round,
            borderWidth: 1,
            justifyContent: 'center',
            alignItems: 'center',
            marginLeft:"auto",
            marginRight:"auto",
            width:120,
          }}>
          <Text style={{textAlign:"center",fontWeight:"500"}}>Logout</Text>
        </Pressable>
      </ScrollView>

      <Modal
        visible={infoVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setInfoVisible(false)}
      >
        <TouchableOpacity style={{flex:1,backgroundColor:'rgba(0,0,0,0.3)',justifyContent:'center',alignItems:'center'}} onPress={() => setInfoVisible(false)}>
          <View style={{backgroundColor:'#fff',padding:24,borderRadius: borderRadius.medium,alignItems:'center',maxWidth:300}}>
            <Text style={{fontFamily: typography.fontFamily.bold,fontSize: typography.fontSize.lg,marginBottom: spacing.sm}}>Profile Info</Text>
            <Text style={{fontSize: typography.fontSize.md,textAlign:'center'}}>This is your profile page. Here you can view and edit your details, see your boosts and roses, and access settings.</Text>
            <CustomButton style={{marginTop: spacing.md}} onPress={() => setInfoVisible(false)}>Close</CustomButton>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaWrapper>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: Platform.OS === 'android' ? 100 : 50, // Extra padding for Android
  },
});
