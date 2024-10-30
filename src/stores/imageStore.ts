import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ImageItem } from '../types';

interface ImageState {
    images: ImageItem[];
    addImages: (newImages: ImageItem[]) => void;
    deleteImage: (id: string) => void;
    deleteAllImages: (onlyFavorites: boolean) => void;
    toggleFavorite: (id: string) => void;
    getImagesByCategory: (categoryId: string) => ImageItem[];
    getFavoriteImages: () => ImageItem[];
}

export const useImageStore = create(
    persist<ImageState>(
        (set, get) => ({
            images: [],
            addImages: (newImages) =>
                set((state) => ({ images: [...state.images, ...newImages] })),
            deleteImage: (id) =>
                set((state) => ({
                    images: state.images.filter((img) => img.id !== id),
                })),
            deleteAllImages: (onlyFavorites) =>
                set((state) => ({
                    images: onlyFavorites
                        ? state.images.filter((img) => !img.isFavorite)
                        : []
                })),
            toggleFavorite: (id) =>
                set((state) => ({
                    images: state.images.map((img) =>
                        img.id === id ? { ...img, isFavorite: !img.isFavorite } : img
                    ),
                })),
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
        }),
        {
            name: 'image-storage',
        }
    )
); 