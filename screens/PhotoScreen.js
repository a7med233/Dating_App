import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
} from 'react-native';
import React, {useState, useEffect} from 'react';
import { Ionicons } from '@expo/vector-icons';
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
import { LinearGradient } from 'expo-linear-gradient';
import { colors, typography, shadows, borderRadius, spacing } from '../theme/colors';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

const PhotoScreen = () => {
  const navigation = useNavigation();
  const [imageUrls, setImageUrls] = useState(Array(6).fill(''));
  const [error, setError] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(null);
  const [showError, setShowError] = useState(false);

  useEffect(() => {
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
    
    const cloudUrls = validImages.filter(url => isCloudUrl(url));
    
    if (cloudUrls.length < 4) {
      setError('Please upload at least 4 photos from your device.');
      setShowError(true);
      return;
    }
    
    saveRegistrationProgress('Photos', {imageUrls: cloudUrls});
    navigation.navigate('Prompts');
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const deletePhoto = (index) => {
    const newUrls = [...imageUrls];
    newUrls[index] = '';
    setImageUrls(newUrls);
    setSelectedImageIndex(null);
  };

  const replacePhoto = async (index) => {
    try {
      setIsUploading(true);
      setError('');
      
      const mediaTypes = ImagePicker.MediaTypeOptions?.Images || "Images";
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: mediaTypes,
        allowsMultipleSelection: false,
        quality: 0.6,
        base64: true,
        allowsEditing: Platform.OS === 'ios',
        aspect: Platform.OS === 'ios' ? [1, 1] : undefined,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        
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

        let base64Data = asset.base64;
        if (!base64Data && asset.uri) {
          base64Data = await uriToBase64(asset.uri);
        }

        if (base64Data) {
          const compressedData = compressBase64Image(base64Data, 300);
          
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

  const handlePhotoLongPress = (index) => {
    if (imageUrls[index]) {
      setSelectedImageIndex(index);
    }
  };

  const closeActionButtons = () => {
    setSelectedImageIndex(null);
  };

  const pickImage = async () => {
    try {
      setIsUploading(true);
      setError('');
      
      const mediaTypes = ImagePicker.MediaTypeOptions?.Images || "Images";
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: mediaTypes,
        allowsMultipleSelection: true,
        selectionLimit: 6,
        quality: 0.6,
        base64: true,
        allowsEditing: Platform.OS === 'ios',
        aspect: Platform.OS === 'ios' ? [1, 1] : undefined,
      });

      if (!result.canceled && result.assets) {
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

        const uploadPromises = result.assets.map(async (asset) => {
          try {
            let base64Data = asset.base64;
            if (!base64Data && asset.uri) {
              base64Data = await uriToBase64(asset.uri);
            }

            if (base64Data) {
              const compressedData = compressBase64Image(base64Data, 300);
              
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

        const newUrls = [...imageUrls];
        successfulUploads.forEach((upload) => {
          const idx = newUrls.findIndex(existingUrl => !existingUrl);
          if (idx !== -1) newUrls[idx] = upload.url;
        });
        setImageUrls(newUrls);
        
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

  const photoCount = imageUrls.filter(url => url.trim() !== '').length;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
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
                <Ionicons name="camera" size={40} color={colors.textInverse} />
                <Text style={styles.headerTitle}>Photos</Text>
              </View>
          </View>
        </LinearGradient>

          {/* Main Content */}
          <View style={styles.mainContent}>
            {/* Title Section */}
            <View style={styles.titleSection}>
              <Text style={styles.title}>Pick your photos</Text>
          <Text style={styles.subtitle}>
                Add four to six photos to showcase yourself. Choose your best shots!
          </Text>
            </View>

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
                      { width: `${Math.min((photoCount / 6) * 100, 100)}%` }
                  ]} 
                />
              </View>
              <Text style={styles.photoCountText}>
                  {photoCount} of 6 photos added
              </Text>
                {photoCount < 4 && (
                <Text style={styles.photoCountSubtext}>
                    Add {4 - photoCount} more photo{4 - photoCount !== 1 ? 's' : ''} to continue
                  </Text>
                )}
                {photoCount >= 4 && photoCount < 6 && (
                  <Text style={styles.photoCountSubtext}>
                    You can add {6 - photoCount} more photo{6 - photoCount !== 1 ? 's' : ''} (optional)
                  </Text>
                )}
                {photoCount >= 6 && (
                  <Text style={styles.photoCountSubtext}>
                    Maximum photos reached! You can edit or replace existing photos.
                </Text>
              )}
            </View>
          </View>

            {/* Upload Section */}
            <View style={styles.uploadSection}>
              <View style={styles.uploadContainer}>
                <View style={styles.uploadIconContainer}>
                  <Ionicons name="cloud-upload-outline" size={24} color={colors.primary} />
                </View>
                <View style={styles.uploadTextContainer}>
                  <Text style={styles.uploadTitle}>Add Photos</Text>
                  <Text style={styles.uploadDescription}>
                    Upload photos from your device to create your profile
                  </Text>
                </View>
              </View>
              
              <TouchableOpacity
                onPress={pickImage}
                disabled={isUploading || photoCount >= 6}
                style={[
                  styles.uploadButton,
                  {
                    opacity: (isUploading || photoCount >= 6) ? 0.6 : 1,
                    backgroundColor: (isUploading || photoCount >= 6) ? colors.textTertiary : colors.primary
                  }
                ]}
              >
                {isUploading ? (
                <View style={styles.loadingContainer}>
                    <LoadingSpinner size="small" />
                    <Text style={styles.uploadButtonText}>Uploading...</Text>
                </View>
                ) : (
                  <Text style={styles.uploadButtonText}>
                    {photoCount >= 6 ? 'Maximum Photos Reached' : 'Upload from Device'}
                  </Text>
              )}
              </TouchableOpacity>
            </View>

            {/* Info Section */}
            <View style={styles.infoContainer}>
              <Ionicons name="information-circle-outline" size={16} color={colors.textSecondary} />
              <Text style={styles.infoText}>
                Long press on any photo to edit or delete it. Choose photos that show your personality and interests!
            </Text>
          </View>

            {/* Tips Section */}
            <View style={styles.tipsContainer}>
              <Text style={styles.tipsTitle}>Photo Tips:</Text>
              <View style={styles.tipsList}>
                <View style={styles.tipItem}>
                  <Ionicons name="checkmark-circle" size={16} color={colors.success} />
                  <Text style={styles.tipText}>Use clear, well-lit photos</Text>
                </View>
                <View style={styles.tipItem}>
                  <Ionicons name="checkmark-circle" size={16} color={colors.success} />
                  <Text style={styles.tipText}>Show your face clearly in the first photo</Text>
                </View>
                <View style={styles.tipItem}>
                  <Ionicons name="checkmark-circle" size={16} color={colors.success} />
                  <Text style={styles.tipText}>Include photos of your hobbies and interests</Text>
                </View>
              </View>
            </View>

            {/* Continue Button */}
          <TouchableOpacity
            onPress={handleNext}
              disabled={photoCount < 4}
            style={[
                styles.continueButton,
                {
                  opacity: photoCount < 4 ? 0.6 : 1,
                  backgroundColor: photoCount < 4 ? colors.textTertiary : colors.primary
                }
              ]}
            >
              <Text style={styles.continueButtonText}>Continue</Text>
          </TouchableOpacity>
        </View>
        </ScrollView>
      </KeyboardAvoidingView>
        
        <ErrorMessage
          error={error}
          visible={showError}
          onDismiss={() => setShowError(false)}
          onRetry={() => {
            setShowError(false);
            setError('');
          }}
        />
    </SafeAreaView>
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
    paddingBottom: Platform.OS === 'android' ? 20 : 0,
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
    paddingBottom: Platform.OS === 'android' ? 100 : 0,
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
  photoSection: {
    marginBottom: spacing.xl,
  },
  photoCountContainer: {
    marginTop: spacing.lg,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
  },
  photoCountBar: {
    width: '100%',
    height: 8,
    backgroundColor: colors.border,
    borderRadius: 4,
    marginBottom: spacing.sm,
    overflow: 'hidden',
  },
  photoCountProgress: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  photoCountText: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.semiBold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  photoCountSubtext: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.regular,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  uploadSection: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.medium,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    marginBottom: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
  },
  uploadContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  uploadIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary + '10',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  uploadTextContainer: {
    flex: 1,
  },
  uploadTitle: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.semiBold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  uploadDescription: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.regular,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  uploadButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.medium,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.medium,
  },
  uploadButtonText: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.semiBold,
    color: colors.textInverse,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.primary + '10',
    borderRadius: borderRadius.small,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.primary + '20',
    marginBottom: spacing.xl,
  },
  infoText: {
    marginLeft: spacing.xs,
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.regular,
    color: colors.textSecondary,
    flex: 1,
    lineHeight: 18,
  },
  tipsContainer: {
    marginBottom: spacing.xl,
  },
  tipsTitle: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.semiBold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  tipsList: {
    gap: spacing.sm,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  tipText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.regular,
    color: colors.textSecondary,
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
    marginBottom: Platform.OS === 'android' ? 20 : 0,
    ...shadows.medium,
  },
  continueButtonText: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.semiBold,
    color: colors.textInverse,
  },
});

export default PhotoScreen;
