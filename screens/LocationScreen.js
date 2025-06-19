import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  Image,
  TouchableOpacity,
  Alert,
  PermissionsAndroid,
  Platform,
  TextInput,
  FlatList,
  Modal,
} from 'react-native';
import React, { useState, useEffect } from 'react';
import MapView, { Marker } from 'react-native-maps';
import Geolocation from '@react-native-community/geolocation';
import { useNavigation } from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {
  getRegistrationProgress,
  saveRegistrationProgress,
} from '../registrationUtils';

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
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState('');

  // Simple permission check for Android
  const checkPermission = async () => {
    if (Platform.OS === 'ios') return true;

    try {
      const granted = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
      );
      return granted;
    } catch (error) {
      console.log('Permission check error:', error);
      return false;
    }
  };

  // Simple permission request for Android
  const requestPermission = async () => {
    if (Platform.OS === 'ios') return true;

    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Location Permission',
          message: 'This app needs location access.',
          buttonPositive: 'OK',
        }
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
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
  const getCurrentLocation = () => {
    setIsLoading(true);

    Geolocation.getCurrentPosition(
      (position) => {
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
      },
      (error) => {
        console.log('Location error:', error);
        setIsLoading(false);

        if (error.code === 1) {
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
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
  };

  // Initialize location on component mount
  useEffect(() => {
    const init = async () => {
      const hasPermission = await checkPermission();
      if (hasPermission) {
        getCurrentLocation();
      } else {
        // Set default region for initial load
        setRegion({
          latitude: 13.0451,
          longitude: 77.6269,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });
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
        backgroundColor: 'white',
      }}
      onPress={() => selectSearchResult(item)}
    >
      <Text style={{ fontSize: 16, fontWeight: '500', color: '#333' }}>
        {item.name}
      </Text>
      <Text style={{ fontSize: 14, color: '#666', marginTop: 2 }}>
        {item.formatted_address}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      <View style={{ marginTop: 90, marginHorizontal: 20 }}>
        {/* Header */}
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View style={{
            width: 44,
            height: 44,
            borderRadius: 22,
            borderColor: 'black',
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
          fontSize: 25,
          fontWeight: 'bold',
          fontFamily: 'GeezaPro-Bold',
          marginTop: 15,
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
            borderRadius: 25,
            paddingHorizontal: 15,
            paddingVertical: 12,
            marginTop: 20,
          }}
        >
          <MaterialCommunityIcons name="magnify" size={20} color="#6c757d" />
          <Text style={{ marginLeft: 10, color: '#6c757d', fontSize: 16 }}>
            Search for a location...
          </Text>
        </TouchableOpacity>

        {/* Map Container with GPS Button */}
        <View style={{ position: 'relative', marginTop: 20 }}>
          <MapView
            key={`${region.latitude}-${region.longitude}`}
            region={region}
            style={{ width: '100%', height: 350, borderRadius: 5 }}
            showsUserLocation={true}
            showsMyLocationButton={false}
          >
            <Marker
              coordinate={markerCoordinate}
              draggable={true}
              onDragEnd={onMarkerDragEnd}
              title="Your Location"
              description="Drag to set location"
              pinColor="#581845"
            />
          </MapView>

          {/* GPS Button - Inside map at bottom */}
          <TouchableOpacity
            onPress={getCurrentLocation}
            disabled={isLoading}
            style={{
              position: 'absolute',
              right: 15,
              bottom: 15,
              backgroundColor: 'white',
              borderRadius: 25,
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
              color={isLoading ? "#ccc" : "#581845"}
            />
          </TouchableOpacity>
        </View>

        {/* Instructions */}
        <View style={{
          backgroundColor: '#f8f9fa',
          padding: 10,
          borderRadius: 5,
          marginTop: 10,
          borderWidth: 1,
          borderColor: '#dee2e6',
        }}>
          <Text style={{
            textAlign: 'center',
            color: '#6c757d',
            fontSize: 12,
            fontStyle: 'italic',
          }}>
            💡 Search for a location or drag the red marker to set your location
          </Text>
        </View>

        {/* Location Display */}
        <View style={{
          backgroundColor: 'black',
          padding: 12,
          borderRadius: 20,
          marginTop: 10,
          alignSelf: 'center',
          marginBottom: 80, // Add bottom margin to make space for the next button
        }}>
          <Text style={{
            textAlign: 'center',
            color: 'white',
            fontSize: 14,
            fontWeight: '500',
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
            bottom: 30,
            backgroundColor: '#581845',
            borderRadius: 30,
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
          <Text style={{ color: 'red', marginTop: 10, textAlign: 'center' }}>{error}</Text>
        ) : null}
      </View>

      {/* Search Modal */}
      <Modal
        visible={showSearchModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
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
              <MaterialCommunityIcons name="close" size={24} color="#333" />
            </TouchableOpacity>
            <Text style={{ fontSize: 18, fontWeight: 'bold' }}>Search Location</Text>
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
                borderRadius: 25,
                paddingHorizontal: 15,
                paddingVertical: 12,
                fontSize: 16,
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
                    <Text style={{ color: '#666', textAlign: 'center' }}>
                      No locations found for "{searchQuery}"
                    </Text>
                  </View>
                ) : null
              }
            />
          )}
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

export default LocationScreen;

const styles = StyleSheet.create({});