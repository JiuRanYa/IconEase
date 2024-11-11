import { useState } from 'react';
import { NewWorkspaceModal } from '../components/workspace/NewWorkspaceModal';
import { useWorkspaceStore } from '../stores/workspaceStore';

export const Welcome = () => {
    const [showWorkspaceModal, setShowWorkspaceModal] = useState(false);
    const { addWorkspace } = useWorkspaceStore();

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-base-100">
            <div className="text-center space-y-6 max-w-md mx-auto p-8">
                <div className="space-y-2">
                    <h1 className="text-4xl font-bold">欢迎使用 IconEase</h1>
                    <p className="text-base-content/70">
                        开始使用前，请创建您的第一个工作区
                    </p>
                </div>

                <div className="p-8 border border-base-300 rounded-box space-y-4 bg-base-200/50">
                    <div className="flex justify-center">
                        <svg
                            className="w-24 h-24 text-primary/20"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path d="M4 5h16v2H4zm0 6h16v2H4zm0 6h16v2H4z" />
                        </svg>
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold">创建工作区</h2>
                        <p className="text-sm text-base-content/70 mt-1">
                            工作区可以帮助您更好地组织和管理图标
                        </p>
                    </div>
                    <button
                        className="btn btn-primary"
                        onClick={() => setShowWorkspaceModal(true)}
                    >
                        创建工作区
                    </button>
                </div>

                <p className="text-sm text-base-content/50">
                    您可以稍后创建更多工作区来组织不同的项目
                </p>
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