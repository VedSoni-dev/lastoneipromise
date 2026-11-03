import { PERSON } from '../seo'
import { createContext, useContext } from 'react'

export const PreviewContext = createContext(null)
export const PREVIEWS = {
  portrait: { src: '/coaching-photo.jpg', title: 'Vedant Soni', alt: 'Vedant Soni in a blue tie', side: 'left', portrait: true },
  neocast: { src: '/projects/neocast.png', title: 'Neocast', alt: 'The Neocast website', side: 'right' },
  cognition: { src: '/cognition-preview.png', title: 'Cognition', alt: 'Cognition project website', side: 'left' },
  eden: { src: '/eden-preview.png', title: 'EDEN Robotics', alt: 'EDEN robotics research website', side: 'right' },
  fern: { src: '/projects/fern.png', title: 'Fern / TalkR', alt: 'TalkR picture-based communication tools', side: 'left' },
  recreach: { src: '/recreach-preview.png', title: 'RecReach', alt: 'RecReach basketball app', side: 'right' },
  opensource: { src: '/projects/merchant-agent.png', title: 'Merchant Agent', alt: 'Merchant Agent open-source project', side: 'left' },
  honors: { src: '/vedant-at-yc.png', title: 'Along the way', alt: 'Vedant at Y Combinator', side: 'left', portrait: true },
}
const entryPreviews = { 'Co-founder & CTO @ Neocast': 'neocast', 'CTO @ Cognition': 'cognition', 'Founder @ EDEN': 'eden', 'Fern / TalkR': 'fern', 'RecReach': 'recreach', 'Open-source Robotics': 'eden', 'Open Source': 'opensource', 'Entrepreneurship': 'honors' }

export function PreviewName({ children, image = 'portrait' }) {
  const preview = useContext(PreviewContext)
  return <button className="preview-name" onMouseEnter={() => preview?.show(PREVIEWS[image])} onMouseLeave={() => preview?.hide()} onFocus={() => preview?.show(PREVIEWS[image])} onBlur={() => preview?.hide()} onClick={() => preview?.pin(PREVIEWS[image])}>{children}</button>
}

function ExternalLink({ href, children, ...props }) {
  return <a href={href} target="_blank" rel="noreferrer" {...props}>{children}</a>
}

function Entry({ title, href, dates, children }) {
  const preview = useContext(PreviewContext)
  const image = PREVIEWS[entryPreviews[title]]
  return (
    <li className="personal-entry">
      <details>
        <summary onMouseEnter={() => image && preview?.show(image)} onMouseLeave={() => preview?.hide()} onFocus={() => image && preview?.show(image)} onBlur={() => preview?.hide()} onClick={() => { if (image && window.matchMedia('(max-width: 900px), (hover: none)').matches) preview?.pin(image) }}>
          <span className="check-ring" aria-hidden="true" /><span>{title}</span>
          {dates === 'Present' && <span className="present-label">Now</span>}
        </summary>
        <div className="entry-details">
          {dates && <p className="personal-dates">{dates}</p>}
          {children && <p>{children}</p>}
          {href && <p><ExternalLink href={href}>Visit {title.split(' @ ').at(-1)} ↗</ExternalLink></p>}
          {image && <button className="preview-name" onClick={() => preview?.pin(image)}>View image ↗</button>}
        </div>
      </details>
    </li>
  )
}

export function ExperienceContent() { return <>

          <ul className="personal-entries">
            <Entry title="Co-founder & CTO @ Neocast" dates="Present" />
            <Entry title="AI Engineer @ Texas A&M" href="https://www.tamu.edu/">
              Handpicked by Texas A&amp;M's CIO to join the university's top AI team.
              Built the Texas A&amp;M Harness and software used by 70,000 people across TAMU facilities.
            </Entry>
            <Entry title="CTO @ Cognition">
              Built computational neuroscience for AI agents, reaching 35,000 users.
              Backed by researchers at Google DeepMind, The Residency, and Founders Inc.
            </Entry>
            <Entry title="Founder @ EDEN" href="https://eden-robotics.github.io/Eden/">
              Founded a robotics lab with $50,000 in university backing and $50,000 in support
              from NVIDIA. Led a team of 12 building robots with emotion-led decision-making
              and completed the project in one year.
            </Entry>
            <Entry title="Research Lead @ ART Lab & DIGIT Lab">
              Applied AI for robotics, robot swarm coordination, and agent-based data extraction
              and cleaning at Texas A&amp;M. The two labs had approximately $5 million in combined funding.
            </Entry>
          </ul>
        </> }

