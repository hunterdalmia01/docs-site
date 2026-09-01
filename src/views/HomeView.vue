<script setup>
import { noteTree } from '../notes-manifest'
</script>

<template>
  <div class="home">
    <h1>Your notes</h1>
    <p class="lede">Pick a topic from the sidebar, or jump in from here.</p>
    <div class="grid">
      <section v-for="folder in noteTree" :key="folder.slug" class="folder-card">
        <h2>{{ folder.title }}</h2>
        <ul>
          <li v-for="n in folder.notes" :key="n.key">
            <router-link :to="`/notes/${folder.slug}/${n.slug}`">{{ n.title }}</router-link>
          </li>
        </ul>
      </section>
    </div>
  </div>
</template>

<style scoped>
.home {
  padding: 2.5rem 3rem;
  font-family: system-ui, -apple-system, sans-serif;
  color: #1c1c1f;
  width: 100%;
  box-sizing: border-box;
}
h1 {
  margin: 0 0 0.25rem;
  font-size: 1.9rem;
}
.lede {
  color: #666;
  margin: 0 0 2rem;
}
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 1.25rem;
}
.folder-card {
  border: 1px solid #e4e4e8;
  border-radius: 10px;
  padding: 1rem 1.25rem;
  background: #fafafc;
}
.folder-card h2 {
  font-size: 1rem;
  margin: 0 0 0.6rem;
  color: #333;
}
.folder-card ul {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}
.folder-card a {
  color: #3457d5;
  text-decoration: none;
  font-size: 0.92rem;
}
.folder-card a:hover {
  text-decoration: underline;
}
</style>
