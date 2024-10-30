import { useState } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { useCategoryStore } from "../stores/categoryStore";
import { CategoryStoreSubscriber } from "../stores/categoryStore";
import EmojiPicker, { EmojiClickData } from "emoji-picker-react";

export default () => {
  const { categories, activeCategory, setActiveCategory, getCategoryCount, getFavoritesCount, addCategory } = useCategoryStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState('💡');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

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
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="absolute left-11 top-1/2 h-5 w-5 -translate-y-1/2 text-base-content/50"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
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
            <li><a>Logout</a></li>
          </ul>
        </div>
      </div>

      {/* 主体内容 */}
      <div className="flex h-full pt-16">
        {/* 左侧边栏 - 固定位置 */}
        <div className="fixed left-0 top-16 bottom-0 w-64 overflow-y-auto border-r border-base-300 bg-base-100 p-4">
          {/* 快捷菜单 */}
          <div className="space-y-2">
            <div
              className={`flex items-center gap-2 rounded-lg px-3 py-2 transition}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span>New Icons</span>
              <span className="ml-auto text-sm text-base-content/50">132</span>
            </div>

            <Link
              to="/favorites"
              className={`flex items-center gap-2 rounded-lg px-3 py-2 transition ${location.pathname === '/favorites' ? 'text-primary bg-base-200' : 'hover:bg-base-200'
                }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <span>Favorites</span>
              <span className="ml-auto text-sm text-base-content/50">{getFavoritesCount()}</span>
            </Link>

            <Link
              to="/projects"
              className={`flex items-center gap-2 rounded-lg px-3 py-2 transition ${location.pathname === '/projects' ? 'text-primary bg-base-200' : 'hover:bg-base-200'
                }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
              <span>Projects</span>
              <span className="ml-auto text-sm text-base-content/50">132</span>
            </Link>
          </div>

          {/* 分类标题 */}
          <div className="mt-8 mb-4">
            <h2 className="px-3 text-sm font-semibold">Category</h2>
          </div>

          {/* 分类列表 */}
          <div className="space-y-1">
            {categories.map((category) => (
              <a
                key={category.id}
                className={`flex items-center gap-2 rounded-lg px-3 py-2 transition ${activeCategory === category.id ? 'bg-base-200' : 'hover:bg-base-200'
                  }`}
                onClick={() => handleCategoryClick(category.id)}
              >
                {category.icon === 'list' ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                ) : (
                  <span className="text-xl">{category.icon}</span>
                )}
                <span>{category.name}</span>
                <span className="ml-auto text-sm text-base-content/50">
                  {getCategoryCount(category.id)}
                </span>
              </a>
            ))}

            {/* 新增分类按钮 */}
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-base-content/70 hover:bg-base-200"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              <span>Add Category</span>
            </button>
          </div>
        </div>

        {/* 主内容区 - 可滚动 */}
        <div className="ml-64 flex-1 overflow-y-auto p-4">
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
                  <span className="text-2xl">{selectedEmoji}</span>
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
