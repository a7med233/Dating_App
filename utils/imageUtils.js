// Utility functions for image handling

// Convert local file URI to base64
export const uriToBase64 = async (uri) => {
  try {
    const response = await fetch(uri);
    const blob = await response.blob();
    
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('Error converting URI to base64:', error);
    throw error;
  }
};

// Compress base64 image to reduce payload size
export const compressBase64Image = (base64String, maxSizeKB = 500) => {
  try {
    // If the base64 string is already small enough, return as is
    const sizeInKB = (base64String.length * 0.75) / 1024; // Approximate size calculation
    if (sizeInKB <= maxSizeKB) {
      return base64String;
    }

    // For now, return the original string
    // In a production app, you might want to use a library like react-native-image-compression
    // or implement canvas-based compression
    console.log(`Image size: ${sizeInKB.toFixed(2)}KB (max: ${maxSizeKB}KB)`);
    return base64String;
  } catch (error) {
    console.error('Error compressing image:', error);
    return base64String; // Return original if compression fails
  }
};

// Check if URL is a cloud URL (not local file)
export const isCloudUrl = (url) => {
  return url && url.startsWith('http') && !url.startsWith('file://');
};

// Validate image URL
export const isValidImageUrl = (url) => {
  if (!url) return false;
  
  // Check if it's a valid URL
  try {
    new URL(url);
  } catch {
    return false;
  }
  
  // Check if it's not a local file
  return isCloudUrl(url);
}; 