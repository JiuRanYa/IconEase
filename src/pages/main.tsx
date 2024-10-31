import { useState, useEffect } from "react";
import { useCategoryStore } from "../stores/categoryStore";
import { useImageStore } from "../stores/imageStore";
import { useLocation } from "react-router-dom";
import { ImageViewer } from "../components/ImageViewer";
import { VirtualGrid } from '../components/VirtualGrid';
import { useCallback } from 'react';
import { ImageItem } from "../types";

interface MainProps {
  showUpload?: boolean;
}


export default ({ showUpload = true }: MainProps) => {
  const location = useLocation();
  const isFavoritePage = location.pathname === '/favorites';
  const { activeCategory } = useCategoryStore();
  const { addImages, getImagesByCategory, getFavoriteImages, toggleFavorite, deleteImage } = useImageStore();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // 根据当前页面决定显示哪些图片
  const images = isFavoritePage ? getFavoriteImages() : getImagesByCategory(activeCategory);

  // 处理删除图片
  const handleDelete = (id: string) => {
    deleteImage(id);
  };

  // 处理文件上传
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const files = e.target.files;
      if (!files?.length) return;

      const fileArray = Array.from(files);
      const imageFiles: File[] = [];

      const processEntry = async (entry: FileSystemEntry) => {
        if (entry.isFile) {
          const file = await new Promise<File>((resolve) => {
            (entry as FileSystemFileEntry).file(resolve);
          });
          if (file.type.startsWith('image/')) {
            imageFiles.push(file);
          }
        } else if (entry.isDirectory) {
          const reader = (entry as FileSystemDirectoryEntry).createReader();
          const entries = await new Promise<FileSystemEntry[]>((resolve) => {
            reader.readEntries(resolve);
          });
          await Promise.all(entries.map(processEntry));
        }
      };

      await Promise.all(
        fileArray.map(file => {
          const entry = (file as any).webkitGetAsEntry?.();
          if (entry) {
            return processEntry(entry);
          } else {
            if (file.type.startsWith('image/')) {
              imageFiles.push(file);
            }
            return Promise.resolve();
          }
        })
      );

      // 创建新的图片数组
      const newImages = await Promise.all(imageFiles.map(async file => {
        const binaryData = await file.arrayBuffer();
        return {
          id: `img-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          url: URL.createObjectURL(file),
          type: file.type,
          binaryData,
          categoryId: activeCategory === 'all' ? 'uncategorized' : activeCategory,
          isFavorite: false,
          fileName: file.name
        };
      }));

      await addImages(newImages);
    } catch (error) {
      console.error('上传图片失败:', error);
    }
  };

  // 计算列数
  const getColumnCount = () => {
    // 获取当前窗口宽度
    const width = window.innerWidth;

    // md 断点 (768px) 时显示 4 列
    if (width >= 768 && width < 1024) {
      return 6;
    }
    // lg 断点及以上时根据宽度动态计算
    else if (width >= 1024) {
      return Math.floor((width - 256) / 100); // 减去侧边栏宽度
    }
    // sm 及以下显示 2 列
    else if (width >= 524) {
      return 3;
    }
    else {
      return 1
    }
  };

  // 渲染单个图片项
  const renderImageItem = useCallback((image: ImageItem) => (
    <div
      key={image.id}
      className="aspect-square rounded-lg border border-gray-150 bg-base-100 relative overflow-hidden"
    >
      <div className="group/image h-full w-full p-1.5">
        <img
          src={image.url}
          alt="uploaded"
          className="h-full w-full cursor-zoom-in object-contain"
          loading="lazy" // 启用浏览器原生懒加载
        />

        {/* 悬浮操作按钮 */}
        <div className="absolute size-full inset-0 flex items-center justify-center gap-2 
          opacity-0 group-hover/image:bg-gray-100/70 group-hover/image:opacity-100 transition
        "
          onClick={() => setSelectedImage(image.url)}
        >
          <button
            className="btn btn-circle btn-xs btn-ghost"
            onClick={(e) => {
              e.stopPropagation();
              toggleFavorite(image.id);
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`h-3 w-3 ${image.isFavorite ? 'fill-primary' : ''}`}
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
          <button
            className="btn btn-circle btn-xs btn-ghost"
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(image.id);
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-3 w-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  ), [setSelectedImage, toggleFavorite, handleDelete]);

  // 渲染上传按钮
  const renderUploadButton = useCallback(() => (
    <label key={0} className="aspect-square rounded-lg border-2 border-base-200 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors">
      <input
        type="file"
        className="hidden"
        multiple
        onChange={handleUpload}
        // 支持文件夹上传
        {...({ webkitdirectory: "", directory: "" } as any)}
      />
      <div className="flex h-full w-full flex-col items-center justify-center gap-2 p-4">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-8 w-8 text-base-content/50"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1}
            d="M12 4v16m8-8H4"
          />
        </svg>
      </div>
    </label>
  ), [handleUpload]);

  // 合并上传按钮和图片列表
  const allItems = showUpload ? [{ id: 'upload-button', isUploadButton: true }, ...images] : images;

  // 修改渲染项方法
  const renderItem = useCallback((item: any) => {
    if (item.isUploadButton) {
      return renderUploadButton();
    }
    return renderImageItem(item);
  }, [renderImageItem, renderUploadButton]);

  // 添加列数状态
  const [columns, setColumns] = useState(getColumnCount);

  // 监听窗口大小变化
  useEffect(() => {
    const handleResize = () => {
      setColumns(getColumnCount());
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="h-full">
      {/* 标题栏 */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold">
          {isFavoritePage ? 'Favorite Icons' : 'Icons'}
        </h2>
      </div>

      <div className="h-[calc(100%-2rem)]"> {/* 减去标题栏的高度 */}
        <VirtualGrid
          items={allItems}
          renderItem={renderItem}
          columnCount={columns} // 使用状态中的列数
          rowHeight={100} // 与列宽保持一致
          gap={12} // tailwind 的 gap-3 对应的像素值
          overscan={2}
        />
      </div>

      {/* 图片查看器 */}
      {selectedImage && (
        <ImageViewer
          url={selectedImage}
          onClose={() => setSelectedImage(null)}
        />
      )}
    </div>
  );
}
