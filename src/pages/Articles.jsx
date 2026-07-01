import { useEffect } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import SEOHead from '../components/SEOHead'
import './Articles.css'

export const ARTICLES = [
  {
    slug: 'what-is-ai',
    title: 'What is AI, actually?',
    description: 'A plain-English answer without the robot movie stuff or a computer science degree.',
    category: 'Start here',
    readingTime: '5 min read',
    updated: 'July 2026',
    dek: 'AI is software that learns patterns from examples. That sounds simple because, at its core, it is.',
    sections: [
      {
        heading: 'The short answer',
        paragraphs: [
          'Artificial intelligence is a broad name for computer systems that do things we normally associate with human intelligence. That includes understanding language, recognizing pictures, making predictions, and solving problems.',
          'The AI most people use today does not think like a person. It is very good at finding patterns. Give it enough examples of language, images, or behavior and it can learn what usually comes next.',
        ],
      },
      {
        heading: 'Think of it like a very well-read autocomplete',
        paragraphs: [
          'When you ask a chatbot a question, it breaks your words into small pieces and predicts a useful response one piece at a time. It has seen patterns from a huge amount of training material, so those predictions can be surprisingly good.',
          'That does not mean it looked up a perfect answer in a giant filing cabinet. It generated an answer based on patterns. This is why AI can explain a hard idea clearly one minute and confidently get a basic fact wrong the next.',
        ],
      },
      {
        heading: 'What AI is good at',
        paragraphs: [
          'AI is useful when you need a first draft, a summary, a list of ideas, a new way to phrase something, or help sorting through a lot of information. It is also good at repetitive work that follows a recognizable pattern.',
          'A simple rule helps: use AI to get from a blank page to something, not from something to unquestioned truth.',
        ],
        list: ['Explaining an unfamiliar topic', 'Drafting and rewriting', 'Brainstorming options', 'Organizing messy notes', 'Finding patterns in lots of information'],
      },
      {
        heading: 'What AI is not',
        paragraphs: [
          'AI is not automatically correct, neutral, or aware of your situation. It can miss context. It can repeat bad information from its training. It can also sound certain when it should say, “I do not know.”',
          'Treat it like a smart, fast assistant who needs clear instructions and a final review. You are still the person responsible for the answer.',
        ],
      },
      {
        heading: 'The part worth remembering',
        paragraphs: [
          'You do not need to understand neural networks to use AI well. You need to know what outcome you want, give useful context, and check important work. That is most of the game.',
        ],
      },
    ],
    faqs: [
      ['Is AI the same thing as ChatGPT?', 'No. AI is the whole field. ChatGPT is one product built with a type of AI called a large language model.'],
      ['Does AI understand what it says?', 'Not in the same way a person does. It models relationships between words and ideas, which can look a lot like understanding.'],
      ['Will AI replace every job?', 'It will change parts of many jobs. People who learn where it helps and where it fails will be in a better position than people who treat it as magic or ignore it.'],
    ],
  },
  {
    slug: 'how-to-use-chatgpt',
    title: 'How to use ChatGPT without feeling silly',
    description: 'You do not need a perfect prompt. You just need to talk to it like a capable new coworker.',
    category: 'How to use AI',
    readingTime: '6 min read',
    updated: 'July 2026',
    dek: 'The best prompt is usually a normal explanation of what you need, why you need it, and what a good answer looks like.',
    sections: [
      {
        heading: 'Start with the situation, not a magic phrase',
        paragraphs: [
          'A lot of prompt advice makes using AI sound like entering a secret code. It is not. ChatGPT works better when you give it the same context you would give a helpful person.',
          'Instead of saying, “Write an email,” say who the email is for, what happened, what you want them to do, and how you want to sound. That little bit of context does more than a page of fancy prompt tricks.',
        ],
      },
      {
        heading: 'Use this simple recipe',
        paragraphs: ['A useful prompt usually has four parts. You can write them as a paragraph. The labels are just here to make the idea easy to remember.'],
        list: ['Situation: what is going on', 'Goal: what you want to accomplish', 'Details: facts the answer needs', 'Shape: how you want the answer delivered'],
        example: 'I am emailing my apartment manager because the air conditioner has been broken for three days. I already called twice. Write a short, polite message asking for a repair date. Keep it firm without sounding angry.',
      },
      {
        heading: 'Your first answer is a starting point',
        paragraphs: [
          'You do not have to accept the first response. Say what feels wrong. Ask it to make the answer shorter, friendlier, more direct, or easier to understand. You can also paste your own draft and ask what is unclear.',
          'This back and forth is not a sign that you used it badly. It is how the tool is meant to work.',
        ],
      },
      {
        heading: 'Give it a job, not a personality costume',
        paragraphs: [
          '“Act like the world’s greatest expert” usually adds confidence, not accuracy. A specific job is more helpful. Ask it to compare options, spot missing information, explain jargon, or turn notes into a checklist.',
          'The clearer the task, the easier it is to judge whether the answer helped.',
        ],
      },
      {
        heading: 'Keep private information private',
        paragraphs: [
          'Do not paste passwords, financial account numbers, private medical records, or confidential work documents into a chatbot. If the details matter, replace names and numbers with simple placeholders.',
          'For anything important, especially health, legal, money, or work decisions, use AI to prepare questions and organize your thoughts. Let a qualified person make the final call.',
        ],
      },
    ],
    faqs: [
      ['Do I need to learn prompt engineering?', 'No. Clear context, a clear goal, and a quick review will cover most everyday uses.'],
      ['Can I ask follow-up questions?', 'Yes. Follow-ups are one of the most useful parts. Tell it what worked, what did not, and what you want changed.'],
      ['Why does the answer sometimes sound generic?', 'The prompt may not include enough about your real situation. Add a few concrete details and say what tone or format you want.'],
    ],
  },
  {
    slug: 'what-ai-can-and-cannot-do',
    title: 'What AI can and cannot do for you',
    description: 'A practical way to decide when AI will save time and when it will create a new headache.',
    category: 'Use it wisely',
    readingTime: '5 min read',
    updated: 'July 2026',
    dek: 'AI is strongest when the work has patterns and room for review. It is weakest when one quiet mistake can cause real harm.',
    sections: [
      {
        heading: 'Good AI tasks have two things in common',
        paragraphs: [
          'First, there is enough information for the tool to work with. Second, you can look at the result and tell whether it is useful. Drafting a birthday invitation fits. Diagnosing chest pain does not.',
          'The sweet spot is work that takes time but does not require the computer to be trusted blindly.',
        ],
      },
      {
        heading: 'Let AI help with the rough work',
        paragraphs: ['AI is often excellent at getting the first 70 percent done. That can remove the hardest part of starting while leaving judgment in your hands.'],
        list: ['Turn scattered notes into an outline', 'Summarize a long document you can verify', 'Suggest questions before an appointment', 'Create a first draft you will edit', 'Compare options using criteria you provide'],
      },
      {
        heading: 'Do not outsource the final decision',
        paragraphs: [
          'A polished answer can still be wrong. That matters most when the decision affects someone’s health, money, rights, safety, or reputation.',
          'In those situations, AI can help you understand terms, prepare questions, or organize records. It should not be the only voice you trust.',
        ],
      },
      {
        heading: 'Watch for the confidence trick',
        paragraphs: [
          'Chatbots are designed to produce a useful response, so they often fill gaps instead of stopping. The writing may sound certain even when the underlying information is weak.',
          'Ask, “What are you uncertain about?” Then verify names, dates, quotes, statistics, and anything that would be expensive or embarrassing to get wrong.',
        ],
      },
      {
        heading: 'A ten-second test',
        paragraphs: [
          'Before using AI, ask yourself: if this answer is wrong, will I notice before it causes a problem? If yes, AI can probably help. If no, slow down and bring in a reliable source or qualified person.',
        ],
      },
    ],
    faqs: [
      ['Can AI search the internet for me?', 'Some AI tools can browse the web. Check the linked sources because a summary can still misread or omit important context.'],
      ['Should I use AI for medical or legal questions?', 'Use it to learn vocabulary and prepare questions, not to replace a qualified professional who understands your situation.'],
      ['How do I check an AI answer?', 'Look for primary sources, confirm important facts in more than one reliable place, and ask a knowledgeable person when the stakes are high.'],
    ],
  },
]

