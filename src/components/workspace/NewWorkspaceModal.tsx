import { useState } from 'react';
import { cn } from '../../utils/cn';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (name: string) => void;
}

export const NewWorkspaceModal = ({ isOpen, onClose, onConfirm }: Props) => {
  const [name, setName] = useState("");

  const handleConfirm = () => {
    if (name.trim()) {
      onConfirm(name.trim());
      setName("");
    }
  };

  return (
    <dialog className={cn('modal', isOpen && 'modal-open')}>
      <div className="modal-box">
        <h3 className="text-lg font-bold">新建工作区</h3>

        <div className="form-control mt-4">
          <input
            type="text"
            placeholder="请输入工作区名称"
            className="input input-bordered w-full input-sm"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleConfirm()}
          />
        </div>

        <div className="modal-action">
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => {
              setName("");
              onClose();
            }}
          >
            取消
          </button>
          <button
            className="btn btn-primary btn-sm"
            onClick={handleConfirm}
            disabled={!name.trim()}
          >
            创建
          </button>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop" onClick={onClose}>
        <button>close</button>
      </form>
    </dialog>
  );
}; 
