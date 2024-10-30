import { create } from 'zustand';
import { ImageItem } from '../types';

interface ImageState {
    images: ImageItem[];
    addImages: (newImages: ImageItem[]) => void;
    deleteImage: (id: string) => void;
    getImagesByCategory: (categoryId: string) => ImageItem[];
}

export const useImageStore = create<ImageState>((set, get) => ({
    images: [],
    addImages: (newImages) =>
        set((state) => ({ images: [...state.images, ...newImages] })),
    deleteImage: (id) =>
        set((state) => ({
            images: state.images.filter((img) => img.id !== id),
        })),
    getImagesByCategory: (categoryId) => {
        const { images } = get();
        return categoryId === 'all'
            ? images
            : images.filter((img) => img.categoryId === categoryId);
    },
})); 