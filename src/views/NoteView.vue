<script setup>
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import hljs from 'highlight.js/lib/core'
import javascript from 'highlight.js/lib/languages/javascript'
import bash from 'highlight.js/lib/languages/bash'
import sql from 'highlight.js/lib/languages/sql'
import json from 'highlight.js/lib/languages/json'
import yaml from 'highlight.js/lib/languages/yaml'
import dockerfile from 'highlight.js/lib/languages/dockerfile'

hljs.registerLanguage('javascript', javascript)
hljs.registerLanguage('bash', bash)
hljs.registerLanguage('sql', sql)
hljs.registerLanguage('json', json)
hljs.registerLanguage('yaml', yaml)
hljs.registerLanguage('dockerfile', dockerfile)
import { getNote } from '../notes-manifest'

const props = defineProps({
  folder: { type: String, required: true },
  file: { type: String, required: true },
})

const contentRoot = ref(null)
let injectedStyle = null
const injectedLinks = []

function clearInjected() {
  if (injectedStyle) {
    injectedStyle.remove()
    injectedStyle = null
  }
  while (injectedLinks.length) {
    injectedLinks.pop().remove()
  }
}

// Full note HTML files carry their own <style> blocks and (for one note)
// external font <link> tags. Since only one note is ever shown at a time,
// we inject that note's style/link tags into <head> on mount and swap them
// out on the next note instead of trying to scope everything with CSS
// modules - this keeps each note pixel-identical to its original file.
function applyNote(html) {
  clearInjected()
  if (!html) return

  const styleBlocks = [...html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)].map((m) => m[1])
  if (styleBlocks.length) {
    const styleEl = document.createElement('style')
    styleEl.setAttribute('data-note-style', '')
    styleEl.textContent = styleBlocks.join('\n')
    document.head.appendChild(styleEl)
    injectedStyle = styleEl
  }

  const linkHrefs = [...html.matchAll(/<link[^>]*rel=["']stylesheet["'][^>]*>/gi)]
    .map((m) => m[0].match(/href=["']([^"']+)["']/i))
    .filter(Boolean)
    .map((m) => m[1])
  for (const href of linkHrefs) {
    const linkEl = document.createElement('link')
    linkEl.rel = 'stylesheet'
    linkEl.href = href
    linkEl.setAttribute('data-note-style', '')
    document.head.appendChild(linkEl)
    injectedLinks.push(linkEl)
  }
}

const note = computed(() => getNote(props.folder, props.file))

const bodyHtml = computed(() => {
  const html = note.value?.html
  if (!html) return ''
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i)
  let body = bodyMatch ? bodyMatch[1] : html
  body = body
    .replace(/<title[^>]*>[\s\S]*?<\/title>/gi, '')
    .replace(/<meta[^>]*>/gi, '')
    .replace(/<link[^>]*>/gi, '')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .trim()
  return body
})

async function renderNote() {
  applyNote(note.value?.html)
  await nextTick()
  contentRoot.value?.querySelectorAll('pre code').forEach((block) => {
    hljs.highlightElement(block)
  })
}

watch(() => [props.folder, props.file], renderNote, { immediate: true })
onBeforeUnmount(clearInjected)
</script>

<template>
  <article v-if="note" class="note-content" ref="contentRoot" v-html="bodyHtml"></article>
  <div v-else class="note-missing">
    <h2>Note not found</h2>
    <p>There's no note at <code>{{ folder }}/{{ file }}</code>.</p>
  </div>
</template>

<style scoped>
.note-content {
  height: 100%;
  overflow: auto;
}
.note-missing {
  padding: 3rem;
  font-family: system-ui, sans-serif;
  color: #444;
}
</style>
