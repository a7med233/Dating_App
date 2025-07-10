import { 
  ScrollView, 
  StyleSheet, 
  Text, 
  View, 
  Image,  
  Platform, 
  StatusBar,
  Pressable,
  Dimensions,
  FlatList,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  Animated,
} from 'react-native'
import { colors, typography, shadows, borderRadius, spacing } from '../theme/colors';
import { LinearGradient } from 'expo-linear-gradient';
import React, { Fragment, useState, useEffect, useRef } from 'react'
import { useRoute, useFocusEffect } from '@react-navigation/native'
import { Ionicons, Entypo, AntDesign, MaterialIcons, Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { jwtDecode } from 'jwt-decode';
import getApi, { getUserMatches, blockUser, unblockUser, reportUser, checkBlockedStatus } from '../services/api';
import ReportModal from '../components/ReportModal';


const { width: screenWidth } = Dimensions.get('window');

const ProfileDetailsScreen = () => {
    const route = useRoute();
    const navigation = useNavigation();
    const [currentProfile, setCurrentProfile] = useState(route?.params?.currentProfile);
    const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
    const [isOwnProfile, setIsOwnProfile] = useState(false);
    const [currentUserId, setCurrentUserId] = useState('');
    const [isAlreadyMatched, setIsAlreadyMatched] = useState(false);
    const [isBlocked, setIsBlocked] = useState(false);
    const [showReportModal, setShowReportModal] = useState(false);
    const [isFromMatches, setIsFromMatches] = useState(route?.params?.isFromMatches || false);
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(50)).current;

    const photos = currentProfile?.imageUrls || [];

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

    // Fetch updated profile data from API
    const fetchUpdatedProfile = async () => {
        try {
            const token = await AsyncStorage.getItem('token');
            const decodedToken = jwtDecode(token);
            const userId = decodedToken.userId;
            setCurrentUserId(userId);

            // Fetch current user's matches to check if already matched
            const userMatchesResponse = await getUserMatches(userId);
            const userMatches = userMatchesResponse.data.matches || [];
            
            // Check if current profile is in user's matches
            const matched = userMatches.some(match => match._id === currentProfile?._id);
            setIsAlreadyMatched(matched);

            // Check if this is own profile
            const profileUserId = currentProfile?._id;
            setIsOwnProfile(userId === profileUserId);

            // Check if user is blocked
            if (!isOwnProfile && profileUserId) {
                try {
                    const blockedResponse = await checkBlockedStatus(userId, profileUserId);
                    setIsBlocked(blockedResponse.data.isBlocked);
                } catch (error) {
                    console.error('Error checking blocked status:', error);
                }
            }
        } catch (error) {
            console.error('Error getting current user ID:', error);
        }
    };

    useEffect(() => {
        const getCurrentUserId = async () => {
            try {
                const token = await AsyncStorage.getItem('token');
                if (token) {
                    const decodedToken = jwtDecode(token);
                    const userId = decodedToken.userId;
                    setCurrentUserId(userId);
                    
                    // Check if this is the user's own profile
                    const profileUserId = currentProfile?._id;
                    setIsOwnProfile(userId === profileUserId);
                }
            } catch (error) {
                console.error('Error getting current user ID:', error);
            }
        };
        
        getCurrentUserId();
    }, [currentProfile?._id]);

    // Refresh profile data when screen comes into focus
    useFocusEffect(
        React.useCallback(() => {
            fetchUpdatedProfile();
        }, [])
    );

    const handleLike = () => {
        if (isOwnProfile) {
            Alert.alert('Cannot like your own profile');
            return;
        }
        
        if (isAlreadyMatched) {
            Alert.alert('Already Matched', 'You are already matched with this user!');
            return;
        }
        
        // Navigate to send like screen
        navigation.navigate('SendLike', {
            image: photos[currentPhotoIndex],
            name: currentProfile?.firstName,
            userId: currentUserId,
            likedUserId: currentProfile?._id
        });
    };

    const handleEdit = () => {
        if (!isOwnProfile) return;
        // Navigate to edit profile screen
        navigation.navigate('EditProfile', {
            profile: currentProfile
        });
    };

    const handleBlock = async () => {
        try {
            await blockUser(currentUserId, currentProfile._id);
            setIsBlocked(true);
            Alert.alert('Success', 'User has been blocked');
        } catch (error) {
            if (error.response?.data?.message === 'User is already blocked') {
                setIsBlocked(true);
                Alert.alert('Info', 'User is already blocked');
            } else {
                Alert.alert('Error', 'Failed to block user');
            }
        }
    };

    const handleUnblock = async () => {
        try {
            await unblockUser(currentUserId, currentProfile._id);
            setIsBlocked(false);
            Alert.alert('Success', 'User has been unblocked');
        } catch (error) {
            Alert.alert('Error', 'Failed to unblock user');
        }
    };

    const handleReport = async (reason, description) => {
        try {
            await reportUser(currentUserId, currentProfile._id, reason, description);
            Alert.alert('Success', 'User has been reported. Thank you for helping keep our community safe.');
        } catch (error) {
            throw error; // Let the modal handle the error
        }
    };

    const renderPhotoItem = ({ item, index }) => (
        <View style={styles.photoContainer}>
            <Image
                style={styles.photo}
                source={{ uri: item }}
                resizeMode="cover"
            />
            <LinearGradient
                colors={['rgba(255, 107, 157, 0.1)', 'rgba(255, 142, 83, 0.1)']}
                style={styles.photoOverlay}
            />
            {!isOwnProfile && !isFromMatches && (
                <TouchableOpacity
                    style={[styles.likeButton, isAlreadyMatched && styles.matchedButton]}
                    onPress={handleLike}
                    activeOpacity={0.8}
                >
                    <LinearGradient
                        colors={isAlreadyMatched ? ['#4CAF50', '#45A049'] : ['#FF6B9D', '#FF8E53']}
                        style={styles.likeButtonGradient}
                    >
                        {isAlreadyMatched ? (
                            <AntDesign name="heart" size={25} color="white" />
                        ) : (
                            <AntDesign name="hearto" size={25} color="white" />
                        )}
                    </LinearGradient>
                </TouchableOpacity>
            )}
        </View>
    );

    const renderBasicInfoItem = ({ label, value, icon }) => {
        if (!value) return null;
        return (
            <View style={styles.basicInfoItem}>
                <View style={styles.basicInfoIcon}>
                    {icon}
                </View>
                <View style={styles.basicInfoContent}>
                    <Text style={styles.basicInfoLabel}>{label}</Text>
                    <Text style={styles.basicInfoValue}>{value}</Text>
                </View>
            </View>
        );
    };

    if (!currentProfile) {
        return (
            <View style={styles.container}>
                <View style={styles.loadingContainer}>
                    <Text style={styles.loadingText}>Loading profile...</Text>
                </View>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="white" />
            
            {/* Header */}
            <LinearGradient
                colors={['white', '#F8F9FA']}
                style={styles.header}
            >
                <View style={styles.headerContent}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
                    </TouchableOpacity>
                    
                    <View style={styles.headerCenter}>
                        <Text style={styles.headerTitle}>
                            {isOwnProfile ? 'My Profile' : currentProfile?.firstName}
                        </Text>
                        {currentProfile?.age && (
                            <Text style={styles.headerSubtitle}>{currentProfile.age} years old</Text>
                        )}
                    </View>
                    
                    <TouchableOpacity
                        style={styles.headerButton}
                        onPress={isOwnProfile ? handleEdit : () => {}}
                        activeOpacity={0.7}
                    >
                        {isOwnProfile ? (
                            <Feather name="edit-3" size={20} color={colors.primary} />
                        ) : (
                            <Entypo name="dots-three-horizontal" size={20} color={colors.textPrimary} />
                        )}
                    </TouchableOpacity>
                </View>
            </LinearGradient>

            <ScrollView 
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Photo Gallery */}
                {photos.length > 0 && (
                    <Animated.View 
                        style={[
                            styles.photoSection,
                            {
                                opacity: fadeAnim,
                                transform: [{ translateY: slideAnim }],
                            }
                        ]}
                    >
                        <FlatList
                            data={photos}
                            renderItem={renderPhotoItem}
                            keyExtractor={(item, index) => `photo-${index}`}
                            horizontal
                            pagingEnabled
                            showsHorizontalScrollIndicator={false}
                            onMomentumScrollEnd={(event) => {
                                const index = Math.round(event.nativeEvent.contentOffset.x / screenWidth);
                                setCurrentPhotoIndex(index);
                            }}
                            style={styles.photoList}
                        />
                        
                        {/* Photo Indicators */}
                        {photos.length > 1 && (
                            <View style={styles.photoIndicators}>
                                {photos.map((_, index) => (
                                    <View
                                        key={index}
                                        style={[
                                            styles.photoIndicator,
                                            index === currentPhotoIndex && styles.photoIndicatorActive
                                        ]}
                                    />
                                ))}
                            </View>
                        )}
                    </Animated.View>
                )}

                {/* Profile Info Card */}
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
                        <View style={styles.nameRow}>
                            <Text style={styles.profileName}>
                            {currentProfile?.firstName}
                            </Text>
                        {currentProfile?.age && (
                            <Text style={styles.profileAge}>{currentProfile.age}</Text>
                            )}
                        </View>
                        
                        {currentProfile?.location && (
                            <View style={styles.locationRow}>
                                <Ionicons name="location-outline" size={16} color={colors.textSecondary} />
                                <Text style={styles.locationText}>{currentProfile.location}</Text>
                            </View>
                        )}
                    </View>
                </Animated.View>

                {/* Bio Section */}
                {currentProfile?.bio && (
                    <Animated.View 
                        style={[
                            styles.bioSection,
                            {
                                opacity: fadeAnim,
                                transform: [{ translateY: slideAnim }],
                            }
                        ]}
                    >
                        <Text style={styles.sectionTitle}>About</Text>
                        <Text style={styles.bioText}>{currentProfile.bio}</Text>
                    </Animated.View>
                )}

                {/* Basic Info Section */}
                <Animated.View 
                    style={[
                        styles.basicInfoSection,
                        {
                            opacity: fadeAnim,
                            transform: [{ translateY: slideAnim }],
                        }
                    ]}
                >
                    <Text style={styles.sectionTitle}>Basic Info</Text>
                    
                    {renderBasicInfoItem({
                        label: 'Gender',
                        value: currentProfile?.gender,
                        icon: <Ionicons name="person-outline" size={16} color={colors.textSecondary} />
                    })}
                    
                    {renderBasicInfoItem({
                        label: 'Looking for',
                        value: currentProfile?.lookingFor,
                        icon: <Ionicons name="heart-outline" size={16} color={colors.textSecondary} />
                    })}
                    
                    {renderBasicInfoItem({
                        label: 'Type',
                        value: currentProfile?.type,
                        icon: <MaterialIcons name="category" size={16} color={colors.textSecondary} />
                    })}
                    
                    {renderBasicInfoItem({
                        label: 'Height',
                        value: currentProfile?.height,
                        icon: <MaterialIcons name="height" size={16} color={colors.textSecondary} />
                    })}
                    
                    {renderBasicInfoItem({
                        label: 'Hometown',
                        value: currentProfile?.hometown,
                        icon: <Ionicons name="home-outline" size={16} color={colors.textSecondary} />
                    })}
                    
                    {renderBasicInfoItem({
                        label: 'Occupation',
                        value: currentProfile?.occupation,
                        icon: <MaterialIcons name="work-outline" size={16} color={colors.textSecondary} />
                    })}
                    
                    {currentProfile?.languages && currentProfile.languages.length > 0 && (
                        <View style={styles.languagesContainer}>
                            <View style={styles.fieldHeader}>
                                <View style={styles.fieldIcon}>
                                    <Ionicons name="language-outline" size={16} color={colors.textSecondary} />
                                </View>
                                <Text style={styles.fieldLabel}>Languages</Text>
                            </View>
                            <View style={styles.languagesList}>
                                {currentProfile.languages.map((language, index) => (
                                    <View key={index} style={styles.languageTag}>
                                        <Text style={styles.languageText}>{language}</Text>
                                    </View>
                                ))}
                            </View>
                        </View>
                    )}
                </Animated.View>

                {/* Lifestyle Section */}
                {(currentProfile?.children || currentProfile?.smoking || currentProfile?.drinking) && (
                    <Animated.View 
                        style={[
                            styles.lifestyleSection,
                            {
                                opacity: fadeAnim,
                                transform: [{ translateY: slideAnim }],
                            }
                        ]}
                    >
                        <Text style={styles.sectionTitle}>Lifestyle</Text>
                        
                        {renderBasicInfoItem({
                            label: 'Children',
                            value: currentProfile?.children,
                            icon: <Ionicons name="people-outline" size={16} color={colors.textSecondary} />
                        })}
                        
                        {renderBasicInfoItem({
                            label: 'Smoking',
                            value: currentProfile?.smoking,
                            icon: <MaterialIcons name="smoking-rooms" size={16} color={colors.textSecondary} />
                        })}
                        
                        {renderBasicInfoItem({
                            label: 'Drinking',
                            value: currentProfile?.drinking,
                            icon: <MaterialIcons name="local-bar" size={16} color={colors.textSecondary} />
                        })}
                    </Animated.View>
                )}

                {/* Prompts Section */}
                {currentProfile?.prompts && currentProfile.prompts.length > 0 && (
                    <Animated.View 
                        style={[
                            styles.promptsSection,
                            {
                                opacity: fadeAnim,
                                transform: [{ translateY: slideAnim }],
                            }
                        ]}
                    >
                        <Text style={styles.sectionTitle}>Prompts</Text>
                        {currentProfile.prompts.map((prompt, index) => (
                            <View key={index} style={styles.promptCard}>
                                <Text style={styles.promptQuestion}>{prompt.question}</Text>
                                <Text style={styles.promptAnswer}>{prompt.answer}</Text>
                                {!isOwnProfile && !isFromMatches && (
                                    <TouchableOpacity
                                        style={styles.promptLikeButton}
                                        onPress={handleLike}
                                        activeOpacity={0.8}
                                    >
                                        <LinearGradient
                                            colors={['#FF6B9D', '#FF8E53']}
                                            style={styles.promptLikeGradient}
                                        >
                                            <AntDesign name="hearto" size={16} color="white" />
                                        </LinearGradient>
                                    </TouchableOpacity>
                                )}
                            </View>
                        ))}
                    </Animated.View>
                )}

                {/* Dating Preferences */}
                {currentProfile?.datingPreferences && currentProfile.datingPreferences.length > 0 && (
                    <Animated.View 
                        style={[
                            styles.preferencesSection,
                            {
                                opacity: fadeAnim,
                                transform: [{ translateY: slideAnim }],
                            }
                        ]}
                    >
                        <Text style={styles.sectionTitle}>Dating Preferences</Text>
                        <View style={styles.preferencesContainer}>
                            {currentProfile.datingPreferences.map((preference, index) => (
                                <View key={index} style={styles.preferenceTag}>
                                    <Text style={styles.preferenceText}>{preference}</Text>
                                </View>
                            ))}
                        </View>
                    </Animated.View>
                )}

                {/* Action Buttons for Non-Own Profile */}
                {!isOwnProfile && (
                    <Animated.View 
                        style={[
                            styles.optionsContainer,
                            {
                                opacity: fadeAnim,
                                transform: [{ translateY: slideAnim }],
                            }
                        ]}
                    >
                        {isBlocked ? (
                            <TouchableOpacity
                                style={styles.optionButton}
                                onPress={handleUnblock}
                                activeOpacity={0.8}
                            >
                                <Ionicons name="lock-open-outline" size={16} color="#4CAF50" />
                                <Text style={[styles.optionButtonText, { color: '#4CAF50' }]}>Unblock</Text>
                            </TouchableOpacity>
                        ) : (
                            <TouchableOpacity
                                style={styles.optionButton}
                                onPress={handleBlock}
                                activeOpacity={0.8}
                            >
                                <Ionicons name="lock-closed-outline" size={16} color="#FF6B6B" />
                                <Text style={[styles.optionButtonText, { color: '#FF6B6B' }]}>Block</Text>
                            </TouchableOpacity>
                        )}
                        
                        <TouchableOpacity
                            style={styles.optionButton}
                            onPress={() => setShowReportModal(true)}
                            activeOpacity={0.8}
                        >
                            <Ionicons name="flag-outline" size={16} color="#FF9800" />
                            <Text style={[styles.optionButtonText, { color: '#FF9800' }]}>Report</Text>
                        </TouchableOpacity>
                    </Animated.View>
                )}
            </ScrollView>

            {/* Report Modal */}
            <ReportModal
                visible={showReportModal}
                onClose={() => setShowReportModal(false)}
                onSubmit={handleReport}
            />
        </SafeAreaView>
    );
};

