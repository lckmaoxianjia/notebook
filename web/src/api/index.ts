import axios from 'axios'
import { ElMessage } from 'element-plus'

// 开发环境走Vite代理 /api → localhost:8080
// 生产环境可通过 VITE_API_BASE_URL 环境变量配置后端地址
const baseURL = import.meta.env.PROD
  ? (import.meta.env.VITE_API_BASE_URL || '/api')
  : '/api'

const api = axios.create({
  baseURL,
  timeout: 10000,
})

api.interceptors.response.use(
  response => response,
  error => {
    const msg = error.response?.data?.message || error.message || '请求失败'
    ElMessage.error(msg)
    return Promise.reject(error)
  }
)

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
