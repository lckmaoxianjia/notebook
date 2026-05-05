import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getFolders, createFolder, updateFolder, deleteFolder, type FolderItem } from '@/api'

export const useFolderStore = defineStore('folder', () => {
  const folders = ref<FolderItem[]>([])
  const loading = ref(false)

  async function fetch() {
    loading.value = true
    try {
      folders.value = await getFolders()
    } finally {
      loading.value = false
    }
  }

  async function create(name: string, parentId?: number | null) {
    await createFolder(name, parentId)
    await fetch()
  }

  async function update(id: number, name: string, parentId?: number | null) {
    await updateFolder(id, name, parentId)
    await fetch()
  }

  async function remove(id: number) {
    await deleteFolder(id)
    await fetch()
  }

  return { folders, loading, fetch, create, update, remove }
})
