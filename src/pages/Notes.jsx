import { useEffect, useRef, useState } from 'react'
import SEOHead from '../components/SEOHead'
import MusicDock from '../components/MusicDock'
import { NOTES, searchNotes } from '../data/notes'
import NotesContent, { PreviewContext } from './NotesContent'
import './Notes.css'

function Icon({ name }) {
  const paths = {
    back: <path d="m15 4-8 8 8 8" />,
    share: <path d="M12 15V2m-4 4 4-4 4 4M7 9H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-9a2 2 0 0 0-2-2h-2" />,
    more: <><circle cx="12" cy="12" r="9" /><path d="M7 12h.01M12 12h.01M17 12h.01" strokeWidth="3" /></>,
    search: <><circle cx="10.5" cy="10.5" r="6.5" /><path d="m16 16 5 5" /></>,
    close: <path d="m6 6 12 12M6 18 18 6" />,
    check: <path d="m5 12 4 4L19 6" />,
  }
  return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>
}

function PhoneStatus() {
  return <div className="phone-status" aria-hidden="true">
    <span>9:41</span>
    <div className="status-icons">
      <svg viewBox="0 0 20 16"><path d="M1 14V10h3v4zm5 0V7h3v7zm5 0V4h3v10zm5 0V1h3v13z" fill="currentColor" /></svg>
      <svg viewBox="0 0 20 16"><path d="M2 5q8-7 16 0M5 8q5-4 10 0M8 11q2-2 4 0" fill="none" stroke="currentColor" strokeWidth="2.3" /><circle cx="10" cy="14" r="1.3" fill="currentColor" /></svg>
      <span className="battery"><i /></span>
    </div>
  </div>
}

function PreviewImage({ image, onClose }) {
  return <figure className="preview-image">
    <img src={image.src} alt={image.alt} decoding="async" />
    <button className="icon-button preview-close" onClick={onClose} aria-label="Close image preview"><Icon name="close" /></button>
  </figure>
}