function SiteHeader() {
  return (
    <header className="article-site-header">
      <Link to="/" className="article-site-name">Vedant Soni</Link>
      <Link to="/blog" className="article-site-index">All guides</Link>
    </header>
  )
}

function ArticleStructuredData({ article }) {
  useEffect(() => {
    const script = document.createElement('script')
    script.id = 'article-structured-data'
    script.type = 'application/ld+json'
    script.textContent = JSON.stringify([
      {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: article.title,
        description: article.description,
        dateModified: '2026-07-01',
        datePublished: '2026-07-01',
        mainEntityOfPage: `https://vedantsoni.com/articles/${article.slug}`,
        author: {
          '@type': 'Person',
          name: 'Vedant Soni',
          url: 'https://vedantsoni.com',
        },
        publisher: {
          '@type': 'Person',
          name: 'Vedant Soni',
        },
      },
      {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: article.faqs.map(([question, answer]) => ({
          '@type': 'Question',
          name: question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: answer,
          },
        })),
      },
    ])
    document.head.appendChild(script)

    return () => script.remove()
  }, [article])

  return null
}

export function ArticlesIndex() {
  return (
    <div className="articles-page">
      <SEOHead
        title="AI Guides for Normal People | Vedant Soni"
        description="Plain-English guides about what AI is, how to use it, and where it actually helps. Written by Vedant Soni."
        keywords="AI guides for beginners, what is AI, how to use ChatGPT, AI explained simply, practical AI tips"
        url="https://vedantsoni.com/blog"
      />
      <SiteHeader />
      <main className="articles-index">
        <p className="articles-kicker">A normal person’s guide to AI</p>
        <h1>Useful answers, minus the tech sermon.</h1>
        <p className="articles-index-intro">
          AI is moving quickly. You do not have to. These guides explain one useful thing at a time,
          with examples you can actually use.
        </p>
        <div className="articles-index-list">
          {ARTICLES.map((article) => (
            <article key={article.slug}>
              <p className="articles-index-meta">{article.category} · {article.readingTime}</p>
              <h2><Link to={`/articles/${article.slug}`}>{article.title}</Link></h2>
              <p>{article.description}</p>
              <Link className="articles-read-link" to={`/articles/${article.slug}`}>Read the guide</Link>
            </article>
          ))}
        </div>
      </main>
      <footer className="article-footer">
        <p>Written by <Link to="/">Vedant Soni</Link>, a builder and AI researcher who explains this stuff to his family.</p>
      </footer>
    </div>
  )
}

