import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Category } from '../types';
import { useImageStore } from './imageStore';
import { useEffect } from 'react';

interface CategoryState {
    categories: Category[];
    activeCategory: string;
    setActiveCategory: (id: string) => void;
    addCategory: (category: Category) => void;
    getCategoryCount: (categoryId: string) => number;
    getFavoritesCount: () => number;
    updateCounts: () => void;
    clearCategories: () => void;
    deleteCategory: (categoryId: string) => void;
}

export const useCategoryStore = create(
    persist<CategoryState>(
        (set) => ({
            categories: [
                { id: 'all', name: 'All', icon: '📋' },
            ],
            activeCategory: 'all',
            setActiveCategory: (id) => set({ activeCategory: id }),
            addCategory: (category) =>
                set((state) => ({ categories: [...state.categories, category] })),
            getCategoryCount: (categoryId) => {
                const images = useImageStore.getState().images;
                return categoryId === 'all'
                    ? images.length
                    : images.filter(img => img.categoryId === categoryId).length;
            },
            getFavoritesCount: () => {
                const images = useImageStore.getState().images;
                return images.filter(img => img.isFavorite).length;
            },
            updateCounts: () => {
                set((state) => ({ ...state }));
            },
            clearCategories: () => set(() => ({
                categories: [{ id: 'all', name: 'All', icon: '📋' }],
                activeCategory: 'all'
            })),
            deleteCategory: (categoryId: string) => {
                if (categoryId === 'all') return;

                set((state) => ({
                    categories: state.categories.filter(c => c.id !== categoryId),
                    activeCategory: state.activeCategory === categoryId ? 'all' : state.activeCategory
                }));

                const images = useImageStore.getState().images;
                const imageIds = images
                    .filter(img => img.categoryId === categoryId)
                    .map(img => img.id);
                useImageStore.getState().deleteImages(imageIds);
            },
        }),
        {
            name: 'category-storage',
        }
    )
);

// CategoryStoreSubscriber 保持不变
export const CategoryStoreSubscriber = () => {
    const updateCounts = useCategoryStore((state) => state.updateCounts);

    useEffect(() => {
        const unsubscribe = useImageStore.subscribe(() => {
            updateCounts();
        });

        return () => {
            unsubscribe();
        };
    }, [updateCounts]);

    return null;
};
