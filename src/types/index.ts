export interface ImageItem {
  id: string;
  url: string;
  type?: string;
  binaryData?: ArrayBuffer;
  categoryId: string;
  isFavorite: boolean;
  fileName: string
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  count?: number;
} 
