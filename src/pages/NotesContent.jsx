import { createContext, useContext } from 'react'
import { IMAGES } from '../data/notes'

export const PreviewContext = createContext(null)

function Links({ links = [] }) {
  return links.length > 0 && <ul className="note-links">{links.map(link => <li key={link.href}><a href={link.href} {...(link.href.startsWith('https:') ? { target: '_blank', rel: 'noreferrer' } : {})}>{link.label}</a></li>)}</ul>
}

function Attachment({ image }) {
  const preview = useContext(PreviewContext)
  return <button className="note-attachment" aria-label={`Open image: ${image.alt}`} onClick={() => preview.pin(image)}><img src={image.src} alt={image.alt} loading="lazy" decoding="async" /></button>
}

function Entry({ entry }) {
  const preview = useContext(PreviewContext)
  const image = IMAGES[entry.image]
  return <li className="note-entry">
    <details>
      <summary onPointerEnter={event => { if (image && event.pointerType === 'mouse') preview.show(image) }} onPointerLeave={preview.hide} onFocus={() => image && preview.show(image)} onBlur={preview.hide}>
        <span className="check-ring" aria-hidden="true" />{entry.title}
      </summary>
      <div className="entry-details">
        {entry.date && <p>{entry.date}</p>}
        {entry.body && <p>{entry.body}</p>}
        <Links links={entry.links} />
        {image && <Attachment image={image} />}
      </div>
    </details>
  </li>
}

function Section({ section, heading = false }) {
  return <>
    {heading && <h2>{section.title}</h2>}
    {section.paragraphs?.map(text => <p key={text}>{text}</p>)}
    {section.entries && <ul className="note-entries">{section.entries.map(entry => <Entry key={entry.id} entry={entry} />)}</ul>}
    <Links links={section.links} />
  </>
}

export default function NotesContent({ note }) {
  const preview = useContext(PreviewContext)
  const image = IMAGES[note.image]
  return <>
    <h1>{image ? <button className="note-title-button" onPointerEnter={event => { if (event.pointerType === 'mouse') preview.show(image) }} onPointerLeave={preview.hide} onFocus={() => preview.show(image)} onBlur={preview.hide} onClick={() => preview.pin(image)} aria-haspopup="dialog">{note.title}</button> : note.title}</h1>
    <Section section={note} />
    {note.sections?.map(section => <section key={section.id}><Section section={section} heading /></section>)}
  </>
}
