import { useState, useEffect, useMemo, useCallback } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { useCategoryStore } from "../stores/categoryStore";
import { CategoryStoreSubscriber } from "../stores/categoryStore";
import EmojiPicker, { EmojiClickData } from "emoji-picker-react";
import { PlusIcon, HeartIcon, ChevronLeftIcon, DeleteIcon } from '../components/icons';
import { cn } from '../utils/cn';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { useWorkspaceStore } from "../stores/workspaceStore";
import { Welcome } from '../pages/Welcome';
import { useTranslation } from "react-i18next";
import Header from "./header";

export default () => {
  const { currentWorkspace, workspaces } = useWorkspaceStore();
  const { categories, activeCategory, setActiveCategory, getCategoryCount, getFavoritesCount, addCategory, deleteCategory } = useCategoryStore();
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();

  // 所有 useState hooks
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState('💡');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 });
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [isDeleteCategoryModalOpen, setIsDeleteCategoryModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);

  // useEffect hooks
  useEffect(() => {
    const handleClickOutside = () => {
      setSelectedCategoryId(null);
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  // useMemo hooks
  const workspaceCategories = useMemo(() => {
    if (!currentWorkspace) return [];
    return categories.filter(category =>
      category.workspaceId === currentWorkspace.id
    );
  }, [categories, currentWorkspace]);

  // 所有事件处理函数
  const handleCategoryClick = useCallback((categoryId: string) => {
    setActiveCategory(categoryId);
    if (location.pathname !== '/home') {
      navigate('/home');
    }
  }, [location.pathname, navigate, setActiveCategory]);

  // 处理添加分类
  const handleAddCategory = () => {
    if (!newCategoryName.trim() || !currentWorkspace) return;

    const newCategory = {
      id: `category-${Date.now()}`,
      name: newCategoryName,
      icon: selectedEmoji,
      workspaceId: currentWorkspace.id
    };
    addCategory(newCategory);
    setNewCategoryName('');
    setSelectedEmoji('💡');
    setIsModalOpen(false);
  };

  // 处理 emoji 选择
  const onEmojiClick = (emojiData: EmojiClickData) => {
    setSelectedEmoji(emojiData.emoji);
    setShowEmojiPicker(false);
  };

  const handleContextMenu = (e: React.MouseEvent, categoryId: string) => {
    e.preventDefault();
    if (categoryId === 'all') return; // 禁止对 'all' 分类使用右键菜单

    setContextMenuPosition({ x: e.clientX, y: e.clientY });
    setSelectedCategoryId(categoryId);
  };

  const handleDeleteCategory = () => {
    if (selectedCategoryId) {
      setCategoryToDelete(selectedCategoryId);
      setIsDeleteCategoryModalOpen(true);
      setSelectedCategoryId(null); // 关闭右键菜单
    }
  };

  const handleConfirmDeleteCategory = () => {
    if (categoryToDelete) {
      deleteCategory(categoryToDelete);
      setCategoryToDelete(null);
      setIsDeleteCategoryModalOpen(false);
    }
  };

  // 如果没有工作区，显示欢迎页面
  if (workspaces.length === 0 || !currentWorkspace) {
    return <Welcome />;
  }

  // 渲染主界面
  return (
    <div className="h-screen w-full bg-base-100">

      <CategoryStoreSubscriber />

      <Header />

      <div className="flex h-full pt-16">
        {/* Sidebar */}
        <div className={cn(
          "fixed left-0 top-16 bottom-0 flex flex-col bg-base-100 border-r border-base-200 transition-all duration-500 ease-in-out",
          isSidebarCollapsed ? 'w-16' : 'w-64'
        )} style={{ zIndex: 100 }}>
          <div className="space-y-2 p-4 text-sm">
            {/* New Icons button */}
            <div className={cn(
              "flex items-center rounded-lg px-3 py-2 transition cursor-pointer hover:bg-base-200 relative",
              isSidebarCollapsed ? 'justify-center' : 'gap-2'
            )}>
              <div className="flex-shrink-0">
                <PlusIcon className="size-5 transition-all duration-500" />
              </div>
              <div className={cn(
                "flex-1 whitespace-nowrap transition-all duration-500 flex items-center justify-between overflow-hidden",
                isSidebarCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'
              )}>
                <span>New Icons</span>
                <span className="text-xs text-base-content/50">{getCategoryCount('all')}</span>
              </div>
            </div>

            {/* Favorites link */}
            <Link
              to="/favorites"
              className={cn(
                "flex items-center rounded-lg px-3 py-2 transition relative",
                location.pathname === '/favorites' ? 'bg-base-200' : 'hover:bg-base-200',
                isSidebarCollapsed ? 'justify-center' : 'gap-2'
              )}
            >
              <div className="flex-shrink-0">
                <HeartIcon className="size-5 transition-all duration-500" />
              </div>
              <div className={cn(
                "flex-1 whitespace-nowrap transition-all duration-500 flex items-center justify-between overflow-hidden",
                isSidebarCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'
              )}>
                <span>Favorites</span>
                <span className="text-xs text-base-content/50">{getFavoritesCount()}</span>
              </div>
            </Link>
          </div>

          {
            isSidebarCollapsed ?
              <div className="border-separate border border-gray-50 transition-all"></div>
              :
              <div className={cn(
                "mt-4 mb-4 px-7 transition-all duration-500",
                isSidebarCollapsed ? 'opacity-0 h-0 overflow-hidden' : 'opacity-100 h-auto'
              )}>
                <h2 className="text-sm font-semibold text-base-content/70">Category</h2>
              </div>
          }

          {/* Categories list */}
          <div className={cn("flex-1 space-y-1 overflow-y-auto p-4 text-sm")}>
            {workspaceCategories.map((category) => (
              <div
                key={category.id}
                onContextMenu={(e) => handleContextMenu(e, category.id)}
                className="relative"
              >
                <a
                  className={cn(
                    "flex items-center rounded-lg px-3 py-2 transition relative cursor-pointer",
                    activeCategory === category.id && location.pathname === '/home' ? 'bg-base-200' : 'hover:bg-base-200',
                    isSidebarCollapsed ? 'justify-center' : 'gap-2',
                  )}
                  onClick={() => handleCategoryClick(category.id)}
                  title={isSidebarCollapsed ? category.name : undefined}
                >
                  <div className="flex-shrink-0">
                    <span className="text-xs transition-all duration-500">
                      {category.icon}
                    </span>
                  </div>
                  <div className={cn(
                    "flex-1 whitespace-nowrap transition-all duration-500 flex items-center justify-between overflow-hidden",
                    isSidebarCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'
                  )}>
                    <span>{category.name}</span>
                    <span className="text-xs text-base-content/50">
                      {getCategoryCount(category.id)}
                    </span>
                  </div>
                </a>

                {/* Context Menu */}
                {selectedCategoryId === category.id && (
                  <div
                    className="fixed z-[100] min-w-[160px] bg-base-100 rounded-lg shadow-lg border border-base-300 p-1.5 overflow-hidden"
                    style={{
                      left: `${contextMenuPosition.x}px`,
                      top: `${contextMenuPosition.y}px`
                    }}
                  >
                    <button
                      className="w-full px-4 py-2 text-sm hover:bg-base-200 text-left flex items-center gap-2.5 transition-colors rounded-md"
                      onClick={handleDeleteCategory}
                    >
                      <DeleteIcon className="h-4 w-4" />
                      <span>删除分类及图片</span>
                    </button>
                  </div>
                )}
              </div>
            ))}

            {/* Add category button */}
            <button
              onClick={() => setIsModalOpen(true)}
              className={cn(
                "flex w-full items-center rounded-lg px-3 py-2 text-base-content/70 hover:bg-base-200 relative",
                isSidebarCollapsed ? 'justify-center' : 'gap-2'
              )}
              title={isSidebarCollapsed ? "Add Category" : undefined}
            >
              <div className="flex-shrink-0">
                <PlusIcon className="size-5 transition-all duration-500" />
              </div>
              <div className={cn(
                "whitespace-nowrap transition-all duration-500 overflow-hidden",
                isSidebarCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'
              )}>
                Add Category
              </div>
            </button>
          </div>

          {/* Collapse button */}
          <div className="p-4 px-2 border-t border-base-200">
            <button
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className={cn(
                "flex w-full items-center rounded-lg px-3 py-2 hover:bg-base-200 relative",
                isSidebarCollapsed ? 'justify-center' : 'gap-2'
              )}
              title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
              <div className="flex-shrink-0">
                <ChevronLeftIcon
                  className={cn(
                    "transition-all duration-500 size-4",
                    isSidebarCollapsed ? 'rotate-180' : ''
                  )}
                />
              </div>
              <div className={cn(
                "whitespace-nowrap transition-all duration-500 overflow-hidden text-sm",
                isSidebarCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'
              )}>
                Collapse Sidebar
              </div>
            </button>
          </div>
        </div>

        {/* Main content */}
        <div className={cn(
          "flex-1 overflow-y-auto p-4 transition-all duration-500",
          isSidebarCollapsed ? 'ml-20' : 'ml-64'
        )}>
          <Outlet />
        </div>
      </div>

      {/* Modal */}
      <dialog className={cn('modal', isModalOpen && 'modal-open')}>
        <div className="modal-box">
          <h3 className="text-lg font-bold">Add New Category</h3>

          <div className="py-4">
            <div className="relative flex items-center gap-2">
              <div className="relative">
                <button
                  className="btn btn-square btn-sm border"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                >
                  <span className="text-sm">{selectedEmoji}</span>
                </button>
                <div className={cn("absolute left-0 top-full mt-2 z-50", showEmojiPicker ? 'visible' : 'hidden')}>
                  <EmojiPicker
                    onEmojiClick={onEmojiClick}
                    autoFocusSearch={false}
                    width={300}
                    height={400}
                  />
                </div>
              </div>

              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Category Name"
                  className="input input-bordered w-full input-sm"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
                />
              </div>
            </div>
          </div>

          <div className="modal-action">
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => {
                setIsModalOpen(false);
                setShowEmojiPicker(false);
              }}
            >
              Cancel
            </button>
            <button
              className={cn(
                "btn btn-primary btn-sm",
                !newCategoryName.trim() && "btn-disabled"
              )}
              onClick={handleAddCategory}
            >
              Add
            </button>
          </div>
        </div>

        <form
          method="dialog"
          className="modal-backdrop"
          onClick={() => {
            setIsModalOpen(false);
            setShowEmojiPicker(false);
          }}
        >
          <button>close</button>
        </form>
      </dialog>

      <ConfirmDialog
        isOpen={isDeleteCategoryModalOpen}
        title={t('category.delete.title')}
        content={t('category.delete.content')}
        onConfirm={handleConfirmDeleteCategory}
        onCancel={() => {
          setIsDeleteCategoryModalOpen(false);
          setCategoryToDelete(null);
        }}
        confirmText={t('common.delete')}
        cancelText={t('common.cancel')}
        type="error"
      />

    </div>
  );
};
