import { useState, useEffect, useRef } from "react";
import { FixedSizeGrid } from 'react-window';
import { useCategoryStore } from "../stores/categoryStore";
import { useImageStore } from "../stores/imageStore";
import { useLocation } from "react-router-dom";
import { ImageViewer } from "../components/ImageViewer";

interface MainProps {
    showUpload?: boolean;
}

export default ({ showUpload }: MainProps) => {
    const location = useLocation();
    const isFavoritePage = location.pathname === '/favorites';
    const { activeCategory } = useCategoryStore();
    const { addImages, getImagesByCategory, getFavoriteImages, toggleFavorite, deleteImage, deleteAllImages } = useImageStore();
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [imageUrls, setImageUrls] = useState<Record<string, string>>({});
    const containerRef = useRef<HTMLDivElement>(null);
    const [gridDimensions, setGridDimensions] = useState({ width: 0, height: 0 });

    // 根据当前页面决定显示哪些图片
    const images = isFavoritePage ? getFavoriteImages() : getImagesByCategory(activeCategory);

    // 处理删除所有图片
    const handleDeleteAll = () => {
        deleteAllImages(isFavoritePage);
    };

    // 处理删除图片
    const handleDelete = (id: string) => {
        deleteImage(id);
    };

    // 处理文件上传
    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files?.length) return;

        // 将 FileList 转换为数组以便处理
        const fileArray = Array.from(files);
        const imageFiles: File[] = [];

        // 递归处理文件夹
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

        // 处理所有文件和文件夹
        await Promise.all(
            fileArray.map(file => {
                // 如果浏览器支持 webkitGetAsEntry
                const entry = (file as any).webkitGetAsEntry?.();
                if (entry) {
                    return processEntry(entry);
                } else {
                    // 降级处理：直接处理文件
                    if (file.type.startsWith('image/')) {
                        imageFiles.push(file);
                    }
                    return Promise.resolve();
                }
            })
        );

        // 创建新的图片数组
        const newImages = imageFiles.map(file => ({
            id: Math.random().toString(36).substring(7),
            url: URL.createObjectURL(file),
            categoryId: activeCategory === 'all' ? 'uncategorized' : activeCategory,
            isFavorite: false
        }));

        addImages(newImages);
    };

    // 加载图片 URL
    useEffect(() => {
        const loadImageUrls = async () => {
            const urls: Record<string, string> = {};
            await Promise.all(
                images.map(async (image) => {
                    try {
                        urls[image.id] = await useImageStore.getState().getImageUrl(image.id);
                    } catch (error) {
                        console.error(`Failed to load image ${image.id}:`, error);
                    }
                })
            );
            setImageUrls(urls);
        };

        loadImageUrls();

        // 清理函数
        return () => {
            Object.values(imageUrls).forEach(URL.revokeObjectURL);
        };
    }, [images]);

    // 计算网格参数
    const ITEM_SIZE = 160; // 每个图片格子的大小
    const GAP_SIZE = 12; // 间距
    const columnCount = Math.max(1, Math.floor((gridDimensions.width + GAP_SIZE) / (ITEM_SIZE + GAP_SIZE)));
    const effectiveItemCount = showUpload ? images.length + 1 : images.length;
    const rowCount = Math.ceil(effectiveItemCount / columnCount);

    // 监听容器大小变化
    useEffect(() => {
        if (!containerRef.current) return;

        const observer = new ResizeObserver((entries) => {
            const { width, height } = entries[0].contentRect;
            setGridDimensions({ width, height });
        });

        observer.observe(containerRef.current);
        return () => observer.disconnect();
    }, []);

    // 渲染单个格子
    const Cell = ({ columnIndex, rowIndex, style }: any) => {
        const index = rowIndex * columnCount + columnIndex;

        // 处理上传按钮格子
        if (index === 0) {
            return (
                <div
                    style={{
                        ...style,
                        left: Number(style.left) + GAP_SIZE / 2,
                        top: Number(style.top) + GAP_SIZE / 2,
                        width: ITEM_SIZE,
                        height: ITEM_SIZE,
                        padding: GAP_SIZE / 2
                    }}
                >
                    <label className="flex h-full w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-base-300 bg-base-200 hover:bg-base-300">
                        <input
                            type="file"
                            className="hidden"
                            multiple
                            onChange={handleUpload}
                            webkitdirectory=""
                            directory=""
                        />
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-6 w-6"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 4v16m8-8H4"
                            />
                        </svg>
                        <span className="mt-2">Upload</span>
                    </label>
                </div>
            );
        }

        // 处理图片格子
        const image = images[showUpload ? index - 1 : index];
        if (!image) return null;

        return (
            <div
                style={{
                    ...style,
                    left: Number(style.left) + GAP_SIZE / 2,
                    top: Number(style.top) + GAP_SIZE / 2,
                    width: ITEM_SIZE,
                    height: ITEM_SIZE,
                    padding: GAP_SIZE / 2
                }}
            >
                <div className="group relative h-full w-full rounded-lg border-2 border-base-300 bg-base-200 p-1.5">
                    {imageUrls[image.id] ? (
                        <img
                            src={imageUrls[image.id]}
                            alt="uploaded"
                            className="h-full w-full cursor-zoom-in object-contain"
                            onClick={() => setSelectedImage(imageUrls[image.id])}
                        />
                    ) : (
                        <div className="flex h-full items-center justify-center">
                            <span className="loading loading-spinner"></span>
                        </div>
                    )}

                    {/* 悬浮操作按钮 */}
                    <div
                        className="absolute inset-0 flex items-center justify-center gap-2 bg-base-100/50 opacity-0 invisible transition-[opacity,visibility] duration-200 group-hover:opacity-100 group-hover:visible"
                        onClick={e => e.stopPropagation()}
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
                            className="btn btn-circle btn-xs btn-ghost hover:btn-error"
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
        );
    };

    return (
        <div className="h-full">
            {/* 标题栏 */}
            <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-semibold">
                    {isFavoritePage ? 'Favorite Icons' : 'Icons'}
                </h2>
                {images.length > 0 && (
                    <button
                        className="btn btn-ghost btn-sm text-error"
                        onClick={handleDeleteAll}
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
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
                        <span className="ml-1">Delete All</span>
                    </button>
                )}
            </div>

            {/* 图片网格 */}
            <div ref={containerRef} className="h-full">
                {gridDimensions.width > 0 && (
                    <FixedSizeGrid
                        columnCount={columnCount}
                        columnWidth={ITEM_SIZE + GAP_SIZE}
                        height={gridDimensions.height}
                        rowCount={rowCount}
                        rowHeight={ITEM_SIZE + GAP_SIZE}
                        width={gridDimensions.width}
                        onItemsRendered={({ visibleRowStartIndex, visibleRowStopIndex }) => {
                            const startIndex = visibleRowStartIndex * columnCount;
                            const stopIndex = (visibleRowStopIndex + 1) * columnCount;

                            // 加载可见区域的图片
                            const visibleImages = images.slice(startIndex, stopIndex);
                            visibleImages.forEach(async (image) => {
                                if (!imageUrls[image.id]) {
                                    try {
                                        const url = await useImageStore.getState().getImageUrl(image.id);
                                        setImageUrls(prev => ({ ...prev, [image.id]: url }));
                                    } catch (error) {
                                        console.error(`Failed to load image ${image.id}:`, error);
                                    }
                                }
                            });
                        }}
                    >
                        {Cell}
                    </FixedSizeGrid>
                )}
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
};
