<template>
  <div class="toolbar" v-if="editor">
    <button
      v-for="(item, index) in toolbarItems"
      :key="index"
      class="toolbar-btn"
      :class="{ active: item.isActive ? item.isActive() : false }"
      @click="item.action"
      :title="item.title"
    >
      <span v-if="item.icon">{{ item.icon }}</span>
      <span v-else>{{ item.label }}</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import type { Editor } from '@tiptap/vue-3'
import { computed } from 'vue'

const props = defineProps<{ editor: Editor | undefined }>()

const toolbarItems = computed(() => {
  const editor = props.editor
  if (!editor) return []

  return [
    {
      label: 'H1',
      title: '一级标题',
      action: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
      isActive: () => editor.isActive('heading', { level: 1 }),
    },
    {
      label: 'H2',
      title: '二级标题',
      action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
      isActive: () => editor.isActive('heading', { level: 2 }),
    },
    {
      label: 'H3',
      title: '三级标题',
      action: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
      isActive: () => editor.isActive('heading', { level: 3 }),
    },
    {
      icon: 'B',
      title: '加粗 (Ctrl+B)',
      action: () => editor.chain().focus().toggleBold().run(),
      isActive: () => editor.isActive('bold'),
    },
    {
      icon: 'I',
      title: '斜体 (Ctrl+I)',
      action: () => editor.chain().focus().toggleItalic().run(),
      isActive: () => editor.isActive('italic'),
    },
    {
      icon: 'U',
      title: '下划线 (Ctrl+U)',
      action: () => editor.chain().focus().toggleUnderline().run(),
      isActive: () => editor.isActive('underline'),
    },
    {
      icon: '~~',
      title: '删除线',
      action: () => editor.chain().focus().toggleStrike().run(),
      isActive: () => editor.isActive('strike'),
    },
    {
      icon: '◆',
      title: '高亮',
      action: () => editor.chain().focus().toggleHighlight().run(),
      isActive: () => editor.isActive('highlight'),
    },
    {
      icon: '"',
      title: '引用',
      action: () => editor.chain().focus().toggleBlockquote().run(),
      isActive: () => editor.isActive('blockquote'),
    },
    {
      icon: '•',
      title: '无序列表',
      action: () => editor.chain().focus().toggleBulletList().run(),
      isActive: () => editor.isActive('bulletList'),
    },
    {
      icon: '1.',
      title: '有序列表',
      action: () => editor.chain().focus().toggleOrderedList().run(),
      isActive: () => editor.isActive('orderedList'),
    },
    {
      icon: '☑',
      title: '任务列表',
      action: () => editor.chain().focus().toggleTaskList().run(),
      isActive: () => editor.isActive('taskList'),
    },
    {
      icon: '</>',
      title: '代码块',
      action: () => editor.chain().focus().toggleCodeBlock().run(),
      isActive: () => editor.isActive('codeBlock'),
    },
    {
      icon: '—',
      title: '分割线',
      action: () => editor.chain().focus().setHorizontalRule().run(),
    },
    {
      icon: '↩',
      title: '撤销',
      action: () => editor.chain().focus().undo().run(),
    },
    {
      icon: '↪',
      title: '重做',
      action: () => editor.chain().focus().redo().run(),
    },
  ]
})
</script>

<style scoped>
.toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 2px;
  padding: 8px 24px;
  border-bottom: 1px solid #f0f0f0;
  background: #fafafa;
}
.toolbar-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: transparent;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
  color: #555;
  font-weight: 500;
}
.toolbar-btn:hover {
  background: #e8e8e8;
}
.toolbar-btn.active {
  background: #e0edff;
  color: #409eff;
}
.toolbar-btn span {
  line-height: 1;
}
</style>
