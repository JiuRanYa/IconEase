export interface ImageItem {
  id: string;
  url: string;
  type?: string;
  binaryData?: ArrayBuffer;
  categoryId: string;
  isFavorite: boolean;
  fileName: string;
  workspaceId: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  count?: number;
  workspaceId: string;
}

export interface Workspace {
  id: string;
  name: string;
  createdAt: number;
}
