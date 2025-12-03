import axios from 'axios';

const AI_API_URL = import.meta.env.VITE_AI_API_URL || 'http://localhost:4000/api';

const aiApi = axios.create({
  baseURL: AI_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface PhotoMetadata {
  event_name: string;
  location: string;
  photographer: string;
  event_date: string;
  photographer_name: string;
  date: string;
}

export interface UploadPhotoData {
  image: string;
  filename: string;
  metadata: PhotoMetadata;
}

export interface FaceData {
  box: number[];
  confidence: number;
  embedding_id: string;
}

export interface Photo {
  photo_id: string;
  filename: string;
  faces_count: number;
  metadata: PhotoMetadata;
  uploaded_at: string;
  in_dropbox: boolean;
  distance?: number;
  cosine_similarity?: number;
}

export interface UploadResponse {
  success: boolean;
  photo_id?: string;
  faces_detected?: number;
  dropbox_uploaded?: boolean;
  compressed?: boolean;
  error?: string;
}

export interface PhotosResponse {
  success: boolean;
  photos: Photo[];
  error?: string;
}

export interface FaceEmbeddingResponse {
  success: boolean;
  embedding?: number[];
  error?: string;
}

export const aiService = {
  async uploadPhoto(data: UploadPhotoData): Promise<UploadResponse> {
    const response = await aiApi.post('/photographer/upload', data);
    return response.data;
  },

  async getPhotographerPhotos(): Promise<PhotosResponse> {
    const response = await aiApi.get('/photographer/photos');
    return response.data;
  },

  async deletePhoto(photoId: string): Promise<{ success: boolean; error?: string }> {
    const response = await aiApi.delete(`/photographer/delete/${photoId}`);
    return response.data;
  },

  async registerFace(image: string): Promise<FaceEmbeddingResponse> {
    const response = await aiApi.post('/user/register_face', { image });
    return response.data;
  },

  async findMyPhotos(embedding: number[]): Promise<PhotosResponse> {
    const response = await aiApi.post('/user/my_photos', { embedding });
    return response.data;
  },

  getPreviewUrl(photoId: string): string {
    return `${AI_API_URL}/image/preview/${photoId}`;
  },

  getDownloadUrl(photoId: string): string {
    return `${AI_API_URL}/download/dropbox/${photoId}`;
  },

  async healthCheck(): Promise<any> {
    const response = await aiApi.get('/health');
    return response.data;
  },
};
