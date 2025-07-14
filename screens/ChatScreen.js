import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Pressable,
  Image,
  Platform,
  StatusBar,
  TouchableOpacity,
  FlatList,
  Dimensions,
  Animated
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import React, {useCallback, useEffect, useState, useRef} from 'react';
import { Ionicons, Entypo, AntDesign, MaterialIcons, Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {jwtDecode} from 'jwt-decode';
import { atob, btoa } from 'base-64';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { getUserMatches, deduplicateUser } from '../services/api';
import { colors, typography, shadows, borderRadius, spacing } from '../theme/colors';
import SafeAreaWrapper from '../components/SafeAreaWrapper';
import ThemedCard from '../components/ThemedCard';
import GradientButton from '../components/GradientButton';
import { LinearGradient } from 'expo-linear-gradient';
import { useTabBar } from '../context/TabBarContext';

const { width: screenWidth } = Dimensions.get('window');

if (typeof global.atob === 'undefined') {
  global.atob = atob;
}
if (typeof global.btoa === 'undefined') {
  global.btoa = btoa;
}

const ChatScreen = () => {
  const navigation = useNavigation();
  const { updateCounts } = useTabBar();
  const [matches, setMatches] = useState([]);
  const [userId, setUserId] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const decodedToken = jwtDecode(token);
        const userId = decodedToken.userId;
        setUserId(userId);
      } catch (error) {
        console.error('Error fetching user:', error);
      }
    };

    fetchUser();
  }, []);

  const fetchMatchesHandler = async () => {
    try {
      setIsLoading(true);
      
      // First, deduplicate the user's data
      try {
        await deduplicateUser(userId);
      } catch (error) {
        console.log('Deduplication failed or not needed:', error.message);
      }
      
      const response = await getUserMatches(userId);
      const matchesData = response.data.matches || [];
      
      // Validate and filter out invalid matches
      const validMatches = matchesData.filter(match => {
        if (!match || !match._id) {
          console.warn('Invalid match data:', match);
          return false;
        }
        return true;
      });
      
      // Remove duplicates based on _id (frontend safety check)
      const uniqueMatches = validMatches.filter((match, index, self) => 
        index === self.findIndex(m => m._id === match._id)
      );
      
      console.log('Valid matches:', uniqueMatches.length);
      setMatches(uniqueMatches);
      
      // Update tab bar counts
      updateCounts({ matches: uniqueMatches.length });
    } catch (error) {
      console.error('Error fetching matches:', error);
      setMatches([]); // Set empty array on error
      // Update tab bar counts
      updateCounts({ matches: 0 });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchMatchesHandler();
    }
  }, [userId]);

  useFocusEffect(
    useCallback(() => {
      if (userId) {
        fetchMatchesHandler();
      }
    }, [userId]),
  );

  // Animate in when matches load
  useEffect(() => {
    if (!isLoading && matches.length > 0) {
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
  }, [isLoading, matches.length]);

  const handleMatchPress = (match) => {
    if (!match || !match._id) {
      console.warn('Invalid match for chat:', match);
      return;
    }
    
    navigation.navigate('ChatRoom', {
      senderId: userId,
      receiverId: match._id,
      name: match.firstName || 'Unknown',
      image: match.imageUrls?.[0],
    });
  };

  const handleProfilePress = (match) => {
    if (!match || !match._id) {
      console.warn('Invalid match for profile:', match);
      return;
    }
    
    navigation.navigate('ProfileDetails', {
      currentProfile: match,
      isFromMatches: true,
    });
  };

  const renderMatchItem = ({ item, index }) => {
    // Add null checks to prevent ReferenceError
    if (!item || !item._id) {
      console.warn('Invalid match item:', item);
      return null;
    }

    return (
      <Animated.View 
        style={[
          styles.matchCard,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }
        ]}
      >
        <View style={styles.cardHeader}>
          <View style={styles.matchBadge}>
            <LinearGradient
              colors={['#FF6B9D', '#FF8E53']}
              style={styles.badgeGradient}
            >
              <Ionicons name="heart" size={16} color="white" />
              <Text style={styles.matchBadgeText}>It's a match!</Text>
            </LinearGradient>
          </View>
          <Text style={styles.matchDate}>
            {new Date().toLocaleDateString()}
          </Text>
        </View>

        <View style={styles.profileContainer}>
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: item.imageUrls?.[0] || 'https://via.placeholder.com/70' }}
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
                {item.firstName || 'Unknown'}
              </Text>
              {item.age && (
                <Text style={styles.profileAge}>
                  {item.age}
                </Text>
              )}
            </View>
            
            {item.location && (
              <View style={styles.locationRow}>
                <Ionicons name="location-outline" size={14} color={colors.textSecondary} />
                <Text style={styles.profileLocation}>
                  {item.location}
                </Text>
              </View>
            )}
            
            {item.occupation && (
              <View style={styles.occupationRow}>
                <MaterialIcons name="work-outline" size={14} color={colors.textSecondary} />
                <Text style={styles.profileOccupation}>
                  {item.occupation}
                </Text>
              </View>
            )}
            
            {item.prompts && item.prompts.length > 0 && item.prompts[0]?.answer && (
              <View style={styles.promptRow}>
                <Text style={styles.promptText}>
                  "{item.prompts[0].answer}"
                </Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.profileButton}
            onPress={() => handleProfilePress(item)}
            activeOpacity={0.8}
          >
            <Feather name="user" size={20} color="#FF6B9D" />
            <Text style={styles.profileButtonText}>Profile</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.chatButton}
            onPress={() => handleMatchPress(item)}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#FF6B9D', '#FF8E53']}
              style={styles.chatButtonGradient}
            >
              <Ionicons name="chatbubble-outline" size={20} color="white" />
              <Text style={styles.chatButtonText}>Message</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </Animated.View>
    );
  };

  const renderEmptyState = () => (
    <Animated.View 
      style={[
        styles.emptyContainer,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        }
      ]}
    >
      <View style={styles.emptyIconContainer}>
        <LinearGradient
          colors={['#FF6B9D', '#FF8E53']}
          style={styles.emptyIconGradient}
        >
          <Ionicons name="heart" size={48} color="white" />
        </LinearGradient>
      </View>
      
      <Text style={styles.emptyTitle}>No matches yet</Text>
      <Text style={styles.emptySubtitle}>
        Start swiping to find your perfect match! The more you swipe, the more matches you'll get.
      </Text>
      
      <TouchableOpacity
        style={styles.startSwipingContainer}
        onPress={() => navigation.navigate('Home')}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={['#FF6B9D', '#FF8E53']}
          style={styles.startSwipingGradient}
        >
          <Ionicons name="heart" size={20} color="white" />
          <Text style={styles.startSwipingText}>Start Swiping</Text>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );

  // Calculate counts for each filter
  const getFilterCount = (filterType) => {
    switch (filterType) {
      case 'All':
        return matches.length;
      case 'Recent':
        return matches.length; // For now, all matches are considered recent
      case 'Nearby':
        return matches.filter(match => match.location && match.location.trim() !== '').length;
      default:
        return 0;
    }
  };

  const filteredMatches = activeTab === 'All' 
    ? matches 
    : matches.filter(match => {
        const now = new Date();
        
        switch (activeTab) {
          case 'Recent':
            // Show matches from the last 7 days (assuming match date is available)
            // For now, we'll show all matches since we don't have match timestamps
            return true;
            
          case 'Nearby':
            // Show matches within a certain distance
            // We'll show matches with location data
            return match.location && match.location.trim() !== '';
            
          default:
            return true;
        }
      });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      
      {/* Header */}
      <LinearGradient
        colors={['white', '#F8F9FA']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerTitle}>Matches</Text>
            {matches.length > 0 && (
              <View style={styles.matchesCount}>
                <Text style={styles.matchesCountText}>{matches.length}</Text>
              </View>
            )}
          </View>
          
          <TouchableOpacity style={styles.settingsButton}>
            <Ionicons name="settings-outline" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          {['All', 'Recent', 'Nearby'].map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[
                styles.filterTab,
                activeTab === tab && styles.filterTabActive
              ]}
              onPress={() => setActiveTab(tab)}
              activeOpacity={0.7}
            >
              <Text style={[
                styles.filterTabText,
                activeTab === tab && styles.filterTabTextActive
              ]}>
                {tab}
              </Text>
              {getFilterCount(tab) > 0 && (
                <View style={[
                  styles.filterCount,
                  activeTab === tab && styles.filterCountActive
                ]}>
                  <Text style={[
                    styles.filterCountText,
                    activeTab === tab && styles.filterCountTextActive
                  ]}>
                    {getFilterCount(tab)}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Content */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <View style={styles.loadingSpinner}>
            <Ionicons name="heart" size={32} color="#FF6B9D" />
          </View>
          <Text style={styles.loadingText}>Loading matches...</Text>
        </View>
      ) : filteredMatches.length > 0 ? (
        <FlatList
          data={filteredMatches}
          renderItem={renderMatchItem}
          keyExtractor={(item, index) => `match-${item._id}-${index}`}
          contentContainerStyle={styles.matchesList}
          showsVerticalScrollIndicator={false}
          initialNumToRender={5}
          maxToRenderPerBatch={10}
          windowSize={10}
        />
      ) : (
        activeTab === 'All' ? renderEmptyState() : (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconContainer}>
              <LinearGradient
                colors={['#FF6B9D', '#FF8E53']}
                style={styles.emptyIconGradient}
              >
                <Ionicons name="search" size={48} color="white" />
              </LinearGradient>
            </View>
            
            <Text style={styles.emptyTitle}>No {activeTab.toLowerCase()} matches</Text>
            <Text style={styles.emptySubtitle}>
              Try switching to a different filter or start swiping to get more matches.
            </Text>
            
            <TouchableOpacity
              style={styles.startSwipingContainer}
              onPress={() => setActiveTab('All')}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#FF6B9D', '#FF8E53']}
                style={styles.startSwipingGradient}
              >
                <Ionicons name="list" size={20} color="white" />
                <Text style={styles.startSwipingText}>Show All Matches</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )
      )}
    </SafeAreaView>
  );
};

