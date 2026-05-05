<template>
  <div class="home-layout">
    <Sidebar />
    <main class="main-content">
      <NoteEditor />
    </main>
  </div>
</template>

<script setup lang="ts">
import Sidebar from '@/components/Sidebar.vue'
import NoteEditor from '@/components/NoteEditor.vue'
</script>

<style scoped>
.home-layout {
  display: flex;
  height: 100vh;
  overflow: hidden;
}
.main-content {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
</style>
