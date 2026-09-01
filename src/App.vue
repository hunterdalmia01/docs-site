<script setup>
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import { noteTree } from './notes-manifest'

const route = useRoute()
const openFolders = ref(new Set(noteTree.map((f) => f.slug)))

function toggleFolder(slug) {
  const next = new Set(openFolders.value)
  next.has(slug) ? next.delete(slug) : next.add(slug)
  openFolders.value = next
}

function isActive(folderSlug, fileSlug) {
  return route.params.folder === folderSlug && route.params.file === fileSlug
}
</script>

<template>
  <div class="shell">
    <aside class="sidebar">
      <router-link to="/" class="brand">📓 My Notes</router-link>
      <nav>
        <div v-for="folder in noteTree" :key="folder.slug" class="folder">
          <button class="folder-toggle" @click="toggleFolder(folder.slug)">
            <span class="chevron" :class="{ open: openFolders.has(folder.slug) }">▸</span>
            {{ folder.title }}
          </button>
          <ul v-show="openFolders.has(folder.slug)">
            <li v-for="n in folder.notes" :key="n.key">
              <router-link
                :to="`/notes/${folder.slug}/${n.slug}`"
                :class="{ active: isActive(folder.slug, n.slug) }"
              >
                {{ n.title }}
              </router-link>
            </li>
          </ul>
        </div>
      </nav>
    </aside>
    <main class="content">
      <router-view />
    </main>
  </div>
</template>

<style scoped>
.shell {
  display: flex;
  min-height: 100vh;
}
.sidebar {
  width: 260px;
  flex-shrink: 0;
  background: #16161a;
  color: #d8d8de;
  padding: 1.25rem 0.9rem;
  box-sizing: border-box;
  height: 100vh;
  position: sticky;
  top: 0;
  overflow-y: auto;
  font-family: system-ui, -apple-system, sans-serif;
}
.brand {
  display: block;
  color: #fff;
  text-decoration: none;
  font-weight: 600;
  font-size: 1.05rem;
  padding: 0.4rem 0.5rem 1.1rem;
}
.folder-toggle {
  width: 100%;
  text-align: left;
  background: none;
  border: none;
  color: #d8d8de;
  font-size: 0.86rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  padding: 0.5rem 0.5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  border-radius: 6px;
}
.folder-toggle:hover {
  background: #232328;
}
.chevron {
  display: inline-block;
  transition: transform 0.15s ease;
  font-size: 0.75rem;
  color: #888;
}
.chevron.open {
  transform: rotate(90deg);
}
.folder ul {
  list-style: none;
  margin: 0.2rem 0 0.6rem;
  padding: 0 0 0 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}
.folder a {
  display: block;
  color: #b7b7c0;
  text-decoration: none;
  font-size: 0.86rem;
  padding: 0.35rem 0.5rem;
  border-radius: 6px;
}
.folder a:hover {
  background: #232328;
  color: #fff;
}
.folder a.active {
  background: #3457d5;
  color: #fff;
}
.content {
  flex: 1;
  min-width: 0;
  height: 100vh;
  overflow-y: auto;
  background: #fff;
}
</style>
