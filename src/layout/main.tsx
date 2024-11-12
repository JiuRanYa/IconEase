import { useState, useEffect, useMemo, useCallback } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { useCategoryStore } from "../stores/categoryStore";
import { CategoryStoreSubscriber } from "../stores/categoryStore";
import { useImageStore } from "../stores/imageStore";
import EmojiPicker, { EmojiClickData } from "emoji-picker-react";
import { PlusIcon, HeartIcon, SearchIcon, ChevronLeftIcon, HamburgerIcon, DeleteIcon, PencilIcon } from '../components/icons';
import { cn } from '../utils/cn';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { useWorkspaceStore } from "../stores/workspaceStore";
import { NewWorkspaceModal } from '../components/workspace/NewWorkspaceModal';
import { EditWorkspaceModal } from "../components/workspace/EditWorkspaceModal";
import { Welcome } from '../pages/Welcome';
import { Workspace } from "../types";
import { useTranslation } from "react-i18next";
import { useLanguage } from '../hooks/useLanguage';
import { Menu, MenuButton, MenuItem, MenuItems, Transition, Disclosure } from '@headlessui/react';
import { Fragment } from 'react';
import { ChevronRightIcon } from '../components/icons';

export default () => {
  const { currentWorkspace, workspaces, switchWorkspace, deleteWorkspace, updateWorkspace, addWorkspace } = useWorkspaceStore();
  const { categories, activeCategory, setActiveCategory, getCategoryCount, getFavoritesCount, addCategory, deleteCategory } = useCategoryStore();
  const { searchQuery, setSearchQuery } = useImageStore();
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { currentLanguage, changeLanguage } = useLanguage();

  // 所有 useState hooks
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState('💡');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 });
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [isDeleteCategoryModalOpen, setIsDeleteCategoryModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);
  const [showWorkspaceModal, setShowWorkspaceModal] = useState(false);
  const [showEditWorkspaceModal, setShowEditWorkspaceModal] = useState(false);
  const [workspaceToEdit, setWorkspaceToEdit] = useState<Workspace | null>(null);
  const [showDeleteWorkspaceConfirm, setShowDeleteWorkspaceConfirm] = useState(false);
  const [workspaceToDelete, setWorkspaceToDelete] = useState<string | null>(null);

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

  // 重写工作区切换方法以添加加载状态
  const handleWorkspaceSwitch = async (workspaceId: string) => {
    try {
      switchWorkspace(workspaceId);
    } finally {
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

      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-10 flex h-16 items-center border-b border-base-300 bg-base-100 px-10 justify-between">
        {/* Logo */}
        <div className="flex items-center gap-4">
          <span className="text-xl font-bold">IconEase</span>

          <span className="rounded bg-primary px-2 py-0.5 text-xs text-white">Beta</span>
        </div>

        {/* Search */}
        <div className="relative max-w-xl flex-1 px-8">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('search.placeholder')}
            className="input input-bordered w-full pl-10 input-sm"
          />
          <SearchIcon className="absolute left-11 top-1/2 h-5 w-5 -translate-y-1/2 text-base-content/50" />
        </div>

        {/* Menu Button */}
        <Menu as="div" className="relative">
          <Menu.Button className="inline-flex items-center gap-2 px-3 py-1.5 text-sm hover:bg-black/5 rounded-md">
            <span className="mr-2">{currentWorkspace.name}</span>
            <HamburgerIcon className="h-4 w-4" />
          </Menu.Button>

          <Transition
            as={Fragment}
            enter="transition ease-out duration-100"
            enterFrom="transform opacity-0 scale-95"
            enterTo="transform opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-95"
          >
            <MenuItems className="absolute right-0 mt-2 w-64 p-2 origin-top-right rounded-lg bg-white shadow-lg ring-1 ring-black/5 focus:outline-none ">
              {/* 工作区列表 */}
              <div className="text-gray-400 text-sm font-medium px-4 py-2">
                <span>{t('workspace.title')}</span>
              </div>

              {workspaces.map(workspace => (
                <MenuItem key={workspace.id}>
                  <div className="px-2 hover:bg-gray-100 transition rounded-lg">
                    <button
                      onClick={() => {
                        handleWorkspaceSwitch(workspace.id);
                      }}
                      className="flex w-full items-center gap-2 px-2 text-sm py-2 text-gray-600 hover:text-gray-900 rounded-md cursor-pointer"
                    >
                      <div className="flex-1 flex items-center gap-2">
                        <div className={cn(
                          "w-2 h-2 rounded-full me-2",
                          workspace.id === currentWorkspace.id ? "bg-blue-500" : "bg-gray-300"
                        )} />
                        <span>{workspace.name}</span>
                      </div>

                      <div className="flex gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setWorkspaceToEdit(workspace);
                            setShowEditWorkspaceModal(true);
                          }}
                          className="p-1 hover:bg-black/5 rounded-md"
                        >
                          <PencilIcon className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setWorkspaceToDelete(workspace.id);
                            setShowDeleteWorkspaceConfirm(true);
                          }}
                          className="p-1 hover:bg-black/5 rounded-md"
                        >
                          <DeleteIcon className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </button>
                  </div>
                </MenuItem>
              ))}

              {/* 新建工作区按钮 */}
              <MenuItem>
                <div className="px-2 transition hover:bg-gray-100 rounded-lg">
                  <button
                    onClick={() => setShowWorkspaceModal(true)}
                    className="flex w-full items-center gap-2 px-2 py-2 text-sm text-gray-600 hover:text-gray-900 rounded-md cursor-pointer"
                  >
                    <PlusIcon className="h-4 w-4" />
                    <span>{t('workspace.new')}</span>
                  </button>
                </div>
              </MenuItem>

              <div className="my-3 h-px bg-gray-200" />

              {/* 设置菜单组 */}
              <div className="text-gray-400 text-sm font-medium px-4 py-2">
                <span>{t('settings.title')}</span>
              </div>

              {/* 语言切换 */}
              <Menu as="div" className="relative w-full">
                {({ open }) => (
                  <>
                    <Menu.Button className="flex w-full items-center gap-2 px-4 py-2 hover:bg-gray-100 transition rounded-lg">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                      </svg>
                      <span>{t('settings.language')}</span>
                      <span className="ml-auto text-gray-400">
                        {currentLanguage === 'zh' ? '中文' : 'English'}
                      </span>
                      <ChevronRightIcon
                        className={cn(
                          "h-4 w-4 transition-transform duration-200",
                          open && "rotate-90"
                        )}
                      />
                    </Menu.Button>

                    <Transition
                      as={Fragment}
                      enter="transition ease-out duration-100"
                      enterFrom="transform opacity-0 scale-95"
                      enterTo="transform opacity-100 scale-100"
                      leave="transition ease-in duration-75"
                      leaveFrom="transform opacity-100 scale-100"
                      leaveTo="transform opacity-0 scale-95"
                    >
                      <MenuItems className="absolute right-full top-0 mr-1 w-40 p-2 origin-top-right rounded-lg bg-white shadow-lg ring-1 ring-black/5 focus:outline-none">
                        <MenuItem>
                          <button
                            onClick={() => changeLanguage('en')}
                            className={cn(
                              "flex w-full items-center px-4 py-2 text-sm rounded-md",
                              currentLanguage === 'en' && 'text-blue-500'
                            )}
                          >
                            English
                          </button>
                        </MenuItem>
                        <MenuItem>
                          <button
                            onClick={() => changeLanguage('zh')}
                            className={cn(
                              "flex w-full items-center px-4 py-2 text-sm rounded-md",
                              currentLanguage === 'zh' && 'text-blue-500'
                            )}
                          >
                            中文
                          </button>
                        </MenuItem>
                      </MenuItems>
                    </Transition>
                  </>
                )}
              </Menu>

              {/* Reset 按钮 */}
              <MenuItem>
                <div className="px-2 hover:bg-gray-100 transition rounded-md">
                  <button
                    onClick={() => setIsConfirmModalOpen(true)}
                    className="flex w-full items-center gap-2 px-2 py-2 rounded-md cursor-pointer"
                  >
                    <DeleteIcon className="h-4 w-4" />
                    <span>{t('common.reset')}</span>
                  </button>
                </div>
              </MenuItem>

              {/* Export Config */}
              <MenuItem>
                <div className="px-2 hover:bg-gray-100 transition rounded-md">
                  <button
                    className="flex w-full items-center gap-2 px-2 py-2 rounded-md cursor-pointer"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    <span>Export Config</span>
                  </button>
                </div>
              </MenuItem>
            </MenuItems>
          </Transition>
        </Menu>
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

      {/* Confirm Clear Modal */}
      <dialog className={cn('modal', isConfirmModalOpen && 'modal-open')}>
        <div className="modal-box">
          <h3 className="text-lg font-bold text-error">{t('reset.title')}</h3>
          <p className="py-4">{t('reset.content')}</p>
          <div className="modal-action">
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => setIsConfirmModalOpen(false)}
            >
              {t('common.cancel')}
            </button>
            <button
              className="btn btn-error btn-sm"
              onClick={handleClearAll}
            >
              {t('reset.confirm')}
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
        title={t('workspace.delete.title')}
        content={t('workspace.delete.content')}
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
