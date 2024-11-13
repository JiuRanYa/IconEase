import { useEffect, useState } from 'react';

interface ImageViewerProps {
  url: string;
  onClose: () => void;
}

export const ImageViewer = ({ url, onClose }: ImageViewerProps) => {
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-base-100/80 backdrop-blur-sm"
      onClick={onClose}
    >
      {/* 工具栏 */}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[60] flex items-center gap-2 rounded-lg bg-base-200 p-2 shadow-lg">
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
          src={url}
          alt="preview"
          className="max-h-[90vh] max-w-[90vw] object-contain size-full block"
          draggable={false}
        />
      </div>

      {/* 关闭按钮 */}
      <button
        className="btn btn-circle btn-sm absolute top-4 right-4"
        onClick={onClose}
      >
        ✕
      </button>
    </div>
  );
}; 
