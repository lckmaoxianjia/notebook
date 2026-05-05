import { createRouter, createWebHashHistory } from 'vue-router'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/HomeView.vue'),
    },
    {
      path: '/folder/:folderId',
      name: 'folder',
      component: () => import('@/views/HomeView.vue'),
    },
    {
      path: '/note/:noteId',
      name: 'note',
      component: () => import('@/views/HomeView.vue'),
    },
    {
      path: '/share/:token',
      name: 'share',
      component: () => import('@/views/ShareView.vue'),
    },
  ],
})

export default router
