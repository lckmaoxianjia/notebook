import type { FolderItem, NoteItem, NoteDetail } from './index'

const STORAGE_KEY = 'notebook_data'

interface LocalData {
  folders: FolderItem[]
  notes: Record<number, NoteDetail>
  folderNotes: Record<number, number[]>
  nextId: number
}

function load(): LocalData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch {}
  return { folders: [], notes: {}, folderNotes: {}, nextId: 1 }
}

function save(data: LocalData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

function now(): string {
  return new Date().toISOString().replace('T', ' ').slice(0, 19)
}

function buildTree(folders: FolderItem[]): FolderItem[] {
  const map = new Map<number, FolderItem[]>()
  for (const f of folders) {
    const parentId = f.parentId ?? 0
    if (!map.has(parentId)) map.set(parentId, [])
    map.get(parentId)!.push(f)
  }
  const build = (parentId: number): FolderItem[] => {
    const children = map.get(parentId) || []
    return children.sort((a, b) => a.sortOrder - b.sortOrder).map(f => ({
      ...f,
      children: build(f.id),
    }))
  }
  return build(0)
}

// Folder operations
export const localFolders = {
  list(): FolderItem[] {
    const data = load()
    return buildTree(data.folders)
  },

  create(name: string, parentId?: number | null): FolderItem {
    const data = load()
    const folder: FolderItem = {
      id: data.nextId++,
      parentId: parentId ?? null,
      name,
      sortOrder: 0,
      createdAt: now(),
    }
    data.folders.push(folder)
    save(data)
    return folder
  },

  update(id: number, name: string, parentId?: number | null): void {
    const data = load()
    const idx = data.folders.findIndex(f => f.id === id)
    if (idx === -1) return
    data.folders[idx].name = name
    if (parentId !== undefined) data.folders[idx].parentId = parentId
    save(data)
  },

  remove(id: number): void {
    const data = load()
    // Recursively remove children
    const toRemove = new Set<number>([id])
    let changed = true
    while (changed) {
      changed = false
      for (const f of data.folders) {
        if (f.parentId && toRemove.has(f.parentId) && !toRemove.has(f.id)) {
          toRemove.add(f.id)
          changed = true
        }
      }
    }
    data.folders = data.folders.filter(f => !toRemove.has(f.id))
    // Remove notes in those folders
    for (const folderId of toRemove) {
      const noteIds = data.folderNotes[folderId] || []
      for (const noteId of noteIds) delete data.notes[noteId]
      delete data.folderNotes[folderId]
    }
    save(data)
  },
}

// Note operations
export const localNotes = {
  listByFolder(folderId: number): NoteItem[] {
    const data = load()
    const noteIds = data.folderNotes[folderId] || []
    return noteIds
      .map(id => data.notes[id])
      .filter(Boolean)
      .map(n => ({ id: n.id, folderId: n.folderId, title: n.title, createdAt: n.createdAt, updatedAt: n.updatedAt }))
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
  },

  getById(id: number): NoteDetail | null {
    const data = load()
    return data.notes[id] || null
  },

  create(folderId: number, title?: string): NoteDetail {
    const data = load()
    const note: NoteDetail = {
      id: data.nextId++,
      folderId,
      title: title || '无标题',
      content: '',
      contentJson: '',
      createdAt: now(),
      updatedAt: now(),
    }
    data.notes[note.id] = note
    if (!data.folderNotes[folderId]) data.folderNotes[folderId] = []
    data.folderNotes[folderId].push(note.id)
    save(data)
    return note
  },

  update(id: number, changes: { title?: string; content?: string; contentJson?: string }): NoteDetail | null {
    const data = load()
    const note = data.notes[id]
    if (!note) return null
    if (changes.title !== undefined) note.title = changes.title
    if (changes.content !== undefined) note.content = changes.content
    if (changes.contentJson !== undefined) note.contentJson = changes.contentJson
    note.updatedAt = now()
    save(data)
    return note
  },

  remove(id: number): void {
    const data = load()
    const note = data.notes[id]
    if (!note) return
    const folderNotes = data.folderNotes[note.folderId]
    if (folderNotes) {
      data.folderNotes[note.folderId] = folderNotes.filter(nid => nid !== id)
    }
    delete data.notes[id]
    save(data)
  },

  share(_noteId: number): { token: string; url: string } {
    return { token: '', url: '' }
  },
}

export function isBackendAvailable(): boolean {
  return window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
}
