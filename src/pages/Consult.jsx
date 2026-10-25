import { useState } from 'react'
import SEOHead from '../components/SEOHead'
import { PERSON } from '../seo'
import './Consult.css'

function ProjectMention({ name, href, logo, image, alt }) {
  const [open, setOpen] = useState(false)
  const id = `preview-${name.toLowerCase().replaceAll(' ', '-')}`
  return (
    <span className="project-mention"
      onPointerEnter={event => { if (event.pointerType === 'mouse') setOpen(value => value || 'hover') }}
      onPointerLeave={event => { if (event.pointerType === 'mouse') setOpen(value => value === 'hover' ? false : value) }}
      onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) setOpen(value => value === 'pinned' ? value : false) }}
      onKeyDown={event => { if (event.key === 'Escape') { setOpen(false); event.stopPropagation() } }}>
      {href ? (
        <a href={href} target="_blank" rel="noreferrer" onFocus={() => setOpen('focus')}>
          {logo && <img className="personal-logo" src={logo} alt="" width="16" height="16" />}{name}
        </a>
      ) : (
        <button type="button" className="project-name" aria-expanded={Boolean(open)} aria-controls={id}
          onClick={() => setOpen('pinned')}>{name}</button>
      )}
      {href && <button type="button" className="project-preview-toggle" aria-label={`Preview ${name}`}
        aria-expanded={Boolean(open)} aria-controls={id} onClick={() => setOpen('pinned')}>preview</button>}
      <span className="project-preview" id={id} hidden={!open}>
        <img src={image} alt={alt} />
        <span className="project-preview-caption">{name}
          <button type="button" aria-label={`Close ${name} preview`} onClick={() => setOpen(false)}>×</button>
        </span>
      </span>
    </span>
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

        <img className="personal-portrait" src="/coaching-photo.jpg"
          alt="Vedant Soni wearing a blue tie, standing in front of a brick wall"
          width="619" height="619" fetchpriority="high" />

        <div className="personal-copy">
          <section className="personal-section personal-intro" aria-labelledby="intro-title">
            <h1 id="intro-title" itemProp="name">{PERSON.name}</h1>
            <p className="personal-lede" itemProp="description">
              <strong>I am really good at building intuitive software.</strong> Due to this skill,
              I have found a fair share of success in consumer facing products.
            </p>
            <p>I like taking an idea all the way to something people can actually use.</p>
            <p>
              Something I excel in is getting to know the user I am building software for to
              ensure the best user experience. I found that this is the edge to making good applied AI products.
            </p>
            <p>
              I'm currently finding the next big thing to solve. I'm also an AI engineer at{' '}
              <a href="https://www.tamu.edu" target="_blank" rel="noreferrer"><img className="personal-logo" src="/logos/tamu.png" alt="" width="16" height="16" />Texas A&amp;M</a>,
              working on the future of AI at the university as the team's only student software
              engineer. I created the Texas A&amp;M Harness. My software is used by
              70,000 people across all TAMU facilities.
            </p>
          </section>

          <section className="personal-section" aria-label="Startups and projects">
            <p>A few things I've built:</p>
            <ul>
              <li><ProjectMention name="Fern" href="https://trytalkr.com" logo="/logos/talkr.png"
                image="/projects/fern.png" alt="TalkR's picture-based communication board" />,
                communication tools for nonverbal kids, with 12,500 users. Now home to TalkR.
                <p>I could have charged for it, but I didn't want to. I used a browser-based LLM
                  to keep it free and brought it to underprivileged schools in Pakistan and South America.</p>
              </li>
              <li><strong>10HAI Game Show</strong>: I helped my friend{' '}
                <a href="https://www.linkedin.com/in/mrtle" target="_blank" rel="noreferrer">Martin Lee</a>{' '}
                build and film 10HAI, a humans-versus-AI game show. I built all the games and software.
                Super fun experience.</li>
              <li className="personal-yc-story">
                <strong>[Redacted due to legal issues]</strong> — deeptech;
                computational neuroscience for agents; 35,000 users. Backed by researchers
                at Google DeepMind, The Residency, and Founders Inc.
                <p>In my YC interview, Diana Hu and François described me as a strong founder
                  they would normally back, but said the product needed a bit more traction.
                  We got that traction, but ended up leaving the company.</p>
              </li>
              <li><strong>Piller</strong>, bespoke AI for real estate firms and realtors.
                I built AI agents before they were popular and made my first six figures in revenue.</li>
              <li><ProjectMention name="RecReach" image="/recreach-preview.png"
                alt="RecReach, a platform for finding pickup basketball games" />,
                a platform for finding pickup basketball games. I learned the basics of building
                iOS apps, distribution, and social media content creation. The content got over
                3 million views in one summer.</li>
            </ul>
            <p>I also had three other startups that failed horribly. I learned a lot and got it out of my system.</p>
            <p>I also build open-source tools, including{' '}
              <ProjectMention name="Merchant Agent" href="https://github.com/VedSoni-dev/merchant-agent"
                logo="/logos/github.png" image="/projects/merchant-agent.png" alt="Merchant Agent project website" />,{' '}
              <ProjectMention name="Teachy" href="https://github.com/VedSoni-dev/teachy-web"
                image="/projects/teachy.jpg" alt="Teachy guiding someone through an app" />, and{' '}
              <ProjectMention name="OmniWork" href="https://github.com/VedSoni-dev/omniwork"
                image="/projects/omniwork.svg" alt="OmniWork's desktop coding workspace" />.
            </p>
          </section>

          <section className="personal-section" aria-label="AI and robotics research">
            <p>My research at Texas A&amp;M has spanned AI agents and robotics:</p>
            <ul>
              <li><strong>ART Lab</strong> ($1.2 million in lab funding): I was the lead,
                working on applied AI for robots. I built an Anduril Lattice-inspired framework
                and a robot swarm hivemind.</li>
              <li><strong>DIGIT Lab</strong> ($500,000 in lab funding): I was the lead,
                working on data extraction and cleaning using AI agents.</li>
            </ul>
            <p>I also founded{' '}
              <ProjectMention name="Eden" href="https://eden-robotics.github.io/Eden/"
                image="/eden-preview.png" alt="Eden robotics framework for adaptive reasoning and memory" />,
              a university-backed undergraduate lab, and served as its principal investigator.
              We put emotions and decision-making into robots. For example, if a robot didn't
              like someone, it could refuse their requests or proactively take action of its own.
              It was my fastest project to complete.</p>
          </section>

          <section className="personal-section" aria-label="What I believe about the future">
            <p>I believe the future of the world will be shaped by:</p>
            <ol>
              <li>Coexisting with robots.</li>
              <li>Protecting people from AI labs and systems.</li>
              <li>Human creativity becoming invaluable as intelligence becomes a commodity.</li>
            </ol>
          </section>

          <section className="personal-section personal-contact" id="contact" aria-label="Get in touch">
            <p>Outside of building, I used to be Grandmaster in League of Legends.</p>
            <p>I love chatting about products and what people are building. Say hello.</p>
            <ul>
              <li><a href={`mailto:${PERSON.email}`} itemProp="email">{PERSON.email}</a></li>
              <li><a href="https://www.linkedin.com/in/vedantsonimech" target="_blank" rel="me noreferrer">LinkedIn</a></li>
              <li><a href="https://github.com/VedSoni-dev" target="_blank" rel="me noreferrer">GitHub</a></li>
              <li><a href="https://x.com/VedantRobot" target="_blank" rel="me noreferrer">X / Twitter</a></li>
            </ul>
          </section>
          <footer className="personal-footer">© {new Date().getFullYear()} {PERSON.name}</footer>
        </div>
      </main>
    </div>
  )
}
