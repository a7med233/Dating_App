import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Image,
  Pressable,
  Alert,
  Platform,
  StatusBar,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import React from 'react';
import {useRoute} from '@react-navigation/native';
import { Entypo, AntDesign, MaterialIcons, Ionicons } from '@expo/vector-icons';
import {useNavigation} from '@react-navigation/native';
import { createMatch } from '../services/api';
import { colors, typography, shadows, borderRadius, spacing } from '../theme/colors';
import { LinearGradient } from 'expo-linear-gradient';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const HandleLikeScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  
  console.log('HandleLikeScreen params:', route?.params);
  
  const createMatchHandler = async () => {
    try {
      const currentUserId = route?.params?.userId;
      const selectedUserId = route?.params?.selectedUserId;
      const response = await createMatch({ currentUserId, selectedUserId });
      if (response.status === 200) {
        navigation.goBack();
      } else {
        console.error('Failed to create match');
      }
    } catch (error) {
      console.error('Error creating match:', error);
      
      // Handle specific error for blocked users
      if (error.response?.status === 403 && error.response?.data?.message === 'Cannot create match with this user') {
        Alert.alert(
          'Cannot Create Match',
          'This user is not available for matching.',
          [
            {
              text: 'OK',
              onPress: () => navigation.goBack()
            }
          ]
        );
      } else {
        Alert.alert(
          'Error',
          'Failed to create match. Please try again.',
          [
            {
              text: 'OK'
            }
          ]
        );
      }
    }
  };
  
  const match = () => {
    Alert.alert('Accept Request?', `Match with ${route?.params?.name}`, [
      {
        text: 'Cancel',
        onPress: () => console.log('Cancel Pressed'),
        style: 'cancel',
      },
      {text: 'OK', onPress: createMatchHandler},
    ]);
  };

  const renderLikedPhotos = () => {
    const allLikes = route?.params?.allLikes || [];
    if (!allLikes || allLikes.length === 0) return null;

    return (
      <View style={styles.likedPhotosSection}>
        <Text style={styles.sectionTitle}>
          {allLikes.length > 1 ? 'Liked these photos:' : 'Liked this photo:'}
        </Text>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.likedPhotosScroll}
        >
          {allLikes.map((like, index) => (
            <View key={index} style={styles.likedPhotoContainer}>
              <Image
                source={{ uri: like.image }}
                style={styles.likedPhotoImage}
              />
              {like.comment && (
                <View style={styles.commentIndicator}>
                  <Ionicons name="chatbubble" size={12} color="white" />
                </View>
              )}
            </View>
          ))}
        </ScrollView>
      </View>
    );
  };

  const renderComments = () => {
    const allLikes = route?.params?.allLikes || [];
    const comments = allLikes.filter(like => like.comment);
    
    if (comments.length === 0) return null;

    return (
      <View style={styles.commentsSection}>
        <Text style={styles.sectionTitle}>Comments:</Text>
        {comments.map((like, index) => (
          <View key={index} style={styles.commentItem}>
            <View style={styles.commentBubble}>
              <Text style={styles.commentText}>"{like.comment}"</Text>
            </View>
          </View>
        ))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      
      {/* Header */}
      <LinearGradient
        colors={['white', '#F8F9FA']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity 
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>
              {route?.params?.likeCount > 1 
                ? `${route?.params?.likeCount} likes from ${route?.params?.name}`
                : `Like from ${route?.params?.name}`
              }
            </Text>
          </View>
          
          <TouchableOpacity style={styles.menuButton}>
            <Entypo name="dots-three-horizontal" size={22} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <View style={styles.profileImageContainer}>
              <Image
                source={{ uri: route?.params?.imageUrls?.[0] }}
                style={styles.profileImage}
              />
              <View style={styles.onlineIndicator} />
            </View>
            
            <View style={styles.profileInfo}>
              <View style={styles.nameRow}>
                <Text style={styles.profileName}>
                  {route?.params?.name}
                </Text>
                <View style={styles.newBadge}>
                  <Text style={styles.newBadgeText}>new here</Text>
                </View>
              </View>
              
              <View style={styles.profileDetails}>
                <View style={styles.detailRow}>
                  <Ionicons name="location-outline" size={16} color={colors.textSecondary} />
                  <Text style={styles.detailText}>
                    {route?.params?.location || 'Location not set'}
                  </Text>
                </View>
                
                {route?.params?.occupation && (
                  <View style={styles.detailRow}>
                    <MaterialIcons name="work-outline" size={16} color={colors.textSecondary} />
                    <Text style={styles.detailText}>
                      {route?.params?.occupation}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </View>
        </View>

        {/* Liked Photos Section */}
        {renderLikedPhotos()}

        {/* Comments Section */}
        {renderComments()}

        {/* Profile Photos */}
        <View style={styles.photosSection}>
          <Text style={styles.sectionTitle}>Profile Photos:</Text>
          {route?.params?.imageUrls?.map((imageUrl, index) => (
            <View key={index} style={styles.photoContainer}>
              <Image
                source={{ uri: imageUrl }}
                style={styles.photoImage}
              />
            </View>
          ))}
        </View>

        {/* Prompts Section */}
        {route?.params?.prompts && route?.params?.prompts.length > 0 && (
          <View style={styles.promptsSection}>
            <Text style={styles.sectionTitle}>Prompts:</Text>
            {route?.params?.prompts.map((prompt, index) => (
              <View key={prompt.id || index} style={styles.promptCard}>
                <Text style={styles.promptQuestion}>{prompt.question}</Text>
                <Text style={styles.promptAnswer}>{prompt.answer}</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actionContainer}>
        <TouchableOpacity
          style={styles.passButton}
          onPress={() => navigation.goBack()}
        >
          <Entypo name="cross" size={28} color="#FF6B6B" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.matchButton}
          onPress={match}
        >
          <LinearGradient
            colors={['#FF6B9D', '#FF8E53']}
            style={styles.matchButtonGradient}
          >
            <AntDesign name="heart" size={24} color="white" />
            <Text style={styles.matchButtonText}>Match</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default HandleLikeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: Platform.OS === 'android' ? spacing.md : spacing.lg,
  },
  backButton: {
    padding: spacing.xs,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.bold,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  menuButton: {
    padding: spacing.xs,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: 120,
  },
  profileCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: Platform.OS === 'android' ? spacing.md : spacing.lg,
    marginBottom: spacing.md,
    ...shadows.medium,
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
  newBadge: {
    backgroundColor: '#FF6B9D',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.xlarge,
  },
  newBadgeText: {
    color: 'white',
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.medium,
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
  likedPhotosSection: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: Platform.OS === 'android' ? spacing.md : spacing.lg,
    marginBottom: spacing.md,
    ...shadows.medium,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.bold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  likedPhotosScroll: {
    paddingHorizontal: spacing.xs,
  },
  likedPhotoContainer: {
    position: 'relative',
    marginRight: spacing.sm,
  },
  likedPhotoImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
  },
  commentIndicator: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#FF6B9D',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  commentsSection: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: Platform.OS === 'android' ? spacing.md : spacing.lg,
    marginBottom: spacing.md,
    ...shadows.medium,
  },
  commentItem: {
    marginBottom: spacing.sm,
  },
  commentBubble: {
    backgroundColor: '#F0F0F0',
    padding: spacing.md,
    borderRadius: 12,
    borderTopLeftRadius: 4,
  },
  commentText: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.regular,
    color: colors.textPrimary,
    fontStyle: 'italic',
  },
  photosSection: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: Platform.OS === 'android' ? spacing.md : spacing.lg,
    marginBottom: spacing.md,
    ...shadows.medium,
  },
  photoContainer: {
    marginBottom: spacing.md,
  },
  photoImage: {
    width: '100%',
    height: 300,
    borderRadius: 12,
  },
  promptsSection: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: Platform.OS === 'android' ? spacing.md : spacing.lg,
    marginBottom: spacing.md,
    ...shadows.medium,
  },
  promptCard: {
    backgroundColor: '#F8F9FA',
    padding: Platform.OS === 'android' ? spacing.md : spacing.lg,
    borderRadius: 12,
    marginBottom: spacing.md,
  },
  promptQuestion: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.medium,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  promptAnswer: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.semiBold,
    color: colors.textPrimary,
  },
  actionContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#E8E8E8',
  },
  passButton: {
    backgroundColor: 'white',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.medium,
  },
  matchButton: {
    borderRadius: borderRadius.medium,
    overflow: 'hidden',
  },
  matchButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  matchButtonText: {
    color: 'white',
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.bold,
  },
});
