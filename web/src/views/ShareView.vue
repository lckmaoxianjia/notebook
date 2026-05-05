<template>
  <div class="share-layout">
    <div class="share-header">
      <h2>{{ note?.title }}</h2>
      <span class="share-badge">只读</span>
    </div>
    <div class="share-content" v-if="note?.content" v-html="note.content" />
    <div class="share-empty" v-else-if="!loading && noBackend">
      <p>分享功能需要启动后端服务</p>
    </div>
    <div class="share-empty" v-else-if="!loading">
      <p>文档不存在或链接已失效</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { getSharedNote, type NoteDetail } from '@/api'
import { isBackendAvailable } from '@/api/localStorage'

const route = useRoute()
const note = ref<NoteDetail | null>(null)
const loading = ref(true)
const noBackend = !isBackendAvailable()

onMounted(async () => {
  if (noBackend) {
    loading.value = false
    return
  }
  try {
    note.value = await getSharedNote(route.params.token as string)
  } catch {
    note.value = null
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.share-layout {
  max-width: 800px;
  margin: 0 auto;
  padding: 40px 24px;
}
.share-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding-bottom: 24px;
  border-bottom: 1px solid #eee;
  margin-bottom: 24px;
}
.share-header h2 {
  font-size: 28px;
  flex: 1;
}
.share-badge {
  background: #f0f0f0;
  color: #999;
  padding: 2px 10px;
  border-radius: 4px;
  font-size: 12px;
}
.share-content {
  font-size: 16px;
  line-height: 1.8;
}
.share-content :deep(h1) { font-size: 2em; margin: 0.67em 0; }
.share-content :deep(h2) { font-size: 1.5em; margin: 0.75em 0; }
.share-content :deep(h3) { font-size: 1.17em; margin: 0.83em 0; }
.share-content :deep(p) { margin: 0.5em 0; }
.share-content :deep(ul), .share-content :deep(ol) { padding-left: 1.5em; margin: 0.5em 0; }
.share-content :deep(li) { margin: 0.3em 0; }
.share-content :deep(blockquote) { border-left: 3px solid #ddd; padding-left: 1em; margin: 0.5em 0; color: #666; }
.share-content :deep(pre) { background: #f5f5f5; padding: 12px 16px; border-radius: 4px; overflow-x: auto; }
.share-content :deep(code) { background: #f5f5f5; padding: 2px 6px; border-radius: 3px; }
.share-content :deep(pre code) { background: none; padding: 0; }
.share-content :deep(img) { max-width: 100%; border-radius: 4px; }
.share-content :deep(table) { border-collapse: collapse; width: 100%; }
.share-content :deep(th), .share-content :deep(td) { border: 1px solid #ddd; padding: 8px 12px; }
.share-content :deep(th) { background: #f5f5f5; }
.share-content :deep(a) { color: #409eff; }
.share-empty {
  text-align: center;
  padding: 80px 0;
  color: #ccc;
}
</style>
