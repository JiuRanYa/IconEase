import { useState } from 'react';
import { useWorkspaceStore } from '../../stores/workspaceStore';
import { PlusIcon, DeleteIcon } from '../icons';
import { cn } from '../../utils/cn';

export const WorkspaceManager = () => {
    const {
        currentWorkspace,
        workspaces,
        switchWorkspace,
    } = useWorkspaceStore();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    return (
        <div className="dropdown">
            <div
                tabIndex={0}
                role="button"
                className="btn btn-sm min-w-40"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-success"></div>
                    <span className="flex-1 text-left truncate">
                        {currentWorkspace.name}
                    </span>
                </div>
                <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
            </div>

            <ul
                tabIndex={0}
                className={cn(
                    "dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52",
                    isDropdownOpen ? 'block' : 'hidden'
                )}
            >
                {workspaces.map(workspace => (
                    <li key={workspace.id}>
                        <a
                            onClick={() => {
                                switchWorkspace(workspace.id);
                                setIsDropdownOpen(false);
                            }}
                            className={cn(
                                "flex justify-between",
                                workspace.id === currentWorkspace.id && "active"
                            )}
                        >
                            <div className="flex items-center gap-2">
                                <div className={cn(
                                    "w-2 h-2 rounded-full",
                                    workspace.id === currentWorkspace.id ? "bg-success" : "bg-base-300"
                                )}></div>
                                <span>{workspace.name}</span>
                            </div>
                            {workspace.id !== 'default' && (
                                <div className="flex gap-1">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            // 处理编辑
                                        }}
                                        className="btn btn-ghost btn-xs"
                                    >
                                        <svg className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M2 5a2 2 0 012-2h7a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V5zm9.293 1.293a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 01-1.414-1.414L12.586 15H7a1 1 0 110-2h4.586l-1.293-1.293a1 1 0 010-1.414z" clipRule="evenodd" />
                                        </svg>
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            // 处理删除
                                        }}
                                        className="btn btn-ghost btn-xs"
                                    >
                                        <DeleteIcon className="h-3 w-3" />
                                    </button>
                                </div>
                            )}
                        </a>
                    </li>
                ))}
                <div className="divider my-1"></div>
                <li>
                    <a onClick={() => {
                        // 处理新建工作区
                        setIsDropdownOpen(false);
                    }}>
                        <PlusIcon className="h-4 w-4" />
                        <span>新建工作区</span>
                    </a>
                </li>
            </ul>
        </div>
    );
}; 