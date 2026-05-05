import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
})

export interface FolderItem {
  id: number
  parentId: number | null
  name: string
  sortOrder: number
  children?: FolderItem[]
  createdAt: string
}

export interface NoteItem {
  id: number
  folderId: number
  title: string
  createdAt: string
  updatedAt: string
}

export interface NoteDetail {
  id: number
  folderId: number
  title: string
  content: string
  contentJson: string
  createdAt: string
  updatedAt: string
}

// Folders
export const getFolders = () => api.get<FolderItem[]>('/folders').then(r => r.data)
export const createFolder = (name: string, parentId?: number | null) =>
  api.post<FolderItem>('/folders', { name, parentId }).then(r => r.data)
export const updateFolder = (id: number, name: string, parentId?: number | null) =>
  api.put(`/folders/${id}`, { name, parentId })
export const deleteFolder = (id: number) => api.delete(`/folders/${id}`)

// Notes
export const getNotes = (folderId: number) =>
  api.get<NoteItem[]>('/notes', { params: { folderId } }).then(r => r.data)
export const getNote = (id: number) => api.get<NoteDetail>(`/notes/${id}`).then(r => r.data)
export const createNote = (folderId: number, title?: string) =>
  api.post<NoteDetail>('/notes', { folderId, title }).then(r => r.data)
export const updateNote = (id: number, data: { title?: string; content?: string; contentJson?: string }) =>
  api.put<NoteDetail>(`/notes/${id}`, data).then(r => r.data)
export const deleteNote = (id: number) => api.delete(`/notes/${id}`)

// Share
export const createShareLink = (noteId: number) =>
  api.post<{ token: string; url: string }>(`/notes/${noteId}/share`).then(r => r.data)
export const getSharedNote = (token: string) =>
  api.get<NoteDetail>(`/share/${token}`).then(r => r.data)
