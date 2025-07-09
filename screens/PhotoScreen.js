import {
  StyleSheet,
  Text,
  View,
  Image,
  Pressable,
  TextInput,
  Button,
  TouchableOpacity,
  Platform,
  StatusBar,
} from 'react-native';
import React, {useState,useEffect} from 'react';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import {useNavigation} from '@react-navigation/native';
import {
  getRegistrationProgress,
  saveRegistrationProgress,
} from '../registrationUtils';
import * as ImagePicker from 'expo-image-picker';
import { uploadPhotos } from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { uriToBase64, isCloudUrl, compressBase64Image } from '../utils/imageUtils';
import DraggablePhotoGrid from '../components/DraggablePhotoGrid';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import SafeAreaWrapper from '../components/SafeAreaWrapper';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, typography, shadows, borderRadius, spacing } from '../theme/colors';
import GradientButton from '../components/GradientButton';
import ThemedCard from '../components/ThemedCard';

const PhotoScreen = () => {
  const navigation = useNavigation();
  const [imageUrls, setImageUrls] = useState(Array(6).fill(''));
  const [imageUrl, setImageUrl] = useState('');
  const [error, setError] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(null);
  const [showError, setShowError] = useState(false);

  const handleAddImage = () => {
    if (imageUrl.trim() === '') {
      setError('Please enter an image URL.');
      return;
    }
    const newUrls = [...imageUrls];
    const idx = newUrls.findIndex(url => !url);
    if (idx !== -1) {
      newUrls[idx] = imageUrl;
      setImageUrls(newUrls);
      setImageUrl('');
      setError('');
    } else {
      setError('Maximum 6 images allowed.');
    }
  };

  useEffect(() => {
    // Fetch the saved image URLs from AsyncStorage
    getRegistrationProgress('Photos').then(progressData => {
      console.log('📸 Loading photos from AsyncStorage:', progressData);
      if (progressData && progressData.imageUrls) {
        console.log('📸 Setting imageUrls to:', progressData.imageUrls);
        setImageUrls(progressData.imageUrls);
      } else {
        console.log('📸 No saved photos found, keeping empty array');
      }
    });
  }, []);

  // Debug logging for imageUrls changes
  useEffect(() => {
    console.log('📸 imageUrls state changed:', imageUrls);
  }, [imageUrls]);

  const handleNext = () => {
    const validImages = imageUrls.filter(url => url.trim() !== '');
    if (validImages.length < 4) {
      setError('Please add at least 4 photos.');
      return;
    }
    setError('');
    
    // Filter out local file URIs and keep only cloud URLs
    const cloudUrls = validImages.filter(url => isCloudUrl(url));
    
    if (cloudUrls.length < 4) {
      setError('Please upload at least 4 photos from your device.');
      return;
    }
    
    saveRegistrationProgress('Photos', {imageUrls: cloudUrls});
    navigation.navigate('Prompts');
  };

  // Delete a specific photo
  const deletePhoto = (index) => {
    const newUrls = [...imageUrls];
    newUrls[index] = '';
    setImageUrls(newUrls);
    setSelectedImageIndex(null);
  };

  // Replace a specific photo
  const replacePhoto = async (index) => {
    try {
      setIsUploading(true);
      setError('');
      
      // Use the correct mediaTypes property based on what's available
      const mediaTypes = ImagePicker.MediaTypeOptions?.Images || "Images";
      
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: mediaTypes,
        allowsMultipleSelection: false,
        quality: 0.6, // Reduced quality to decrease payload size
        base64: true,
        aspect: [1, 1], // Force square aspect ratio
        allowsEditing: false, // Disable editing to reduce processing
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        
        // Get user ID from AsyncStorage for Cloudinary upload
        const token = await AsyncStorage.getItem('token');
        let userId = 'temp';
        
        if (token) {
          try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            userId = payload.userId || 'temp';
          } catch (e) {
            console.log('Could not decode token, using temp userId');
          }
        }

        // Convert image to base64 and upload to Cloudinary
        let base64Data = asset.base64;
        if (!base64Data && asset.uri) {
          base64Data = await uriToBase64(asset.uri);
        }

        if (base64Data) {
          // Compress the image to reduce payload size
          const compressedData = compressBase64Image(base64Data, 300); // 300KB limit
          
          const uploadResult = await uploadPhotos([compressedData], userId);
          if (uploadResult.data.successful && uploadResult.data.successful.length > 0) {
            const newUrls = [...imageUrls];
            newUrls[index] = uploadResult.data.successful[0].url;
            setImageUrls(newUrls);
          }
        }
      }
    } catch (error) {
      console.error('Error replacing photo:', error);
      setError('Error replacing photo: ' + error.message);
    } finally {
      setIsUploading(false);
      setSelectedImageIndex(null);
    }
  };

  // Handle long press on photo
  const handlePhotoLongPress = (index) => {
    if (imageUrls[index]) {
      setSelectedImageIndex(index);
    }
  };

  // Close action buttons
  const closeActionButtons = () => {
    setSelectedImageIndex(null);
  };

  // Handle photo reordering
  const handlePhotosReorder = (newOrder) => {
    setImageUrls(newOrder);
  };

  // Add this function to pick images from device
  const pickImage = async () => {
    try {
      setIsUploading(true);
      setError('');
      
      // Use the correct mediaTypes property based on what's available
      const mediaTypes = ImagePicker.MediaTypeOptions?.Images || "Images";
      
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: mediaTypes,
        allowsMultipleSelection: true,
        selectionLimit: 6,
        quality: 0.6, // Reduced quality to decrease payload size
        base64: true, // Enable base64 encoding
        aspect: [1, 1], // Force square aspect ratio
        allowsEditing: false, // Disable editing to reduce processing
      });

      if (!result.canceled && result.assets) {
        // Get user ID from AsyncStorage for Cloudinary upload
        const token = await AsyncStorage.getItem('token');
        let userId = 'temp'; // Default for new users
        
        if (token) {
          try {
            // Decode JWT to get userId (you might need to adjust this based on your JWT structure)
            const payload = JSON.parse(atob(token.split('.')[1]));
            userId = payload.userId || 'temp';
          } catch (e) {
            console.log('Could not decode token, using temp userId');
          }
        }

        // Convert images to base64 and upload to Cloudinary
        const uploadPromises = result.assets.map(async (asset) => {
          try {
            // Use base64 data if available, otherwise convert URI to base64
            let base64Data = asset.base64;
            if (!base64Data && asset.uri) {
              base64Data = await uriToBase64(asset.uri);
            }

            if (base64Data) {
              // Compress the image to reduce payload size
              const compressedData = compressBase64Image(base64Data, 300); // 300KB limit
              
              const uploadResult = await uploadPhotos([compressedData], userId);
              if (uploadResult.data.successful && uploadResult.data.successful.length > 0) {
                return {
                  url: uploadResult.data.successful[0].url,
                  success: true
                };
              }
            }
            return { success: false, error: 'Upload failed' };
          } catch (error) {
            console.error('Error uploading image:', error);
            return { success: false, error: error.message };
          }
        });

        const uploadResults = await Promise.all(uploadPromises);
        const successfulUploads = uploadResults.filter(result => result.success);
        const failedUploads = uploadResults.filter(result => !result.success);

        // Fill empty slots in imageUrls with uploaded cloud URLs
        const newUrls = [...imageUrls];
        successfulUploads.forEach((upload) => {
          const idx = newUrls.findIndex(existingUrl => !existingUrl);
          if (idx !== -1) newUrls[idx] = upload.url;
        });
        setImageUrls(newUrls);
        
        // Show general upload failure message if any
        if (failedUploads.length > 0 && successfulUploads.length === 0) {
          setError('Failed to upload photos. Please try again.');
          setShowError(true);
        }
      }
    } catch (error) {
      console.error('Error picking image:', error);
      setError('Error uploading images: ' + error.message);
      setShowError(true);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <SafeAreaWrapper backgroundColor={colors.background}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <View style={styles.content}>
        {/* Header with Gradient */}
        <LinearGradient
          colors={colors.purpleToCoral}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.headerGradient}
        >
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <MaterialIcons name="photo-camera-back" size={22} color={colors.textInverse} />
            </View>
            <Image
              style={styles.logo}
              source={{
                uri: 'https://cdn-icons-png.flaticon.com/128/10613/10613685.png',
              }}
            />
          </View>
        </LinearGradient>

        <Text style={styles.title}>
          Pick your videos and photos
        </Text>
        
        <View style={styles.photoGridContainer}>
          <DraggablePhotoGrid
            key={`photo-grid-${imageUrls.filter(url => url).length}`}
            photos={imageUrls}
            onPhotosReorder={handlePhotosReorder}
            onPhotoLongPress={handlePhotoLongPress}
            onPhotoPress={pickImage}
            onReplacePhoto={replacePhoto}
            onDeletePhoto={deletePhoto}
            selectedImageIndex={selectedImageIndex}
            isUploading={isUploading}
          />
        </View>

        <View style={styles.instructionsContainer}>
          <Text style={styles.instructionText}>Long press to drag and reorder photos</Text>
          <Text style={styles.photoCountText}>
            Add four to six photos
          </Text>
        </View>

        <ThemedCard variant="elevated" padding="large" margin="medium">
          <Text style={styles.sectionTitle}>Add a picture of yourself</Text>
          
          <View style={styles.uploadSection}>
            <GradientButton
              title="Upload from device"
              onPress={pickImage}
              disabled={isUploading}
              style={styles.uploadButton}
              gradient="purpleToCoral"
            />
            {isUploading && <LoadingSpinner message="Uploading photos..." size="small" />}
          </View>
          
          <View style={styles.urlInputContainer}>
            <MaterialIcons
              style={styles.urlInputIcon}
              name="image"
              size={22}
              color={colors.primary}
            />
            <TextInput
              value={imageUrl}
              onChangeText={text => setImageUrl(text)}
              style={styles.urlInput}
              placeholder="Enter your image URL"
              placeholderTextColor={colors.textTertiary}
            />
          </View>
          
          <GradientButton
            title="Add Image"
            onPress={handleAddImage}
            variant="outline"
            style={styles.addImageButton}
          />
        </ThemedCard>

        <TouchableOpacity
          onPress={handleNext}
          activeOpacity={0.8}
          style={styles.nextButton}>
          <MaterialCommunityIcons
            name="arrow-right-circle"
            size={45}
            color={colors.primary}
          />
        </TouchableOpacity>
        
        <ErrorMessage
          error={error}
          visible={showError}
          onDismiss={() => setShowError(false)}
          onRetry={() => {
            setShowError(false);
            setError('');
          }}
        />
      </View>
    </SafeAreaWrapper>
  );
};

