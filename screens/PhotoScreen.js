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
  ScrollView,
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
  const [error, setError] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(null);
  const [showError, setShowError] = useState(false);

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
      setError(`Please add at least 4 photos. You currently have ${validImages.length} photo${validImages.length !== 1 ? 's' : ''}.`);
      setShowError(true);
      return;
    }
    setError('');
    
    // Filter out local file URIs and keep only cloud URLs
    const cloudUrls = validImages.filter(url => isCloudUrl(url));
    
    if (cloudUrls.length < 4) {
      setError('Please upload at least 4 photos from your device.');
      setShowError(true);
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
        allowsEditing: Platform.OS === 'ios', // Only enable editing on iOS for now
        aspect: Platform.OS === 'ios' ? [1, 1] : undefined, // Force square aspect ratio only on iOS
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
        allowsEditing: Platform.OS === 'ios', // Only enable editing on iOS for now
        aspect: Platform.OS === 'ios' ? [1, 1] : undefined, // Force square aspect ratio only on iOS
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
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
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

        <View style={styles.content}>
          <Text style={styles.title}>
            Pick your photos
          </Text>
          
          <Text style={styles.subtitle}>
            Add four to six photos to showcase yourself
          </Text>

          {/* Photo Grid Section */}
          <View style={styles.photoSection}>
            <DraggablePhotoGrid
              photos={imageUrls}
              onPhotoLongPress={handlePhotoLongPress}
              onPhotoPress={pickImage}
              onReplacePhoto={replacePhoto}
              onDeletePhoto={deletePhoto}
              selectedImageIndex={selectedImageIndex}
              isUploading={isUploading}
            />
            
            {/* Photo Count Indicator */}
            <View style={styles.photoCountContainer}>
              <View style={styles.photoCountBar}>
                <View 
                  style={[
                    styles.photoCountProgress, 
                    { width: `${Math.min((imageUrls.filter(url => url.trim() !== '').length / 4) * 100, 100)}%` }
                  ]} 
                />
              </View>
              <Text style={styles.photoCountText}>
                {imageUrls.filter(url => url.trim() !== '').length} of 4 photos added
              </Text>
              {imageUrls.filter(url => url.trim() !== '').length < 4 && (
                <Text style={styles.photoCountSubtext}>
                  Add {4 - imageUrls.filter(url => url.trim() !== '').length} more photo{4 - imageUrls.filter(url => url.trim() !== '').length !== 1 ? 's' : ''} to continue
                </Text>
              )}
            </View>
          </View>

          {/* Upload Options Section */}
          <ThemedCard variant="elevated" padding="medium" margin="small">
            <Text style={styles.sectionTitle}>Add Photos</Text>
            
            <View style={styles.uploadSection}>
              <GradientButton
                title="Upload from device"
                onPress={pickImage}
                disabled={isUploading}
                style={styles.uploadButton}
                gradient="purpleToCoral"
                size="small"
              />
              {isUploading && (
                <View style={styles.loadingContainer}>
                  <LoadingSpinner message="Uploading..." size="small" />
                </View>
              )}
            </View>
          </ThemedCard>

          {/* Instructions */}
          <View style={styles.instructionsContainer}>
            <MaterialIcons name="info-outline" size={14} color={colors.textSecondary} />
            <Text style={styles.instructionText}>
              Long press on a photo to edit or delete
            </Text>
          </View>

          {/* Next Button */}
          <TouchableOpacity
            onPress={handleNext}
            activeOpacity={0.8}
            disabled={imageUrls.filter(url => url.trim() !== '').length < 4}
            style={[
              styles.nextButton,
              imageUrls.filter(url => url.trim() !== '').length < 4 && styles.nextButtonDisabled
            ]}>
            <MaterialCommunityIcons
              name="arrow-right-circle"
              size={50}
              color={imageUrls.filter(url => url.trim() !== '').length < 4 ? colors.textTertiary : colors.primary}
            />
          </TouchableOpacity>
        </View>
        
        <ErrorMessage
          error={error}
          visible={showError}
          onDismiss={() => setShowError(false)}
          onRetry={() => {
            setShowError(false);
            setError('');
          }}
        />
      </ScrollView>
    </SafeAreaWrapper>
  );
};

export default PhotoScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    backgroundColor: "#fff",
  },
  headerGradient: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderBottomLeftRadius: borderRadius.large,
    borderBottomRightRadius: borderRadius.large,
    marginBottom: spacing.sm,
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
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.regular,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  photoSection: {
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.bold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  uploadSection: {
    marginBottom: spacing.sm,
  },
  uploadButton: {
    marginBottom: spacing.sm,
  },
  loadingContainer: {
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  instructionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  instructionText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    flex: 1,
    fontFamily: typography.fontFamily.regular,
  },
  nextButton: {
    alignSelf: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
  nextButtonDisabled: {
    opacity: 0.5,
  },
  photoCountContainer: {
    marginTop: spacing.sm,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
  },
  photoCountBar: {
    width: '100%',
    height: 8,
    backgroundColor: colors.cardBorder,
    borderRadius: 4,
    marginBottom: spacing.xs,
    overflow: 'hidden',
  },
  photoCountProgress: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  photoCountText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  photoCountSubtext: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.regular,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
