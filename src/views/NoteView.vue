<script setup>
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import hljs from 'highlight.js/lib/core'
import javascript from 'highlight.js/lib/languages/javascript'
import bash from 'highlight.js/lib/languages/bash'
import sql from 'highlight.js/lib/languages/sql'
import json from 'highlight.js/lib/languages/json'
import yaml from 'highlight.js/lib/languages/yaml'
import dockerfile from 'highlight.js/lib/languages/dockerfile'
import { getNote } from '../notes-manifest'

hljs.registerLanguage('javascript', javascript)
hljs.registerLanguage('bash', bash)
hljs.registerLanguage('sql', sql)
hljs.registerLanguage('json', json)
hljs.registerLanguage('yaml', yaml)
hljs.registerLanguage('dockerfile', dockerfile)

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

// Every note file caps its own top-level wrapper at a fixed reading width
// (e.g. max-width:1100px; margin:0 auto) and centers it, which leaves big
// empty gutters on a wide monitor. Rather than hand-edit each note's CSS
// (different class names, different grid setups per file), we neutralize
// that cap generically on whichever element is the note's outermost
// wrapper: drop the max-width/centering so it fills the pane, and - for
// notes that lay out a fixed sidebar/TOC column plus a fixed-width content
// column via CSS grid - let just the last column grow to fill the rest of
// the space instead of staying capped too.
function stretchToFill() {
  const wrapper = contentRoot.value?.firstElementChild
  if (!wrapper) return

  // Read the ORIGINAL (still-capped) grid track sizes before we touch
  // width/max-width, so a fixed-px sidebar/TOC column is captured as it
  // was authored, not as some already-stretched intermediate value.
  const originalCols = getComputedStyle(wrapper).display.includes('grid')
    ? getComputedStyle(wrapper).gridTemplateColumns.trim().split(/\s+/)
    : null

  wrapper.style.setProperty('max-width', 'none', 'important')
  wrapper.style.setProperty('width', '100%', 'important')
  wrapper.style.setProperty('margin-left', '0', 'important')
  wrapper.style.setProperty('margin-right', '0', 'important')
  wrapper.style.setProperty('box-sizing', 'border-box', 'important')

  if (originalCols && originalCols.length >= 2) {
    // Keep every column except the last one exactly as authored (that's
    // the fixed sidebar/TOC rail); let only the last - the reading column -
    // grow to fill whatever width is now available.
    const stretched = [...originalCols.slice(0, -1), 'minmax(0,1fr)'].join(' ')
    wrapper.style.setProperty('grid-template-columns', stretched, 'important')
  }
}

async function renderNote() {
  applyNote(note.value?.html)
  await nextTick()
  stretchToFill()
  // Web fonts loading in can reflow text and shift intrinsic sizes; run it
  // again once fonts settle so the stretch isn't undone by a later reflow.
  document.fonts?.ready?.then(stretchToFill).catch(() => {})
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
