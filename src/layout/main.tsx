import { useState } from "react";
import { Outlet } from "react-router-dom";
import { useCategoryStore } from "../stores/categoryStore";
import { useImageStore } from "../stores/imageStore";
import { CategoryStoreSubscriber } from "../stores/categoryStore";

export default () => {
  const [collapsed, setCollapsed] = useState(false);
  const { categories, activeCategory, setActiveCategory, getCategoryCount, getFavoritesCount } = useCategoryStore();

  return (
    <div className="flex h-screen w-full bg-base-100">
      {/* 添加订阅组件 */}
      <CategoryStoreSubscriber />

      {/* Header */}
      <div className="fixed top-0 left-0 right-0 flex h-16 items-center border-b border-base-300 bg-base-100 px-4 justify-between px-10">
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
      <div className="mt-16 flex w-full">
        {/* 左侧边栏 */}
        <div className="w-64 bg-base-100 p-4 border-r">
          {/* 快捷菜单 */}
          <div className="space-y-2">
            <a className="flex items-center gap-2 rounded-lg px-3 py-2 text-primary hover:bg-base-200 transition">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span>New Icons</span>
              <span className="ml-auto text-sm text-base-content/50">132</span>
            </a>
            <a className="flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-base-200 transition">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <span>Favorites</span>
              <span className="ml-auto text-sm text-base-content/50">{getFavoritesCount()}</span>
            </a>
            <a className="flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-base-200 transition">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
              <span>Projects</span>
              <span className="ml-auto text-sm text-base-content/50">132</span>
            </a>
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
                onClick={() => setActiveCategory(category.id)}
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
          </div>
        </div>

        {/* 主内容区 */}
        <div className="flex-1 p-4">
          <Outlet />
        </div>
      </div>
    </div>
  );
};
