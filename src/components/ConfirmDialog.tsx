import { cn } from '../utils/cn';

interface ConfirmDialogProps {
    isOpen: boolean;
    title: string;
    content: string;
    onConfirm: () => void;
    onCancel: () => void;
    confirmText?: string;
    cancelText?: string;
    type?: 'error' | 'warning' | 'info';
}

export const ConfirmDialog = ({
    isOpen,
    title,
    content,
    onConfirm,
    onCancel,
    confirmText = '确认',
    cancelText = '取消',
    type = 'error'
}: ConfirmDialogProps) => {
    return (
        <dialog className={cn('modal', isOpen && 'modal-open')}>
            <div className="modal-box">
                <h3 className={cn(
                    "text-lg font-bold",
                    type === 'error' && 'text-error',
                    type === 'warning' && 'text-warning',
                    type === 'info' && 'text-info'
                )}>
                    {title}
                </h3>
                <p className="py-4">{content}</p>
                <div className="modal-action">
                    <button
                        className="btn btn-ghost btn-sm"
                        onClick={onCancel}
                    >
                        {cancelText}
                    </button>
                    <button
                        className={cn(
                            "btn btn-sm",
                            type === 'error' && 'btn-error',
                            type === 'warning' && 'btn-warning',
                            type === 'info' && 'btn-info'
                        )}
                        onClick={onConfirm}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
            <form
                method="dialog"
                className="modal-backdrop"
                onClick={onCancel}
            >
                <button>close</button>
            </form>
        </dialog>
    );
}; 