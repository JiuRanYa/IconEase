import { useState } from "react";
import { useCategoryStore } from "../stores/categoryStore";
import { useImageStore } from "../stores/imageStore";

export default () => {
  const { activeCategory } = useCategoryStore();
  const { addImages, getImagesByCategory, toggleFavorite } = useImageStore();

  const images = getImagesByCategory(activeCategory);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;

    const newImages = Array.from(files).map(file => ({
      id: Math.random().toString(36).substring(7),
      url: URL.createObjectURL(file),
      categoryId: activeCategory === 'all' ? 'uncategorized' : activeCategory,
      isFavorite: false
    }));

    addImages(newImages);
  };

  return (
    <div>
      <h2 className="mb-4 text-xl font-semibold">Icons</h2>

      <div className="grid grid-cols-4 gap-3 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-12">
        {/* 上传按钮 */}
        <div className="aspect-square rounded-lg border-2 border-dashed border-base-300 hover:border-primary hover:bg-base-200">
          <label className="flex h-full w-full cursor-pointer items-center justify-center">
            <input
              type="file"
              className="hidden"
              accept="image/*"
              multiple
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
                  className="btn btn-circle btn-xs btn-ghost"
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
