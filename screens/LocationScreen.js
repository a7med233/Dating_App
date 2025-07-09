import {StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  Alert,
  Platform,
  TextInput,
  FlatList,
  Modal,
  StatusBar,
  Animated,} from 'react-native';
import React, { useState, useEffect, useRef } from 'react';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import {
  getRegistrationProgress,
  saveRegistrationProgress,
} from '../registrationUtils';
import SafeAreaWrapper from '../components/SafeAreaWrapper';
import { colors, typography, shadows, borderRadius, spacing } from '../theme/colors';


const LocationScreen = () => {
  const navigation = useNavigation();
  const [region, setRegion] = useState({
    latitude: 13.0451,
    longitude: 77.6269,
    latitudeDelta: 0.01, // Consistent zoom level
    longitudeDelta: 0.01,
  });
  const [location, setLocation] = useState('');
  const [markerCoordinate, setMarkerCoordinate] = useState({
    latitude: 13.0451,
    longitude: 77.6269,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true); // New state for initial GPS attempt
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
        setSearchResults(data.results.slice(0, 5)); // Limit to 5 results
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
      latitudeDelta: 0.01, // Zoom in closer
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

      // Check if map is zoomed out (large delta values) and zoom back in
      const isZoomedOut = region.latitudeDelta > 0.05 || region.longitudeDelta > 0.05;

      const newRegion = {
        latitude,
        longitude,
        latitudeDelta: isZoomedOut ? 0.01 : region.latitudeDelta, // Zoom in if was zoomed out
        longitudeDelta: isZoomedOut ? 0.01 : region.longitudeDelta,
      };

      setRegion(newRegion);
      setMarkerCoordinate({ latitude, longitude });
      setIsLoading(false);
      setIsInitializing(false); // Stop initializing state
      stopPulseAnimation(); // Stop the pulse animation

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
      setIsInitializing(false); // Stop initializing state
      stopPulseAnimation(); // Stop the pulse animation

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
        startPulseAnimation(); // Start the pulse animation
        getCurrentLocation();
      } else {
        // Set default region for initial load
        setRegion({
          latitude: 13.0451,
          longitude: 77.6269,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });
        setIsInitializing(false); // Stop initializing if no permission
      }
    };
    init();
  }, []);

  // Handle marker drag end
  const onMarkerDragEnd = (e) => {
    const coordinate = e.nativeEvent.coordinate;
    setMarkerCoordinate(coordinate);

    // Update map region to follow the marker with consistent zoom
    const newRegion = {
      latitude: coordinate.latitude,
      longitude: coordinate.longitude,
      latitudeDelta: 0.01, // Consistent zoom level
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

  // Render search result item
  const renderSearchResult = ({ item }) => (
    <TouchableOpacity
      style={{
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        backgroundColor: colors.textInverse,
      }}
      onPress={() => selectSearchResult(item)}
    >
              <Text style={{ fontSize: typography.fontSize.md, fontFamily: typography.fontFamily.medium, color: colors.textPrimary }}>
        {item.name}
      </Text>
              <Text style={{ fontSize: typography.fontSize.sm, color: colors.textSecondary, marginTop: spacing.xs }}>
        {item.formatted_address}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaWrapper backgroundColor="#fff" style={{flex: 1, backgroundColor: "#fff"}}>
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      <View style={styles.content}>
        {/* Header */}
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View style={{
            width: 44,
            height: 44,
            borderRadius: borderRadius.xlarge,
            borderColor: colors.textPrimary,
            borderWidth: 2,
            justifyContent: 'center',
            alignItems: 'center',
          }}>
            <MaterialCommunityIcons
              name="cake-variant-outline"
              size={26}
              color="black"
            />
          </View>
          <Image
            style={{ width: 100, height: 40 }}
            source={{
              uri: 'https://cdn-icons-png.flaticon.com/128/10613/10613685.png',
            }}
          />
        </View>

        <Text style={{
          fontSize: typography.fontSize.xxxl,
          fontFamily: typography.fontFamily.bold,
          fontFamily: 'GeezaPro-Bold',
          marginTop: spacing.md,
        }}>
          Where do you live?
        </Text>

        {/* Search Bar */}
        <TouchableOpacity
          onPress={() => setShowSearchModal(true)}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: '#f8f9fa',
            borderWidth: 1,
            borderColor: '#dee2e6',
            borderRadius: borderRadius.round,
            paddingHorizontal: spacing.md,
            paddingVertical: 12,
            marginTop: spacing.lg,
          }}
        >
          <MaterialCommunityIcons name="magnify" size={20} color="#6c757d" />
          <Text style={{ marginLeft: 10, color: '#6c757d', fontSize: typography.fontSize.md }}>
            Search for a location...
          </Text>
        </TouchableOpacity>

        {/* Map Container with GPS Button */}
        <View style={{ position: 'relative', marginTop: spacing.lg }}>
          <MapView
            key={`${region.latitude}-${region.longitude}`}
            region={region}
            style={{ width: '100%', height: 350, borderRadius: borderRadius.small }}
            showsUserLocation={true}
            showsMyLocationButton={false}
          >
            <Marker
              coordinate={markerCoordinate}
              draggable={true}
              onDragEnd={onMarkerDragEnd}
              title="Your Location"
              description="Drag to set location"
              pinColor="colors.primary"
            />
          </MapView>

          {/* GPS Location Indicator Overlay */}
          {isInitializing && (
            <View style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
              justifyContent: 'center',
              alignItems: 'center',
              borderRadius: borderRadius.small,
            }}>
              <Animated.View style={{
                transform: [{ scale: pulseAnim }],
                alignItems: 'center',
              }}>
                <View style={{
                  backgroundColor: colors.primary,
                  borderRadius: borderRadius.round,
                  padding: 20,
                  marginBottom: spacing.md,
                  elevation: 10,
                  shadowColor: colors.primary,
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                }}>
                  <MaterialCommunityIcons
                    name="crosshairs-gps"
                    size={40}
                    color={colors.textInverse}
                  />
                </View>
                <Text style={{
                  color: colors.textInverse,
                  fontSize: typography.fontSize.lg,
                  fontFamily: typography.fontFamily.bold,
                  textAlign: 'center',
                  marginBottom: spacing.xs,
                }}>
                  Locating you...
                </Text>
                <Text style={{
                  color: colors.textInverse,
                  fontSize: typography.fontSize.sm,
                  textAlign: 'center',
                  opacity: 0.8,
                }}>
                  Please wait while we find your location
                </Text>
              </Animated.View>
            </View>
          )}

          {/* GPS Button - Inside map at bottom */}
          <TouchableOpacity
            onPress={getCurrentLocation}
            disabled={isLoading}
            style={{
              position: 'absolute',
              right: 15,
              bottom: 15,
              backgroundColor: colors.textInverse,
              borderRadius: borderRadius.round,
              padding: 10,
              elevation: 5,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.25,
              shadowRadius: 3.84,
            }}
          >
            <MaterialCommunityIcons
              name="crosshairs-gps"
              size={24}
              color={isLoading ? "#ccc" : colors.primary}
            />
          </TouchableOpacity>
        </View>

        {/* Instructions */}
        <View style={{
          backgroundColor: '#f8f9fa',
          padding: 10,
          borderRadius: borderRadius.small,
          marginTop: spacing.md,
          borderWidth: 1,
          borderColor: '#dee2e6',
        }}>
          <Text style={{
            textAlign: 'center',
            color: '#6c757d',
            fontSize: typography.fontSize.xs,
            fontStyle: 'italic',
          }}>
            💡 Search for a location or drag the red marker to set your location
          </Text>
        </View>

        {/* Location Display */}
        <View style={{
          backgroundColor: colors.textPrimary,
          padding: 12,
          borderRadius: borderRadius.xlarge,
          marginTop: spacing.md,
          alignSelf: 'center',
          marginBottom: Platform.OS === 'android' ? 100 : 80, // Extra margin for Android
        }}>
          <Text style={{
            textAlign: 'center',
            color: colors.textInverse,
            fontSize: typography.fontSize.sm,
            fontFamily: typography.fontFamily.medium,
          }}>
            {location || 'Drag marker to set location'}
          </Text>
        </View>

        {/* Next Button */}
        <TouchableOpacity
          onPress={handleNext}
          style={{
            position: 'absolute',
            right: 20,
            bottom: Platform.OS === 'android' ? 40 : 30,
            backgroundColor: colors.primary,
            borderRadius: borderRadius.round,
            padding: 15,
            elevation: 8,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 4.65,
          }}
        >
          <MaterialCommunityIcons
            name="arrow-right"
            size={30}
            color="white"
          />
        </TouchableOpacity>

        {error ? (
          <Text style={{ color: 'red', marginTop: spacing.md, textAlign: 'center' }}>{error}</Text>
        ) : null}
      </View>

      {/* Search Modal */}
      <Modal
        visible={showSearchModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaWrapper backgroundColor={colors.background} style={{ flex: 1, backgroundColor: colors.textInverse }}>
          {/* Modal Header */}
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            padding: 15,
            borderBottomWidth: 1,
            borderBottomColor: '#eee',
          }}>
            <TouchableOpacity
              onPress={() => {
                setShowSearchModal(false);
                setSearchQuery('');
                setSearchResults([]);
              }}
              style={{ marginRight: 15 }}
            >
              <MaterialCommunityIcons name="close" size={24} color="colors.textPrimary" />
            </TouchableOpacity>
            <Text style={{ fontSize: typography.fontSize.lg, fontFamily: typography.fontFamily.bold }}>Search Location</Text>
          </View>

          {/* Search Input */}
          <View style={{
            padding: 15,
            borderBottomWidth: 1,
            borderBottomColor: '#eee',
          }}>
            <TextInput
              style={{
                borderWidth: 1,
                borderColor: '#dee2e6',
                borderRadius: borderRadius.round,
                paddingHorizontal: spacing.md,
                paddingVertical: 12,
                fontSize: typography.fontSize.md,
              }}
              placeholder="Enter location name..."
              value={searchQuery}
              onChangeText={handleSearchChange}
              autoFocus={true}
            />
          </View>

          {/* Search Results */}
          {isSearching ? (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <Text>Searching...</Text>
            </View>
          ) : (
            <FlatList
              data={searchResults}
              renderItem={renderSearchResult}
              keyExtractor={(item, index) => index.toString()}
              style={{ flex: 1 }}
              ListEmptyComponent={
                searchQuery.length > 2 ? (
                  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
                    <Text style={{ color: colors.textSecondary, textAlign: 'center' }}>
                      No locations found for "{searchQuery}"
                    </Text>
                  </View>
                ) : null
              }
            />
          )}
        </SafeAreaWrapper>
      </Modal>
    </SafeAreaWrapper>
  );
};

export default LocationScreen;

const styles = StyleSheet.create({
  content: {
    marginHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight || 20 : 20,
    flex: 1,
  },
});