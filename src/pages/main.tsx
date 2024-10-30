import { useState } from "react";
import { useCategoryStore } from "../stores/categoryStore";
import { useImageStore } from "../stores/imageStore";
import { useLocation } from "react-router-dom";

interface MainProps {
    showUpload?: boolean;
}

export default ({ showUpload }: MainProps) => {
    const location = useLocation();
    const isFavoritePage = location.pathname === '/favorites';
    const { activeCategory } = useCategoryStore();
    const { addImages, getImagesByCategory, getFavoriteImages, toggleFavorite, deleteImage, deleteAllImages } = useImageStore();

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

    return (
        <div>
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

            <div className="grid grid-cols-4 gap-3 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-12">
                {/* 上传按钮 - 只在非收藏页面显示 */}
                {!isFavoritePage && (
                    <div className="aspect-square rounded-lg border-2 border-dashed border-base-300 hover:border-primary hover:bg-base-200">
                        <label className="flex h-full w-full cursor-pointer items-center justify-center">
                            <input
                                type="file"
                                className="hidden"
                                accept="image/*"
                                multiple
                                webkitdirectory=""
                                directory=""
                                onChange={handleUpload}
                            />
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-6 w-6 text-base-content/50"
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
                        </label>
                    </div>
                )}

                {/* 图片网格 */}
                {images.map((image) => (
                    <div
                        key={image.id}
                        className="aspect-square rounded-lg border-2 border-base-300 bg-base-200"
                    >
                        <div className="group relative h-full w-full p-1.5">
                            <img
                                src={image.url}
                                alt="uploaded"
                                className="h-full w-full object-contain"
                            />

                            {/* 悬浮操作按钮 */}
                            <div className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 bg-base-100/50 group-hover:opacity-100 transition-opacity">
                                <button
                                    className="btn btn-circle btn-xs btn-ghost"
                                    onClick={() => toggleFavorite(image.id)}
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
                                    onClick={() => handleDelete(image.id)}
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
                ))}
            </div>
        </div>
    );
};
