import { create } from 'zustand';
import { Category } from '../types';

interface CategoryState {
    categories: Category[];
    activeCategory: string;
    setActiveCategory: (id: string) => void;
    addCategory: (category: Category) => void;
    updateCategoryCount: (id: string, count: number) => void;
}

export const useCategoryStore = create<CategoryState>((set) => ({
    categories: [
        { id: 'all', name: 'All', icon: 'list', count: 0 },
        { id: 'food', name: 'Food', icon: '🍎', count: 0 },
    ],
    activeCategory: 'all',
    setActiveCategory: (id) => set({ activeCategory: id }),
    addCategory: (category) =>
        set((state) => ({ categories: [...state.categories, category] })),
    updateCategoryCount: (id, count) =>
        set((state) => ({
            categories: state.categories.map((cat) =>
                cat.id === id ? { ...cat, count } : cat
            ),
        })),
})); 
