import { useState, useEffect } from 'react';
import { cn } from '../../utils/cn';
import { Workspace } from '../../types';

interface Props {
    isOpen: boolean;
    workspace: Workspace | null;
    onClose: () => void;
    onConfirm: (name: string) => void;
}

export const EditWorkspaceModal = ({ isOpen, workspace, onClose, onConfirm }: Props) => {
    const [name, setName] = useState("");

    useEffect(() => {
        if (workspace) {
            setName(workspace.name);
        }
    }, [workspace]);

    const handleConfirm = () => {
        if (name.trim()) {
            onConfirm(name.trim());
            setName("");
        }
    };

    return (
        <dialog className={cn('modal', isOpen && 'modal-open')}>
            <div className="modal-box">
                <h3 className="text-lg font-bold">编辑工作区</h3>

                <div className="form-control mt-4">
                    <input
                        type="text"
                        placeholder="请输入工作区名称"
                        className="input input-bordered w-full"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleConfirm()}
                    />
                </div>

                <div className="modal-action">
                    <button
                        className="btn btn-ghost"
                        onClick={() => {
                            setName("");
                            onClose();
                        }}
                    >
                        取消
                    </button>
                    <button
                        className="btn btn-primary"
                        onClick={handleConfirm}
                        disabled={!name.trim()}
                    >
                        保存
                    </button>
                </div>
            </div>
            <form method="dialog" className="modal-backdrop" onClick={onClose}>
                <button>close</button>
            </form>
        </dialog>
    );
}; 