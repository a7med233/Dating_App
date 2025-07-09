import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Text,
  PanResponder,
  Animated,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
const PHOTO_SIZE = (width - 80) / 3; // 3 photos per row with margins

const DraggablePhotoGrid = ({
  photos,
  onPhotosReorder,
  onPhotoLongPress,
  onPhotoPress,
  onReplacePhoto,
  onDeletePhoto,
  selectedImageIndex,
  isUploading,
}) => {
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [dropTargetIndex, setDropTargetIndex] = useState(null);
  const [containerLayout, setContainerLayout] = useState(null);
  
  // Use ref to track draggedIndex for PanResponder
  const draggedIndexRef = useRef(null);
  
  // Animation values for drag feedback
  const dragAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  // Debug logging
  useEffect(() => {
    console.log('🖼️ DraggablePhotoGrid mounted with photos:', photos);
  }, []);

  useEffect(() => {
    console.log('📸 Photos updated:', photos);
  }, [photos]);

  useEffect(() => {
    console.log('🎯 draggedIndex changed to:', draggedIndex);
  }, [draggedIndex]);

  useEffect(() => {
    console.log('🏗️ Container layout updated:', containerLayout);
  }, [containerLayout]);

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

  // Create PanResponder for drag and drop
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: (evt, gestureState) => {
        console.log('🎯 PanResponder start check:', { draggedIndex: draggedIndexRef.current });
        return false; // Let TouchableOpacity handle the start
      },
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        console.log('🎯 PanResponder move check:', { 
          draggedIndex: draggedIndexRef.current, 
          dx: gestureState.dx, 
          dy: gestureState.dy,
          shouldStart: draggedIndexRef.current !== null && (Math.abs(gestureState.dx) > 10 || Math.abs(gestureState.dy) > 10)
        });
        
        // If we don't have a dragged item yet, check if this is a long press
        if (draggedIndexRef.current === null) {
          const touchX = evt.nativeEvent.pageX;
          const touchY = evt.nativeEvent.pageY;
          const photoIndex = getPhotoIndexFromTouch(touchX, touchY);
          
          console.log('🔍 Checking for long press:', { photoIndex, hasPhoto: photos[photoIndex] });
          console.log('🔍 All photos:', photos);
          
          if (photoIndex !== -1 && photos[photoIndex] && photos[photoIndex].trim() !== '') {
            console.log('🔍 Long press detected on photo:', photoIndex);
            setDraggedIndex(photoIndex);
            draggedIndexRef.current = photoIndex;
            
            // Animate the dragged item
            Animated.parallel([
              Animated.timing(dragAnim, {
                toValue: 0.8,
                duration: 200,
                useNativeDriver: true,
              }),
              Animated.timing(scaleAnim, {
                toValue: 1.1,
                duration: 200,
                useNativeDriver: true,
              }),
            ]).start();
            
            return true; // Start the pan responder
          } else {
            console.log('🔍 No valid photo at this position');
          }
        }
        
        // Only start moving if we have a dragged item and there's significant movement
        return draggedIndexRef.current !== null && (Math.abs(gestureState.dx) > 10 || Math.abs(gestureState.dy) > 10);
      },
      onPanResponderGrant: (evt, gestureState) => {
        console.log('🎯 Pan responder granted for dragging');
      },
      onPanResponderMove: (evt, gestureState) => {
        console.log('🔄 PanResponder move:', { draggedIndex: draggedIndexRef.current, dx: gestureState.dx, dy: gestureState.dy });
        if (draggedIndexRef.current !== null) {
          const touchX = evt.nativeEvent.pageX;
          const touchY = evt.nativeEvent.pageY;
          
          console.log('🔄 Dragging to position:', { touchX, touchY });
          
          // Calculate potential drop target
          const targetIndex = getPhotoIndexFromTouch(touchX, touchY);
          if (targetIndex !== -1 && targetIndex !== draggedIndexRef.current) {
            setDropTargetIndex(targetIndex);
            console.log('🎯 Drop target found:', targetIndex);
          } else {
            setDropTargetIndex(null);
          }
        }
      },
      onPanResponderRelease: (evt, gestureState) => {
        console.log('Pan responder release:', { draggedIndex: draggedIndexRef.current, dropTargetIndex });
        
        // Get the current drop target index from state
        const currentDropTarget = dropTargetIndex;
        
        if (draggedIndexRef.current !== null && currentDropTarget !== null) {
          // Perform the reorder
          const newPhotos = [...photos];
          const draggedPhoto = newPhotos[draggedIndexRef.current];
          
          console.log('🔄 Reordering:', { from: draggedIndexRef.current, to: currentDropTarget, draggedPhoto });
          
          // Remove from original position
          newPhotos.splice(draggedIndexRef.current, 1);
          
          // Insert at new position
          newPhotos.splice(currentDropTarget, 0, draggedPhoto);
          
          console.log('✅ SUCCESS: Photos reordered! New order:', newPhotos);
          
          // Call the reorder callback
          onPhotosReorder(newPhotos);
        } else {
          console.log('❌ No reorder - missing draggedIndex or dropTargetIndex', { 
            draggedIndex: draggedIndexRef.current, 
            dropTargetIndex: currentDropTarget 
          });
        }
        
        // Reset animations and state
        Animated.parallel([
          Animated.timing(dragAnim, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
        ]).start(() => {
          setDraggedIndex(null);
          draggedIndexRef.current = null;
          setDropTargetIndex(null);
        });
      },
    })
  ).current;

  // Helper function to calculate photo index from touch coordinates
  const getPhotoIndexFromTouch = (touchX, touchY) => {
    console.log('📍 Touch coordinates:', { touchX, touchY });
    console.log('📍 Container layout:', containerLayout);
    
    if (!containerLayout) {
      console.log('📍 No container layout yet, using fallback calculation');
      // Fallback: use screen coordinates and estimate photo positions
      // Assuming photos start around 20px from left edge and have some top margin
      const estimatedLeftMargin = 20;
      const estimatedTopMargin = 200; // Approximate top margin for the photo grid
      
      const relativeX = touchX - estimatedLeftMargin;
      const relativeY = touchY - estimatedTopMargin;
      
      console.log('📍 Fallback relative coordinates:', { relativeX, relativeY });
      
      if (relativeX < 0 || relativeY < 0) {
        console.log('📍 Fallback coordinates outside bounds');
        return -1;
      }
      
      const row = Math.floor(relativeY / (PHOTO_SIZE + 20));
      const col = Math.floor(relativeX / (PHOTO_SIZE + 10));
      
      console.log('📍 Fallback calculated position:', { row, col, PHOTO_SIZE });
      
      const index = row * 3 + col;
      
      console.log('📍 Fallback calculated index:', index);
      
      // Only return valid indices that are within the photo array bounds
      if (index >= 0 && index < photos.length) {
        console.log('📍 Fallback valid index found:', index, 'Photo:', photos[index]);
        return index;
      }
      
      console.log('📍 Fallback index out of range:', index, 'Photos length:', photos.length);
      return -1;
    }
    
    const { x: containerX, y: containerY } = containerLayout;
    const relativeX = touchX - containerX;
    const relativeY = touchY - containerY;
    
    console.log('📍 Relative coordinates:', { relativeX, relativeY });
    
    // Account for padding and margins
    const adjustedX = relativeX - 20; // paddingHorizontal
    const adjustedY = relativeY;
    
    console.log('📍 Adjusted coordinates:', { adjustedX, adjustedY });
    
    if (adjustedX < 0 || adjustedY < 0) {
      console.log('📍 Coordinates outside bounds');
      return -1;
    }
    
    // Calculate which photo was touched
    const row = Math.floor(adjustedY / (PHOTO_SIZE + 20));
    const col = Math.floor(adjustedX / (PHOTO_SIZE + 10));
    
    console.log('📍 Calculated position:', { row, col, PHOTO_SIZE });
    
    const index = row * 3 + col;
    
    console.log('📍 Calculated index:', index);
    
    // Only return valid indices that are within the photo array bounds
    if (index >= 0 && index < photos.length) {
      console.log('📍 Valid index found:', index, 'Photo:', photos[index]);
      return index;
    }
    
    console.log('📍 Index out of range:', index, 'Photos length:', photos.length);
    return -1;
  };

  const onContainerLayout = (event) => {
    const { x, y, width, height } = event.nativeEvent.layout;
    console.log('🏗️ Container layout set:', { x, y, width, height });
    setContainerLayout({ x, y, width, height });
  };

  // Force container layout update when photos change
  useEffect(() => {
    if (photos.length > 0 && !containerLayout) {
      console.log('🔄 Photos loaded but no container layout, forcing update');
      // This will trigger a re-render and hopefully capture the layout
    }
  }, [photos, containerLayout]);

  const renderPhotoItem = (url, index) => {
    const hasPhoto = url && url.trim() !== '';
    const isDragging = draggedIndex === index;
    const isDropTarget = dropTargetIndex === index;
    
    return (
      <Animated.View
        key={index}
        style={[
          styles.photoContainer,
          isDragging && styles.draggingPhoto,
          isDropTarget && styles.dropTargetPhoto,
          {
            opacity: isDragging ? dragAnim : 1,
            transform: [
              { scale: isDragging ? scaleAnim : 1 },
            ],
            zIndex: isDragging ? 1000 : 1,
          },
        ]}>
        <TouchableOpacity
          onPress={() => handlePress(index)}
          style={styles.photoTouchable}
          disabled={isUploading || draggedIndex !== null}>
          {hasPhoto ? (
            <Image
              source={{ uri: url }}
              style={styles.photo}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.emptyPhoto}>
              <MaterialIcons name="image" size={24} color="#ccc" />
            </View>
          )}
          
          {/* Action buttons for selected photo */}
          {selectedImageIndex === index && hasPhoto && (
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[styles.actionButton, styles.replaceButton]}
                onPress={() => onReplacePhoto(index)}
                disabled={isUploading}>
                <MaterialIcons name="edit" size={16} color="white" />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.deleteButton]}
                onPress={() => onDeletePhoto(index)}
                disabled={isUploading}>
                <MaterialIcons name="delete" size={16} color="white" />
              </TouchableOpacity>
            </View>
          )}
          
          {/* Drag handle for photos */}
          {hasPhoto && (
            <View style={styles.dragHandle}>
              <MaterialIcons name="drag-handle" size={16} color="white" />
            </View>
          )}
          
          {/* Drag indicator overlay */}
          {isDragging && (
            <View style={styles.dragOverlay}>
              <MaterialIcons name="pan-tool" size={24} color="white" />
            </View>
          )}
        </TouchableOpacity>
      </Animated.View>
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
    <View 
      key={`photo-grid-${photos.length}-${photos.join(',')}`}
      style={styles.container} 
      onLayout={onContainerLayout} 
      {...panResponder.panHandlers}
    >
      <View style={styles.gridContainer}>
        {/* First row (photos 0-2) */}
        {renderPhotoRow(0, 3)}
        
        {/* Second row (photos 3-5) */}
        {renderPhotoRow(3, 3)}
      </View>
      
      {/* Drag and drop instructions */}
      <View style={styles.instructions}>
        <MaterialIcons name="info" size={16} color="#666" />
        <Text style={styles.instructionText}>
          Long press on a photo and drag to reorder! Drop on another photo to swap positions.
        </Text>
      </View>
      
      {/* Debug info */}
      <View style={styles.debugInfo}>
        <Text style={styles.debugText}>
          Dragged: {draggedIndex !== null ? draggedIndex : 'None'} | 
          Target: {dropTargetIndex !== null ? dropTargetIndex : 'None'} |
          Layout: {containerLayout ? 'Set' : 'Not Set'}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gridContainer: {
    paddingHorizontal: 20,
  },
  photoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  photoContainer: {
    width: PHOTO_SIZE,
    height: PHOTO_SIZE,
    borderRadius: 10,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#f8f9fa',
    borderWidth: 2,
    borderColor: '#e9ecef',
    borderStyle: 'dashed',
  },
  photoTouchable: {
    width: '100%',
    height: '100%',
  },
  draggingPhoto: {
    opacity: 0.5,
    transform: [{ scale: 1.1 }],
  },
  dropTargetPhoto: {
    borderColor: '#007AFF',
    borderWidth: 3,
    borderStyle: 'solid',
  },
  photo: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  emptyPhoto: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  actionButtons: {
    position: 'absolute',
    top: 5,
    right: 5,
    flexDirection: 'row',
    gap: 5,
  },
  actionButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  replaceButton: {
    backgroundColor: '#007AFF',
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
  },
  dragHandle: {
    position: 'absolute',
    bottom: 5,
    left: 5,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 12,
    padding: 4,
  },
  dragOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 122, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  instructions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    gap: 8,
  },
  instructionText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    flex: 1,
  },
  debugInfo: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 10,
    borderRadius: 8,
  },
  debugText: {
    color: 'white',
    fontSize: 12,
  },
});

export default DraggablePhotoGrid; 