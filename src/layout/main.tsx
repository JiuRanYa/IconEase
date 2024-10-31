import { useState } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { useCategoryStore } from "../stores/categoryStore";
import { CategoryStoreSubscriber } from "../stores/categoryStore";
import { useImageStore } from "../stores/imageStore";
import EmojiPicker, { EmojiClickData } from "emoji-picker-react";
import { PlusIcon, HeartIcon, SearchIcon, ListIcon, ChevronLeftIcon, HamburgerIcon } from '../components/icons';
import { cn } from '../utils/cn';
import { CloseIcon } from "../components/icons/CloseIcon";

export default () => {
  const { categories, activeCategory, setActiveCategory, getCategoryCount, getFavoritesCount, addCategory, clearCategories } = useCategoryStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState('💡');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { searchQuery, setSearchQuery } = useImageStore();

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

  return (
    <div className="h-screen w-full bg-base-100">
      <CategoryStoreSubscriber />

      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-10 flex h-16 items-center border-b border-base-300 bg-base-100 px-10 justify-between">
        {/* Logo */}
        <div className="flex items-center">
          <span className="text-xl font-bold">IconEase</span>
          <span className="ml-2 rounded bg-primary px-2 py-0.5 text-xs text-white">Pro</span>
        </div>

        {/* Search */}
        <div className="relative max-w-xl flex-1 px-8">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search icons by name"
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
                setIsMenuOpen(false);
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
        )}>
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
                location.pathname === '/favorites' ? 'text-primary bg-base-200' : 'hover:bg-base-200',
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
              <a
                key={category.id}
                className={cn(
                  "flex items-center rounded-lg px-2 py-2 transition relative cursor-pointer",
                  activeCategory === category.id ? 'bg-base-200' : 'hover:bg-base-200',
                  isSidebarCollapsed ? 'justify-center' : 'gap-2',
                )}
                onClick={() => handleCategoryClick(category.id)}
                title={isSidebarCollapsed ? category.name : undefined}
              >
                <div className="flex-shrink-0">
                  {category.icon === 'list' ? (
                    <ListIcon className="size-4 transition-all duration-500" />
                  ) : (
                    <span className="text-sm transition-all duration-500">
                      {category.icon}
                    </span>
                  )}
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
                  className="btn btn-square btn-outline btn-sm"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                >
                  <span className="text-sm">{selectedEmoji}</span>
                </button>
                {showEmojiPicker && (
                  <div className="absolute left-0 top-full mt-2 z-50">
                    <EmojiPicker
                      onEmojiClick={onEmojiClick}
                      autoFocusSearch={false}
                      width={300}
                      height={400}
                    />
                  </div>
                )}
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
    </div>
  );
};
