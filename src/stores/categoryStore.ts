import { create } from 'zustand';
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
}

export const useCategoryStore = create<CategoryState>((set, get) => ({
    categories: [
        { id: 'all', name: 'All', icon: 'list' },
        { id: 'food', name: 'Food', icon: '🍎' },
        { id: 'device', name: 'Device', icon: '💻' },
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
        // 强制更新状态以触发重新渲染
        set((state) => ({ ...state }));
    },
}));

// 创建一个订阅组件
export const CategoryStoreSubscriber = () => {
    const updateCounts = useCategoryStore((state) => state.updateCounts);

    useEffect(() => {
        // 订阅 imageStore 的变化
        const unsubscribe = useImageStore.subscribe(() => {
            updateCounts();
        });

        return () => {
            unsubscribe();
        };
    }, [updateCounts]);

    return null;
};
