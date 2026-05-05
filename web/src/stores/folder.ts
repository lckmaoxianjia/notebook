import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getFolders, createFolder, updateFolder, deleteFolder, type FolderItem } from '@/api'
import { localFolders, isBackendAvailable } from '@/api/localStorage'

export const useFolderStore = defineStore('folder', () => {
  const folders = ref<FolderItem[]>([])
  const loading = ref(false)
  const useLocal = !isBackendAvailable()

  async function fetch() {
    loading.value = true
    try {
      if (useLocal) {
        folders.value = localFolders.list()
      } else {
        folders.value = await getFolders()
      }
    } finally {
      loading.value = false
    }
  }

  async function create(name: string, parentId?: number | null) {
    if (useLocal) {
      localFolders.create(name, parentId)
    } else {
      await createFolder(name, parentId)
    }
    await fetch()
  }

  async function update(id: number, name: string, parentId?: number | null) {
    if (useLocal) {
      localFolders.update(id, name, parentId)
    } else {
      await updateFolder(id, name, parentId)
    }
    await fetch()
  }

  async function remove(id: number) {
    if (useLocal) {
      localFolders.remove(id)
    } else {
      await deleteFolder(id)
    }
    await fetch()
  }

  return { folders, loading, fetch, create, update, remove }
})
