const cloudinary = require('cloudinary').v2;
const cloudinaryConfig = require('./cloudinary-config');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || cloudinaryConfig.cloud_name,
  api_key: process.env.CLOUDINARY_API_KEY || cloudinaryConfig.api_key,
  api_secret: process.env.CLOUDINARY_API_SECRET || cloudinaryConfig.api_secret,
});

// Function to upload image to Cloudinary
const uploadImage = async (imageBase64, folder = 'dating-app') => {
  try {
    // Remove data:image/jpeg;base64, prefix if present
    const base64Data = imageBase64.replace(/^data:image\/[a-z]+;base64,/, '');
    
    const result = await cloudinary.uploader.upload(
      `data:image/jpeg;base64,${base64Data}`,
      {
        folder: folder,
        resource_type: 'image',
        transformation: [
          { width: 800, height: 800, crop: 'fill', quality: 'auto' },
          { fetch_format: 'auto' }
        ]
      }
    );
    
    return {
      url: result.secure_url,
      public_id: result.public_id
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw new Error('Failed to upload image to cloud');
  }
};

// Function to delete image from Cloudinary
const deleteImage = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    throw new Error('Failed to delete image from cloud');
  }
};

module.exports = {
  uploadImage,
  deleteImage,
  cloudinary
}; 