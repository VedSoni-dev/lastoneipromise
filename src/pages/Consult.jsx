import SEOHead from '../components/SEOHead'
import { PERSON } from '../seo'
import './Consult.css'

function ExternalLink({ href, children, ...props }) {
  return <a href={href} target="_blank" rel="noreferrer" {...props}>{children}</a>
}

function Entry({ title, href, dates, children }) {
  return (
    <li className="personal-entry">
      <h3>{href ? <ExternalLink href={href}>{title}</ExternalLink> : title}</h3>
      {dates && <p className="personal-dates">{dates}</p>}
      <p>{children}</p>
    </li>
  )
}

export default function ConsultPage() {
  return (
    <div className="personal-page" itemScope itemType="https://schema.org/ProfilePage">
      <SEOHead />
      <main className="personal-main" itemProp="mainEntity" itemScope itemType="https://schema.org/Person">
        <meta itemProp="givenName" content={PERSON.givenName} />
        <meta itemProp="familyName" content={PERSON.familyName} />
        <meta itemProp="jobTitle" content={PERSON.jobTitle} />
        <meta itemProp="image" content={PERSON.image} />
        <link itemProp="url" href={PERSON.url} />

        <header className="personal-header">
          <div>
            <h1 itemProp="name">{PERSON.name}</h1>
            <p className="personal-bio" itemProp="description">
              I build intuitive software, AI agents, and robots. I'm an AI engineer at Texas A&amp;M,
              with a background in consumer products and applied AI research.
            </p>
            <p className="personal-contact">
              Reach me at <a href={`mailto:${PERSON.email}`} itemProp="email">{PERSON.email}</a>.
            </p>
            <nav className="personal-socials" aria-label="Social profiles">
              <ExternalLink href="https://github.com/VedSoni-dev" rel="me noreferrer">GitHub</ExternalLink>
              <ExternalLink href="https://www.linkedin.com/in/vedantsonimech" rel="me noreferrer">LinkedIn</ExternalLink>
              <ExternalLink href="https://x.com/VedantRobot" rel="me noreferrer">X / Twitter</ExternalLink>
            </nav>
          </div>
          <img className="personal-portrait" src="/coaching-photo.jpg"
            alt="Vedant Soni wearing a blue tie, standing in front of a brick wall"
            width="88" height="88" fetchpriority="high" />
        </header>

        <section className="personal-section" aria-labelledby="experience-title">
          <h2 id="experience-title">Experience</h2>
          <ul className="personal-entries">
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
        </section>

        <section className="personal-section" aria-labelledby="projects-title">
          <h2 id="projects-title">Projects</h2>
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
        </section>

        <section className="personal-section" aria-labelledby="honors-title">
          <h2 id="honors-title">Honors</h2>
          <ul className="personal-entries">
            <Entry title="Entrepreneurship">
              Founders Inc Canopy (2026), Delta II finalist at The Residency (2025),
              McFerrin Fast Pass Spring '25 winner, and Ideas Challenge finalist (2024).
            </Entry>
            <Entry title="Academic">
              SAT: 1570. ACT: 36. AIME qualifier. Scored 127.5 on the AMC 12A, placing in the top 2.5%.
            </Entry>
          </ul>
        </section>

        <section className="personal-section" aria-labelledby="elsewhere-title">
          <h2 id="elsewhere-title">Elsewhere</h2>
          <p>
            Outside of building, I used to be Grandmaster in League of Legends.
          </p>
        </section>

        <footer className="personal-footer">© {new Date().getFullYear()} {PERSON.name}.</footer>
      </main>
    </div>
  )
}
