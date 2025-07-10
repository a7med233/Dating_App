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
  SafeAreaView,
  Animated,
} from 'react-native';
import React, {useEffect, useState, useCallback, useRef} from 'react';
import { Ionicons, Entypo, AntDesign, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {jwtDecode} from 'jwt-decode';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import { atob, btoa } from 'base-64';
import { fetchReceivedLikes, rejectProfile } from '../services/api';
import { colors, typography, shadows, borderRadius, spacing } from '../theme/colors';
import { LinearGradient } from 'expo-linear-gradient';
import SafeAreaWrapper from '../components/SafeAreaWrapper';
import ThemedCard from '../components/ThemedCard';
import GradientButton from '../components/GradientButton';
import { useTabBar } from '../context/TabBarContext';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

if (typeof global.atob === 'undefined') {
  global.atob = atob;
}
if (typeof global.btoa === 'undefined') {
  global.btoa = btoa;
}

const LikesScreen = () => {
  const navigation = useNavigation();
  const { updateCounts } = useTabBar();
  const [option, setOption] = useState('Recent');
  const [userId, setUserId] = useState('');
  const [likes, setLikes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

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

  const fetchReceivedLikesHandler = async () => {
    try {
      setIsLoading(true);
      const response = await fetchReceivedLikes(userId);
      const receivedLikes = response.data.receivedLikes;
      console.log('Received likes:', receivedLikes);
      
      // Deduplicate likes by user ID - group likes from the same user
      const uniqueLikes = [];
      const userLikesMap = new Map();
      
      if (receivedLikes && receivedLikes.length > 0) {
        receivedLikes.forEach((like) => {
          const userId = like.userId?._id;
          if (userId) {
            if (!userLikesMap.has(userId)) {
              // First like from this user
              userLikesMap.set(userId, {
                ...like,
                likeCount: 1,
                latestLike: like,
                allLikes: [like]
              });
            } else {
              // Additional like from the same user
              const existing = userLikesMap.get(userId);
              existing.likeCount += 1;
              existing.allLikes.push(like);
              // Keep the most recent like as the main one
              if (new Date(like.createdAt || Date.now()) > new Date(existing.latestLike.createdAt || Date.now())) {
                existing.latestLike = like;
              }
            }
          }
        });
        
        // Convert map to array
        uniqueLikes.push(...userLikesMap.values());
      }
      
      console.log('Deduplicated likes:', uniqueLikes);
      setLikes(uniqueLikes || []);
      
      // Update tab bar counts
      updateCounts({ likes: uniqueLikes.length });
    } catch (error) {
      console.error('Error fetching received likes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchReceivedLikesHandler();
    }
  }, [userId]);

  useFocusEffect(
    useCallback(() => {
      if (userId) {
        fetchReceivedLikesHandler();
      }
    }, [userId]),
  );

  const handleLike = (like) => {
    navigation.navigate('HandleLike', {
      name: like.userId?.firstName,
      image: like.latestLike?.image || like.image,
      imageUrls: like.userId?.imageUrls,
      prompts: like.userId?.prompts,
      userId: userId,
      selectedUserId: like.userId?._id,
      likes: likes?.length,
      likeCount: like.likeCount || 1,
      allLikes: like.allLikes || [],
      location: like.userId?.location,
      occupation: like.userId?.occupation
    });
  };

  const handleReject = async (like, index) => {
    try {
      // Animate the card out
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: -screenWidth,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => {
        // Call the reject API
        rejectProfile(userId, like.userId._id).then(() => {
          // Remove from local state
          const updatedLikes = likes.filter((_, i) => i !== index);
          setLikes(updatedLikes);
          // Update tab bar counts
          updateCounts({ likes: updatedLikes.length });
        }).catch((error) => {
          console.error('Error rejecting like:', error);
          // Still remove from local state even if API call fails
          const updatedLikes = likes.filter((_, i) => i !== index);
          setLikes(updatedLikes);
          // Update tab bar counts
          updateCounts({ likes: updatedLikes.length });
        });
        
        // Reset animations
        fadeAnim.setValue(1);
        slideAnim.setValue(0);
      });
    } catch (error) {
      console.error('Error rejecting like:', error);
      // Still remove from local state even if API call fails
      const updatedLikes = likes.filter((_, i) => i !== index);
      setLikes(updatedLikes);
    }
  };

  const renderLikeItem = ({ item, index }) => (
    <Animated.View 
      style={[
        styles.likeCard,
        {
          opacity: fadeAnim,
          transform: [{ translateX: slideAnim }]
        }
      ]}
    >
      {/* Profile Header */}
      <View style={styles.profileHeader}>
        <View style={styles.profileImageContainer}>
          <Image
            source={{ uri: item.userId?.imageUrls?.[0] }}
            style={styles.profileImage}
          />
          <View style={styles.onlineIndicator} />
        </View>
        
        <View style={styles.profileInfo}>
          <View style={styles.nameRow}>
            <Text style={styles.profileName}>
              {item.userId?.firstName}
            </Text>
            {item.userId?.age && (
              <Text style={styles.profileAge}>{item.userId.age}</Text>
            )}
          </View>
          
          {item.userId?.location && (
            <View style={styles.infoRow}>
              <Ionicons name="location" size={16} color={colors.textSecondary} />
              <Text style={styles.infoText}>{item.userId.location}</Text>
            </View>
          )}
          
          {item.userId?.occupation && (
            <View style={styles.infoRow}>
              <MaterialIcons name="work" size={16} color={colors.textSecondary} />
              <Text style={styles.infoText}>{item.userId.occupation}</Text>
            </View>
          )}
        </View>

        <View style={styles.likeIndicator}>
          <LinearGradient
            colors={['#FF6B9D', '#FF8E53']}
            style={styles.likeIndicatorGradient}
          >
            <Ionicons name="heart" size={16} color="white" />
            <Text style={styles.likeIndicatorText}>
              {item.likeCount > 1 ? `${item.likeCount}` : '1'}
            </Text>
          </LinearGradient>
        </View>
      </View>

      {/* Like Details */}
      <View style={styles.likeDetails}>
        <Text style={styles.likeActionText}>
          {item.likeCount > 1 
            ? `Liked ${item.likeCount} of your photos`
            : (item.latestLike?.comment || item.comment) 
              ? 'Commented on your photo' 
              : 'Liked your photo'
          }
        </Text>

        {/* Show which photos were liked */}
        {item.allLikes && item.allLikes.length > 0 && (
          <View style={styles.likedPhotosContainer}>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.likedPhotosScroll}
            >
              {item.allLikes.map((like, likeIndex) => (
                <View key={likeIndex} style={styles.likedPhotoItem}>
                  <Image
                    source={{ uri: like.image }}
                    style={styles.likedPhotoThumbnail}
                  />
                  {like.comment && (
                    <View style={styles.commentBadge}>
                      <Ionicons name="chatbubble" size={12} color="white" />
                    </View>
                  )}
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Comment */}
        {(item.latestLike?.comment || item.comment) && (
          <View style={styles.commentBubble}>
            <Text style={styles.commentText}>
              "{(item.latestLike?.comment || item.comment)}"
            </Text>
          </View>
        )}
      </View>

      {/* Action Buttons */}
      <View style={styles.actionRow}>
        <TouchableOpacity
          style={styles.passButton}
          onPress={() => handleReject(item, index)}
        >
          <LinearGradient
            colors={['#FF6B6B', '#FF8E53']}
            style={styles.actionButtonGradient}
          >
            <Entypo name="cross" size={24} color="white" />
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.likeButton}
          onPress={() => handleLike(item)}
        >
          <LinearGradient
            colors={['#FF6B9D', '#FF8E53']}
            style={styles.actionButtonGradient}
          >
            <AntDesign name="heart" size={24} color="white" />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );

  const renderFilterTab = (filterName, label) => (
    <TouchableOpacity
      key={filterName}
      style={[
        styles.filterTab,
        option === filterName && styles.filterTabActive
      ]}
      onPress={() => setOption(filterName)}
    >
      <Text style={[
        styles.filterTabText,
        option === filterName && styles.filterTabTextActive
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <LinearGradient
        colors={['#FF6B9D', '#FF8E53']}
        style={styles.emptyIconGradient}
      >
        <Ionicons name="heart-outline" size={64} color="white" />
      </LinearGradient>
      
      <Text style={styles.emptyTitle}>No likes yet</Text>
      <Text style={styles.emptySubtitle}>
        When someone likes your profile, they'll appear here. Start swiping to get more likes!
      </Text>
      
      <TouchableOpacity
        style={styles.boostContainer}
        onPress={() => navigation.navigate('Home')}
      >
        <LinearGradient
          colors={['#FF6B9D', '#FF8E53']}
          style={styles.boostGradient}
        >
          <Ionicons name="flame" size={20} color="white" />
          <Text style={styles.boostText}>Boost Profile</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#FF6B9D" />
      
      {/* Header */}
      <LinearGradient
        colors={['#FF6B9D', '#FF8E53']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <View style={styles.logoContainer}>
              <Ionicons name="heart" size={24} color="white" />
              <Text style={styles.logoText}>Likes You</Text>
            </View>
            {likes.length > 0 && (
              <View style={styles.likesCount}>
                <Text style={styles.likesCountText}>{likes.length}</Text>
              </View>
            )}
          </View>
          
          <TouchableOpacity style={styles.boostButton}>
            <LinearGradient
              colors={['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.1)']}
              style={styles.boostButtonGradient}
            >
              <Ionicons name="flame" size={18} color="white" />
              <Text style={styles.boostButtonText}>Boost</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Filter Tabs */}
        <View style={styles.filterContainer}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterScroll}
          >
            {renderFilterTab('Recent', 'Recent')}
            {renderFilterTab('Your Type', 'Your Type')}
            {renderFilterTab('Last Active', 'Last Active')}
            {renderFilterTab('Nearby', 'Nearby')}
          </ScrollView>
        </View>
      </LinearGradient>

      {/* Content */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <LinearGradient
            colors={['#FF6B9D', '#FF8E53']}
            style={styles.loadingSpinner}
          >
            <Ionicons name="heart" size={32} color="white" />
          </LinearGradient>
          <Text style={styles.loadingText}>Loading your likes...</Text>
        </View>
      ) : likes.length > 0 ? (
        <FlatList
          data={likes}
          renderItem={renderLikeItem}
          keyExtractor={(item) => `like-${item.userId?._id || item._id}`}
          contentContainerStyle={styles.likesList}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        renderEmptyState()
      )}
    </SafeAreaView>
  );
};

export default LikesScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  logoText: {
    fontSize: typography.fontSize.xl,
    fontFamily: typography.fontFamily.bold,
    color: 'white',
  },
  likesCount: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    minWidth: 28,
    alignItems: 'center',
  },
  likesCountText: {
    color: 'white',
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.bold,
  },
  boostButton: {
    borderRadius: borderRadius.medium,
    overflow: 'hidden',
  },
  boostButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.xs,
  },
  boostButtonText: {
    color: 'white',
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.bold,
  },
  filterContainer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  filterScroll: {
    paddingRight: spacing.xl,
  },
  filterTab: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.xlarge,
    marginRight: spacing.sm,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  filterTabActive: {
    backgroundColor: 'white',
  },
  filterTabText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.medium,
    color: 'white',
  },
  filterTabTextActive: {
    color: colors.primary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  loadingSpinner: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  loadingText: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.medium,
    color: colors.textSecondary,
  },
  likesList: {
    padding: spacing.lg,
  },
  likeCard: {
    backgroundColor: 'white',
    borderRadius: borderRadius.large,
    marginBottom: spacing.md,
    overflow: 'hidden',
    ...shadows.large,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: '#F8F9FA',
  },
  profileImageContainer: {
    position: 'relative',
    marginRight: spacing.md,
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
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
  },
  profileInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
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
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  infoText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.textSecondary,
  },
  likeIndicator: {
    alignItems: 'center',
  },
  likeIndicatorGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.medium,
    gap: spacing.xs,
  },
  likeIndicatorText: {
    color: 'white',
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.bold,
  },
  likeDetails: {
    padding: spacing.lg,
  },
  likeActionText: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.medium,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  likedPhotosContainer: {
    marginBottom: spacing.md,
  },
  likedPhotosScroll: {
    gap: spacing.sm,
  },
  likedPhotoItem: {
    position: 'relative',
  },
  likedPhotoThumbnail: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.medium,
  },
  commentBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#FF6B9D',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  commentBubble: {
    backgroundColor: '#F8F9FA',
    padding: spacing.md,
    borderRadius: borderRadius.medium,
    borderLeftWidth: 3,
    borderLeftColor: '#FF6B9D',
  },
  commentText: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.medium,
    color: colors.textPrimary,
    fontStyle: 'italic',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: spacing.lg,
    gap: spacing.md,
  },
  passButton: {
    flex: 1,
    height: 50,
    borderRadius: 25,
    overflow: 'hidden',
  },
  likeButton: {
    flex: 1,
    height: 50,
    borderRadius: 25,
    overflow: 'hidden',
  },
  actionButtonGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  emptyIconGradient: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  emptyTitle: {
    fontSize: typography.fontSize.xl,
    fontFamily: typography.fontFamily.bold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  emptySubtitle: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.regular,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  boostContainer: {
    borderRadius: borderRadius.medium,
    overflow: 'hidden',
  },
  boostGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    gap: spacing.sm,
  },
  boostText: {
    color: 'white',
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.semiBold,
  },
});
