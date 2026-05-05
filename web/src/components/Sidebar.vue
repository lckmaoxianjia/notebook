<template>
  <div class="sidebar">
    <div class="sidebar-header">
      <h3>Notebook</h3>
    </div>
    <div class="folder-section">
      <div class="section-title">
        <span>目录</span>
        <el-button :icon="Plus" size="small" text @click="addRootFolder" />
      </div>
      <el-tree
        :data="folderStore.folders"
        :props="{ children: 'children', label: 'name' }"
        node-key="id"
        :expand-on-click-node="false"
        highlight-current
        @node-click="onFolderClick"
        default-expand-all
      >
        <template #default="{ node, data }">
          <div class="tree-node" @contextmenu.prevent="showContextMenu($event, data)">
            <el-icon><Folder /></el-icon>
            <span class="tree-label">{{ data.name }}</span>
            <span class="tree-actions" @click.stop>
              <el-button :icon="Plus" size="small" text @click="addSubFolder(data)" />
            </span>
          </div>
        </template>
      </el-tree>
    </div>
    <div v-if="selectedFolderId" class="note-section">
      <div class="section-title">
        <span>笔记</span>
        <el-button :icon="Plus" size="small" text @click="createNewNote" />
      </div>
      <div class="note-list">
        <div
          v-for="note in noteStore.notes"
          :key="note.id"
          class="note-item"
          :class="{ active: currentNoteId === note.id }"
          @click="selectNote(note.id)"
        >
          <el-icon><Document /></el-icon>
          <span class="note-title">{{ note.title }}</span>
          <span class="note-actions" @click.stop>
            <el-button :icon="Delete" size="small" text @click="deleteNoteItem(note.id)" />
          </span>
        </div>
        <div v-if="!noteStore.notes.length" class="empty-hint">暂无笔记</div>
      </div>
    </div>

    <!-- Context menu -->
    <div v-if="contextMenu.visible" class="context-menu" :style="{ top: contextMenu.y + 'px', left: contextMenu.x + 'px' }">
      <div class="context-item" @click="renameFolder">重命名</div>
      <div class="context-item danger" @click="deleteFolderItem">删除</div>
    </div>

    <!-- Dialogs -->
    <el-dialog v-model="dialog.visible" :title="dialog.title" width="400px" @close="dialog.visible = false">
      <el-input v-model="dialog.name" placeholder="名称" @keyup.enter="confirmDialog" />
      <template #footer>
        <el-button @click="dialog.visible = false">取消</el-button>
        <el-button type="primary" @click="confirmDialog">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Folder, Document, Plus, Delete } from '@element-plus/icons-vue'
import { useFolderStore } from '@/stores/folder'
import { useNoteStore } from '@/stores/note'
import type { FolderItem } from '@/api'

const router = useRouter()
const route = useRoute()
const folderStore = useFolderStore()
const noteStore = useNoteStore()

const selectedFolderId = ref<number | null>(null)
const currentNoteId = ref<number | null>(null)

const contextMenu = reactive({ visible: false, x: 0, y: 0, folder: null as FolderItem | null })
const dialog = reactive({ visible: false, title: '', name: '', action: null as (() => Promise<void>) | null })

folderStore.fetch()

function onFolderClick(data: FolderItem) {
  selectedFolderId.value = data.id
  noteStore.fetchList(data.id)
  router.push(`/folder/${data.id}`)
}

function selectNote(id: number) {
  currentNoteId.value = id
  noteStore.fetchDetail(id)
  router.push(`/note/${id}`)
}

async function createNewNote() {
  if (!selectedFolderId.value) return
  const note = await noteStore.create(selectedFolderId.value, '无标题')
  await noteStore.fetchList(selectedFolderId.value)
  selectNote(note.id)
}

async function deleteNoteItem(id: number) {
  await noteStore.remove(id)
  if (selectedFolderId.value) await noteStore.fetchList(selectedFolderId.value)
  if (currentNoteId.value === id) currentNoteId.value = null
}

function showContextMenu(e: MouseEvent, folder: FolderItem) {
  contextMenu.visible = true
  contextMenu.x = e.clientX
  contextMenu.y = e.clientY
  contextMenu.folder = folder
}

function hideContextMenu() {
  contextMenu.visible = false
}

document.addEventListener('click', hideContextMenu)

function addRootFolder() {
  dialog.title = '新建目录'
  dialog.name = ''
  dialog.action = async () => {
    await folderStore.create(dialog.name, null)
  }
  dialog.visible = true
}

function addSubFolder(parent: FolderItem) {
  dialog.title = '新建子目录'
  dialog.name = ''
  dialog.action = async () => {
    await folderStore.create(dialog.name, parent.id)
  }
  dialog.visible = true
}

function renameFolder() {
  if (!contextMenu.folder) return
  dialog.title = '重命名'
  dialog.name = contextMenu.folder.name
  dialog.action = async () => {
    await folderStore.update(contextMenu.folder!.id, dialog.name, contextMenu.folder!.parentId)
  }
  dialog.visible = true
  contextMenu.visible = false
}

async function deleteFolderItem() {
  if (!contextMenu.folder) return
  await folderStore.remove(contextMenu.folder.id)
  if (selectedFolderId.value === contextMenu.folder.id) {
    selectedFolderId.value = null
    noteStore.notes = []
  }
  contextMenu.visible = false
}

function confirmDialog() {
  if (dialog.action) dialog.action()
  dialog.visible = false
}

// Watch route to restore state (immediate for direct URL entry)
watch(() => route.params.folderId, async (id) => {
  if (id) {
    selectedFolderId.value = Number(id)
    await noteStore.fetchList(Number(id))
  }
}, { immediate: true })

watch(() => route.params.noteId, async (id) => {
  if (id) {
    currentNoteId.value = Number(id)
    await noteStore.fetchDetail(Number(id))
  }
}, { immediate: true })
</script>

<style scoped>
.sidebar {
  width: 280px;
  height: 100%;
  background: #fff;
  border-right: 1px solid #e5e6e8;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.sidebar-header {
  padding: 16px 16px 12px;
  border-bottom: 1px solid #f0f0f0;
}
.sidebar-header h3 {
  font-size: 16px;
  font-weight: 600;
}
.folder-section, .note-section {
  flex: 1;
  overflow-y: auto;
  padding: 8px 0;
}
.note-section {
  border-top: 1px solid #f0f0f0;
}
.section-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 4px 16px;
  font-size: 12px;
  color: #999;
  font-weight: 500;
}
.tree-node {
  display: flex;
  align-items: center;
  gap: 6px;
  flex: 1;
  padding: 2px 0;
}
.tree-label {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.tree-actions {
  display: none;
}
.tree-node:hover .tree-actions {
  display: inline-flex;
}
.note-list {
  padding: 4px 0;
}
.note-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  cursor: pointer;
  font-size: 14px;
}
.note-item:hover, .note-item.active {
  background: #f0f5ff;
}
.note-item.active {
  color: #409eff;
}
.note-title {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.note-actions {
  display: none;
}
.note-item:hover .note-actions {
  display: inline-flex;
}
.empty-hint {
  padding: 16px;
  text-align: center;
  color: #ccc;
  font-size: 13px;
}
.context-menu {
  position: fixed;
  background: #fff;
  border: 1px solid #e5e6e8;
  border-radius: 4px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.1);
  z-index: 999;
  padding: 4px 0;
  min-width: 120px;
}
.context-item {
  padding: 8px 16px;
  cursor: pointer;
  font-size: 13px;
}
.context-item:hover {
  background: #f5f5f5;
}
.context-item.danger {
  color: #f56c6c;
}
</style>
