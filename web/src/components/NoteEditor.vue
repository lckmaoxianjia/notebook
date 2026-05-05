<template>
  <div class="editor-wrapper" v-if="noteStore.currentNote">
    <div class="editor-header">
      <input
        class="title-input"
        v-model="title"
        placeholder="无标题"
        @input="onTitleChange"
      />
      <div class="header-actions">
        <el-button @click="onShare" :icon="Share" size="small">分享</el-button>
        <span class="save-status" v-if="saving">保存中...</span>
        <span class="save-status" v-else-if="saved">已保存</span>
      </div>
    </div>
    <EditorToolbar :editor="editor" />
    <div class="editor-content">
      <editor-content :editor="editor" />
    </div>

    <el-dialog v-model="shareDialog.visible" title="分享链接" width="480px">
      <div v-if="shareDialog.url" class="share-link-box">
        <el-input v-model="shareDialog.url" readonly />
        <el-button type="primary" @click="copyShareLink">复制链接</el-button>
      </div>
      <div v-else class="share-loading">
        <el-icon class="is-loading"><Loading /></el-icon>
      </div>
    </el-dialog>
  </div>
  <div class="editor-empty" v-else>
    <div class="empty-content">
      <el-icon :size="64" color="#ddd"><Document /></el-icon>
      <p>选择或创建一个笔记</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onBeforeUnmount, nextTick } from 'vue'
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Placeholder from '@tiptap/extension-placeholder'
import Highlight from '@tiptap/extension-highlight'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import Image from '@tiptap/extension-image'
import Table from '@tiptap/extension-table'
import TableRow from '@tiptap/extension-table-row'
import TableCell from '@tiptap/extension-table-cell'
import TableHeader from '@tiptap/extension-table-header'
import Link from '@tiptap/extension-link'
import { useNoteStore } from '@/stores/note'
import { Document, Share, Loading } from '@element-plus/icons-vue'
import { isBackendAvailable } from '@/api/localStorage'
import EditorToolbar from './EditorToolbar.vue'
import { ElMessage } from 'element-plus'

const noteStore = useNoteStore()

const editor = useEditor({
  extensions: [
    StarterKit.configure({
      heading: { levels: [1, 2, 3, 4] },
    }),
    Underline,
    Placeholder.configure({ placeholder: '输入内容，支持 Markdown 语法...' }),
    Highlight,
    TaskList,
    TaskItem.configure({ nested: true }),
    Image,
    Table.configure({ resizable: true }),
    TableRow,
    TableCell,
    TableHeader,
    Link.configure({ openOnClick: false }),
  ],
  onUpdate: () => {
    isDirty.value = true
  },
})

const title = ref('')
const isDirty = ref(false)
const saving = ref(false)
const saved = ref(false)
let saveTimer: ReturnType<typeof setTimeout> | null = null
let titleTimer: ReturnType<typeof setTimeout> | null = null

const shareDialog = ref({ visible: false, url: '' })

watch(() => noteStore.currentNote, (note) => {
  if (!note || !editor.value) return
  title.value = note.title
  isDirty.value = false
  saved.value = false

  if (note.contentJson) {
    try {
      const json = JSON.parse(note.contentJson)
      editor.value.commands.setContent(json)
    } catch {
      editor.value.commands.setContent(note.content || '')
    }
  } else if (note.content) {
    editor.value.commands.setContent(note.content)
  } else {
    editor.value.commands.setContent('')
  }
}, { immediate: true })

function save() {
  if (!noteStore.currentNote || !editor.value) return
  saving.value = true
  saved.value = false
  const html = editor.value.getHTML()
  const json = JSON.stringify(editor.value.getJSON())
  noteStore.update(noteStore.currentNote.id, {
    title: title.value,
    content: html,
    contentJson: json,
  }).then(() => {
    saving.value = false
    saved.value = true
    isDirty.value = false
  })
}

function onTitleChange() {
  if (titleTimer) clearTimeout(titleTimer)
  titleTimer = setTimeout(save, 800)
}

// Auto-save on editor change (debounce 2s)
watch(isDirty, (dirty) => {
  if (!dirty) return
  if (saveTimer) clearTimeout(saveTimer)
  saveTimer = setTimeout(save, 2000)
})

