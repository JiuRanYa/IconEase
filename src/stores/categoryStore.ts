import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Category } from '../types';
import { useImageStore } from './imageStore';
import { useEffect } from 'react';
import { useWorkspaceStore } from './workspaceStore';
import { message } from '../components/Message/MessageContainer';

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
  deleteWorkspaceCategories: (workspaceId: string) => void;
  getWorkspaceCategories: () => Category[];
}

export const useCategoryStore = create(
  persist<CategoryState>(
    (set, get) => ({
      categories: [],
      activeCategory: 'all',
      setActiveCategory: (id) => set({ activeCategory: id }),
      addCategory: (category) => {
        const existingCategories = get().categories.filter(c =>
          c.workspaceId === category.workspaceId
        );

        if (category.id === 'all') {
          const hasAll = existingCategories.some(c => c.id === 'all');
          if (hasAll) return;
        } else {
          const isDuplicate = existingCategories.some(c =>
            c.name.toLowerCase() === category.name.toLowerCase() &&
            c.id !== 'all'
          );
          if (isDuplicate) {
            message.error(`分类 "${category.name}" 已存在`);
            return;
          }
        }

        set((state) => ({
          categories: [...state.categories, category]
        }));
      },
      getCategoryCount: (categoryId) => {
        const images = useImageStore.getState().images;
        const workspaceId = useWorkspaceStore.getState().currentWorkspace.id;
        const workspaceImages = images.filter(img => img.workspaceId === workspaceId);

        return categoryId === 'all'
          ? workspaceImages.length
          : workspaceImages.filter(img => img.categoryId === categoryId).length;
      },
      getFavoritesCount: () => {
        const images = useImageStore.getState().images;
        return images.filter(img => img.isFavorite).length;
      },
      updateCounts: () => {
        set((state) => ({ ...state }));
      },
      clearCategories: () => {
        const workspaceId = useWorkspaceStore.getState().currentWorkspace.id;
        set((state) => ({
          categories: state.categories.filter(c =>
            c.id === 'all' || c.workspaceId !== workspaceId
          ),
          activeCategory: 'all'
        }));
      },
      deleteCategory: (categoryId: string) => {
        if (categoryId === 'all') return;

        const workspaceId = useWorkspaceStore.getState().currentWorkspace.id;

        set((state) => ({
          categories: state.categories.filter(c =>
            c.id !== categoryId &&
            (c.id === 'all' || c.workspaceId === workspaceId)
          ),
          activeCategory: state.activeCategory === categoryId ? 'all' : state.activeCategory
        }));

        const images = useImageStore.getState().images;
        const imageIds = images
          .filter(img =>
            img.categoryId === categoryId &&
            img.workspaceId === workspaceId
          )
          .map(img => img.id);
        useImageStore.getState().deleteImages(imageIds);
      },
      deleteWorkspaceCategories: (workspaceId: string) => {
        set(state => ({
          categories: state.categories.filter(c => c.workspaceId !== workspaceId),
          activeCategory: 'all'
        }));
      },
      getWorkspaceCategories: () => {
        const { categories } = get();
        const workspaceId = useWorkspaceStore.getState().currentWorkspace?.id;
        if (!workspaceId) return [];

        const workspaceCategories = categories.filter(c =>
          c.workspaceId === workspaceId
        );

        const hasAll = workspaceCategories.some(c => c.id === 'all');
        if (!hasAll) {
          const defaultCategory = {
            id: 'all',
            name: 'All',
            icon: '📋',
            workspaceId,
            createdAt: Date.now(),
          };

          set(state => ({
            categories: [...state.categories, defaultCategory]
          }));

          return [defaultCategory, ...workspaceCategories];
        }

        return workspaceCategories;
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
