export type NoteSourceType = 'manual' | 'pdf' | 'word' | 'text';

export interface ParsedDocument {
  text: string;
  fileName: string;
  sourceType: NoteSourceType;
}

export interface SummaryResult {
  summary: string;
  bulletPoints: string[];
}

export interface Note {
  id: string;
  title: string;
  originalText: string;
  summary: string;
  bulletPoints: string[];
  content: string;
  userId: string;
  folderId?: string;
  sourceType: NoteSourceType;
  fileName?: string;
  isPinned: boolean;
  isFavorite: boolean;
  color?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Folder {
  id: string;
  name: string;
  color?: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Tag {
  id: string;
  name: string;
  color?: string;
  createdAt: Date;
}

export interface SharedNote {
  id: string;
  noteId: string;
  userId: string;
  shareToken: string;
  isPublic: boolean;
  canEdit: boolean;
  createdAt: Date;
  expiresAt?: Date;
}

export interface User {
  id: string;
  email: string;
  name?: string;
  image?: string;
  createdAt: Date;
  updatedAt: Date;
}
