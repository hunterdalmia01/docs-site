import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import NoteView from '../views/NoteView.vue'

const router = createRouter({
  // Path-based history (no #) so the URL hash stays free for the notes'
  // own internal "jump to section" links (e.g. href="#s13"). With hash
  // history those links collided with routing itself - clicking one
  // replaced the whole hash and made the router try to navigate to a
  // route called "/s13", landing on a blank page. Requires a static-host
  // rewrite (all paths -> index.html), added in vercel.json.
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'home', component: HomeView },
    {
      path: '/notes/:folder/:file',
      name: 'note',
      component: NoteView,
      props: true,
    },
  ],
  scrollBehavior(to) {
    if (to.hash) {
      return { el: to.hash, behavior: 'smooth' }
    }
    return { top: 0 }
  },
})

export default router
