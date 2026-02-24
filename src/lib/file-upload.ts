import { v4 as uuidv4 } from 'uuid';

type UploadResponse = {
  success: boolean;
  url?: string;
  error?: string;
};

export async function uploadFile(file: File): Promise<UploadResponse> {
  try {
    // For local development, we'll use a simple file reader to get a data URL
    // In production, replace this with your actual file upload logic (e.g., to S3, Cloudinary, etc.)
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        // In a real app, you would upload the file to your storage service here
        // and return the public URL
        const fakeUrl = `https://example.com/uploads/${uuidv4()}-${file.name}`;
        resolve({
          success: true,
          url: fakeUrl
        });
      };
      reader.onerror = () => {
        resolve({
          success: false,
          error: 'Failed to read file'
        });
      };
      reader.readAsDataURL(file);
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to upload file'
    };
  }
}

export function validateFile(file: File): { valid: boolean; error?: string } {
  // 5MB max file size
  const MAX_FILE_SIZE = 5 * 1024 * 1024;
  const ALLOWED_TYPES = [
    'image/jpeg',
    'image/png',
    'image/jpg',
    'application/pdf',
    'image/webp'
  ];

  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: 'File size must be less than 5MB' };
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: 'Only JPG, PNG, PDF, and WebP files are allowed'
    };
  }

  return { valid: true };
}
