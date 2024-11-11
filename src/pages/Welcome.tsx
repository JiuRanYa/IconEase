import { useState } from 'react';
import { NewWorkspaceModal } from '../components/workspace/NewWorkspaceModal';
import { useWorkspaceStore } from '../stores/workspaceStore';

export const Welcome = () => {
  const [showWorkspaceModal, setShowWorkspaceModal] = useState(false);
  const { addWorkspace } = useWorkspaceStore();

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-base-100">
      <div className="max-w-2xl w-full px-8">
        {/* Logo 和标题区域 */}
        <div className="text-center space-y-4 mb-12">
          <div className="inline-block">
            <img
              src="/icon.png"
              alt="IconEase Logo"
              className="w-24 h-24 mx-auto"
            />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            IconEase
          </h1>
          <p className="text-base-content/70 text-lg">
            简单、高效的图标管理工具
          </p>
        </div>

        {/* 功能介绍卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="card bg-base-200 hover:shadow-lg transition-shadow duration-300">
            <div className="card-body items-center text-center">
              <svg className="w-8 h-8 text-primary mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <h2 className="card-title text-base">工作区管理</h2>
              <p className="text-sm text-base-content/70">为不同项目创建独立工作区</p>
            </div>
          </div>
          <div className="card bg-base-200 hover:shadow-lg transition-shadow duration-300">
            <div className="card-body items-center text-center">
              <svg className="w-8 h-8 text-primary mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              <h2 className="card-title text-base">分类标签</h2>
              <p className="text-sm text-base-content/70">灵活组织和管理您的图标</p>
            </div>
          </div>
          <div className="card bg-base-200 hover:shadow-lg transition-shadow duration-300">
            <div className="card-body items-center text-center">
              <svg className="w-8 h-8 text-primary mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <h2 className="card-title text-base">快速搜索</h2>
              <p className="text-sm text-base-content/70">轻松找到需要的图标</p>
            </div>
          </div>
        </div>

        {/* 开始使用按钮 */}
        <div className="text-center space-y-4">
          <button
            onClick={() => setShowWorkspaceModal(true)}
            className="btn btn-primary hover:scale-105 transition-transform duration-300 text-white"
          >
            创建第一个工作区
          </button>
          <p className="text-sm text-base-content/50">
            创建工作区后即可开始使用所有功能
          </p>
        </div>
      </div>

      <NewWorkspaceModal
        isOpen={showWorkspaceModal}
        onClose={() => setShowWorkspaceModal(false)}
        onConfirm={(name) => {
          addWorkspace(name);
          setShowWorkspaceModal(false);
        }}
      />
    </div>
  );
}; 
