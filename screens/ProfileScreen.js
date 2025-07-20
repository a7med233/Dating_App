import {
  StyleSheet,
  Text,
  View,
  Image,
  Pressable,
  Modal,
  TouchableOpacity,
  ScrollView,
  Platform,
  StatusBar,
  Dimensions,
  RefreshControl,
  Animated
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import React, {useEffect, useState, useRef, useContext} from 'react';
import { AuthContext } from '../AuthContext';
import { Feather, AntDesign, Ionicons, MaterialIcons, MaterialCommunityIcons, Entypo } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useNavigation} from '@react-navigation/native';
import {jwtDecode} from 'jwt-decode';
import { atob, btoa } from 'base-64';
import { getUserDetails, getUserStats } from '../services/api';
import { colors, typography, shadows, borderRadius, spacing } from '../theme/colors';
import { LinearGradient } from 'expo-linear-gradient';

const { width: screenWidth } = Dimensions.get('window');

if (typeof global.atob === 'undefined') {
  global.atob = atob;
}
if (typeof global.btoa === 'undefined') {
  global.btoa = btoa;
}

const ProfileScreen = () => {
  const navigation = useNavigation();
  const [userId, setUserId] = useState('');
  const [currentProfile, setCurrentProfile] = useState(null);
  const [userStats, setUserStats] = useState({
    profileViews: 0,
    likesReceived: 0,
    matchesCount: 0
  });
  const [infoVisible, setInfoVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const { token, isLoading, setToken } = useContext(AuthContext);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        if (token) {
          const decodedToken = jwtDecode(token);
          const userId = decodedToken.userId;
          setUserId(userId);
        } else {
          console.log('No token found, user not logged in');
        }
      } catch (error) {
        console.error('Error fetching user:', error);
      }
    };

    fetchUser();
  }, []);

  useEffect(() => {
    if (userId) {
      getUserDetailsHandler();
      getUserStatsHandler();
    }
  }, [userId]);

  useEffect(() => {
    if (!token) {
      navigation.navigate('AuthStack', { screen: 'Login' });
    }
  }, [token, navigation]);

  // Animate in when profile loads
  useEffect(() => {
    if (currentProfile) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [currentProfile]);
  
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

  const getUserStatsHandler = async () => {
    try {
      console.log('Fetching stats for user:', userId);
      const response = await getUserStats(userId);
      if (response.status === 200) {
        const stats = response.data.stats;
        setUserStats(stats);
        console.log('User stats loaded:', stats);
      } else {
        console.error('Error fetching user stats:', response.data.message);
      }
    } catch (error) {
      console.error('Error fetching user stats:', error.message);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await getUserDetailsHandler();
    await getUserStatsHandler();
    setRefreshing(false);
  };

  const logout = () => {
    clearAuthToken();
  };

  const clearAuthToken = async () => {
    try {
      await AsyncStorage.removeItem('token');
      console.log('AuthToken cleared successfully');
      setToken("");
    } catch (error) {
      console.error('Failed to clear AuthToken:', error);
    }
  };

  const renderProfileCard = () => (
    <Animated.View 
      style={[
        styles.profileCard,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        }
      ]}
    >
      <View style={styles.profileHeader}>
        <View style={styles.profileImageContainer}>
          <Image
            source={{ uri: currentProfile?.imageUrls?.[0] }}
            style={styles.profileImage}
          />
          <View style={styles.onlineIndicator} />
          <LinearGradient
            colors={['rgba(255, 107, 157, 0.1)', 'rgba(255, 142, 83, 0.1)']}
            style={styles.imageOverlay}
          />
        </View>
        
        <View style={styles.profileInfo}>
          <View style={styles.nameRow}>
            <Text style={styles.profileName}>
              {currentProfile?.firstName}
            </Text>
            <LinearGradient
              colors={['#FF6B9D', '#FF8E53']}
              style={styles.verifiedBadge}
            >
              <MaterialIcons name="verified" size={16} color="white" />
            </LinearGradient>
          </View>
          
          <View style={styles.profileDetails}>
            <View style={styles.detailRow}>
              <Ionicons name="location-outline" size={16} color={colors.textSecondary} />
              <Text style={styles.detailText}>
                {currentProfile?.location || 'Location not set'}
              </Text>
            </View>
            
            {currentProfile?.occupation && (
              <View style={styles.detailRow}>
                <MaterialIcons name="work-outline" size={16} color={colors.textSecondary} />
                <Text style={styles.detailText}>
                  {currentProfile?.occupation}
                </Text>
              </View>
            )}

            {currentProfile?.age && (
              <View style={styles.detailRow}>
                <Ionicons name="calendar-outline" size={16} color={colors.textSecondary} />
                <Text style={styles.detailText}>
                  {currentProfile.age} years old
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </Animated.View>
  );

  const renderFeatureCard = (icon, title, subtitle, color, onPress) => (
    <TouchableOpacity style={styles.featureCard} onPress={onPress} activeOpacity={0.8}>
      <LinearGradient
        colors={[color, color + 'CC']}
        style={styles.featureIcon}
      >
        {icon}
      </LinearGradient>
      <View style={styles.featureContent}>
        <Text style={styles.featureTitle}>{title}</Text>
        <Text style={styles.featureSubtitle}>{subtitle}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
    </TouchableOpacity>
  );

  const renderStatsCard = () => (
    <Animated.View 
      style={[
        styles.statsCard,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        }
      ]}
    >
      <View style={styles.statsHeader}>
        <Text style={styles.sectionTitle}>Your Stats</Text>
        <TouchableOpacity 
          onPress={getUserStatsHandler}
          style={styles.refreshButton}
          activeOpacity={0.7}
        >
          <Ionicons name="refresh" size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>
      <View style={styles.statsGrid}>
        <View style={styles.statItem}>
          <LinearGradient
            colors={['#FF6B9D', '#FF8E53']}
            style={styles.statIcon}
          >
            <Ionicons name="eye-outline" size={20} color="white" />
          </LinearGradient>
          <Text style={styles.statNumber}>{userStats.profileViews}</Text>
          <Text style={styles.statLabel}>Profile Views</Text>
          <Text style={styles.statNote}>Estimated</Text>
        </View>
        <View style={styles.statItem}>
          <LinearGradient
            colors={['#FF6B9D', '#FF8E53']}
            style={styles.statIcon}
          >
            <Ionicons name="heart-outline" size={20} color="white" />
          </LinearGradient>
          <Text style={styles.statNumber}>{userStats.likesReceived}</Text>
          <Text style={styles.statLabel}>Likes Received</Text>
          <Text style={styles.statNote}>Real</Text>
        </View>
        <View style={styles.statItem}>
          <LinearGradient
            colors={['#FF6B9D', '#FF8E53']}
            style={styles.statIcon}
          >
            <Ionicons name="people-outline" size={20} color="white" />
          </LinearGradient>
          <Text style={styles.statNumber}>{userStats.matchesCount}</Text>
          <Text style={styles.statLabel}>Matches</Text>
          <Text style={styles.statNote}>Real</Text>
        </View>
      </View>
    </Animated.View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      
      {/* Header */}
      <LinearGradient
        colors={['white', '#F8F9FA']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <Image
              style={styles.logo}
              source={{
                uri: 'https://branditechture.agency/brand-logos/wp-content/uploads/wpdm-cache/lashwa-app-900x0.png',
              }}
            />
          </View>
          
          <View style={styles.headerActions}>
            <TouchableOpacity 
              onPress={() => setInfoVisible(true)} 
              style={styles.headerButton}
              activeOpacity={0.7}
            >
              <AntDesign name="infocirlce" size={24} color={colors.textPrimary} />
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => navigation.navigate('Settings')}
              style={styles.headerButton}
              activeOpacity={0.7}
            >
              <AntDesign name="setting" size={24} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        {/* Profile Card */}
        <TouchableOpacity
          onPress={() =>
            navigation.navigate('ProfileDetails', {
              currentProfile: currentProfile,
            })
          }
          activeOpacity={0.9}
        >
          {renderProfileCard()}
        </TouchableOpacity>

        {/* Stats Card */}
        {renderStatsCard()}

        {/* Features */}
        <View style={styles.featuresSection}>
          <Text style={styles.sectionTitle}>Premium Features</Text>
          
          {renderFeatureCard(
            <MaterialCommunityIcons name="lightning-bolt-outline" size={22} color="white" />,
            'Boost Profile',
            'Get seen by 11x more people',
            '#006A4E',
            () => console.log('Boost pressed')
          )}
          
          {renderFeatureCard(
            <Ionicons name="rose-outline" size={22} color="white" />,
            'Send Roses',
            '2x as likely to lead to a date',
            '#F9629F',
            () => console.log('Roses pressed')
          )}
          
          {renderFeatureCard(
            <Ionicons name="diamond-outline" size={22} color="white" />,
            'Premium',
            'Unlock all premium features',
            '#FFD700',
            () => console.log('Premium pressed')
          )}
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={logout} activeOpacity={0.8}>
          <LinearGradient
            colors={['#FF6B6B', '#FF8E53']}
            style={styles.logoutGradient}
          >
            <Ionicons name="log-out-outline" size={20} color="white" />
            <Text style={styles.logoutText}>Logout</Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>

      {/* Info Modal */}
      <Modal
        visible={infoVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setInfoVisible(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          onPress={() => setInfoVisible(false)}
          activeOpacity={1}
        >
          <View style={styles.modalContent}>
            <LinearGradient
              colors={['#FF6B9D', '#FF8E53']}
              style={styles.modalIcon}
            >
              <Ionicons name="information-circle" size={32} color="white" />
            </LinearGradient>
            <Text style={styles.modalTitle}>Profile Info</Text>
            <Text style={styles.modalText}>
              This is your profile page. Here you can view and edit your details, see your boosts and roses, and access settings.
            </Text>
            <TouchableOpacity 
              style={styles.modalButton}
              onPress={() => setInfoVisible(false)}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#FF6B9D', '#FF8E53']}
                style={styles.modalButtonGradient}
              >
                <Text style={styles.modalButtonText}>Got it!</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    // Remove paddingTop since SafeAreaView handles it
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: Platform.OS === 'android' ? spacing.md : spacing.lg,
  },
  headerLeft: {
    flex: 1,
  },
  logo: {
    width: 80,
    height: 60,
    resizeMode: 'contain',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  headerButton: {
    padding: spacing.xs,
    borderRadius: borderRadius.medium,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: Platform.OS === 'android' ? 100 : 80,
  },
  profileCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: Platform.OS === 'android' ? spacing.md : spacing.lg,
    marginBottom: spacing.md,
    ...shadows.medium,
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 157, 0.1)',
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileImageContainer: {
    position: 'relative',
    marginRight: spacing.md,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 40,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#4CAF50',
    borderWidth: 3,
    borderColor: 'white',
    ...shadows.small,
  },
  profileInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  profileName: {
    fontSize: typography.fontSize.xl,
    fontFamily: typography.fontFamily.bold,
    color: colors.textPrimary,
    marginRight: spacing.sm,
  },
  verifiedBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.small,
  },
  profileDetails: {
    gap: spacing.xs,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  detailText: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.regular,
    color: colors.textSecondary,
  },
  statsCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 20,
    padding: Platform.OS === 'android' ? spacing.md : spacing.lg,
    marginBottom: spacing.md,
    ...shadows.medium,
    borderWidth: 1,
    borderColor: 'rgba(161, 66, 244, 0.1)',
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.bold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  statsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  refreshButton: {
    padding: spacing.xs,
    borderRadius: borderRadius.medium,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
    ...shadows.small,
  },
  statNumber: {
    fontSize: 24,
    fontFamily: typography.fontFamily.bold,
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  statLabel: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.textSecondary,
  },
  statNote: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.regular,
    color: colors.textSecondary,
    opacity: 0.7,
    marginTop: 2,
  },
  featuresSection: {
    marginBottom: spacing.md,
  },
  featureCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    padding: Platform.OS === 'android' ? spacing.md : spacing.lg,
    marginBottom: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    ...shadows.medium,
    borderWidth: 1,
    borderColor: 'rgba(161, 66, 244, 0.1)',
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
    ...shadows.small,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.semiBold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  featureSubtitle: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.regular,
    color: colors.textSecondary,
  },
  logoutButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: spacing.lg,
    ...shadows.medium,
  },
  logoutGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  logoutText: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.medium,
    color: 'white',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.cardBackground,
    borderRadius: 20,
    padding: spacing.xl,
    margin: spacing.lg,
    alignItems: 'center',
    maxWidth: 300,
    ...shadows.large,
  },
  modalIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  modalTitle: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.bold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  modalText: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.regular,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: spacing.lg,
  },
  modalButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  modalButtonGradient: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  modalButtonText: {
    color: 'white',
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.medium,
  },
});