async function onShare() {
  if (!noteStore.currentNote) return
  if (!isBackendAvailable()) {
    ElMessage.warning('分享功能需要启动后端服务')
    return
  }
  shareDialog.value.visible = true
  shareDialog.value.url = ''
  const result = await noteStore.share(noteStore.currentNote.id)
  shareDialog.value.url = window.location.origin + result.url
}

async function copyShareLink() {
  await navigator.clipboard.writeText(shareDialog.value.url)
  ElMessage.success('已复制到剪贴板')
}

onBeforeUnmount(() => {
  if (isDirty.value) save()
  editor.value?.destroy()
})
</script>

<style scoped>
.editor-wrapper {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #fff;
}
.editor-header {
  display: flex;
  align-items: center;
  padding: 16px 24px;
  border-bottom: 1px solid #f0f0f0;
  gap: 16px;
}
.title-input {
  flex: 1;
  border: none;
  outline: none;
  font-size: 24px;
  font-weight: 600;
  line-height: 1.4;
  color: #1a1a1a;
}
.title-input::placeholder {
  color: #ccc;
}
.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}
.save-status {
  font-size: 12px;
  color: #999;
}
.editor-content {
  flex: 1;
  overflow-y: auto;
  padding: 16px 24px;
}
.editor-empty {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
}
.empty-content {
  text-align: center;
  color: #ccc;
}
.empty-content p {
  margin-top: 16px;
  font-size: 14px;
}
.share-link-box {
  display: flex;
  gap: 12px;
}
.share-loading {
  text-align: center;
  padding: 24px;
}
</style>

<style>
/* Tiptap editor styles */
.tiptap {
  outline: none;
  min-height: 400px;
  max-width: 800px;
  margin: 0 auto;
}
.tiptap p.is-editor-empty:first-child::before {
  content: attr(data-placeholder);
  float: left;
  color: #adb5bd;
  pointer-events: none;
  height: 0;
}
.tiptap h1 { font-size: 2em; margin: 0.67em 0; }
.tiptap h2 { font-size: 1.5em; margin: 0.75em 0; }
.tiptap h3 { font-size: 1.17em; margin: 0.83em 0; }
.tiptap h4 { font-size: 1em; margin: 1em 0; }
.tiptap p { margin: 0.5em 0; line-height: 1.7; }
.tiptap ul, .tiptap ol { padding-left: 1.5em; margin: 0.5em 0; }
.tiptap li { margin: 0.3em 0; }
.tiptap blockquote {
  border-left: 3px solid #ddd;
  padding-left: 1em;
  margin: 0.5em 0;
  color: #666;
}
.tiptap pre {
  background: #f5f5f5;
  padding: 12px 16px;
  border-radius: 4px;
  font-family: 'Fira Code', 'Consolas', monospace;
  font-size: 0.9em;
  overflow-x: auto;
}
.tiptap code {
  background: #f5f5f5;
  padding: 2px 6px;
  border-radius: 3px;
  font-family: 'Fira Code', 'Consolas', monospace;
  font-size: 0.9em;
}
.tiptap pre code {
  background: none;
  padding: 0;
}
.tiptap img {
  max-width: 100%;
  border-radius: 4px;
}
.tiptap table {
  border-collapse: collapse;
  width: 100%;
  margin: 0.5em 0;
}
.tiptap th, .tiptap td {
  border: 1px solid #ddd;
  padding: 8px 12px;
  text-align: left;
}
.tiptap th {
  background: #f5f5f5;
  font-weight: 600;
}
.tiptap hr {
  border: none;
  border-top: 1px solid #eee;
  margin: 1em 0;
}
.tiptap ul[data-type="taskList"] {
  list-style: none;
  padding-left: 0;
}
.tiptap ul[data-type="taskList"] li {
  display: flex;
  align-items: flex-start;
  gap: 8px;
}
.tiptap ul[data-type="taskList"] li label {
  margin-top: 2px;
}
.tiptap mark {
  background: #fef08a;
  padding: 0 2px;
}
.tiptap a {
  color: #409eff;
  text-decoration: underline;
}
</style>