export default PhotoScreen;

const styles = StyleSheet.create({
  content: {
    marginHorizontal: spacing.lg,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight || 20 : 20,
    flex: 1,
  },
  headerGradient: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderBottomLeftRadius: borderRadius.large,
    borderBottomRightRadius: borderRadius.large,
    marginBottom: spacing.lg,
    ...shadows.medium,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderColor: colors.textInverse,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  logo: {
    width: 100,
    height: 40,
    resizeMode: 'contain',
  },
  title: {
    fontSize: typography.fontSize.xxl,
    fontFamily: typography.fontFamily.bold,
    color: colors.textPrimary,
    marginTop: spacing.md,
    textAlign: 'center',
  },
  photoGridContainer: {
    flex: 1,
    marginTop: spacing.lg,
  },
  instructionsContainer: {
    marginVertical: spacing.md,
    alignItems: 'center',
  },
  instructionText: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.regular,
  },
  photoCountText: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.medium,
    color: colors.primary,
    marginTop: spacing.xs,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.bold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  uploadSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginVertical: spacing.md,
  },
  uploadButton: {
    flex: 1,
  },
  urlInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.medium,
    paddingHorizontal: spacing.md,
    marginTop: spacing.md,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  urlInputIcon: {
    marginRight: spacing.sm,
  },
  urlInput: {
    flex: 1,
    color: colors.textPrimary,
    paddingVertical: spacing.md,
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.regular,
  },
  addImageButton: {
    marginTop: spacing.md,
  },
  nextButton: {
    marginTop: spacing.xl,
    alignSelf: 'center',
    marginBottom: spacing.lg,
  },
  actionButtons: {
    position: 'absolute',
    top: 5,
    right: 5,
    flexDirection: 'row',
    gap: 5,
  },
  actionButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.small,
  },
  replaceButton: {
    backgroundColor: colors.info,
  },
  deleteButton: {
    backgroundColor: colors.error,
  },
});
