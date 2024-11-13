import i18next from 'i18next';
import { create } from 'zustand';

import { message } from '../components/Message/MessageContainer';
import { ImageItem } from '../types';
import { db } from '../utils/db';

import { useCategoryStore } from './categoryStore';
import { useWorkspaceStore } from './workspaceStore';

interface ImageState {
  images: ImageItem[];
  addImages: (newImages: ImageItem[]) => Promise<void>;
  deleteImage: (id: string) => Promise<void>;
  deleteAllImages: (onlyFavorites: boolean) => Promise<void>;
  toggleFavorite: (id: string) => Promise<void>;
  getImagesByCategory: (categoryId: string) => ImageItem[];
  getFavoriteImages: () => ImageItem[];
  initImages: () => Promise<void>;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  getFilteredImages: (categoryId: string) => ImageItem[];
  isLoading: boolean;
  setLoading: (loading: boolean) => void;
  isDuplicate: (newImage: ImageItem) => boolean;
  deleteImages: (ids: string[]) => Promise<void>;
  deleteWorkspaceImages: (workspaceId: string) => void;
}

export const useImageStore = create<ImageState>((set, get) => ({
  images: [],
  searchQuery: '',
  isLoading: false,

  initImages: async () => {
    try {
      set({ isLoading: true });
      await db.init();
      const storedImages = await db.getAll('images');

      const images = storedImages.map(img => ({
        ...img,
        url: URL.createObjectURL(new Blob([img.binaryData], { type: img.type })),
      }));

      set({ images });
      useCategoryStore.getState().updateCounts();
    } catch (error) {
      message.error(i18next.t('common.error.init', { error }));
    } finally {
      set({ isLoading: false });
    }
  },

  addImages: async (newImages) => {
    try {
      set({ isLoading: true });
      const currentWorkspaceId = useWorkspaceStore.getState().currentWorkspace?.id;
      if (!currentWorkspaceId) {
        message.error(i18next.t('common.error.noWorkspace'));
        return;
      }

      let skippedCount = 0;
      const uniqueImages = [];

      for (const img of newImages) {
        if (!get().isDuplicate(img)) {
          uniqueImages.push(img);
        } else {
          skippedCount++;
        }
      }

      const processedImages = await Promise.all(
        uniqueImages.map(async img => {
          const response = await fetch(img.url);
          const blob = await response.blob();
          const binaryData = await blob.arrayBuffer();

          return {
            ...img,
            type: blob.type,
            binaryData,
            url: URL.createObjectURL(blob),
            workspaceId: currentWorkspaceId,
            isFavorite: false,
            createdAt: Date.now(),
          } as ImageItem;
        }),
      );

      if (processedImages.length > 0) {
        await db.putAll('images', processedImages);
        set((state) => ({
          images: [...state.images, ...processedImages],
        }));

        // 显示添加成功信息
        if (skippedCount > 0) {
          message.success(i18next.t('main.upload.success', { count: processedImages.length }));
        } else {
          message.success(i18next.t('main.upload.success', { count: processedImages.length }));
        }
      } else if (skippedCount > 0) {
        message.warning(i18next.t('main.upload.allDuplicate', { count: skippedCount }));
      }
    } catch (error) {
      message.error(i18next.t('common.error.add', { error }));
    } finally {
      set({ isLoading: false });
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
      img.id === id ? { ...img, isFavorite: !img.isFavorite } : img,
    );
    await db.putAll('images', newImages);
    set({ images: newImages });
  },

  getImagesByCategory: (categoryId: string) => {
    const { images } = get();
    const workspaceId = useWorkspaceStore.getState().currentWorkspace?.id;
    if (!workspaceId) return [];

    const workspaceImages = images.filter(img => img.workspaceId === workspaceId);

    return categoryId === 'all'
      ? workspaceImages
      : workspaceImages.filter((img) => img.categoryId === categoryId);
  },

  getFavoriteImages: () => {
    const { images } = get();
    const workspaceId = useWorkspaceStore.getState().currentWorkspace?.id;
    if (!workspaceId) return [];

    return images.filter(img =>
      img.workspaceId === workspaceId && img.isFavorite,
    );
  },

  setSearchQuery: (query) => {
    set({ searchQuery: query });
  },

  getFilteredImages: (categoryId: string) => {
    const { images, searchQuery } = get();
    const workspaceId = useWorkspaceStore.getState().currentWorkspace?.id;
    if (!workspaceId) return [];

    // 首先过滤当前工作区的图片
    let filteredImages = images.filter(img => img.workspaceId === workspaceId);

    // 再按分类过滤
    if (categoryId !== 'all') {
      filteredImages = filteredImages.filter(img => img.categoryId === categoryId);
    }

    // 最后按搜索关键词过滤
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filteredImages = filteredImages.filter(img =>
        img.fileName.toLowerCase().includes(query),
      );
    }

    return filteredImages;
  },

  setLoading: (loading) => set({ isLoading: loading }),

  isDuplicate: (newImage: ImageItem) => {
    const { images } = get();
    const currentWorkspaceId = useWorkspaceStore.getState().currentWorkspace?.id;

    // 只检查当前工作区的图片
    const workspaceImages = images.filter(img =>
      img.workspaceId === currentWorkspaceId,
    );

    // 检查文件名是否在当前工作区重复
    const hasSameFileName = workspaceImages.some(img =>
      img.fileName === newImage.fileName,
    );

    return hasSameFileName;
  },

  deleteImages: async (ids: string[]) => {
    try {
      // 批量删除数据库记录
      await Promise.all(ids.map(id => db.delete('images', id)));

      // 更新状态
      set((state) => ({
        images: state.images.filter((img) => !ids.includes(img.id)),
      }));

      return Promise.resolve();
    } catch (error) {
      message.error(i18next.t('common.error.delete', { error }));
      return Promise.reject(error);
    }
  },

  deleteWorkspaceImages: (workspaceId: string) => {
    set(state => ({
      images: state.images.filter(img => img.workspaceId !== workspaceId),
    }));
  },
})); 
