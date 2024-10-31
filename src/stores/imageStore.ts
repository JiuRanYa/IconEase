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
        try {
            await db.init();
            const storedImages = await db.getAll('images');

            // 为每个存储的图片数据创建新的 Blob URL
            const images = storedImages.map(img => ({
                ...img,
                url: URL.createObjectURL(new Blob([img.binaryData], { type: img.type }))
            }));

            set({ images });
        } catch (error) {
            console.error('初始化图片失败:', error);
        }
    },

    addImages: async (newImages) => {
        try {
            const processedImages = await Promise.all(
                newImages.map(async img => {
                    // 获取图片的二进制数据
                    const response = await fetch(img.url);
                    const blob = await response.blob();
                    const binaryData = await blob.arrayBuffer();

                    return {
                        ...img,
                        type: blob.type,
                        binaryData, // 存储二进制数据
                        url: URL.createObjectURL(blob)
                    };
                })
            );

            await db.putAll('images', processedImages);
            set((state) => ({ images: [...state.images, ...processedImages] }));
        } catch (error) {
            console.error('添加图片失败:', error);
        }
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
