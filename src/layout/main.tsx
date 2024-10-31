import { useState } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { useCategoryStore } from "../stores/categoryStore";
import { CategoryStoreSubscriber } from "../stores/categoryStore";
import { useImageStore } from "../stores/imageStore";
import EmojiPicker, { EmojiClickData } from "emoji-picker-react";
import { PlusIcon, HeartIcon, SearchIcon, ListIcon, ChevronLeftIcon } from '../components/icons';

export default () => {
  const { categories, activeCategory, setActiveCategory, getCategoryCount, getFavoritesCount, addCategory } = useCategoryStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState('💡');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

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

  return (
    <div className="h-screen w-full bg-base-100">
      <CategoryStoreSubscriber />

      {/* Header - 固定在顶部 */}
      <div className="fixed top-0 left-0 right-0 z-10 flex h-16 items-center border-b border-base-300 bg-base-100 px-10 justify-between">
        {/* Logo */}
        <div className="flex items-center">
          <span className="text-xl font-bold">IconEase</span>
          <span className="ml-2 rounded bg-primary px-2 py-0.5 text-xs text-white">Pro</span>
        </div>

        {/* 搜索框 */}
        <div className="relative max-w-xl flex-1 px-8">
          <input
            type="text"
            placeholder="Search 3432 icons"
            className="input input-bordered w-full pl-10 input-sm"
          />
          <SearchIcon className="absolute left-11 top-1/2 h-5 w-5 -translate-y-1/2 text-base-content/50" />
        </div>

        {/* Avatar */}
        <div className="dropdown dropdown-end">
          <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar">
            <div className="w-8 rounded-full">
              <img alt="avatar" src="https://avatars.githubusercontent.com/u/58846658?v=4" />
            </div>
          </div>
          <ul tabIndex={0} className="menu dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52">
            <li><a>Profile</a></li>
            <li><a>Settings</a></li>
            <li className="text-error"><a onClick={() => {
              const isFavoritePage = location.pathname === '/favorites';
              useImageStore.getState().deleteAllImages(isFavoritePage);
            }}>
              Delete All Images
            </a></li>
            <li><a>Logout</a></li>
          </ul>
        </div>
      </div>

      {/* 主体内容 */}
      <div className="flex h-full pt-16">
        {/* 左侧边栏 - 使用transition实现平滑收缩效果 */}
        <div className={`fixed left-0 top-16 bottom-0 flex flex-col bg-base-100 border-r border-base-200 transition-all duration-500 ease-in-out ${isSidebarCollapsed ? 'w-20' : 'w-64'
          }`}>
          {/* 快捷菜单 */}
          <div className="space-y-2 p-4 text-sm">
            {/* New Icons 按钮 */}
            <div className={`flex items-center rounded-lg px-3 py-2 transition cursor-pointer hover:bg-base-200 relative ${isSidebarCollapsed ? 'justify-center' : 'gap-2'
              }`}>
              <div className="flex-shrink-0">
                <PlusIcon className={`${isSidebarCollapsed ? 'h-7 w-7' : 'h-5 w-5'} transition-all duration-500`} />
              </div>
              <div className={`flex-1 whitespace-nowrap transition-all duration-500 ${isSidebarCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'
                } flex items-center justify-between overflow-hidden`}>
                <span>New Icons</span>
                <span className="text-xs text-base-content/50">{getCategoryCount('all')}</span>
              </div>
            </div>

            {/* Favorites 按钮 */}
            <Link
              to="/favorites"
              className={`flex items-center rounded-lg px-3 py-2 transition relative ${location.pathname === '/favorites' ? 'text-primary bg-base-200' : 'hover:bg-base-200'
                } ${isSidebarCollapsed ? 'justify-center' : 'gap-2'}`}
            >
              <div className="flex-shrink-0">
                <HeartIcon className={`${isSidebarCollapsed ? 'h-7 w-7' : 'h-5 w-5'} transition-all duration-500`} />
              </div>
              <div className={`flex-1 whitespace-nowrap transition-all duration-500 ${isSidebarCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'
                } flex items-center justify-between overflow-hidden`}>
                <span>Favorites</span>
                <span className="text-xs text-base-content/50">{getFavoritesCount()}</span>
              </div>
            </Link>
          </div>

          {/* 分类标题 */}
          <div className={`mt-4 mb-4 px-7 transition-all duration-500 ${isSidebarCollapsed ? 'opacity-0 h-0 overflow-hidden' : 'opacity-100 h-auto'
            }`}>
            <h2 className="text-sm font-semibold text-base-content/70">Category</h2>
          </div>

          {/* 分类列表 */}
          <div className="flex-1 space-y-1 overflow-y-auto p-4 text-sm">
            {categories.map((category) => (
              <a
                key={category.id}
                className={`flex items-center rounded-lg px-3 py-2 transition relative ${activeCategory === category.id ? 'bg-base-200' : 'hover:bg-base-200'
                  } ${isSidebarCollapsed ? 'justify-center' : 'gap-2'}`}
                onClick={() => handleCategoryClick(category.id)}
                title={isSidebarCollapsed ? category.name : undefined}
              >
                <div className="flex-shrink-0">
                  {category.icon === 'list' ? (
                    <ListIcon className={`${isSidebarCollapsed ? 'h-7 w-7' : 'h-5 w-5'} transition-all duration-500`} />
                  ) : (
                    <span className={`${isSidebarCollapsed ? 'text-2xl' : 'text-base'} transition-all duration-500`}>
                      {category.icon}
                    </span>
                  )}
                </div>
                <div className={`flex-1 whitespace-nowrap transition-all duration-500 ${isSidebarCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'
                  } flex items-center justify-between overflow-hidden`}>
                  <span>{category.name}</span>
                  <span className="text-xs text-base-content/50">
                    {getCategoryCount(category.id)}
                  </span>
                </div>
              </a>
            ))}

            {/* 新增分类按钮 */}
            <button
              onClick={() => setIsModalOpen(true)}
              className={`flex w-full items-center rounded-lg px-3 py-2 text-base-content/70 hover:bg-base-200 relative ${isSidebarCollapsed ? 'justify-center' : 'gap-2'
                }`}
              title={isSidebarCollapsed ? "Add Category" : undefined}
            >
              <div className="flex-shrink-0">
                <PlusIcon className={`${isSidebarCollapsed ? 'h-7 w-7' : 'h-5 w-5'} transition-all duration-500`} />
              </div>
              <div className={`whitespace-nowrap transition-all duration-500 ${isSidebarCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'
                } overflow-hidden`}>
                Add Category
              </div>
            </button>
          </div>

          {/* 收缩按钮 */}
          <div className="p-4 border-t border-base-200">
            <button
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className={`flex w-full items-center rounded-lg px-3 py-2 hover:bg-base-200 relative ${isSidebarCollapsed ? 'justify-center' : 'gap-2'
                }`}
              title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
              <div className="flex-shrink-0">
                <ChevronLeftIcon
                  className={`${isSidebarCollapsed ? 'h-7 w-7' : 'h-5 w-5'} transition-all duration-500 ${isSidebarCollapsed ? 'rotate-180' : ''
                    }`}
                />
              </div>
              <div className={`whitespace-nowrap transition-all duration-500 ${isSidebarCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'
                } overflow-hidden`}>
                Collapse Sidebar
              </div>
            </button>
          </div>
        </div>

        {/* 主内容区 */}
        <div className={`flex-1 overflow-y-auto p-4 transition-all duration-500 ${isSidebarCollapsed ? 'ml-20' : 'ml-64'
          }`}>
          <Outlet />
        </div>
      </div>

      {/* 新增分类模态框 */}
      <dialog className={`modal ${isModalOpen ? 'modal-open' : ''}`}>
        <div className="modal-box">
          <h3 className="text-lg font-bold">Add New Category</h3>

          <div className="py-4">
            {/* Emoji 和输入框在同一行 */}
            <div className="relative flex items-center gap-2">
              {/* Emoji 选择器 */}
              <div className="relative">
                <button
                  className="btn btn-square btn-outline"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                >
                  <span className="text-xl">{selectedEmoji}</span>
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

              {/* 分类名称输入框 */}
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Category Name"
                  className="input input-bordered w-full"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
                />
              </div>
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="modal-action">
            <button
              className="btn btn-ghost"
              onClick={() => {
                setIsModalOpen(false);
                setShowEmojiPicker(false);
              }}
            >
              Cancel
            </button>
            <button
              className="btn btn-primary"
              onClick={handleAddCategory}
              disabled={!newCategoryName.trim()}
            >
              Add
            </button>
          </div>
        </div>

        {/* 背景遮罩 */}
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
    </div>
  );
};
