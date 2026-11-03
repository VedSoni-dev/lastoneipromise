import { PERSON } from '../seo.js'

export const IMAGES = {
  portrait: { src: '/coaching-photo.jpg', alt: 'Vedant Soni', side: 'left', portrait: true },
  neocast: { src: '/projects/neocast.png', alt: 'Neocast website', side: 'right' },
  cognition: { src: '/cognition-preview.png', alt: 'Cognition website', side: 'left' },
  eden: { src: '/eden-preview.png', alt: 'EDEN robotics research', side: 'right' },
  fern: { src: '/projects/fern.png', alt: 'TalkR communication tools', side: 'left' },
  recreach: { src: '/recreach-preview.png', alt: 'RecReach basketball app', side: 'right' },
  opensource: { src: '/projects/merchant-agent.png', alt: 'Merchant Agent', side: 'left' },
  honors: { src: '/vedant-at-yc.png', alt: 'Vedant at Y Combinator', side: 'left', portrait: true },
}

const experience = {
  id: 'experience', title: 'Experience', entries: [
    { id: 'neocast', title: 'Co-founder & CTO @ Neocast', date: 'Present', image: 'neocast' },
    { id: 'tamu', title: 'AI Engineer @ Texas A&M', body: "Handpicked by Texas A&M's CIO to join the university's top AI team. Built the Texas A&M Harness and software used by 70,000 people across TAMU facilities.", links: [{ label: 'Texas A&M', href: 'https://www.tamu.edu/' }] },
    { id: 'cognition', title: 'CTO @ Cognition', image: 'cognition', body: 'Built computational neuroscience for AI agents, reaching 35,000 users. Backed by researchers at Google DeepMind, The Residency, and Founders Inc.' },
    { id: 'eden', title: 'Founder @ EDEN', image: 'eden', body: 'Founded a robotics lab with $50,000 in university backing and $50,000 in support from NVIDIA. Led a team of 12 building robots with emotion-led decision-making and completed the project in one year.', links: [{ label: 'EDEN', href: 'https://eden-robotics.github.io/Eden/' }] },
    { id: 'research', title: 'Research Lead @ ART Lab & DIGIT Lab', body: 'Applied AI for robotics, robot swarm coordination, and agent-based data extraction and cleaning at Texas A&M. The two labs had approximately $5 million in combined funding.' },
  ],
}
const projects = {
  id: 'projects', title: 'Projects', entries: [
    { id: 'fern', title: 'Fern / TalkR', image: 'fern', body: 'Free communication tools for nonverbal children, reaching 12,500 users. Brought the software to underprivileged schools in Pakistan and South America.', links: [{ label: 'TalkR', href: 'https://trytalkr.com/' }] },
    { id: 'pillar', title: 'Pillar', date: 'Summer between freshman and sophomore year', body: 'Built bespoke AI agents for real estate firms and realtors.' },
    { id: 'consulting', title: 'AI Consulting', date: 'June–September 2026', body: 'Built an AI consulting business from scratch. Generated $80,000 in revenue in three months and $15,000 in monthly recurring revenue from retainers.' },
    { id: 'recreach', title: 'RecReach', image: 'recreach', body: 'A platform for finding pickup basketball games. Built the iOS app and grew its social content to more than 3 million views in one summer.' },
    { id: 'robotics', title: 'Open-source Robotics', image: 'eden', body: 'Worked on open-source robotics projects, including ROS-MCP-Server (about 1,500 GitHub stars) and TalkrBot, an AI-powered assistive robot built on ROS 2.', links: [{ label: 'ROS-MCP-Server', href: 'https://github.com/robotmcp/ros-mcp-server' }, { label: 'TalkrBot', href: 'https://github.com/VedSoni-dev/TalkrBot' }] },
    { id: 'opensource', title: 'Open Source', image: 'opensource', body: 'Tools for agents, learning, and getting things done.', links: [{ label: 'Merchant Agent', href: 'https://github.com/VedSoni-dev/merchant-agent' }, { label: 'Teachy', href: 'https://github.com/VedSoni-dev/teachy-web' }, { label: 'OmniWork', href: 'https://github.com/VedSoni-dev/omniwork' }, { label: 'GitHub', href: 'https://github.com/VedSoni-dev' }] },
  ],
}
const honors = {
  id: 'honors', title: 'Honors', entries: [
    { id: 'entrepreneurship', title: 'Entrepreneurship', image: 'honors', body: "Founders Inc Canopy (2026), Delta II finalist at The Residency (2025), McFerrin Fast Pass Spring '25 winner, and Ideas Challenge finalist (2024)." },
    { id: 'academic', title: 'Academic', body: 'SAT: 1570. ACT: 36. AIME qualifier. Scored 127.5 on the AMC 12A, placing in the top 2.5%.' },
  ],
}
const elsewhere = { id: 'elsewhere', title: 'Outside of building', paragraphs: ['Outside of building, I used to be Grandmaster in League of Legends.'] }
const contact = {
  id: 'contact', title: 'Contact', links: [
    { label: PERSON.email, href: `mailto:${PERSON.email}` },
    { label: 'GitHub', href: 'https://github.com/VedSoni-dev' },
    { label: 'LinkedIn', href: 'https://www.linkedin.com/in/vedantsonimech' },
    { label: 'X', href: 'https://x.com/VedantRobot' },
  ],
}
const about = { id: 'about', title: 'About me', image: 'portrait', paragraphs: ['I like building cool things', 'Co-founder & CTO at Neocast. Previously built Fern and Eden Robotics.', elsewhere.paragraphs[0]], links: [contact.links[0]] }

export const NOTES = [
  { id: 'website', title: "Vedant's Website", image: 'portrait', paragraphs: ['I like building cool things'], sections: [experience, projects, honors, elsewhere, contact] },
  about, experience, projects, honors, elsewhere, contact,
]

// Search the same content we render: no HTML rendering or duplicate search copy.
export function noteText(note) {
  return [note.title, note.body, note.date, ...(note.paragraphs || []), ...(note.links || []).map(link => link.label), ...(note.entries || []).map(noteText), ...(note.sections || []).map(noteText)].filter(Boolean).join(' ')
}
export function searchNotes(query) {
  const terms = query.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean)
  return NOTES.filter(note => terms.every(term => noteText(note).toLocaleLowerCase().includes(term)))
}
