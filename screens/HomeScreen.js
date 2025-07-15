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
  Dimensions,
  Modal,
  Alert,
  TextInput,
  Animated
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import React, {useEffect, useState, useCallback, useRef} from 'react';
import { Ionicons, Entypo, AntDesign, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {jwtDecode} from 'jwt-decode';
import { fetchMatches, deduplicateUser, rejectProfile } from '../services/api';
import { colors, typography, shadows, borderRadius, spacing } from '../theme/colors';
import { LinearGradient } from 'expo-linear-gradient';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const HomeScreen = () => {
  const navigation = useNavigation();
  const [option, setOption] = useState('Compatible');
  const [profilesData, setProfilesData] = useState([]);
  const [userId, setUserId] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    ageRange: { min: 18, max: 99 },
    religion: '',
    height: '',
    children: '',
    smoking: '',
    drinking: '',
    languages: [],
    location: '',
  });
  const [activeFilters, setActiveFilters] = useState(0);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
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

  const fetchMatchesHandler = async () => {
    try {
      setIsLoading(true);
      
      // First, deduplicate the user's data
      try {
        await deduplicateUser(userId);
      } catch (error) {
        console.log('Deduplication failed or not needed:', error.message);
      }
      
      console.log('Fetching matches for userId:', userId);
      const response = await fetchMatches(userId);
      console.log('API Response:', response);
      const matches = response.data.matches;
      console.log('Matches data:', matches);
      console.log('Number of matches:', matches?.length || 0);
      setProfilesData(matches || []);
    } catch (error) {
      console.error('Error fetching matches:', error);
      console.error('Error details:', error.response?.data);
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

  const handleLike = () => {
    navigation.navigate('SendLike', {
      image: filteredProfiles[0]?.imageUrls?.[0],
      name: filteredProfiles[0]?.firstName,
      userId: userId,
      likedUserId: filteredProfiles[0]?._id
    });
  };

  const handleCross = async () => {
    try {
      const currentProfile = filteredProfiles[0];
      if (currentProfile && currentProfile._id) {
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
          rejectProfile(userId, currentProfile._id).then(() => {
            // Refresh the data from backend to ensure rejected users are properly filtered
            fetchMatchesHandler();
          }).catch((error) => {
            console.error('Error rejecting profile:', error);
            // Still refresh data even if API call fails
            fetchMatchesHandler();
          });
          
          // Reset animations
          fadeAnim.setValue(1);
          slideAnim.setValue(0);
          setCurrentImageIndex(0);
        });
      } else {
        // If no current profile, just remove from local state
        const updatedProfiles = filteredProfiles.slice(1);
        setProfilesData(updatedProfiles);
      }
    } catch (error) {
      console.error('Error rejecting profile:', error);
      // Still remove the profile from the UI even if the API call fails
      const updatedProfiles = filteredProfiles.slice(1);
      setProfilesData(updatedProfiles);
    }
  };

  const filterProfiles = () => {
    console.log('Filtering profiles with option:', option);
    console.log('Total profiles data:', profilesData?.length || 0);
    
    if (!profilesData || profilesData.length === 0) {
      console.log('No profiles data available');
      return [];
    }

    let filtered = [];
    switch (option) {
      case 'Compatible':
        // For now, show all profiles since compatibility score might not be implemented
        filtered = profilesData;
        console.log('Compatible filter - showing all profiles:', filtered.length);
        break;
      case 'Active Today':
        filtered = profilesData.filter(profile => 
          profile.lastActive && isToday(new Date(profile.lastActive))
        );
        console.log('Active Today filter - profiles active today:', filtered.length);
        // If no active profiles, show all profiles
        if (filtered.length === 0) {
          filtered = profilesData;
          console.log('No active profiles found, showing all profiles');
        }
        break;
      case 'New here':
        filtered = profilesData.filter(profile => 
          profile.createdAt && isNewUser(new Date(profile.createdAt))
        );
        console.log('New here filter - new profiles:', filtered.length);
        // If no new profiles, show all profiles
        if (filtered.length === 0) {
          filtered = profilesData;
          console.log('No new profiles found, showing all profiles');
        }
        break;
      default:
        filtered = profilesData;
        console.log('Default filter - all profiles:', filtered.length);
    }

    // Apply advanced filters
    filtered = applyAdvancedFilters(filtered);
    
    console.log('Final filtered profiles:', filtered.length);
    return filtered;
  };

  const applyAdvancedFilters = (profiles) => {
    return profiles.filter(profile => {
      // Age filter
      if (profile.age) {
        const age = parseInt(profile.age);
        if (age < filters.ageRange.min || age > filters.ageRange.max) {
          return false;
        }
      }

      // Religion filter
      if (filters.religion && profile.religion) {
        if (!profile.religion.toLowerCase().includes(filters.religion.toLowerCase())) {
          return false;
        }
      }

      // Height filter (basic - could be enhanced)
      if (filters.height && profile.height) {
        if (!profile.height.toLowerCase().includes(filters.height.toLowerCase())) {
          return false;
        }
      }

      // Children filter
      if (filters.children && profile.children) {
        if (!profile.children.toLowerCase().includes(filters.children.toLowerCase())) {
          return false;
        }
      }

      // Smoking filter
      if (filters.smoking && profile.smoking) {
        if (!profile.smoking.toLowerCase().includes(filters.smoking.toLowerCase())) {
          return false;
        }
      }

      // Drinking filter
      if (filters.drinking && profile.drinking) {
        if (!profile.drinking.toLowerCase().includes(filters.drinking.toLowerCase())) {
          return false;
        }
      }

      // Languages filter
      if (filters.languages.length > 0 && profile.languages) {
        const hasMatchingLanguage = filters.languages.some(lang => 
          profile.languages.some(profileLang => 
            profileLang.toLowerCase().includes(lang.toLowerCase())
          )
        );
        if (!hasMatchingLanguage) {
          return false;
        }
      }

      // Location filter
      if (filters.location && profile.location) {
        if (!profile.location.toLowerCase().includes(filters.location.toLowerCase())) {
          return false;
        }
      }

      return true;
    });
  };

  const filteredProfiles = filterProfiles();

  const updateFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const addLanguageFilter = () => {
    if (filters.languages.length < 5) {
      setFilters(prev => ({
        ...prev,
        languages: [...prev.languages, '']
      }));
    }
  };

  const removeLanguageFilter = (index) => {
    setFilters(prev => ({
      ...prev,
      languages: prev.languages.filter((_, i) => i !== index)
    }));
  };

  const clearAllFilters = () => {
    setFilters({
      ageRange: { min: 18, max: 99 },
      religion: '',
      height: '',
      children: '',
      smoking: '',
      drinking: '',
      languages: [],
      location: '',
    });
  };

  const countActiveFilters = () => {
    let count = 0;
    if (filters.religion) count++;
    if (filters.height) count++;
    if (filters.children) count++;
    if (filters.smoking) count++;
    if (filters.drinking) count++;
    if (filters.languages.length > 0) count++;
    if (filters.location) count++;
    if (filters.ageRange.min > 18 || filters.ageRange.max < 99) count++;
    return count;
  };

  useEffect(() => {
    setActiveFilters(countActiveFilters());
  }, [filters]);

  const isToday = (date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };

  const isNewUser = (date) => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    return date > sevenDaysAgo;
  };

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

  const nextImage = () => {
    const profile = filteredProfiles[0];
    if (profile?.imageUrls?.length > 1) {
      setCurrentImageIndex((prev) => 
        prev < profile.imageUrls.length - 1 ? prev + 1 : 0
      );
    }
  };

  const previousImage = () => {
    const profile = filteredProfiles[0];
    if (profile?.imageUrls?.length > 1) {
      setCurrentImageIndex((prev) => 
        prev > 0 ? prev - 1 : profile.imageUrls.length - 1
      );
    }
  };

  const renderProfileCard = () => {
    if (filteredProfiles.length === 0) {
      return (
        <View style={styles.emptyState}>
          <LinearGradient
            colors={['#FF6B9D', '#FF8E53']}
            style={styles.emptyIconGradient}
          >
            <Ionicons name="heart-outline" size={64} color="white" />
          </LinearGradient>
          <Text style={styles.emptyTitle}>No profiles found</Text>
          <Text style={styles.emptySubtitle}>
            Try changing your filters or check back later for new profiles.
          </Text>
          <TouchableOpacity
            style={styles.refreshButton}
            onPress={fetchMatchesHandler}
          >
            <Text style={styles.refreshButtonText}>Refresh</Text>
          </TouchableOpacity>
        </View>
      );
    }

    const profile = filteredProfiles[0];
    if (!profile) return null;

    return (
      <Animated.View 
        style={[
          styles.profileCard,
          {
            opacity: fadeAnim,
            transform: [{ translateX: slideAnim }]
          }
        ]}
      >
        {/* Profile Image with Navigation */}
        <View style={styles.imageContainer}>
          {profile?.imageUrls?.length > 0 && (
            <Image
              style={styles.profileImage}
              source={{uri: profile?.imageUrls[currentImageIndex]}}
            />
          )}
          
          {/* Image Navigation Dots */}
          {profile?.imageUrls?.length > 1 && (
            <View style={styles.imageDots}>
              {profile.imageUrls.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.dot,
                    index === currentImageIndex && styles.activeDot
                  ]}
                />
              ))}
            </View>
          )}

          {/* Image Navigation Arrows */}
          {profile?.imageUrls?.length > 1 && (
            <>
              <TouchableOpacity
                style={[styles.imageNavButton, styles.imageNavLeft]}
                onPress={previousImage}
              >
                <Ionicons name="chevron-back" size={24} color="white" />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.imageNavButton, styles.imageNavRight]}
                onPress={nextImage}
              >
                <Ionicons name="chevron-forward" size={24} color="white" />
              </TouchableOpacity>
            </>
          )}

          {/* Profile Info Overlay */}
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.7)']}
            style={styles.profileInfoOverlay}
          >
            <View style={styles.profileInfo}>
              <View style={styles.profileBasicInfo}>
                <Text style={styles.profileName}>{profile?.firstName}</Text>
                {profile?.age && (
                  <Text style={styles.profileAge}>{profile.age}</Text>
                )}
              </View>
              
              {profile?.location && (
                <View style={styles.locationContainer}>
                  <Ionicons name="location" size={16} color="white" />
                  <Text style={styles.locationText}>{profile.location}</Text>
                </View>
              )}

              {profile?.occupation && (
                <View style={styles.occupationContainer}>
                  <MaterialIcons name="work" size={16} color="white" />
                  <Text style={styles.occupationText}>{profile.occupation}</Text>
                </View>
              )}
            </View>
          </LinearGradient>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              onPress={handleCross}
              style={styles.passButton}
            >
              <LinearGradient
                colors={['#FF6B6B', '#FF8E53']}
                style={styles.actionButtonGradient}
              >
                <Entypo name="cross" size={28} color="white" />
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleLike}
              style={styles.likeButton}
            >
              <LinearGradient
                colors={['#FF6B9D', '#FF8E53']}
                style={styles.actionButtonGradient}
              >
                <AntDesign name="heart" size={28} color="white" />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>

        {/* Profile Details */}
        <View style={styles.profileDetails}>
          {/* Prompts */}
          {profile?.prompts?.slice(0, 2).map((prompt, index) => (
            <View key={prompt.id || index} style={styles.promptCard}>
              <Text style={styles.promptQuestion}>{prompt.question}</Text>
              <Text style={styles.promptAnswer}>{prompt.answer}</Text>
            </View>
          ))}

          {/* Bio */}
          {profile?.bio && (
            <View style={styles.bioCard}>
              <Text style={styles.bioText}>{profile.bio}</Text>
            </View>
          )}

          {/* Additional Info */}
          <View style={styles.additionalInfo}>
            {profile?.height && (
              <View style={styles.infoItem}>
                <FontAwesome5 name="ruler-vertical" size={16} color={colors.textSecondary} />
                <Text style={styles.infoText}>{profile.height}</Text>
              </View>
            )}
            
            {profile?.religion && (
              <View style={styles.infoItem}>
                <Ionicons name="heart" size={16} color={colors.textSecondary} />
                <Text style={styles.infoText}>{profile.religion}</Text>
              </View>
            )}

            {profile?.languages?.length > 0 && (
              <View style={styles.infoItem}>
                <Ionicons name="language" size={16} color={colors.textSecondary} />
                <Text style={styles.infoText}>{profile.languages.join(', ')}</Text>
              </View>
            )}
          </View>
        </View>
      </Animated.View>
    );
  };

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
              <Ionicons name="sparkles" size={24} color="white" />
              <Text style={styles.logoText}>Lashwa</Text>
            </View>
          </View>
          
          <View style={styles.headerRight}>
            <TouchableOpacity 
              style={styles.filterButton}
              onPress={() => setShowFilters(true)}
            >
              <Ionicons name="filter" size={20} color="white" />
              {activeFilters > 0 && (
                <View style={styles.filterBadge}>
                  <Text style={styles.filterBadgeText}>{activeFilters}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Filter Tabs */}
        <View style={styles.filterContainer}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterScroll}
          >
            {renderFilterTab('Compatible', 'Compatible')}
            {renderFilterTab('Active Today', 'Active Today')}
            {renderFilterTab('New here', 'New here')}
          </ScrollView>
        </View>
      </LinearGradient>

      {/* Content */}
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <LinearGradient
              colors={['#FF6B9D', '#FF8E53']}
              style={styles.loadingSpinner}
            >
              <Ionicons name="heart" size={32} color="white" />
            </LinearGradient>
            <Text style={styles.loadingText}>Finding your perfect match...</Text>
          </View>
        ) : (
          renderProfileCard()
        )}
      </ScrollView>

      {/* Filter Modal */}
      <Modal
        visible={showFilters}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowFilters(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              onPress={() => setShowFilters(false)}
              style={styles.closeButton}
            >
              <Ionicons name="close" size={24} color={colors.textPrimary} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Filters</Text>
            <TouchableOpacity
              onPress={clearAllFilters}
              style={styles.clearButton}
            >
              <Text style={styles.clearButtonText}>Clear All</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            {/* Age Range */}
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Age Range</Text>
              <View style={styles.ageRangeContainer}>
                <Text style={styles.ageRangeText}>
                  {filters.ageRange.min} - {filters.ageRange.max} years
                </Text>
                <View style={styles.ageRangeSlider}>
                  <TouchableOpacity
                    style={styles.ageButton}
                    onPress={() => {
                      if (filters.ageRange.min > 18) {
                        updateFilter('ageRange', { ...filters.ageRange, min: filters.ageRange.min - 1 });
                      }
                    }}
                  >
                    <Ionicons name="remove" size={16} color="white" />
                  </TouchableOpacity>
                  <View style={styles.ageRangeBar}>
                    <View style={styles.ageRangeFill} />
                  </View>
                  <TouchableOpacity
                    style={styles.ageButton}
                    onPress={() => {
                      if (filters.ageRange.max < 99) {
                        updateFilter('ageRange', { ...filters.ageRange, max: filters.ageRange.max + 1 });
                      }
                    }}
                  >
                    <Ionicons name="add" size={16} color="white" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Religion */}
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Religion</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.filterInput}
                  placeholder="Enter religion preference"
                  value={filters.religion}
                  onChangeText={(text) => updateFilter('religion', text)}
                />
              </View>
            </View>

            {/* Height */}
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Height</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.filterInput}
                  placeholder="Enter height preference"
                  value={filters.height}
                  onChangeText={(text) => updateFilter('height', text)}
                />
              </View>
            </View>

            {/* Children */}
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Children</Text>
              <View style={styles.optionsContainer}>
                {['Has children', 'No children', 'Open to children'].map((option) => (
                  <TouchableOpacity
                    key={option}
                    style={[
                      styles.optionButton,
                      filters.children === option && styles.optionButtonSelected
                    ]}
                    onPress={() => updateFilter('children', filters.children === option ? '' : option)}
                  >
                    <Text style={[
                      styles.optionText,
                      filters.children === option && styles.optionTextSelected
                    ]}>
                      {option}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Smoking */}
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Smoking</Text>
              <View style={styles.optionsContainer}>
                {['Smoker', 'Non-smoker', 'Occasionally'].map((option) => (
                  <TouchableOpacity
                    key={option}
                    style={[
                      styles.optionButton,
                      filters.smoking === option && styles.optionButtonSelected
                    ]}
                    onPress={() => updateFilter('smoking', filters.smoking === option ? '' : option)}
                  >
                    <Text style={[
                      styles.optionText,
                      filters.smoking === option && styles.optionTextSelected
                    ]}>
                      {option}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Drinking */}
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Drinking</Text>
              <View style={styles.optionsContainer}>
                {['Drinker', 'Non-drinker', 'Socially'].map((option) => (
                  <TouchableOpacity
                    key={option}
                    style={[
                      styles.optionButton,
                      filters.drinking === option && styles.optionButtonSelected
                    ]}
                    onPress={() => updateFilter('drinking', filters.drinking === option ? '' : option)}
                  >
                    <Text style={[
                      styles.optionText,
                      filters.drinking === option && styles.optionTextSelected
                    ]}>
                      {option}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Languages */}
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Languages</Text>
              <View style={styles.languagesContainer}>
                {filters.languages.map((language, index) => (
                  <View key={index} style={styles.languageTag}>
                    <TextInput
                      style={styles.languageInput}
                      placeholder="Language"
                      value={language}
                      onChangeText={(text) => {
                        const newLanguages = [...filters.languages];
                        newLanguages[index] = text;
                        updateFilter('languages', newLanguages);
                      }}
                    />
                    <TouchableOpacity
                      onPress={() => removeLanguageFilter(index)}
                      style={styles.removeLanguageButton}
                    >
                      <Ionicons name="close" size={16} color={colors.error} />
                    </TouchableOpacity>
                  </View>
                ))}
                {filters.languages.length < 5 && (
                  <TouchableOpacity
                    onPress={addLanguageFilter}
                    style={styles.addLanguageButton}
                  >
                    <Ionicons name="add" size={20} color={colors.primary} />
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* Location */}
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Location</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.filterInput}
                  placeholder="Enter location preference"
                  value={filters.location}
                  onChangeText={(text) => updateFilter('location', text)}
                />
              </View>
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={styles.applyButton}
              onPress={() => setShowFilters(false)}
            >
              <Text style={styles.applyButtonText}>Apply Filters</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

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
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
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
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#FF6B6B',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterBadgeText: {
    color: 'white',
    fontSize: 12,
    fontFamily: typography.fontFamily.bold,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
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
  emptyState: {
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
  refreshButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.medium,
  },
  refreshButtonText: {
    color: 'white',
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.semiBold,
  },
  profileCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 20,
    overflow: 'hidden',
    ...shadows.large,
    borderWidth: 1,
    borderColor: 'rgba(161, 66, 244, 0.1)',
  },
  imageContainer: {
    position: 'relative',
    height: screenHeight * 0.6,
  },
  profileImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imageDots: {
    position: 'absolute',
    top: spacing.lg,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  activeDot: {
    backgroundColor: 'white',
  },
  imageNavButton: {
    position: 'absolute',
    top: '50%',
    transform: [{ translateY: -20 }],
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageNavLeft: {
    left: spacing.md,
  },
  imageNavRight: {
    right: spacing.md,
  },
  profileInfoOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.lg,
  },
  profileInfo: {
    gap: spacing.sm,
  },
  profileBasicInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  profileName: {
    fontSize: typography.fontSize.xxl,
    fontFamily: typography.fontFamily.bold,
    color: 'white',
  },
  profileAge: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.medium,
    color: 'white',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  locationText: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.medium,
    color: 'white',
  },
  occupationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  occupationText: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.medium,
    color: 'white',
  },
  actionButtons: {
    position: 'absolute',
    bottom: spacing.lg,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
  },
  passButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    overflow: 'hidden',
  },
  likeButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    overflow: 'hidden',
  },
  actionButtonGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileDetails: {
    padding: spacing.lg,
  },
  promptCard: {
    backgroundColor: '#F8F9FA',
    padding: spacing.lg,
    borderRadius: borderRadius.medium,
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
  bioCard: {
    backgroundColor: '#F8F9FA',
    padding: spacing.lg,
    borderRadius: borderRadius.medium,
    marginBottom: spacing.md,
  },
  bioText: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.regular,
    color: colors.textPrimary,
    lineHeight: 24,
  },
  additionalInfo: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: '#F8F9FA',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.medium,
  },
  infoText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.textPrimary,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8E8',
  },
  closeButton: {
    padding: spacing.xs,
  },
  modalTitle: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.bold,
    color: colors.textPrimary,
  },
  clearButton: {
    padding: spacing.xs,
  },
  clearButtonText: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.medium,
    color: colors.primary,
  },
  modalContent: {
    flex: 1,
    padding: spacing.lg,
    backgroundColor: colors.background,
  },
  modalFooter: {
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: '#E8E8E8',
  },
  applyButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.medium,
    alignItems: 'center',
  },
  applyButtonText: {
    color: 'white',
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.semiBold,
  },
  filterSection: {
    marginBottom: spacing.xl,
  },
  filterSectionTitle: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.semiBold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  ageRangeContainer: {
    backgroundColor: '#F8F9FA',
    padding: spacing.lg,
    borderRadius: borderRadius.medium,
  },
  ageRangeText: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.medium,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  ageRangeSlider: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  ageButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ageRangeBar: {
    flex: 1,
    height: 4,
    backgroundColor: '#E8E8E8',
    borderRadius: 2,
    marginHorizontal: spacing.md,
  },
  ageRangeFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 2,
    width: '60%',
  },
  inputContainer: {
    backgroundColor: '#F8F9FA',
    borderRadius: borderRadius.medium,
    paddingHorizontal: spacing.md,
  },
  filterInput: {
    paddingVertical: spacing.md,
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.regular,
    color: colors.textPrimary,
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  optionButton: {
    borderWidth: 1,
    borderColor: '#E8E8E8',
    borderRadius: borderRadius.medium,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: 'white',
  },
  optionButtonSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  optionText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.textPrimary,
  },
  optionTextSelected: {
    color: 'white',
  },
  languagesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    alignItems: 'center',
  },
  languageTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: borderRadius.medium,
    paddingRight: spacing.sm,
  },
  languageInput: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.regular,
    color: colors.textPrimary,
    minWidth: 100,
  },
  removeLanguageButton: {
    padding: spacing.xs,
  },
  addLanguageButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: colors.primary,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default HomeScreen;
