// Client-side upload function for Cloudinary
export const uploadMedia = async (file: File): Promise<string> => {
  try {
    const cloudName = 'dzm72kpyf';
    const uploadPreset = 'PinPointr'; // Using the exact preset name from your Cloudinary account

    console.log('Starting media upload...', { cloudName, uploadPreset, fileType: file.type });

    // Determine resource type (image or video)
    const resourceType = file.type.startsWith('video/') ? 'video' : 'image';

    // Create FormData
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);

    console.log(`Attempting upload to Cloudinary as ${resourceType}...`);

    // Upload to Cloudinary using unsigned upload
    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`, {
      method: 'POST',
      body: formData
    });

    console.log('Upload response status:', response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      console.error('Upload failed:', errorData);
      throw new Error(`Upload failed: ${response.status} ${response.statusText} - ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    console.log('Upload successful:', data.secure_url);
    return data.secure_url;
  } catch (error) {
    console.error('Error in uploadMedia:', error);
    throw error;
  }
};

// Keep the original function for backward compatibility
export const uploadImage = uploadMedia; 