export default ChatScreen;

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
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  headerTitle: {
    fontSize: 28,
    fontFamily: typography.fontFamily.bold,
    color: colors.textPrimary,
  },
  matchesCount: {
    backgroundColor: '#FF6B9D',
    borderRadius: 20,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    minWidth: 28,
    alignItems: 'center',
    ...shadows.small,
  },
  matchesCountText: {
    color: 'white',
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.bold,
  },
  settingsButton: {
    padding: spacing.sm,
    borderRadius: borderRadius.medium,
  },
  filterContainer: {
    backgroundColor: 'white',
    paddingVertical: Platform.OS === 'android' ? spacing.sm : spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8E8',
  },
  filterScroll: {
    paddingHorizontal: spacing.md,
  },
  filterTab: {
    paddingHorizontal: spacing.lg,
    paddingVertical: Platform.OS === 'android' ? spacing.sm : spacing.md,
    marginRight: spacing.sm,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'center',
    ...shadows.small,
  },
  filterTabActive: {
    backgroundColor: '#FF6B9D',
    borderColor: '#FF6B9D',
    ...shadows.medium,
  },
  filterTabText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.textSecondary,
  },
  filterTabTextActive: {
    color: 'white',
  },
  filterCount: {
    backgroundColor: '#F0F0F0',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: spacing.xs,
    minWidth: 20,
    alignItems: 'center',
  },
  filterCountActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  filterCountText: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.bold,
    color: colors.textSecondary,
  },
  filterCountTextActive: {
    color: 'white',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  loadingSpinner: {
    marginBottom: spacing.lg,
  },
  loadingText: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.medium,
    color: colors.textSecondary,
  },
  matchesList: {
    padding: spacing.md,
  },
  matchCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    marginBottom: Platform.OS === 'android' ? spacing.sm : spacing.md,
    padding: Platform.OS === 'android' ? spacing.md : spacing.lg,
    ...shadows.medium,
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 157, 0.1)',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Platform.OS === 'android' ? spacing.sm : spacing.md,
  },
  matchBadge: {
    borderRadius: borderRadius.medium,
    overflow: 'hidden',
    ...shadows.small,
  },
  badgeGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    gap: spacing.xs,
  },
  matchBadgeText: {
    color: 'white',
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.medium,
  },
  matchDate: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.regular,
    color: colors.textSecondary,
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Platform.OS === 'android' ? spacing.md : spacing.lg,
  },
  imageContainer: {
    position: 'relative',
    marginRight: spacing.md,
  },
  profileImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 35,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#4CAF50',
    borderWidth: 2,
    borderColor: 'white',
    ...shadows.small,
  },
  profileInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  profileName: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.bold,
    color: colors.textPrimary,
  },
  profileAge: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.medium,
    color: colors.textSecondary,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  profileLocation: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.textSecondary,
  },
  occupationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  profileOccupation: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.regular,
    color: colors.textSecondary,
  },
  promptRow: {
    backgroundColor: '#F8F9FA',
    padding: Platform.OS === 'android' ? spacing.xs : spacing.sm,
    borderRadius: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#FF6B9D',
    ...shadows.small,
  },
  promptText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.textPrimary,
    fontStyle: 'italic',
  },
  actionRow: {
    flexDirection: 'row',
    gap: Platform.OS === 'android' ? spacing.sm : spacing.md,
  },
  profileButton: {
    flex: 1,
    height: Platform.OS === 'android' ? 48 : 56,
    borderRadius: Platform.OS === 'android' ? 24 : 28,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: '#FF6B9D',
    flexDirection: 'row',
    gap: spacing.xs,
    ...shadows.small,
  },
  profileButtonText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.medium,
    color: '#FF6B9D',
  },
  chatButton: {
    flex: 1,
    borderRadius: Platform.OS === 'android' ? 24 : 28,
    overflow: 'hidden',
    ...shadows.medium,
  },
  chatButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: Platform.OS === 'android' ? 48 : 56,
    gap: spacing.xs,
  },
  chatButtonText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.medium,
    color: 'white',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  emptyIconContainer: {
    marginBottom: spacing.xl,
    ...shadows.medium,
  },
  emptyIconGradient: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 24,
    fontFamily: typography.fontFamily.bold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.regular,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: 24,
  },
  startSwipingContainer: {
    borderRadius: borderRadius.medium,
    overflow: 'hidden',
    ...shadows.medium,
  },
  startSwipingGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    gap: spacing.sm,
  },
  startSwipingText: {
    color: 'white',
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.bold,
  },
});