export function ArticlePage() {
  const { slug } = useParams()
  const article = ARTICLES.find((item) => item.slug === slug)

  if (!article) return <Navigate to="/blog" replace />

  return (
    <div className="articles-page">
      <ArticleStructuredData article={article} />
      <SEOHead
        title={`${article.title} | Vedant Soni`}
        description={article.description}
        keywords={`${article.title}, AI for beginners, AI explained simply, Vedant Soni`}
        url={`https://vedantsoni.com/articles/${article.slug}`}
        type="article"
      />
      <SiteHeader />
      <main>
        <article className="article-document">
          <header className="article-header">
            <Link className="article-back" to="/blog">All AI guides</Link>
            <p className="article-category">{article.category}</p>
            <h1>{article.title}</h1>
            <p className="article-dek">{article.dek}</p>
            <div className="article-byline">
              <span>By <Link to="/">Vedant Soni</Link></span>
              <span>{article.readingTime}</span>
              <span>Updated {article.updated}</span>
            </div>
          </header>

          <div className="article-body">
            {article.sections.map((section) => (
              <section key={section.heading}>
                <h2>{section.heading}</h2>
                {section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                {section.list && (
                  <ul>{section.list.map((item) => <li key={item}>{item}</li>)}</ul>
                )}
                {section.example && (
                  <blockquote>
                    <strong>Try this:</strong> “{section.example}”
                  </blockquote>
                )}
              </section>
            ))}

            <section className="article-faq" aria-labelledby="faq-title">
              <h2 id="faq-title">Common questions</h2>
              {article.faqs.map(([question, answer]) => (
                <div className="article-faq-item" key={question}>
                  <h3>{question}</h3>
                  <p>{answer}</p>
                </div>
              ))}
            </section>
          </div>

          <aside className="article-author">
            <p className="article-author-label">Who wrote this?</p>
            <h2>Hey, I’m Vedant.</h2>
            <p>
              I build AI products and research robots at Texas A&amp;M. I write these guides
              because useful technology should not require a translator.
            </p>
            <Link to="/">More about me</Link>
          </aside>
        </article>
      </main>
      <footer className="article-footer">
        <p>Have a question I should explain next? <a href="mailto:ved.soni@tamu.edu">Send it my way.</a></p>
      </footer>
    </div>
  )
}
