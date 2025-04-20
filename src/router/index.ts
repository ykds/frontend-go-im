import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '@/views/LoginView.vue'
import FriendView from '@/views/FriendView.vue'
import ChatView from '@/views/ChatView.vue'
import GroupView from '@/views/GroupView.vue'
import ProfileView from '@/views/ProfileView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: LoginView
    },
    {
      path: '/friend',
      name: 'friend',
      component: FriendView
    },
    {
      path: '/group',
      name: 'group',
      component: GroupView
    },
    {
      path: '/chat',
      name: 'chat',
      component: ChatView
    },
    {
      path: '/chat/:id',
      name: 'chat-detail',
      component: ChatView,
      props: route => ({
        id: route.params.id,
        ...route.query
      })
    },
    {
      path: '/profile',
      name: 'profile',
      component: ProfileView
    }
  ]
})

export default router
