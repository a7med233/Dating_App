import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  Image,
  Pressable,
  TextInput,
  Button,
  TouchableOpacity,
} from 'react-native';
import React, {useState,useEffect} from 'react';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import EvilIcons from 'react-native-vector-icons/EvilIcons';
import {useNavigation} from '@react-navigation/native';
import {
  getRegistrationProgress,
  saveRegistrationProgress,
} from '../registrationUtils';
import {launchImageLibrary} from 'react-native-image-picker';

const PhotoScreen = () => {
  const navigation = useNavigation();
  const [imageUrls, setImageUrls] = useState(['', '', '', '', '', '']);
  const [imageUrl, setImageUrl] = useState('');
  const [error, setError] = useState('');

  const handleAddImage = () => {
    // Find the first empty slot in the array
    const index = imageUrls.findIndex(url => url === '');
    if (index !== -1) {
      const updatedUrls = [...imageUrls];
      updatedUrls[index] = imageUrl;
      setImageUrls(updatedUrls);
      setImageUrl('');
    }
  };

  useEffect(() => {
    // Fetch the saved image URLs from AsyncStorage
    getRegistrationProgress('Photos').then(progressData => {
      if (progressData && progressData.imageUrls) {
        setImageUrls(progressData.imageUrls);
      }
    });
  }, []);

  const handleNext = () => {
    // At least one image URL must be non-empty
    if (!imageUrls.some(url => url && url.trim() !== '')) {
      setError('Please add at least one photo.');
      return;
    }
    setError('');
    saveRegistrationProgress('Photos', {imageUrls});
    navigation.navigate('Prompts');
  };

  // Add this function to pick images from device
  const pickImage = () => {
    launchImageLibrary(
      { mediaType: 'photo', selectionLimit: 6 },
      (response) => {
        if (response.didCancel) return;
        if (response.errorCode) {
          alert('Error: ' + response.errorMessage);
          return;
        }
        if (response.assets) {
          // Fill empty slots in imageUrls with selected images
          const newUrls = [...imageUrls];
          response.assets.forEach((asset) => {
            const idx = newUrls.findIndex(url => !url);
            if (idx !== -1) newUrls[idx] = asset.uri;
          });
          setImageUrls(newUrls);
        }
      }
    );
  };

  return (
    <SafeAreaView>
      <View style={{marginTop: 90, marginHorizontal: 20}}>
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <View
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              borderColor: 'black',
              borderWidth: 2,
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <MaterialIcons name="photo-camera-back" size={22} color="black" />
          </View>
          <Image
            style={{width: 100, height: 40}}
            source={{
              uri: 'https://cdn-icons-png.flaticon.com/128/10613/10613685.png',
            }}
          />
        </View>
        <Text
          style={{
            fontSize: 25,
            fontWeight: 'bold',
            fontFamily: 'GeezaPro-Bold',
            marginTop: 15,
          }}>
          Pick your videos and photos
        </Text>
        <View style={{marginTop: 20}}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',

              gap: 20,
            }}>
            {imageUrls.slice(0, 3).map((url, index) => (
              <Pressable
                key={index}
                style={{
                  borderColor: '#581845',
                  borderWidth: url ? 0 : 2,
                  flex: 1,
                  justifyContent: 'center',
                  alignItems: 'center',
                  borderStyle: 'dashed',
                  borderRadius: 10,
                  height: 100,
                }}>
                {url ? (
                  <Image
                    source={{uri: url}}
                    style={{
                      width: '100%',
                      height: '100%',
                      borderRadius: 10,
                      resizeMode: 'cover',
                    }}
                  />
                ) : (
                  <EvilIcons name="image" size={22} color="black" />
                )}
              </Pressable>
            ))}
          </View>
        </View>
        <View style={{marginTop: 20}}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              gap: 20,
            }}>
            {imageUrls.slice(3, 6).map((url, index) => (
              <Pressable
                key={index}
                style={{
                  borderColor: '#581845',
                  borderWidth: url ? 0 : 2,
                  flex: 1,
                  justifyContent: 'center',
                  alignItems: 'center',
                  borderStyle: 'dashed',
                  borderRadius: 10,
                  height: 100,
                }}>
                {url ? (
                  <Image
                    source={{uri: url}}
                    style={{
                      width: '100%',
                      height: '100%',
                      borderRadius: 10,
                      resizeMode: 'cover',
                    }}
                  />
                ) : (
                  <EvilIcons name="image" size={22} color="black" />
                )}
              </Pressable>
            ))}
          </View>
        </View>

        <View style={{marginVertical: 10}}>
          <Text style={{color: 'gray', fontSize: 15}}>Drag to reorder</Text>
          <Text
            style={{
              fontSize: 15,
              fontWeight: '500',
              color: '#581845',
              marginTop: 3,
            }}>
            Add four to six photos
          </Text>
        </View>

        <View style={{marginTop: 25}}>
          <Text>Add a picture of yourself</Text>
          <View style={{flexDirection: 'row', alignItems: 'center', gap: 10, marginVertical: 10}}>
            <Button title="Upload from device" onPress={pickImage} />
          </View>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 5,
              paddingVertical: 5,
              borderRadius: 5,
              marginTop: 10,
              backgroundColor: '#DCDCDC',
            }}>
            <EvilIcons
              style={{marginLeft: 8}}
              name="image"
              size={22}
              color="black"
            />
            <TextInput
              value={imageUrl}
              onChangeText={text => setImageUrl(text)}
              style={{color: 'gray', marginVertical: 10, width: 300}}
              placeholder="enter your image url"
            />
          </View>
          <Button
            onPress={handleAddImage}
            style={{marginTop: 5}}
            title="Add Image"
          />
        </View>

        <TouchableOpacity
          onPress={handleNext}
          activeOpacity={0.8}
          style={{marginTop: 30, marginLeft: 'auto'}}>
          <MaterialCommunityIcons
            name="arrow-right-circle"
            size={45}
            color="#581845"
            style={{alignSelf: 'center', marginTop: 20}}
          />
        </TouchableOpacity>
        {error ? (
          <Text style={{ color: 'red', marginTop: 5 }}>{error}</Text>
        ) : null}
      </View>
    </SafeAreaView>
  );
};

export default PhotoScreen;

const styles = StyleSheet.create({});
