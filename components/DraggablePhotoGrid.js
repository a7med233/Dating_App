import React, { useState } from 'react';
import {
  View,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Text,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, typography, shadows, borderRadius, spacing } from '../theme/colors';

const { width } = Dimensions.get('window');
const PHOTO_SIZE = (width - 80) / 3; // 3 photos per row with margins

const DraggablePhotoGrid = ({
  photos,
  onPhotoLongPress,
  onPhotoPress,
  onReplacePhoto,
  onDeletePhoto,
  selectedImageIndex,
  isUploading,
}) => {
  const handleLongPress = (index) => {
    if (photos[index] && photos[index].trim() !== '') {
      onPhotoLongPress(index);
    }
  };

  const handlePress = (index) => {
    if (!photos[index] || photos[index].trim() === '') {
      onPhotoPress();
    }
  };

  const renderPhotoItem = (url, index) => {
    const hasPhoto = url && url.trim() !== '';
    
    return (
      <View key={index} style={styles.photoContainer}>
        <TouchableOpacity
          onPress={() => handlePress(index)}
          onLongPress={() => handleLongPress(index)}
          style={styles.photoTouchable}
          disabled={isUploading}>
          {hasPhoto ? (
            <Image
              source={{ uri: url }}
              style={styles.photo}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.emptyPhoto}>
              <MaterialIcons name="add-a-photo" size={28} color={colors.textTertiary} />
              <Text style={styles.emptyPhotoText}>Add</Text>
            </View>
          )}
          
          {/* Action buttons for selected photo */}
          {selectedImageIndex === index && hasPhoto && (
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[styles.actionButton, styles.replaceButton]}
                onPress={() => onReplacePhoto(index)}
                disabled={isUploading}>
                <MaterialIcons name="edit" size={14} color="white" />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.deleteButton]}
                onPress={() => onDeletePhoto(index)}
                disabled={isUploading}>
                <MaterialIcons name="delete" size={14} color="white" />
              </TouchableOpacity>
            </View>
          )}
          
          {/* Long press indicator for photos */}
          {hasPhoto && (
            <View style={styles.longPressIndicator}>
              <MaterialIcons name="touch-app" size={12} color="white" />
            </View>
          )}
        </TouchableOpacity>
      </View>
    );
  };

  const renderPhotoRow = (startIndex, count) => {
    const rowPhotos = photos.slice(startIndex, startIndex + count);
    
    return (
      <View key={`row-${startIndex}`} style={styles.photoRow}>
        {rowPhotos.map((url, index) => 
          renderPhotoItem(url, startIndex + index)
        )}
        {/* Fill empty slots */}
        {Array.from({ length: count - rowPhotos.length }).map((_, index) => 
          renderPhotoItem('', startIndex + rowPhotos.length + index)
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.gridContainer}>
        {/* First row (photos 0-2) */}
        {renderPhotoRow(0, 3)}
        
        {/* Second row (photos 3-5) */}
        {renderPhotoRow(3, 3)}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gridContainer: {
    paddingHorizontal: spacing.md,
  },
  photoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  photoContainer: {
    width: PHOTO_SIZE,
    height: PHOTO_SIZE,
    borderRadius: borderRadius.medium,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: colors.backgroundSecondary,
    borderWidth: 2,
    borderColor: colors.cardBorder,
    borderStyle: 'dashed',
    ...shadows.small,
  },
  photoTouchable: {
    width: '100%',
    height: '100%',
  },
  photo: {
    width: '100%',
    height: '100%',
    borderRadius: borderRadius.small,
  },
  emptyPhoto: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.backgroundSecondary,
  },
  emptyPhotoText: {
    fontSize: typography.fontSize.xs,
    color: colors.textTertiary,
    fontFamily: typography.fontFamily.medium,
    marginTop: spacing.xs,
  },
  actionButtons: {
    position: 'absolute',
    top: spacing.xs,
    right: spacing.xs,
    flexDirection: 'row',
    gap: spacing.xs,
  },
  actionButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.medium,
  },
  replaceButton: {
    backgroundColor: colors.info,
  },
  deleteButton: {
    backgroundColor: colors.error,
  },
  longPressIndicator: {
    position: 'absolute',
    bottom: spacing.xs,
    left: spacing.xs,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: borderRadius.small,
    padding: 4,
  },
});

export default DraggablePhotoGrid; 