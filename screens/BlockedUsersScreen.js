import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Pressable, Alert, Image, ActivityIndicator } from 'react-native';
import { colors, typography, shadows, borderRadius, spacing } from '../theme/colors';
import SafeAreaWrapper from '../components/SafeAreaWrapper';
import CustomButton from '../components/CustomButton';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from 'jwt-decode';
import { AntDesign, MaterialIcons } from '@expo/vector-icons';
import { getBlockedUsers, unblockUser } from '../services/api';

const BlockedUsersScreen = () => {
  const navigation = useNavigation();
  const [userId, setUserId] = useState('');
  const [blockedUsers, setBlockedUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [unblocking, setUnblocking] = useState({});

  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        if (token) {
          const decodedToken = jwtDecode(token);
          setUserId(decodedToken.userId);
        }
      } catch (error) {
        console.error('Failed to decode userId:', error);
      }
    };
    fetchUserId();
  }, []);

  useEffect(() => {
    if (userId) {
      fetchBlockedUsers();
    }
  }, [userId]);

  const fetchBlockedUsers = async () => {
    try {
      setLoading(true);
      const response = await getBlockedUsers(userId);
      if (response.status === 200) {
        setBlockedUsers(response.data.blockedUsers || []);
      }
    } catch (error) {
      console.error('Error fetching blocked users:', error);
      Alert.alert('Error', 'Failed to load blocked users');
    } finally {
      setLoading(false);
    }
  };

  const handleUnblock = async (blockedUserId, blockedUserName) => {
    Alert.alert(
      'Unblock User',
      `Are you sure you want to unblock ${blockedUserName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Unblock',
          style: 'destructive',
          onPress: async () => {
            try {
              setUnblocking(prev => ({ ...prev, [blockedUserId]: true }));
              const response = await unblockUser(userId, blockedUserId);
              if (response.status === 200) {
                setBlockedUsers(prev => prev.filter(user => user._id !== blockedUserId));
                Alert.alert('Success', `${blockedUserName} has been unblocked`);
              }
            } catch (error) {
              console.error('Error unblocking user:', error);
              const errorMessage = error.response?.data?.message || 'Failed to unblock user';
              Alert.alert('Error', errorMessage);
            } finally {
              setUnblocking(prev => ({ ...prev, [blockedUserId]: false }));
            }
          }
        }
      ]
    );
  };

  const BlockedUserCard = ({ user }) => (
    <View style={{
      backgroundColor: colors.textInverse,
      borderRadius: borderRadius.medium,
      marginHorizontal: spacing.lg,
      marginBottom: spacing.md,
      padding: spacing.lg,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    }}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <View style={{
          width: 60,
          height: 60,
          borderRadius: 30,
          backgroundColor: colors.backgroundSecondary,
          justifyContent: 'center',
          alignItems: 'center',
          marginRight: spacing.md,
        }}>
          {user.imageUrls && user.imageUrls.length > 0 ? (
            <Image
              source={{ uri: user.imageUrls[0] }}
              style={{
                width: 60,
                height: 60,
                borderRadius: 30,
              }}
            />
          ) : (
            <MaterialIcons name="person" size={30} color={colors.textSecondary} />
          )}
        </View>
        
        <View style={{ flex: 1 }}>
          <Text style={{
            fontSize: typography.fontSize.md,
            fontFamily: typography.fontFamily.semiBold,
            color: colors.textPrimary,
          }}>
            {user.firstName}, {user.age}
          </Text>
          <Text style={{
            fontSize: typography.fontSize.sm,
            color: colors.textSecondary,
            marginTop: spacing.xs,
          }}>
            {user.location || 'Location not available'}
          </Text>
        </View>
        
        <CustomButton
          onPress={() => handleUnblock(user._id, user.firstName)}
          disabled={unblocking[user._id]}
          style={{
            backgroundColor: colors.error,
            paddingHorizontal: spacing.md,
            paddingVertical: spacing.sm,
            borderRadius: borderRadius.small,
          }}
          textStyle={{
            fontSize: typography.fontSize.sm,
            color: colors.textInverse,
          }}
        >
          {unblocking[user._id] ? (
            <ActivityIndicator size="small" color={colors.textInverse} />
          ) : (
            'Unblock'
          )}
        </CustomButton>
      </View>
    </View>
  );

  return (
    <SafeAreaWrapper backgroundColor="#fff" style={{ flex: 1, backgroundColor: '#fff' }}>
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.lg,
        paddingBottom: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.backgroundSecondary,
      }}>
        <Pressable onPress={() => navigation.goBack()} style={{ marginRight: spacing.md }}>
          <AntDesign name="arrowleft" size={24} color={colors.textPrimary} />
        </Pressable>
        <Text style={{
          fontSize: typography.fontSize.xl,
          fontFamily: typography.fontFamily.bold,
          color: colors.textPrimary,
        }}>
          Blocked Users
        </Text>
      </View>

      <ScrollView style={{ flex: 1 }}>
        {loading ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: spacing.xl }}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={{
              fontSize: typography.fontSize.md,
              color: colors.textSecondary,
              marginTop: spacing.md,
            }}>
              Loading blocked users...
            </Text>
          </View>
        ) : blockedUsers.length === 0 ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: spacing.xl }}>
            <MaterialIcons name="block" size={80} color={colors.textSecondary} />
            <Text style={{
              fontSize: typography.fontSize.lg,
              fontFamily: typography.fontFamily.semiBold,
              color: colors.textPrimary,
              marginTop: spacing.md,
              textAlign: 'center',
            }}>
              No Blocked Users
            </Text>
            <Text style={{
              fontSize: typography.fontSize.md,
              color: colors.textSecondary,
              marginTop: spacing.sm,
              textAlign: 'center',
              paddingHorizontal: spacing.lg,
            }}>
              You haven't blocked any users yet. Blocked users will appear here where you can unblock them.
            </Text>
          </View>
        ) : (
          <View style={{ marginTop: spacing.lg }}>
            <Text style={{
              fontSize: typography.fontSize.md,
              color: colors.textSecondary,
              paddingHorizontal: spacing.lg,
              marginBottom: spacing.md,
            }}>
              {blockedUsers.length} blocked user{blockedUsers.length !== 1 ? 's' : ''}
            </Text>
            
            {blockedUsers.map((user) => (
              <BlockedUserCard key={user._id} user={user} />
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaWrapper>
  );
};

export default BlockedUsersScreen; 