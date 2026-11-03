import { useEffect, useRef, useState } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import SEOHead from '../components/SEOHead'
import { AboutContent, ExperienceContent, ProjectsContent, HonorsContent, ElsewhereContent, ContactContent } from './NotesContent'
import './Notes.css'

const notes = [
  { id: 'about', title: 'About me', preview: 'I build intuitive software, AI agents, and robots.', folder: 'Personal', pinned: true, Content: AboutContent },
  { id: 'experience', title: 'Experience', preview: 'Co-founder & CTO @ Neocast', folder: 'Work', Content: ExperienceContent },
  { id: 'projects', title: 'Projects', preview: 'Fern / TalkR, Pillar, and a few other things.', folder: 'Work', Content: ProjectsContent },
  { id: 'honors', title: 'Honors', preview: 'Entrepreneurship and academics.', folder: 'Personal', Content: HonorsContent },
  { id: 'elsewhere', title: 'Outside of building', preview: 'A little League of Legends.', folder: 'Personal', Content: ElsewhereContent },
  { id: 'contact', title: 'Say hello', preview: 'Email, GitHub, LinkedIn, and X.', folder: 'Personal', Content: ContactContent },
].map(note => ({ ...note, search: (note.title + ' ' + renderToStaticMarkup(<note.Content />).replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/&#x27;/g, "'")).toLowerCase() }))

function Icon({ name, ...props }) {
  const paths = {
    sidebar: <><rect x="3" y="4" width="18" height="16" rx="3"/><path d="M9 4v16"/></>,
    folder: <path d="M3 7V6a2 2 0 0 1 2-2h5l2 3h7a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z"/>,
    notes: <><rect x="5" y="3" width="15" height="17" rx="2"/><path d="M5 7h15M3 7v13a2 2 0 0 0 2 2M8 11h9M8 15h7"/></>,
    search: <><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/></>,
    pin: <><path d="m9 3 6 0-1 6 4 4v2H6v-2l4-4-1-6ZM12 15v7"/></>,
    share: <><path d="M12 15V2m-4 4 4-4 4 4M7 9H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-9a2 2 0 0 0-2-2h-2"/></>,
    back: <path d="m15 4-8 8 8 8"/>,
    check: <path d="m5 12 4 4L19 6"/>,
  }
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>{paths[name]}</svg>
}

export default function NotesPage() {
  const [folder, setFolder] = useState('All Notes')
  const [selected, setSelected] = useState('about')
  const [query, setQuery] = useState('')
  const [sidebar, setSidebar] = useState(true)
  const [mobileView, setMobileView] = useState('list')
  const [largeText, setLargeText] = useState(false)
  const [copied, setCopied] = useState('')
  const searchRef = useRef(null)
  const articleRef = useRef(null)
  const timer = useRef(null)
  const filtered = notes.filter(note => (folder === 'All Notes' || note.folder === folder) && note.search.includes(query.trim().toLowerCase()))
  const current = filtered.find(note => note.id === selected) || filtered[0]

  useEffect(() => {
    const sync = () => {
      const id = window.location.hash.slice(1)
      if (notes.some(note => note.id === id)) {
        setSelected(id); setFolder('All Notes'); setQuery(''); setMobileView('note')
      } else { setSelected('about'); setMobileView('list') }
    }
    sync()
    window.addEventListener('hashchange', sync)
    const shortcut = event => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault(); setMobileView('list'); requestAnimationFrame(() => searchRef.current?.focus())
      }
      if (event.key === 'Escape') { setQuery(''); setMobileView('list') }
    }
    window.addEventListener('keydown', shortcut)
    return () => { window.removeEventListener('hashchange', sync); window.removeEventListener('keydown', shortcut); clearTimeout(timer.current) }
  }, [])

  useEffect(() => { articleRef.current?.scrollTo(0, 0); setCopied('') }, [current?.id])

  useEffect(() => {
    if (mobileView === 'note' && window.matchMedia('(max-width: 700px)').matches) {
      articleRef.current?.querySelector('h1')?.focus({ preventScroll: true })
    }
  }, [mobileView, current?.id])

  function openNote(id) {
    setSelected(id); setMobileView('note')
    window.history.pushState(null, '', '#' + id)
  }

  function chooseFolder(value) {
    setFolder(value); setQuery(''); setMobileView('list')
  }

  async function shareNote() {
    if (!current) return
    window.history.replaceState(null, '', '#' + current.id)
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/#${current.id}`)
      setCopied('Link copied')
    } catch { setCopied('Copy the link from your address bar') }
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setCopied(''), 3500)
  }

  return (
    <div className={`notes-app ${sidebar ? '' : 'sidebar-hidden'} mobile-${mobileView}`}>
      <SEOHead />
      <aside className="notes-sidebar" aria-label="Folders">
        <header className="sidebar-header"><span className="notes-app-icon"><Icon name="notes" /></span><span>Vedant's Website</span></header>
        <div className="folder-group-label">Folders</div>
        <nav className="folder-list">
          {['All Notes', 'Personal', 'Work'].map(name => <button key={name} onClick={() => chooseFolder(name)} className={folder === name ? 'selected' : ''} aria-current={folder === name ? 'true' : undefined}>
            <Icon name={name === 'All Notes' ? 'notes' : 'folder'} /><span>{name}</span><span className="folder-count">{name === 'All Notes' ? notes.length : notes.filter(note => note.folder === name).length}</span>
          </button>)}
        </nav>
        <div className="sidebar-bottom">A few notes from Vedant.</div>
      </aside>

      <section className="notes-list-pane" aria-label="Notes">
        <header className="list-toolbar">
          <button className="icon-button desktop-sidebar-toggle" title="Toggle sidebar" aria-label="Toggle sidebar" aria-expanded={sidebar} onClick={() => setSidebar(!sidebar)}><Icon name="sidebar" /></button>
          <button className="mobile-folder-back" onClick={() => setMobileView('folders')}><Icon name="back" />Folders</button>
          <span className="list-folder-title">{folder}</span><span className="list-count">{filtered.length}</span>
        </header>
        <h1 className="mobile-site-title">Vedant's Website</h1>
        <div className="notes-search"><Icon name="search" /><input ref={searchRef} type="search" aria-label="Search notes" placeholder="Search" value={query} onChange={event => setQuery(event.target.value)} /></div>
        <div className="notes-list">
          {[true, false].map(pinned => {
            const group = filtered.filter(note => Boolean(note.pinned) === pinned)
            return group.length > 0 && <div key={String(pinned)}>
              <h2 className="note-group-title">{pinned ? <><Icon name="pin" />Pinned</> : query ? 'Results' : 'Notes'}</h2>
              {group.map(note => <button className={`note-row ${current?.id === note.id ? 'selected' : ''}`} key={note.id} aria-current={current?.id === note.id ? 'true' : undefined} onClick={() => openNote(note.id)}>
                <span className="note-row-title">{note.title}</span>
                <span className="note-row-preview">{note.preview}</span>
                <span className="note-row-folder"><Icon name="folder" />{note.folder}</span>
              </button>)}
            </div>
          })}
          {filtered.length === 0 && <div className="no-results"><Icon name="search" /><h2>No notes found</h2><p>Try a different search.</p></div>}
        </div>
        <footer className="list-footer" role="status">{filtered.length} {filtered.length === 1 ? 'Note' : 'Notes'}</footer>
      </section>

      <main className={`note-pane ${largeText ? 'large-text' : ''}`}>
        <header className="note-toolbar">
          <button className="mobile-note-back" onClick={() => setMobileView('list')}><Icon name="back" />Notes</button>
          <div className="note-toolbar-leading"><Icon name="notes" /><span>Vedant's Website</span></div>
          <div className="note-actions">
            <button className="icon-button text-size-button" onClick={() => setLargeText(!largeText)} aria-pressed={largeText} aria-label="Larger text" title="Larger text">Aa</button>
            <span className="toolbar-divider" />
            <button className="icon-button" onClick={shareNote} disabled={!current} title="Copy note link" aria-label="Copy note link"><Icon name={copied === 'Link copied' ? 'check' : 'share'} /></button>
          </div>
        </header>
        <div className="copy-status" role="status">{copied}</div>
        <div className="note-scroll" ref={articleRef}>
          {current ? <article className="note-document" key={current.id}>
            <div className="note-context">{current.folder}</div>
            <h1 tabIndex={-1}>{current.title}</h1>
            <current.Content />
          </article> : <div className="empty-note">No note selected</div>}
        </div>
      </main>
    </div>
  )
}
