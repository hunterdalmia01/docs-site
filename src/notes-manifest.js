// Auto-builds the sidebar tree + note lookup from every .html file under
// src/content/notes/<Folder>/<file>.html. Drop a new folder/file in there
// and it shows up automatically next time the site builds.

const rawModules = import.meta.glob('./content/notes/**/*.html', {
  query: '?raw',
  import: 'default',
  eager: true,
})

function prettify(name) {
  return name
    .replace(/\.[^/.]+$/, '') // strip extension
    .replace(/[-_]+/g, ' ')
    .trim()
    .replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
}

function slugify(name) {
  return name
    .replace(/\.[^/.]+$/, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

const notesByKey = {}
const folders = {}

for (const path in rawModules) {
  // path looks like "./content/notes/ExpressJS/crud-api-notes.html"
  const parts = path.replace('./content/notes/', '').split('/')
  const folderName = parts[0]
  const fileName = parts[1]
  const folderSlug = slugify(folderName)
  const fileSlug = slugify(fileName)
  const key = `${folderSlug}/${fileSlug}`

  notesByKey[key] = {
    key,
    html: rawModules[path],
    title: prettify(fileName),
    folderTitle: prettify(folderName),
  }

  if (!folders[folderSlug]) {
    folders[folderSlug] = {
      slug: folderSlug,
      title: prettify(folderName),
      notes: [],
    }
  }
  folders[folderSlug].notes.push({
    slug: fileSlug,
    title: prettify(fileName),
    key,
  })
}

// Sort folders and notes alphabetically by title for a stable sidebar.
export const noteTree = Object.values(folders)
  .sort((a, b) => a.title.localeCompare(b.title))
  .map((folder) => ({
    ...folder,
    notes: folder.notes.sort((a, b) => a.title.localeCompare(b.title)),
  }))

export function getNote(folderSlug, fileSlug) {
  return notesByKey[`${folderSlug}/${fileSlug}`]
}

export const firstNote = noteTree[0]?.notes[0]
  ? { folder: noteTree[0].slug, file: noteTree[0].notes[0].slug }
  : null
