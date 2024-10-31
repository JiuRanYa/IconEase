import { create } from 'zustand';
import { ImageItem } from '../types';
import { db } from '../utils/db';

interface ImageState {
    images: ImageItem[];
    addImages: (newImages: ImageItem[]) => Promise<void>;
    deleteImage: (id: string) => Promise<void>;
    deleteAllImages: (onlyFavorites: boolean) => Promise<void>;
    toggleFavorite: (id: string) => Promise<void>;
    getImagesByCategory: (categoryId: string) => ImageItem[];
    getFavoriteImages: () => ImageItem[];
    initImages: () => Promise<void>;
}

export const useImageStore = create<ImageState>((set, get) => ({
    images: [],

    initImages: async () => {
        await db.init();
        const images = await db.getAll('images');
        set({ images });
    },

    addImages: async (newImages) => {
        await db.putAll('images', newImages);
        set((state) => ({ images: [...state.images, ...newImages] }));
    },

    deleteImage: async (id) => {
        await db.delete('images', id);
        set((state) => ({
            images: state.images.filter((img) => img.id !== id),
        }));
    },

    deleteAllImages: async (onlyFavorites) => {
        if (onlyFavorites) {
            const nonFavorites = get().images.filter(img => !img.isFavorite);
            await db.clear('images');
            await db.putAll('images', nonFavorites);
            set({ images: nonFavorites });
        } else {
            await db.clear('images');
            set({ images: [] });
        }
    },

    toggleFavorite: async (id) => {
        const newImages = get().images.map((img) =>
            img.id === id ? { ...img, isFavorite: !img.isFavorite } : img
        );
        await db.putAll('images', newImages);
        set({ images: newImages });
    },

    getImagesByCategory: (categoryId) => {
        const { images } = get();
        return categoryId === 'all'
            ? images
            : images.filter((img) => img.categoryId === categoryId);
    },

    getFavoriteImages: () => {
        const { images } = get();
        return images.filter((img) => img.isFavorite);
    },
})); 