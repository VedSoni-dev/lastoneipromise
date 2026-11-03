# Notes website

- `src/data/notes.js` owns the content, stable note IDs, links, and image references. Search reads this same data. Keep existing IDs so shared links continue to work.
- `src/pages/NotesContent.jsx` renders semantic headings, links, and native disclosure elements. Full content is included in the prerendered page.
- `src/pages/Notes.jsx` owns hash navigation, search, text sizing, sharing, and previews. Hover previews stay beside the phone; clicking an attachment uses a native modal dialog.
- `src/pages/Notes.css` owns the interface. Keep the background black and live text untransformed. The high-resolution bezel overlays the interactive screen with pointer events disabled. Its screen coordinates are documented beside the CSS and in `public/device/SOURCES.md`.

The Notes typography uses a dedicated token to avoid the older site's global font overrides. Apple devices use their system font; other platforms load the local Inter Latin subset.

Validation: `node --test tests/notes.test.mjs`, then `npm run build`. Browser checks cover 320/375/414/768 px, browser back/forward, existing deep links, full-content search, keyboard dismissal, native modal focus, and hover/touch previews. Do not add a 3D renderer or browser-side HTML renderer for this interface.

The phone music dock is an isolated native-audio component in src/components/MusicDock.jsx. Solar Eclipse by Drake & Don Toliver uses metadata, artwork, and a preview from Apple's iTunes Search API (track 6818059593); the cover links to the full song on Apple Music. The preview streams from Apple, loops, and attempts playback on mount at 35% volume. If the browser blocks autoplay, the first click/tap or Enter/Space interaction retries it. The player button always takes control; pausing must never be undone by later navigation or interactions. Playback persists across note navigation. Browser checks cover allowed and blocked autoplay, first-interaction fallback, manual play/pause, and looping past the end.
