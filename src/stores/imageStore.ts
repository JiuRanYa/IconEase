import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ImageItem } from '../types';
import { db } from '../services/db';

interface ImageState {
    images: ImageItem[];
    addImages: (newImages: ImageItem[]) => Promise<void>;
    deleteImage: (id: string) => Promise<void>;
    deleteAllImages: (onlyFavorites: boolean) => Promise<void>;
    toggleFavorite: (id: string) => void;
    getImagesByCategory: (categoryId: string) => ImageItem[];
    getFavoriteImages: () => ImageItem[];
    getImageUrl: (id: string) => Promise<string>;
}

export const useImageStore = create(
    persist<ImageState>(
        (set, get) => ({
            images: [],
            addImages: async (newImages) => {
                try {
                    await db.init();

                    await Promise.all(
                        newImages.map(async (image) => {
                            const response = await fetch(image.url);
                            const blob = await response.blob();
                            await db.saveImage(image.id, blob);
                        })
                    );

                    const imagesWithoutUrls = newImages.map(({ url, ...rest }) => ({
                        ...rest,
                        url: ''
                    }));

                    set((state) => ({
                        images: [...state.images, ...imagesWithoutUrls]
                    }));
                } catch (error) {
                    console.error('Failed to add images:', error);
                    throw error;
                }
            },
            deleteImage: async (id) => {
                try {
                    await db.init();
                    await db.deleteImage(id);
                    set((state) => ({
                        images: state.images.filter((img) => img.id !== id),
                    }));
                } catch (error) {
                    console.error('Failed to delete image:', error);
                    throw error;
                }
            },
            deleteAllImages: async (onlyFavorites) => {
                try {
                    await db.init();
                    const { images } = get();
                    const imagesToDelete = onlyFavorites
                        ? images.filter((img) => img.isFavorite)
                        : images;

                    await Promise.all(
                        imagesToDelete.map((img) => db.deleteImage(img.id))
                    );

                    set((state) => ({
                        images: onlyFavorites
                            ? state.images.filter((img) => !img.isFavorite)
                            : []
                    }));
                } catch (error) {
                    console.error('Failed to delete all images:', error);
                    throw error;
                }
            },
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
            getImageUrl: async (id) => {
                try {
                    await db.init();
                    const blob = await db.getImage(id);
                    if (!blob) throw new Error('Image not found');
                    return URL.createObjectURL(blob);
                } catch (error) {
                    console.error('Failed to get image URL:', error);
                    throw error;
                }
            },
        }),
        {
            name: 'image-storage',
            partialize: (state) => ({
                images: state.images.map(({ url, ...rest }) => rest)
            }),
        }
    )
); 