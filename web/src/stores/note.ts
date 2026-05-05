import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getNotes, getNote, createNote, updateNote, deleteNote, createShareLink, type NoteItem, type NoteDetail } from '@/api'
import { localNotes, isBackendAvailable } from '@/api/localStorage'

export const useNoteStore = defineStore('note', () => {
  const notes = ref<NoteItem[]>([])
  const currentNote = ref<NoteDetail | null>(null)
  const loading = ref(false)
  const useLocal = !isBackendAvailable()

  async function fetchList(folderId: number) {
    loading.value = true
    try {
      if (useLocal) {
        notes.value = localNotes.listByFolder(folderId)
      } else {
        notes.value = await getNotes(folderId)
      }
    } finally {
      loading.value = false
    }
  }

  async function fetchDetail(id: number) {
    if (useLocal) {
      currentNote.value = localNotes.getById(id)
    } else {
      currentNote.value = await getNote(id)
    }
  }

  async function create(folderId: number, title?: string) {
    let note: NoteDetail
    if (useLocal) {
      note = localNotes.create(folderId, title)
    } else {
      note = await createNote(folderId, title)
    }
    return note
  }

  async function update(id: number, data: { title?: string; content?: string; contentJson?: string }) {
    let note: NoteDetail | null
    if (useLocal) {
      note = localNotes.update(id, data)
    } else {
      note = await updateNote(id, data)
    }
    if (note) currentNote.value = note
    return note
  }

  async function remove(id: number) {
    if (useLocal) {
      localNotes.remove(id)
    } else {
      await deleteNote(id)
    }
    currentNote.value = null
  }

  async function share(noteId: number) {
    if (useLocal) {
      return localNotes.share(noteId)
    }
    return await createShareLink(noteId)
  }

  return { notes, currentNote, loading, fetchList, fetchDetail, create, update, remove, share }
})
