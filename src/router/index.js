import { createRouter, createWebHashHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import NoteView from '../views/NoteView.vue'

const router = createRouter({
  // Hash history needs zero server config, so it deploys on Vercel (or any
  // static host) with no rewrite rules required.
  history: createWebHashHistory(),
  routes: [
    { path: '/', name: 'home', component: HomeView },
    {
      path: '/notes/:folder/:file',
      name: 'note',
      component: NoteView,
      props: true,
    },
  ],
})

export default router
