import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Alert,
  Platform,
  TextInput,
  FlatList,
  Modal,
  StatusBar,
  Animated,
  Dimensions,
  ScrollView,
  KeyboardAvoidingView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState, useEffect, useRef } from 'react';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import {
  getRegistrationProgress,
  saveRegistrationProgress,
} from '../registrationUtils';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, typography, shadows, borderRadius, spacing } from '../theme/colors';
import SafeAreaWrapper from '../components/SafeAreaWrapper';


const { width, height } = Dimensions.get('window');

const LocationScreen = () => {
  const navigation = useNavigation();
  const [region, setRegion] = useState({
    latitude: 13.0451,
    longitude: 77.6269,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });
  const [location, setLocation] = useState('');
  const [markerCoordinate, setMarkerCoordinate] = useState({
    latitude: 13.0451,
    longitude: 77.6269,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState('');

  // Animation for GPS indicator
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Start pulsing animation
  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  // Stop pulsing animation
  const stopPulseAnimation = () => {
    pulseAnim.stopAnimation();
    pulseAnim.setValue(1);
  };

  // Simple permission check using Expo Location
  const checkPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.log('Permission check error:', error);
      return false;
    }
  };

  // Simple permission request using Expo Location
  const requestPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.log('Permission request error:', error);
      return false;
    }
  };

  // Search for locations
  const searchLocations = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&key=AIzaSyCxJnLEXSwG-fHAzwoEWZdrbxPgOMLkaBE`
      );
      const data = await response.json();

      if (data.results) {
        setSearchResults(data.results.slice(0, 5));
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.log('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Handle search input change
  const handleSearchChange = (text) => {
    setSearchQuery(text);
    if (text.length > 2) {
      searchLocations(text);
    } else {
      setSearchResults([]);
    }
  };

  // Select a search result
  const selectSearchResult = (place) => {
    const { lat, lng } = place.geometry.location;
    const newCoordinate = { latitude: lat, longitude: lng };

    setMarkerCoordinate(newCoordinate);
    setRegion({
      latitude: lat,
      longitude: lng,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    });
    setLocation(place.formatted_address);
    setSearchQuery('');
    setSearchResults([]);
    setShowSearchModal(false);
  };

  // Get current location
  const getCurrentLocation = async () => {
    setIsLoading(true);

    try {
      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const { latitude, longitude } = position.coords;

      const isZoomedOut = region.latitudeDelta > 0.05 || region.longitudeDelta > 0.05;

      const newRegion = {
        latitude,
        longitude,
        latitudeDelta: isZoomedOut ? 0.01 : region.latitudeDelta,
        longitudeDelta: isZoomedOut ? 0.01 : region.longitudeDelta,
      };

      setRegion(newRegion);
      setMarkerCoordinate({ latitude, longitude });
      setIsLoading(false);
      setIsInitializing(false);
      stopPulseAnimation();

      // Get address
      fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=AIzaSyCxJnLEXSwG-fHAzwoEWZdrbxPgOMLkaBE`
      )
        .then(response => response.json())
        .then(data => {
          if (data.results && data.results.length > 0) {
            setLocation(data.results[0].formatted_address);
          }
        })
        .catch(error => {
          console.log('Geocoding error:', error);
          setLocation('Location found');
        });
    } catch (error) {
      console.log('Location error:', error);
      setIsLoading(false);
      setIsInitializing(false);
      stopPulseAnimation();

      if (error.code === 'E_LOCATION_PERMISSION_DENIED') {
        Alert.alert(
          'Permission Required',
          'Please grant location permission to use this feature.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Grant Permission', onPress: requestPermission }
          ]
        );
      } else {
        Alert.alert('Error', 'Unable to get location. You can still drag the marker.');
      }
    }
  };

  // Initialize location on component mount
  useEffect(() => {
    const init = async () => {
      const hasPermission = await checkPermission();
      if (hasPermission) {
        startPulseAnimation();
        getCurrentLocation();
      } else {
        setRegion({
          latitude: 13.0451,
          longitude: 77.6269,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });
        setIsInitializing(false);
      }
    };
    init();
  }, []);

  // Handle marker drag end
  const onMarkerDragEnd = (e) => {
    const coordinate = e.nativeEvent.coordinate;
    setMarkerCoordinate(coordinate);

    const newRegion = {
      latitude: coordinate.latitude,
      longitude: coordinate.longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    };
    setRegion(newRegion);

    // Get address for new location
    fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${coordinate.latitude},${coordinate.longitude}&key=AIzaSyCxJnLEXSwG-fHAzwoEWZdrbxPgOMLkaBE`
    )
      .then(response => response.json())
      .then(data => {
        if (data.results && data.results.length > 0) {
          setLocation(data.results[0].formatted_address);
        }
      })
      .catch(error => {
        console.log('Geocoding error:', error);
        setLocation('Location selected');
      });
  };

  // Navigate to next screen
  const handleNext = () => {
    if (!location || location.trim() === '') {
      setError('Please select your location before continuing.');
      return;
    }
    setError('');
    saveRegistrationProgress('Location', { location });
    navigation.navigate('Gender');
  };

  const handleBack = () => {
    navigation.goBack();
  };

  // Render search result item
  const renderSearchResult = ({ item }) => (
    <TouchableOpacity
      style={styles.searchResultItem}
      onPress={() => selectSearchResult(item)}
    >
      <Ionicons name="location-outline" size={20} color={colors.textSecondary} />
      <View style={styles.searchResultContent}>
        <Text style={styles.searchResultName}>{item.name}</Text>
        <Text style={styles.searchResultAddress}>{item.formatted_address}</Text>
      </View>
      <Ionicons name="chevron-forward" size={16} color={colors.textTertiary} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaWrapper backgroundColor={colors.background} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header Section with Gradient */}
          <LinearGradient
            colors={colors.primaryGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.headerSection}
          >
            <View style={styles.headerContent}>
              <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                <Ionicons name="arrow-back" size={24} color={colors.textInverse} />
              </TouchableOpacity>
              
              <View style={styles.logoContainer}>
                <Ionicons name="location-outline" size={40} color={colors.textInverse} />
                <Text style={styles.headerTitle}>Location</Text>
          </View>
        </View>
          </LinearGradient>

          {/* Main Content */}
          <View style={styles.mainContent}>
            {/* Title Section */}
            <View style={styles.titleSection}>
              <Text style={styles.title}>Where do you live?</Text>
              <Text style={styles.subtitle}>
                This helps us show you people nearby and improve your matches.
        </Text>
            </View>

        {/* Search Bar */}
        <TouchableOpacity
          onPress={() => setShowSearchModal(true)}
              style={styles.searchBar}
        >
              <Ionicons name="search-outline" size={20} color={colors.textSecondary} />
              <Text style={styles.searchPlaceholder}>
            Search for a location...
          </Text>
              <Ionicons name="chevron-forward" size={16} color={colors.textTertiary} />
        </TouchableOpacity>

            {/* Map Container */}
            <View style={styles.mapContainer}>
          <MapView
            key={`${region.latitude}-${region.longitude}`}
            region={region}
                style={styles.map}
            showsUserLocation={true}
            showsMyLocationButton={false}
          >
            <Marker
              coordinate={markerCoordinate}
              draggable={true}
              onDragEnd={onMarkerDragEnd}
              title="Your Location"
              description="Drag to set location"
                  pinColor={colors.primary}
            />
          </MapView>

          {/* GPS Location Indicator Overlay */}
          {isInitializing && (
                <View style={styles.gpsOverlay}>
                  <Animated.View style={[styles.gpsIndicator, { transform: [{ scale: pulseAnim }] }]}>
                    <View style={styles.gpsIconContainer}>
                      <Ionicons
                        name="location"
                    size={40}
                    color={colors.textInverse}
                  />
                </View>
                    <Text style={styles.gpsTitle}>Locating you...</Text>
                    <Text style={styles.gpsSubtitle}>
                  Please wait while we find your location
                </Text>
              </Animated.View>
            </View>
          )}

              {/* GPS Button */}
          <TouchableOpacity
            onPress={getCurrentLocation}
            disabled={isLoading}
                style={styles.gpsButton}
          >
                <Ionicons
                  name="locate"
              size={24}
                  color={isLoading ? colors.textTertiary : colors.primary}
            />
          </TouchableOpacity>
        </View>

        {/* Instructions */}
            <View style={styles.instructionsContainer}>
              <Ionicons name="information-circle-outline" size={16} color={colors.textSecondary} />
              <Text style={styles.instructionsText}>
                Search for a location or drag the marker to set your location
          </Text>
        </View>

        {/* Location Display */}
            <View style={styles.locationDisplay}>
              <Ionicons name="checkmark-circle" size={16} color={colors.success} />
              <Text style={styles.locationText}>
            {location || 'Drag marker to set location'}
          </Text>
        </View>

            {/* Error Message */}
            {error ? (
              <View style={styles.errorContainer}>
                <Ionicons name="alert-circle-outline" size={16} color={colors.error} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            {/* Continue Button */}
        <TouchableOpacity
          onPress={handleNext}
              disabled={!location || location.trim() === ''}
              style={[
                styles.continueButton,
                {
                  opacity: (!location || location.trim() === '') ? 0.6 : 1,
                  backgroundColor: (!location || location.trim() === '') ? colors.textTertiary : colors.primary
                }
              ]}
        >
              <Text style={styles.continueButtonText}>Continue</Text>
        </TouchableOpacity>
      </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Search Modal */}
      <Modal
        visible={showSearchModal}
        animationType="slide"
        presentationStyle={Platform.OS === 'ios' ? 'pageSheet' : 'fullScreen'}
      >
        <SafeAreaView style={styles.modalContainer} edges={['top', 'left', 'right']}>
          {/* Modal Header */}
          <View style={styles.modalHeader}>
            <TouchableOpacity
              onPress={() => {
                setShowSearchModal(false);
                setSearchQuery('');
                setSearchResults([]);
              }}
              style={styles.closeButton}
            >
              <Ionicons name="close" size={24} color={colors.textPrimary} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Search Location</Text>
            <View style={styles.placeholderButton} />
          </View>

          {/* Search Input */}
          <View style={styles.searchInputContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Enter location name..."
              placeholderTextColor={colors.textTertiary}
              value={searchQuery}
              onChangeText={handleSearchChange}
              autoFocus={true}
            />
          </View>

          {/* Search Results */}
          {isSearching ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Searching...</Text>
            </View>
          ) : (
            <FlatList
              data={searchResults}
              renderItem={renderSearchResult}
              keyExtractor={(item, index) => index.toString()}
              style={styles.searchResultsList}
              ListEmptyComponent={
                searchQuery.length > 2 ? (
                  <View style={styles.emptyContainer}>
                    <Ionicons name="search-outline" size={48} color={colors.textTertiary} />
                    <Text style={styles.emptyText}>
                      No locations found for "{searchQuery}"
                    </Text>
                  </View>
                ) : null
              }
            />
          )}
        </SafeAreaView>
      </Modal>
    </SafeAreaWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: Platform.OS === 'android' ? 20 : 0, // Extra padding for Android navigation
  },
  headerSection: {
    height: 180,
    width: '100%',
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.large,
    elevation: 8,
  },
  headerContent: {
    width: '100%',
    paddingHorizontal: spacing.lg,
    paddingTop: Platform.OS === 'ios' ? 0 : (StatusBar.currentHeight || 0),
  },
  backButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 20 : 10,
    left: spacing.lg,
    zIndex: 1,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  headerTitle: {
    marginTop: spacing.sm,
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.bold,
    color: colors.textInverse,
  },
  mainContent: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: Platform.OS === 'android' ? 100 : 0, // Account for Android navigation bar
  },
  titleSection: {
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: typography.fontSize.xl,
    fontFamily: typography.fontFamily.bold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.regular,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.medium,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.lg,
  },
  searchPlaceholder: {
    flex: 1,
    marginLeft: spacing.sm,
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.regular,
    color: colors.textSecondary,
  },
  mapContainer: {
    position: 'relative',
    marginBottom: spacing.lg,
  },
  map: {
    width: '100%',
    height: Platform.OS === 'android' ? 280 : 320,
    borderRadius: borderRadius.medium,
  },
  gpsOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: borderRadius.medium,
  },
  gpsIndicator: {
    alignItems: 'center',
  },
  gpsIconContainer: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.round,
    padding: 20,
    marginBottom: spacing.md,
    ...shadows.large,
  },
  gpsTitle: {
    color: colors.textInverse,
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.bold,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  gpsSubtitle: {
    color: colors.textInverse,
    fontSize: typography.fontSize.sm,
    textAlign: 'center',
    opacity: 0.8,
  },
  gpsButton: {
    position: 'absolute',
    right: 15,
    bottom: 15,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.round,
    padding: 12,
    ...shadows.medium,
  },
  instructionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary + '10',
    borderRadius: borderRadius.small,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.primary + '20',
    marginBottom: spacing.lg,
  },
  instructionsText: {
    marginLeft: spacing.xs,
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.regular,
    color: colors.textSecondary,
    flex: 1,
    lineHeight: 18,
  },
  locationDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.success + '10',
    borderRadius: borderRadius.medium,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.success + '20',
    marginBottom: spacing.xl,
  },
  locationText: {
    marginLeft: spacing.xs,
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.medium,
    color: colors.success,
    flex: 1,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.error + '10',
    borderRadius: borderRadius.small,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.error + '20',
  },
  errorText: {
    marginLeft: spacing.xs,
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.error,
    flex: 1,
  },
  continueButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.medium,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.lg,
    marginBottom: Platform.OS === 'android' ? 20 : 0, // Extra margin for Android
    ...shadows.medium,
  },
  continueButtonText: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.semiBold,
    color: colors.textInverse,
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  closeButton: {
    padding: spacing.xs,
  },
  modalTitle: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.bold,
    color: colors.textPrimary,
  },
  placeholderButton: {
    width: 40,
  },
  searchInputContainer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  searchInput: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.medium,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.regular,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.medium,
    color: colors.textSecondary,
  },
  searchResultsList: {
    flex: 1,
  },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  searchResultContent: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  searchResultName: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.medium,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  searchResultAddress: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.regular,
    color: colors.textSecondary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyText: {
    marginTop: spacing.md,
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.medium,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});

export default LocationScreen;