export default ProfileDetailsScreen;

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
    backButton: {
        padding: spacing.sm,
        borderRadius: borderRadius.medium,
    },
    headerCenter: {
        flex: 1,
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: typography.fontSize.lg,
        fontFamily: typography.fontFamily.bold,
        color: colors.textPrimary,
    },
    headerSubtitle: {
        fontSize: typography.fontSize.sm,
        fontFamily: typography.fontFamily.regular,
        color: colors.textSecondary,
        marginTop: spacing.xs,
    },
    headerButton: {
        padding: spacing.sm,
        borderRadius: borderRadius.medium,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: Platform.OS === 'android' ? 100 : 80,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        fontSize: typography.fontSize.lg,
        fontFamily: typography.fontFamily.medium,
        color: colors.textSecondary,
    },
    photoSection: {
        marginBottom: spacing.md,
    },
    photoList: {
        height: screenWidth * 1.2,
    },
    photoContainer: {
        width: screenWidth,
        height: screenWidth * 1.2,
        position: 'relative',
    },
    photo: {
        width: '100%',
        height: '100%',
    },
    photoOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    photoIndicators: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        bottom: spacing.md,
        left: 0,
        right: 0,
        gap: spacing.xs,
    },
    photoIndicator: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: 'rgba(255, 255, 255, 0.5)',
    },
    photoIndicatorActive: {
        backgroundColor: '#FF6B9D',
        width: 24,
    },
    profileCard: {
        backgroundColor: 'white',
        borderRadius: 20,
        padding: Platform.OS === 'android' ? spacing.md : spacing.lg,
        marginHorizontal: spacing.md,
        marginBottom: spacing.md,
        ...shadows.medium,
        borderWidth: 1,
        borderColor: 'rgba(255, 107, 157, 0.1)',
    },
    profileHeader: {
        alignItems: 'center',
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
    profileAge: {
        fontSize: typography.fontSize.lg,
        fontFamily: typography.fontFamily.medium,
        color: colors.textSecondary,
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
    },
    locationText: {
        fontSize: typography.fontSize.md,
        fontFamily: typography.fontFamily.medium,
        color: colors.textSecondary,
    },
    bioSection: {
        backgroundColor: 'white',
        borderRadius: 20,
        padding: Platform.OS === 'android' ? spacing.md : spacing.lg,
        marginHorizontal: spacing.md,
        marginBottom: spacing.md,
        ...shadows.medium,
        borderWidth: 1,
        borderColor: 'rgba(255, 107, 157, 0.1)',
    },
    sectionTitle: {
        fontSize: typography.fontSize.lg,
        fontFamily: typography.fontFamily.bold,
        color: colors.textPrimary,
        marginBottom: spacing.md,
    },
    bioText: {
        fontSize: typography.fontSize.md,
        fontFamily: typography.fontFamily.regular,
        color: colors.textPrimary,
        lineHeight: 24,
    },
    basicInfoSection: {
        backgroundColor: 'white',
        borderRadius: 20,
        padding: Platform.OS === 'android' ? spacing.md : spacing.lg,
        marginHorizontal: spacing.md,
        marginBottom: spacing.md,
        ...shadows.medium,
        borderWidth: 1,
        borderColor: 'rgba(255, 107, 157, 0.1)',
    },
    basicInfoItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    basicInfoIcon: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#F0F0F0',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.md,
    },
    basicInfoContent: {
        flex: 1,
    },
    basicInfoLabel: {
        fontSize: typography.fontSize.sm,
        fontFamily: typography.fontFamily.medium,
        color: colors.textSecondary,
        marginBottom: spacing.xs,
    },
    basicInfoValue: {
        fontSize: typography.fontSize.md,
        fontFamily: typography.fontFamily.semiBold,
        color: colors.textPrimary,
    },
    languagesContainer: {
        marginBottom: spacing.md,
    },
    fieldHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.sm,
    },
    fieldIcon: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#F0F0F0',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.md,
    },
    fieldLabel: {
        fontSize: typography.fontSize.sm,
        fontFamily: typography.fontFamily.medium,
        color: colors.textSecondary,
    },
    languagesList: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.sm,
    },
    languageTag: {
        backgroundColor: colors.primary,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: borderRadius.medium,
        ...shadows.small,
    },
    languageText: {
        fontSize: typography.fontSize.sm,
        fontFamily: typography.fontFamily.medium,
        color: 'white',
    },
    lifestyleSection: {
        backgroundColor: 'white',
        borderRadius: 20,
        padding: Platform.OS === 'android' ? spacing.md : spacing.lg,
        marginHorizontal: spacing.md,
        marginBottom: spacing.md,
        ...shadows.medium,
        borderWidth: 1,
        borderColor: 'rgba(255, 107, 157, 0.1)',
    },
    promptsSection: {
        backgroundColor: 'white',
        borderRadius: 20,
        padding: Platform.OS === 'android' ? spacing.md : spacing.lg,
        marginHorizontal: spacing.md,
        marginBottom: spacing.md,
        ...shadows.medium,
        borderWidth: 1,
        borderColor: 'rgba(255, 107, 157, 0.1)',
    },
    promptCard: {
        backgroundColor: '#F8F9FA',
        borderRadius: 16,
        padding: Platform.OS === 'android' ? spacing.md : spacing.lg,
        marginBottom: spacing.md,
        position: 'relative',
        borderLeftWidth: 3,
        borderLeftColor: '#FF6B9D',
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
    promptLikeButton: {
        position: 'absolute',
        top: spacing.md,
        right: spacing.md,
        borderRadius: 18,
        overflow: 'hidden',
        ...shadows.small,
    },
    promptLikeGradient: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    preferencesSection: {
        backgroundColor: 'white',
        borderRadius: 20,
        padding: Platform.OS === 'android' ? spacing.md : spacing.lg,
        marginHorizontal: spacing.md,
        marginBottom: spacing.md,
        ...shadows.medium,
        borderWidth: 1,
        borderColor: 'rgba(255, 107, 157, 0.1)',
    },
    preferencesContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.sm,
    },
    preferenceTag: {
        backgroundColor: '#F0F0F0',
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: 20,
        ...shadows.small,
    },
    preferenceText: {
        fontSize: typography.fontSize.sm,
        fontFamily: typography.fontFamily.medium,
        color: colors.textPrimary,
    },
    likeButton: {
        position: 'absolute',
        bottom: spacing.lg,
        right: spacing.lg,
        borderRadius: 30,
        overflow: 'hidden',
        ...shadows.medium,
    },
    matchedButton: {
        backgroundColor: 'rgba(76, 175, 80, 0.1)',
        borderWidth: 2,
        borderColor: '#4CAF50',
    },
    likeButtonGradient: {
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
    },
    optionsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
        backgroundColor: 'white',
        borderTopWidth: 1,
        borderTopColor: '#E8E8E8',
        marginTop: spacing.md,
    },
    optionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: borderRadius.medium,
        backgroundColor: '#F8F9FA',
        gap: spacing.xs,
        ...shadows.small,
    },
    optionButtonText: {
        fontSize: typography.fontSize.sm,
        fontFamily: typography.fontFamily.medium,
        color: colors.textPrimary,
    },
});