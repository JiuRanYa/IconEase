import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Workspace } from '../types';
import { useImageStore } from './imageStore';
import { useCategoryStore } from './categoryStore';
import { message } from '../components/Message/MessageContainer';

interface WorkspaceState {
    workspaces: Workspace[];
    currentWorkspace: Workspace | null;
    addWorkspace: (name: string) => void;
    switchWorkspace: (id: string) => void;
    deleteWorkspace: (id: string) => void;
    updateWorkspace: (id: string, name: string) => void;
}

export const useWorkspaceStore = create<WorkspaceState>()(
    persist(
        (set, get) => ({
            workspaces: [],
            currentWorkspace: null,

            addWorkspace: (name) => {
                const newWorkspace = {
                    id: `workspace-${Date.now()}`,
                    name,
                    createdAt: Date.now(),
                };
                set(state => ({
                    workspaces: [...state.workspaces, newWorkspace],
                    currentWorkspace: newWorkspace,
                }));
                // 为新工作区设置默认分类
                useCategoryStore.setState({ activeCategory: 'all' });
            },

            switchWorkspace: async (id) => {
                const workspace = get().workspaces.find(w => w.id === id);
                if (workspace && workspace.id !== get().currentWorkspace?.id) {
                    set({ currentWorkspace: workspace });
                    // 切换工作区时重置分类选择，但不触发额外的更新
                    useCategoryStore.setState({ activeCategory: 'all' });
                }
            },

            deleteWorkspace: (id) => {
                const { workspaces, currentWorkspace } = get();
                if (workspaces.length <= 1) {
                    message.error('至少保留一个工作区');
                    return;
                }

                // 删除该工作区的所有图片和分类
                const imageStore = useImageStore.getState();
                const categoryStore = useCategoryStore.getState();

                // 删除图片
                const imagesToDelete = imageStore.images.filter(img => img.workspaceId === id);
                imageStore.deleteImages(imagesToDelete.map(img => img.id));

                // 删除分类
                categoryStore.deleteWorkspaceCategories(id);

                set(state => ({
                    workspaces: state.workspaces.filter(w => w.id !== id),
                    currentWorkspace: id === currentWorkspace?.id
                        ? state.workspaces.find(w => w.id !== id)!
                        : currentWorkspace,
                }));
            },

            updateWorkspace: (id, name) => {
                set(state => ({
                    workspaces: state.workspaces.map(w =>
                        w.id === id ? { ...w, name } : w
                    ),
                    currentWorkspace: state.currentWorkspace?.id === id
                        ? { ...state.currentWorkspace, name }
                        : state.currentWorkspace,
                }));
            },
        }),
        {
            name: 'workspace-storage',
        }
    )
); 