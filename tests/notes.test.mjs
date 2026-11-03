import test from 'node:test'
import assert from 'node:assert/strict'
import { existsSync } from 'node:fs'
import { NOTES, IMAGES, searchNotes, noteText } from '../src/data/notes.js'

test('existing note links remain addressable', () => {
  for (const id of ['website', 'about', 'experience', 'projects', 'honors', 'elsewhere', 'contact']) {
    assert.equal(NOTES.filter(note => note.id === id).length, 1)
  }
})
test('search finds full descriptions and normalizes whitespace and case', () => {
  assert.deepEqual(searchNotes('  NVIDIA   robots  ').map(note => note.id), ['website', 'experience'])
  assert.deepEqual(searchNotes('1570').map(note => note.id), ['website', 'honors'])
  assert.equal(searchNotes('zzzxxyyy').length, 0)
})
test('contact links and all image assets are available', () => {
  assert.match(noteText(NOTES.find(note => note.id === 'contact')), /ved\.06\.soni@gmail\.com/)
  for (const image of Object.values(IMAGES)) assert.ok(existsSync(new URL('../public' + image.src, import.meta.url)), image.src)
})
