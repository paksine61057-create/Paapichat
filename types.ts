export type FileType = 'PDF' | 'DOCX' | 'IMAGE' | 'VIDEO' | 'LINK';

export interface PAUpload {
  id: string;
  indicator: string; // The ID of the menu item (e.g., 'd1-1')
  fileUrl: string;
  fileType: FileType;
  uploadDate: string;
  caption: string;
  thumbnailUrl?: string; // For images/videos
}

export interface MenuItem {
  id: string;
  title: string;
  description?: string;
  subItems?: MenuItem[];
  isHeader?: boolean;
}

export interface SheetData {
  metadata: any[];
  uploads: PAUpload[];
  publish: any[];
}