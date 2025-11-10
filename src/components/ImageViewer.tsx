import { useEffect, useState } from 'react';

import { ImageItem } from '../types';

import { DeleteIcon } from './icons';

interface ImageViewerProps {
  image: ImageItem;
  onClose: () => void;
  onDownload: (image: ImageItem) => void;
  onToggleFavorite: (id: string) => void;
  onDelete: (id: string) => void;
  onCopy?: (image: ImageItem) => void;
}

export const ImageViewer = ({
  image,
  onClose,
  onDownload,
  onToggleFavorite,
  onDelete,
  onCopy,
}: ImageViewerProps) => {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // 处理键盘事件
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === '=' || e.key === '+') setScale(s => Math.min(s + 0.1, 3));
      if (e.key === '-') setScale(s => Math.max(s - 0.1, 0.5));
      if (e.key === '0') {
        setScale(1);
        setPosition({ x: 0, y: 0 });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // 处理鼠标拖动
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // 处理滚轮缩放
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setScale(s => Math.max(0.5, Math.min(s + delta, 3)));
  };

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-base-100/80 backdrop-blur-sm"
      onClick={onClose}
    >
      {/* 工具栏 */}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[10000] flex items-center gap-2 rounded-lg bg-base-200 p-2 shadow-lg">
        <button
          className="btn btn-circle btn-sm"
          onClick={(e) => {
            e.stopPropagation();
            setScale(s => Math.min(s + 0.1, 3));
          }}
        >
          +
        </button>
        <button
          className="btn btn-circle btn-sm"
          onClick={(e) => {
            e.stopPropagation();
            setScale(s => Math.max(s - 0.1, 0.5));
          }}
        >
          -
        </button>
        <button
          className="btn btn-circle btn-sm"
          onClick={(e) => {
            e.stopPropagation();
            setScale(1);
            setPosition({ x: 0, y: 0 });
          }}
        >
          ↺
        </button>
        <div className="text-sm">
          {Math.round(scale * 100)}%
        </div>
      </div>

      {/* 图片容器 */}
      <div
        className="relative cursor-move select-none h-[40vh] w-[40vw]"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        onClick={(e) => e.stopPropagation()}
        style={{
          transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
        }}
      >
        <img
          src={image.url}
          alt="preview"
          className="max-h-[90vh] max-w-[90vw] object-contain size-full block"
          draggable={false}
        />
      </div>

      {/* 关闭按钮 */}
      <button
        className="btn btn-circle btn-sm absolute top-4 right-4 z-[10000]"
        onClick={onClose}
      >
        ✕
      </button>

      {/* 底部操作栏 */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[10000] flex items-center gap-2 rounded-full bg-base-200/90 backdrop-blur-sm px-3 py-2 shadow-lg">
        {/* 下载按钮 */}
        <button
          className="btn btn-circle btn-sm btn-ghost hover:bg-base-300"
          onClick={(e) => {
            e.stopPropagation();
            onDownload(image);
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
            />
          </svg>
        </button>

        {/* 复制按钮 - 仅SVG文件显示 */}
        {image.type?.includes('svg') && onCopy && (
          <button
            className="btn btn-circle btn-sm btn-ghost hover:bg-base-300"
            onClick={(e) => {
              e.stopPropagation();
              onCopy(image);
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
          </button>
        )}

        {/* 收藏按钮 */}
        <button
          className="btn btn-circle btn-sm btn-ghost hover:bg-base-300"
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(image.id);
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`h-4 w-4 ${image.isFavorite ? 'fill-error' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
        </button>

        {/* 删除按钮 */}
        <button
          className="btn btn-circle btn-sm btn-ghost hover:bg-base-300 text-error"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(image.id);
          }}
        >
          <DeleteIcon className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}; 
