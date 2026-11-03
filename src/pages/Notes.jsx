import { useEffect, useRef, useState } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import SEOHead from '../components/SEOHead'
import { PreviewContext, PREVIEWS, WebsiteContent, AboutContent, ExperienceContent, ProjectsContent, HonorsContent, ElsewhereContent, ContactContent } from './NotesContent'
import './Notes.css'

const notes = [
  { id: 'website', title: "Vedant's Website", preview: 'I like building cool things', Content: WebsiteContent },
  { id: 'about', title: 'About me', preview: 'I like building cool things', Content: AboutContent },
  { id: 'experience', title: 'Experience', preview: 'Neocast, Texas A&M, Cognition, EDEN.', Content: ExperienceContent },
  { id: 'projects', title: 'Projects', preview: 'Fern / TalkR, Pillar, and a few other things.', Content: ProjectsContent },
  { id: 'honors', title: 'Honors', preview: 'Entrepreneurship and academics.', Content: HonorsContent },
  { id: 'elsewhere', title: 'Outside of building', preview: 'A little League of Legends.', Content: ElsewhereContent },
  { id: 'contact', title: 'Say hello', preview: 'Email, GitHub, LinkedIn, and X.', Content: ContactContent },
].map(note => ({ ...note, search: (note.title + ' ' + renderToStaticMarkup(<note.Content />).replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/&#x27;/g, "'")).toLowerCase() }))

function Icon({ name, ...props }) {
  const paths = {
    back: <path d="m15 4-8 8 8 8" />,
    share: <path d="M12 15V2m-4 4 4-4 4 4M7 9H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-9a2 2 0 0 0-2-2h-2" />,
    more: <><circle cx="12" cy="12" r="9"/><path d="M7 12h.01M12 12h.01M17 12h.01" strokeWidth="3"/></>,
    search: <><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/></>,
    checklist: <><circle cx="4" cy="5" r="2"/><circle cx="4" cy="13" r="2"/><path d="M10 5h11M10 13h11M2 21h19"/></>,
    grid: <><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 3v18M3 15h18"/></>,
    mail: <><rect x="2" y="4" width="20" height="16" rx="3"/><path d="m3 6 9 7 9-7"/></>,
    close: <path d="m6 6 12 12M6 18 18 6" />,
    check: <path d="m5 12 4 4L19 6" />,
  }
  return <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>{paths[name]}</svg>
}

export default function NotesPage() {
  const [selected, setSelected] = useState('website')
  const [view, setView] = useState('note')
  const [query, setQuery] = useState('')
  const [large, setLarge] = useState(false)
  const [menu, setMenu] = useState(false)
  const [copied, setCopied] = useState('')
  const [preview, setPreview] = useState(null)
  const [pinned, setPinned] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const articleRef = useRef(null)
  const searchRef = useRef(null)
  const previewCloseRef = useRef(null)
  const returnFocus = useRef(null)
  const hideTimer = useRef(null)
  const copyTimer = useRef(null)
  const current = notes.find(note => note.id === selected) || notes[0]
  const filtered = notes.filter(note => note.search.includes(query.trim().toLowerCase()))

  useEffect(() => {
    const sync = () => {
      const id = window.location.hash.slice(1)
      setSelected(notes.some(note => note.id === id) ? id : 'website'); setView('note')
    }
    const keys = event => {
      if (event.key === 'Escape') { setPreview(null); setPinned(false); setMenu(false) }
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); setView('list'); requestAnimationFrame(() => searchRef.current?.focus()) }
    }
    sync(); window.addEventListener('hashchange', sync); window.addEventListener('keydown', keys)
    return () => { window.removeEventListener('hashchange', sync); window.removeEventListener('keydown', keys); clearTimeout(hideTimer.current); clearTimeout(copyTimer.current) }
  }, [])

  useEffect(() => {
    articleRef.current?.scrollTo(0, 0)
    setPreview(null); setPinned(false); setExpanded(false); setCopied(''); setMenu(false)
  }, [selected, view])

  function openNote(id) { setSelected(id); setView('note'); window.history.pushState(null, '', '#' + id) }
  function show(image) { clearTimeout(hideTimer.current); if (!pinned) setPreview(image) }
  function hide() { if (!pinned) hideTimer.current = setTimeout(() => setPreview(null), 180) }
  function pin(image) { clearTimeout(hideTimer.current); returnFocus.current = document.activeElement; setPreview(image); setPinned(true); requestAnimationFrame(() => previewCloseRef.current?.focus()) }
  function closePreview() { setPinned(false); returnFocus.current?.focus({ preventScroll: true }); setPreview(null) }
  function toggleDetails() {
    const next = !expanded
    articleRef.current?.querySelectorAll('details').forEach(detail => { detail.open = next })
    setExpanded(next)
  }
  async function share() {
    const hash = selected === 'website' ? '' : '#' + selected
    window.history.replaceState(null, '', '/' + hash)
    try { await navigator.clipboard.writeText(window.location.href); setCopied('Link copied') }
    catch { setCopied('Copy the link in your address bar') }
    clearTimeout(copyTimer.current); copyTimer.current = setTimeout(() => setCopied(''), 3000)
  }

  return <div className="phone-stage">
    <SEOHead />
    <div className="phone-scene">
      <div className="iphone">
        <span className="phone-button phone-mute" aria-hidden="true" /><span className="phone-button phone-volume-up" aria-hidden="true" /><span className="phone-button phone-volume-down" aria-hidden="true" /><span className="phone-button phone-power" aria-hidden="true" />
        <div className="phone-screen">
          <div className="phone-status" aria-hidden="true"><span>9:41</span><div className="dynamic-island"><i /></div><div className="status-icons"><svg viewBox="0 0 20 16"><path d="M1 14V10h3v4zm5 0V7h3v7zm5 0V4h3v10zm5 0V1h3v13z" fill="currentColor"/></svg><svg viewBox="0 0 20 16"><path d="M2 5q8-7 16 0M5 8q5-4 10 0M8 11q2-2 4 0" fill="none" stroke="currentColor" strokeWidth="2.3"/><circle cx="10" cy="14" r="1.3" fill="currentColor"/></svg><span className="battery"><i /></span></div></div>
          <header className="phone-toolbar">
            <button className="notes-back" onClick={() => { if (view === 'note') setView('list'); else openNote('website') }}><Icon name="back" />{view === 'note' ? 'Notes' : 'Home'}</button>
            <div className="top-actions"><button className="icon-button" aria-label="Copy note link" title="Copy note link" onClick={share}><Icon name={copied === 'Link copied' ? 'check' : 'share'} /></button><button className="icon-button" aria-label="Note options" aria-expanded={menu} title="Note options" onClick={() => setMenu(!menu)}><Icon name="more" /></button></div>
          </header>
          {menu && <div className="phone-menu"><button onClick={() => {setLarge(!large);setMenu(false)}}>{large ? 'Standard text size' : 'Larger text'}</button><button onClick={() => {setMenu(false);setView('list');requestAnimationFrame(() => searchRef.current?.focus())}}>Search notes</button><button onClick={() => {openNote('contact');setMenu(false)}}>Contact Vedant</button></div>}
          <div className="copy-status" role="status">{copied}</div>
          <main className={`phone-content ${large ? 'large-text' : ''}`} ref={articleRef}>
            {view === 'note' ? <PreviewContext.Provider value={{show, hide, pin}}><article className="phone-note" key={selected}>
              <h1>{current.title}</h1><current.Content />
            </article></PreviewContext.Provider> : <section className="phone-note note-picker" aria-label="Notes">
              <h1>Notes</h1><div className="notes-search"><Icon name="search"/><input ref={searchRef} type="search" placeholder="Search" aria-label="Search notes" value={query} onChange={event => setQuery(event.target.value)} /></div>
              <div className="note-list">{filtered.map(note => <button className="note-row" key={note.id} onClick={() => openNote(note.id)}><strong>{note.title}</strong><span>{note.preview}</span></button>)}</div>
              {filtered.length === 0 && <p className="no-results">No notes found.</p>}
              <p className="note-count">{filtered.length} notes</p>
            </section>}
          </main>
          <footer className="phone-bottom-toolbar">
            <button className="icon-button text-size" aria-label="Larger text" aria-pressed={large} title="Larger text" onClick={() => setLarge(!large)}>Aa</button>
            <button className="icon-button" aria-label={expanded ? 'Collapse all details' : 'Expand all details'} title="Show or hide details" disabled={view !== 'note'} onClick={toggleDetails}><Icon name="checklist" /></button>
            <button className="icon-button" aria-label="All notes" title="All notes" onClick={() => setView('list')}><Icon name="grid" /></button>
            <button className="icon-button" aria-label="Search notes" title="Search notes" onClick={() => {setView('list');requestAnimationFrame(() => searchRef.current?.focus())}}><Icon name="search" /></button>
            <button className="icon-button" aria-label="Contact Vedant" title="Contact Vedant" onClick={() => openNote('contact')}><Icon name="mail" /></button>
          </footer>
          <div className="home-indicator" aria-hidden="true"><span /></div>
        </div>
      </div>
      {preview && <aside className={`floating-preview preview-${preview.side} ${preview.portrait ? 'portrait-preview' : ''} ${pinned ? 'preview-pinned' : ''}`} aria-label={`${preview.title} image preview`} onMouseEnter={() => clearTimeout(hideTimer.current)} onMouseLeave={hide}>
        <figure><img src={preview.src} alt={preview.alt} /><figcaption><span>{preview.title}</span><button ref={previewCloseRef} className="icon-button" onClick={closePreview} aria-label="Close image preview"><Icon name="close" /></button></figcaption></figure>
      </aside>}
    </div>
    <p className="stage-hint"><span className="desktop-hint">Hover to explore.</span><span className="touch-hint">Tap a name to explore.</span></p>
    <div className="preload-images" aria-hidden="true">{Object.values(PREVIEWS).map(image => <img key={image.src} src={image.src} alt="" loading="lazy" />)}</div>
  </div>
}
