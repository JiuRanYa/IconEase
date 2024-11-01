import { useEffect, useState } from 'react';
import { cn } from '../../utils/cn';

export type MessageType = 'info' | 'success' | 'warning' | 'error';

export interface MessageProps {
    id: string;
    type: MessageType;
    content: string;
    duration?: number;
    onClose: (id: string) => void;
}

const icons = {
    info: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="h-4 w-4 stroke-current">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    ),
    success: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="h-4 w-4 stroke-current">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    ),
    warning: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="h-4 w-4 stroke-current">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
    ),
    error: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="h-4 w-4 stroke-current">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    ),
};

export const Message = ({ id, type, content, duration = 3000, onClose }: MessageProps) => {
    const [isVisible, setIsVisible] = useState(false);
    const [isLeaving, setIsLeaving] = useState(false);

    useEffect(() => {
        requestAnimationFrame(() => {
            setIsVisible(true);
        });

        const timer = setTimeout(() => {
            setIsLeaving(true);
            setTimeout(() => {
                onClose(id);
            }, 300);
        }, duration);

        return () => clearTimeout(timer);
    }, [id, duration, onClose]);

    return (
        <div
            className={cn(
                "alert shadow-lg max-w-xs w-full transition-all duration-300 transform",
                "translate-x-[120%] opacity-0",
                isVisible && !isLeaving && "translate-x-0 opacity-100",
                isLeaving && "translate-x-[120%] opacity-0",
                type === 'info' && "alert-info",
                type === 'success' && "alert-success",
                type === 'warning' && "alert-warning",
                type === 'error' && "alert-error"
            )}
        >
            <div className="flex w-full items-center gap-2">
                {icons[type]}
                <span className="text-sm flex-1">{content}</span>
                <button
                    className="btn btn-circle btn-ghost btn-xs"
                    onClick={() => {
                        setIsLeaving(true);
                        setTimeout(() => onClose(id), 300);
                    }}
                >
                    ✕
                </button>
            </div>
        </div>
    );
};