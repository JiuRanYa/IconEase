import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '../../utils/cn';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (name: string) => void;
}

export const NewWorkspaceModal = ({ isOpen, onClose, onConfirm }: Props) => {
    const [name, setName] = useState("");
    const { t } = useTranslation();

    const handleConfirm = () => {
        if (name.trim()) {
            onConfirm(name.trim());
            setName("");
        }
    };

    return (
        <dialog className={cn('modal', isOpen && 'modal-open')}>
            <div className="modal-box">
                <h3 className="text-lg font-bold">{t('workspace.new')}</h3>

                <div className="form-control mt-4">
                    <input
                        type="text"
                        placeholder={t('workspace.namePlaceholder')}
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
                        {t('common.cancel')}
                    </button>
                    <button
                        className="btn btn-primary btn-sm"
                        onClick={handleConfirm}
                        disabled={!name.trim()}
                    >
                        {t('common.create')}
                    </button>
                </div>
            </div>
            <form method="dialog" className="modal-backdrop" onClick={onClose}>
                <button>close</button>
            </form>
        </dialog>
    );
}; 
