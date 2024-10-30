export interface ImageItem {
    id: string;
    url: string;
    categoryId: string;
    isFavorite: boolean
}

export interface Category {
    id: string;
    name: string;
    icon: string;
    count?: number;
} 
