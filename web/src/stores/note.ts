import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getNotes, getNote, createNote, updateNote, deleteNote, createShareLink, type NoteItem, type NoteDetail } from '@/api'

export const useNoteStore = defineStore('note', () => {
  const notes = ref<NoteItem[]>([])
  const currentNote = ref<NoteDetail | null>(null)
  const loading = ref(false)

  async function fetchList(folderId: number) {
    loading.value = true
    try {
      notes.value = await getNotes(folderId)
    } finally {
      loading.value = false
    }
  }

  async function fetchDetail(id: number) {
    currentNote.value = await getNote(id)
  }

  async function create(folderId: number, title?: string) {
    const note = await createNote(folderId, title)
    return note
  }

  async function update(id: number, data: { title?: string; content?: string; contentJson?: string }) {
    const note = await updateNote(id, data)
    currentNote.value = note
    return note
  }

  async function remove(id: number) {
    await deleteNote(id)
    currentNote.value = null
  }

  async function share(noteId: number) {
    return await createShareLink(noteId)
  }

  return { notes, currentNote, loading, fetchList, fetchDetail, create, update, remove, share }
})