export default function NotesPage() {
  const [active, setActive] = useState('website')
  const [query, setQuery] = useState('')
  const [large, setLarge] = useState(false)
  const [menu, setMenu] = useState(false)
  const [copied, setCopied] = useState('')
  const [preview, setPreview] = useState(null)
  const articleRef = useRef(null)
  const searchRef = useRef(null)
  const menuRef = useRef(null)
  const menuButtonRef = useRef(null)
  const dialogRef = useRef(null)
  const restoringFocus = useRef(false)
  const hideTimer = useRef(null)
  const copyTimer = useRef(null)
  const searchPending = useRef(false)
  const current = NOTES.find(note => note.id === active)
  const filtered = active === 'notes' ? searchNotes(query) : []

  useEffect(() => {
    function sync() {
      const id = window.location.hash.slice(1)
      setActive(id === 'notes' || NOTES.some(note => note.id === id) ? id : 'website')
    }
    function keys(event) {
      if (event.key === 'Escape') {
        clearTimeout(hideTimer.current)
        setPreview(null)
        setMenu(false)
      }
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        searchPending.current = true
        window.location.hash = 'notes'
        searchRef.current?.focus()
      }
    }
    sync()
    window.addEventListener('hashchange', sync)
    window.addEventListener('keydown', keys)
    return () => {
      window.removeEventListener('hashchange', sync)
      window.removeEventListener('keydown', keys)
      clearTimeout(hideTimer.current)
      clearTimeout(copyTimer.current)
    }
  }, [])

  useEffect(() => {
    articleRef.current?.scrollTo(0, 0)
    clearTimeout(hideTimer.current)
    setPreview(null)
    setCopied('')
    setMenu(false)
    if (active === 'notes' && searchPending.current) {
      searchRef.current?.focus()
      searchPending.current = false
    }
  }, [active])

  useEffect(() => {
    if (!menu) return
    function dismiss(event) {
      if (!menuRef.current?.contains(event.target) && !menuButtonRef.current?.contains(event.target)) setMenu(false)
    }
    document.addEventListener('pointerdown', dismiss)
    return () => document.removeEventListener('pointerdown', dismiss)
  }, [menu])

  useEffect(() => {
    const dialog = dialogRef.current
    if (preview?.pinned && !dialog.open) dialog.showModal()
    if (!preview?.pinned && dialog.open) {
      restoringFocus.current = true
      dialog.close()
      queueMicrotask(() => { restoringFocus.current = false })
    }
  }, [preview?.pinned])

  function show(image) {
    if (restoringFocus.current) return
    clearTimeout(hideTimer.current)
    setPreview(value => value?.pinned ? value : { image, pinned: false })
  }
  function hide() {
    clearTimeout(hideTimer.current)
    hideTimer.current = setTimeout(() => setPreview(value => value?.pinned ? value : null), 200)
  }
  function pin(image) {
    clearTimeout(hideTimer.current)
    setPreview({ image, pinned: true })
  }
  function setDetails(open) {
    articleRef.current?.querySelectorAll('details').forEach(detail => { detail.open = open })
    setMenu(false)
    menuButtonRef.current?.focus()
  }
  async function share() {
    const url = new URL(window.location.href)
    url.hash = active === 'website' ? '' : active
    try {
      await navigator.clipboard.writeText(url.href)
      setCopied('Link copied')
    } catch {
      setCopied('Could not copy link')
    }
    clearTimeout(copyTimer.current)
    copyTimer.current = setTimeout(() => setCopied(''), 2500)
  }

  return <div className="phone-stage">
    <SEOHead />
    <div className="phone-scene">
      <div className="iphone">
        <div className="phone-screen">
          <PhoneStatus />
          <header className="phone-toolbar">
            <a className="notes-back" href={current ? '#notes' : '#website'}><Icon name="back" />{current ? 'Notes' : 'Home'}</a>
            <div className="top-actions">
              <button className="icon-button" aria-label="Copy note link" onClick={share}><Icon name={copied === 'Link copied' ? 'check' : 'share'} /></button>
              <button ref={menuButtonRef} className="icon-button" aria-label="Note options" aria-expanded={menu} aria-controls="note-options" onClick={() => setMenu(!menu)}><Icon name="more" /></button>
            </div>
          </header>
          {menu && <div id="note-options" ref={menuRef} className="phone-menu" role="group" aria-label="Note options">
            <button onClick={() => { setLarge(!large); setMenu(false); menuButtonRef.current?.focus() }}>{large ? 'Standard text' : 'Larger text'}</button>
            {current && <><button onClick={() => setDetails(true)}>Expand all</button><button onClick={() => setDetails(false)}>Collapse all</button></>}
            <a href="#contact" onClick={() => setMenu(false)}>Contact</a>
          </div>}
          <div className="copy-status" role="status">{copied}</div>
          <main className={`phone-content${large ? ' large-text' : ''}`} ref={articleRef} onScroll={() => setPreview(value => value?.pinned ? value : null)}>
            {current ? <PreviewContext.Provider value={{ show, hide, pin }}>
              <article className="phone-note" key={current.id}><NotesContent note={current} /></article>
            </PreviewContext.Provider> : <section className="phone-note note-picker" aria-label="Notes">
              <h1>Notes</h1>
              <div className="notes-search"><Icon name="search" /><input ref={searchRef} type="search" placeholder="Search" aria-label="Search notes" value={query} onChange={event => setQuery(event.target.value)} /></div>
              <nav className="note-list" aria-label="Choose a note">{filtered.map(note => <a className="note-row" key={note.id} href={`#${note.id}`}>{note.title}<span aria-hidden="true">›</span></a>)}</nav>
              {filtered.length === 0 && <p className="no-results">No notes found</p>}
            </section>}
          </main>
          <MusicDock />
          <div className="home-indicator" aria-hidden="true"><span /></div>
        </div>
        <img className="device-bezel" src="/device/iphone-16-pro.png" width="1406" height="2822" alt="" aria-hidden="true" fetchpriority="high" draggable="false" />
      </div>
      {preview && !preview.pinned && <aside className={`floating-preview preview-${preview.image.side}${preview.image.portrait ? ' portrait-preview' : ''}`} aria-label="Image preview" onPointerEnter={() => clearTimeout(hideTimer.current)} onPointerLeave={hide}>
        <PreviewImage image={preview.image} onClose={() => setPreview(null)} />
      </aside>}
    </div>
    <dialog ref={dialogRef} className="image-dialog" aria-label={preview?.image.alt || 'Image preview'} onCancel={event => { event.preventDefault(); setPreview(null) }} onClick={event => { if (event.target === event.currentTarget) setPreview(null) }}>
      {preview?.pinned && <PreviewImage image={preview.image} onClose={() => setPreview(null)} />}
    </dialog>
  </div>
}
