import { useState, useEffect } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { useCategoryStore } from "../stores/categoryStore";
import { CategoryStoreSubscriber } from "../stores/categoryStore";
import { useImageStore } from "../stores/imageStore";
import EmojiPicker, { EmojiClickData } from "emoji-picker-react";
import { PlusIcon, HeartIcon, SearchIcon, ChevronLeftIcon, HamburgerIcon, DeleteIcon } from '../components/icons';
import { cn } from '../utils/cn';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { useWorkspaceStore } from "../stores/workspaceStore";
import { NewWorkspaceModal } from '../components/workspace/NewWorkspaceModal';
import { LoadingOverlay } from '../components/LoadingOverlay';
import { WorkspaceManager } from "../components/workspace/WorkspaceManager";
import { EditWorkspaceModal } from "../components/workspace/EditWorkspaceModal";

export default () => {
  const { categories, activeCategory, setActiveCategory, getCategoryCount, getFavoritesCount, addCategory, deleteCategory } = useCategoryStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState('💡');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const { searchQuery, setSearchQuery } = useImageStore();
  const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 });
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [isDeleteCategoryModalOpen, setIsDeleteCategoryModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);
  const {
    switchWorkspace,
    addWorkspace,
    deleteWorkspace,
    updateWorkspace
  } = useWorkspaceStore();
  const [showWorkspaceModal, setShowWorkspaceModal] = useState(false);
  const [showEditWorkspaceModal, setShowEditWorkspaceModal] = useState(false);
  const [workspaceToEdit, setWorkspaceToEdit] = useState<Workspace | null>(null);
  const [showDeleteWorkspaceConfirm, setShowDeleteWorkspaceConfirm] = useState(false);
  const [workspaceToDelete, setWorkspaceToDelete] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // 处理分类点击
  const handleCategoryClick = (categoryId: string) => {
    setActiveCategory(categoryId);
    if (location.pathname !== '/home') {
      navigate('/home');
    }
  };

  // 处理添加分类
  const handleAddCategory = () => {
    if (!newCategoryName.trim()) return;

    const newCategory = {
      id: `category-${Date.now()}`,
      name: newCategoryName,
      icon: selectedEmoji
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

  const handleClearAll = () => {
    const isFavoritePage = location.pathname === '/favorites';
    useImageStore.getState().deleteAllImages(isFavoritePage);
    useCategoryStore.getState().clearCategories();

    // 如果在分类页面，重定向到首页
    if (location.pathname !== '/home' && location.pathname !== '/favorites') {
      navigate('/home');
    }
    setIsConfirmModalOpen(false);
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

  useEffect(() => {
    const handleClickOutside = () => {
      setSelectedCategoryId(null);
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  // 重写工作区切换方法以添加加载状态
  const handleWorkspaceSwitch = async (workspaceId: string) => {
    setIsLoading(true);
    try {
      await switchWorkspace(workspaceId);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen w-full bg-base-100">
      <LoadingOverlay isLoading={isLoading} />

      <CategoryStoreSubscriber />

      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-10 flex h-16 items-center border-b border-base-300 bg-base-100 px-10 justify-between">
        {/* Logo */}
        <div className="flex items-center gap-4">
          <span className="text-xl font-bold">IconEase</span>

          {/* 工作区选择器 */}
          <WorkspaceManager onSwitch={handleWorkspaceSwitch} />

          <span className="rounded bg-primary px-2 py-0.5 text-xs text-white">Beta</span>
        </div>

        {/* Search */}
        <div className="relative max-w-xl flex-1 px-8">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Search icon in current category`}
            className="input input-bordered w-full pl-10 input-sm"
          />
          <SearchIcon className="absolute left-11 top-1/2 h-5 w-5 -translate-y-1/2 text-base-content/50" />
        </div>

        {/* Menu Button */}
        <div className="dropdown dropdown-end">
          <div role="button" tabIndex={0}>
            <HamburgerIcon className="h-5 w-5 swap-off fill-current" />
          </div>
          <ul className={cn(
            "menu dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52",
          )} tabIndex={0}>
            <li>
              <a onClick={() => {
                setIsConfirmModalOpen(true);
              }}>
                Reset
              </a>
            </li>
            <li><a>Export Config</a></li>
          </ul>
        </div>
      </div>

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
            {categories.map((category) => (
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

      {/* Confirm Clear Modal */}
      <dialog className={cn('modal', isConfirmModalOpen && 'modal-open')}>
        <div className="modal-box">
          <h3 className="text-lg font-bold text-error">Clear All Data</h3>
          <p className="py-4">
            This will delete all images and categories. This action cannot be undone. Are you sure you want to proceed?
          </p>
          <div className="modal-action">
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => setIsConfirmModalOpen(false)}
            >
              Cancel
            </button>
            <button
              className="btn btn-error btn-sm"
              onClick={handleClearAll}
            >
              Clear All
            </button>
          </div>
        </div>
        <form
          method="dialog"
          className="modal-backdrop"
          onClick={() => setIsConfirmModalOpen(false)}
        >
          <button>close</button>
        </form>
      </dialog>

      <ConfirmDialog
        isOpen={isDeleteCategoryModalOpen}
        title="Delete Category"
        content={`Are you sure you want to delete this category and all its images? This action cannot be undone.`}
        onConfirm={handleConfirmDeleteCategory}
        onCancel={() => {
          setIsDeleteCategoryModalOpen(false);
          setCategoryToDelete(null);
        }}
        confirmText="Delete"
        cancelText="Cancel"
        type="error"
      />

      {/* 新建工作区 Modal */}
      <NewWorkspaceModal
        isOpen={showWorkspaceModal}
        onClose={() => setShowWorkspaceModal(false)}
        onConfirm={(name) => {
          addWorkspace(name);
          setShowWorkspaceModal(false);
        }}
      />

      {/* 编辑工作区 Modal */}
      <EditWorkspaceModal
        isOpen={showEditWorkspaceModal}
        workspace={workspaceToEdit}
        onClose={() => {
          setShowEditWorkspaceModal(false);
          setWorkspaceToEdit(null);
        }}
        onConfirm={(name) => {
          if (workspaceToEdit) {
            updateWorkspace(workspaceToEdit.id, name);
          }
          setShowEditWorkspaceModal(false);
          setWorkspaceToEdit(null);
        }}
      />

      {/* 删除工作区确认 */}
      <ConfirmDialog
        isOpen={showDeleteWorkspaceConfirm}
        title="删除工作区"
        content="删除工作区将同时删除该工作区下的所有图片和分类，此操作不可恢复。确定要继续吗？"
        type="error"
        onConfirm={() => {
          if (workspaceToDelete) {
            deleteWorkspace(workspaceToDelete);
          }
          setShowDeleteWorkspaceConfirm(false);
          setWorkspaceToDelete(null);
        }}
        onCancel={() => {
          setShowDeleteWorkspaceConfirm(false);
          setWorkspaceToDelete(null);
        }}
      />
    </div>
  );
};
