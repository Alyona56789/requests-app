import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Projects',
    component: () => import('../views/ProjectsView.vue')
  },
  {
    path: '/project/:id',
    name: 'ProjectDetail',
    component: () => import('../views/ProjectDetailView.vue')
  },
  {
    path: '/request/:id',
    name: 'RequestDetail',
    component: () => import('../views/RequestDetailView.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router