import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { NewWorkspaceModal } from '../components/workspace/NewWorkspaceModal';
import { useWorkspaceStore } from '../stores/workspaceStore';

interface FeatureCardProps {
  icon: 'workspace' | 'category' | 'search';
  title: string;
  description: string;
}

const FeatureCard = ({ title, description }: FeatureCardProps) => (
  <div className="card bg-base-200">
    <div className="card-body">
      <h2 className="card-title">{title}</h2>
      <p>{description}</p>
    </div>
  </div>
);

export const Welcome = () => {
  const [showWorkspaceModal, setShowWorkspaceModal] = useState(false);
  const { addWorkspace } = useWorkspaceStore();
  const { t } = useTranslation();

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-base-100">
      <div className="max-w-2xl w-full px-8">
        {/* Logo 和标题区域 */}
        <div className="text-center space-y-4 mb-12">
          <div className="inline-block">
            <img src="/icon.png" alt="IconEase Logo" className="w-24 h-24 mx-auto" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            {t('welcome.title')}
          </h1>
          <p className="text-base-content/70 text-lg">
            {t('welcome.subtitle')}
          </p>
        </div>

        {/* 功能介绍卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <FeatureCard
            icon="workspace"
            title={t('welcome.features.workspace.title')}
            description={t('welcome.features.workspace.desc')}
          />
          <FeatureCard
            icon="category"
            title={t('welcome.features.category.title')}
            description={t('welcome.features.category.desc')}
          />
          <FeatureCard
            icon="search"
            title={t('welcome.features.search.title')}
            description={t('welcome.features.search.desc')}
          />
        </div>

        {/* 开始使用按钮 */}
        <div className="text-center space-y-4">
          <button
            onClick={() => setShowWorkspaceModal(true)}
            className="btn btn-primary hover:scale-105 transition-transform duration-300"
          >
            {t('welcome.createButton')}
          </button>
          <p className="text-sm text-base-content/50">
            {t('welcome.createHint')}
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