export function ProjectsContent() { return <>

          <ul className="personal-entries">
            <Entry title="Fern / TalkR" href="https://trytalkr.com/">
              Free communication tools for nonverbal children, reaching 12,500 users.
              Brought the software to underprivileged schools in Pakistan and South America.
            </Entry>
            <Entry title="Pillar" dates="Summer between freshman and sophomore year">
              Built bespoke AI agents for real estate firms and realtors.
            </Entry>
            <Entry title="AI Consulting" dates="June–September 2026">
              Built an AI consulting business from scratch.
              Generated $80,000 in revenue in three months and $15,000 in monthly recurring
              revenue from retainers.
            </Entry>
            <Entry title="RecReach">
              A platform for finding pickup basketball games. Built the iOS app and grew its social
              content to more than 3 million views in one summer.
            </Entry>
            <Entry title="Open-source Robotics">
              Worked on open-source robotics projects, including{' '}
              <ExternalLink href="https://github.com/robotmcp/ros-mcp-server">ROS-MCP-Server</ExternalLink>
              {' '}(about 1,500 GitHub stars) and{' '}
              <ExternalLink href="https://github.com/VedSoni-dev/TalkrBot">TalkrBot</ExternalLink>,
              an AI-powered assistive robot built on ROS 2.
            </Entry>
            <Entry title="Open Source" href="https://github.com/VedSoni-dev">
              <ExternalLink href="https://github.com/VedSoni-dev/merchant-agent">Merchant Agent</ExternalLink>,{' '}
              <ExternalLink href="https://github.com/VedSoni-dev/teachy-web">Teachy</ExternalLink>, and{' '}
              <ExternalLink href="https://github.com/VedSoni-dev/omniwork">OmniWork</ExternalLink>.
              {' '}Tools for agents, learning, and getting things done.
            </Entry>
          </ul>
        </> }

export function HonorsContent() { return <>

          <ul className="personal-entries">
            <Entry title="Entrepreneurship">
              Founders Inc Canopy (2026), Delta II finalist at The Residency (2025),
              McFerrin Fast Pass Spring '25 winner, and Ideas Challenge finalist (2024).
            </Entry>
            <Entry title="Academic">
              SAT: 1570. ACT: 36. AIME qualifier. Scored 127.5 on the AMC 12A, placing in the top 2.5%.
            </Entry>
          </ul>
        </> }

export function ElsewhereContent() { return <>

          <p>
            Outside of building, I used to be Grandmaster in League of Legends.
          </p>
        </> }

export function AboutContent() { return <>
  <p><PreviewName>Hey, I'm Vedant.</PreviewName></p>
  <p>I build intuitive software, AI agents, and robots. I'm an AI engineer at Texas A&amp;M, with a background in consumer products and applied AI research.</p>
  <h2>A little about me</h2><p>Co-founder &amp; CTO at Neocast. Previously built Fern and Eden Robotics.</p>
  <p>Outside of building, I used to be Grandmaster in League of Legends.</p>
  <p>Reach me at <a href={'mailto:' + PERSON.email}>{PERSON.email}</a>.</p>
</> }
export function ContactContent() { return <>
  <p>Reach me at <a href={'mailto:' + PERSON.email}>{PERSON.email}</a>.</p>
  <h2>Elsewhere on the internet</h2>
  <p><ExternalLink href="https://github.com/VedSoni-dev">GitHub</ExternalLink></p>
  <p><ExternalLink href="https://www.linkedin.com/in/vedantsonimech">LinkedIn</ExternalLink></p>
  <p><ExternalLink href="https://x.com/VedantRobot">X / Twitter</ExternalLink></p>
</> }
export function WebsiteContent() { return <>
  <p><PreviewName>Hey, I'm Vedant.</PreviewName> I build intuitive software, AI agents, and robots.</p>
  <p className="intro-secondary">AI engineer at Texas A&amp;M. A background in consumer products and applied AI research.</p>
  <h2>Experience</h2><ExperienceContent />
  <h2>Projects</h2><ProjectsContent />
  <h2>Honors</h2><HonorsContent />
  <h2>Outside of building</h2><ElsewhereContent />
  <h2>Say hello</h2><ContactContent />
</> }
