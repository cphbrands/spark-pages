import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
  listAll,
} from 'firebase/storage';
import { storage, auth } from './config';
import { v4 as uuidv4 } from 'uuid';

// Upload an image and return the download URL
export async function uploadImage(
  file: File,
  folder: string = 'images'
): Promise<{ url: string | null; error: string | null }> {
  try {
    const userId = auth.currentUser?.uid;
    if (!userId) {
      return { url: null, error: 'Not authenticated' };
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return { url: null, error: 'File must be an image' };
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return { url: null, error: 'Image must be less than 5MB' };
    }

    // Generate unique filename
    const ext = file.name.split('.').pop() || 'jpg';
    const filename = `${uuidv4()}.${ext}`;
    const path = `${userId}/${folder}/${filename}`;

    // Upload file
    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, file);

    // Get download URL
    const url = await getDownloadURL(storageRef);
    return { url, error: null };
  } catch (error: any) {
    console.error('Upload error:', error);
    return { url: null, error: 'Failed to upload image' };
  }
}

// Upload a base64 image and return the download URL
export async function uploadBase64Image(
  base64Data: string,
  folder: string = 'images'
): Promise<{ url: string | null; error: string | null }> {
  try {
    const userId = auth.currentUser?.uid;
    if (!userId) {
      return { url: null, error: 'Not authenticated' };
    }

    // Convert base64 to blob
    const response = await fetch(base64Data);
    const blob = await response.blob();

    // Generate unique filename
    const ext = blob.type.split('/')[1] || 'jpg';
    const filename = `${uuidv4()}.${ext}`;
    const path = `${userId}/${folder}/${filename}`;

    // Upload file
    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, blob);

    // Get download URL
    const url = await getDownloadURL(storageRef);
    return { url, error: null };
  } catch (error: any) {
    console.error('Upload error:', error);
    return { url: null, error: 'Failed to upload image' };
  }
}

// Delete an image by URL
export async function deleteImage(
  imageUrl: string
): Promise<{ success: boolean; error: string | null }> {
  try {
    // Extract the path from the URL
    const storageRef = ref(storage, imageUrl);
    await deleteObject(storageRef);
    return { success: true, error: null };
  } catch (error: any) {
    console.error('Delete error:', error);
    return { success: false, error: 'Failed to delete image' };
  }
}

// List all images in a folder
export async function listImages(
  folder: string = 'images'
): Promise<{ urls: string[]; error: string | null }> {
  try {
    const userId = auth.currentUser?.uid;
    if (!userId) {
      return { urls: [], error: 'Not authenticated' };
    }

    const folderRef = ref(storage, `${userId}/${folder}`);
    const result = await listAll(folderRef);

    const urls = await Promise.all(
      result.items.map((item) => getDownloadURL(item))
    );

    return { urls, error: null };
  } catch (error: any) {
    console.error('List error:', error);
    return { urls: [], error: 'Failed to list images' };
  }
}
