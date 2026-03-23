import { kv } from '@vercel/kv'
import nodemailer from 'nodemailer'

// Forgetting curve intervals (hours after signup)
// Based on Ebbinghaus: memory drops ~50% after 1 day, then slower decay
const REMINDER_SCHEDULE = [
  { emailIndex: 0, hoursAfter: 20 },   // ~1 day: "remember me?"
  { emailIndex: 1, hoursAfter: 72 },   // ~3 days: deeper content
  { emailIndex: 2, hoursAfter: 168 },  // ~1 week: the pull-back
  { emailIndex: 3, hoursAfter: 360 },  // ~2 weeks: final reminder
]

// Email templates based on what sections they saw
function getEmailContent(subscriber, emailIndex) {
  const { engagement } = subscriber
  const sections = engagement.sectionsViewed || []
  const depth = engagement.maxScrollDepth || 0
  const timeOnPage = engagement.timeOnPage || 0

  const emails = [
    // Email 0: ~1 day later. Light, curious.
    {
      subject: "you're about to forget something",
      html: buildEmail({
        opening: "hey — you visited my site yesterday.",
        body: depth < 50
          ? "you didn't scroll very far. there's a lot more down there — robots, research, a blackjack game. just saying."
          : "you made it pretty deep. but memory is funny — right about now, you're losing about half of what you saw.",
        closing: sections.includes('blog')
          ? "you read some of my blog. here's what i didn't write yet: the cognition team just hit a milestone that changes everything. more soon."
          : "i write about building robots, startups, and the things nobody tells you about founding a company. might be worth a look.",
        cta: { text: "come back", url: "https://vedantsoni.com" },
      })
    },

    // Email 1: ~3 days later. More personal.
    {
      subject: "the forgetting curve is real",
      html: buildEmail({
        opening: "fun fact: you've now forgotten about 70% of what you saw on my site.",
        body: sections.includes('work')
          ? "you saw my work — cognition, fern, eden. but did you know fern started because i met a kid who couldn't speak, and i thought 'i can fix that'? 10,000 users later, turns out i was right."
          : "you might remember my name. maybe not what i do. i build AI that adapts to how people learn (cognition), communication tools for nonverbal kids (fern), and humanoid robots that learn from experience (eden).",
        closing: "this email exists because i built the same spaced repetition system that powers cognition — except this time it's about remembering me.",
        cta: { text: "refresh your memory", url: "https://vedantsoni.com" },
      })
    },

    // Email 2: ~1 week later. The hook.
    {
      subject: "one week later",
      html: buildEmail({
        opening: "it's been a week since you found my site.",
        body: `by now, without reinforcement, you'd remember less than 20% of what you saw. that's not a guess — it's the ebbinghaus forgetting curve, and it's the exact problem i'm solving at cognition.`,
        closing: timeOnPage > 60
          ? `you spent over a minute on my site. that means something caught your attention. whatever it was — it's still there, and it's gotten better since you last looked.`
          : `most people spend a few seconds on a portfolio and move on. you're getting this email because you didn't. something made you stay.`,
        cta: { text: "see what's new", url: "https://vedantsoni.com" },
      })
    },

    // Email 3: ~2 weeks later. Last one, direct.
    {
      subject: "last one, i promise",
      html: buildEmail({
        opening: "this is the last email you'll get from me.",
        body: "four emails, spaced across two weeks, timed to the exact moments your brain would otherwise let go. this is literally what cognition does — except with everything you need to learn, not just one website.",
        closing: "if any of this was interesting — building with me, working together, or just talking about AI and robotics — reply to this email. it goes straight to my inbox.",
        cta: { text: "vedantsoni.com", url: "https://vedantsoni.com" },
      })
    },
  ]

  return emails[emailIndex] || null
}

function buildEmail({ opening, body, closing, cta }) {
  return `
    <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 40px 20px; color: #1a1a1a; line-height: 1.7;">
      <p style="font-size: 16px; margin-bottom: 20px;">${opening}</p>
      <p style="font-size: 16px; margin-bottom: 20px;">${body}</p>
      <p style="font-size: 16px; margin-bottom: 30px;">${closing}</p>
      ${cta ? `
        <a href="${cta.url}" style="display: inline-block; padding: 12px 28px; background: #000; color: #fff; text-decoration: none; border-radius: 6px; font-size: 14px; letter-spacing: 0.5px;">${cta.text}</a>
      ` : ''}
      <p style="margin-top: 40px; font-size: 13px; color: #999;">— vedant</p>
      <p style="font-size: 11px; color: #ccc; margin-top: 20px;">you signed up on vedantsoni.com. this is email ${cta ? '' : 'the last'} of 4, timed to when your brain forgets.</p>
    </div>
  `
}

export default async function handler(req, res) {
  // Verify cron secret to prevent unauthorized access
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'unauthorized' })
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  })

  try {
    const emails = await kv.smembers('subscribers')
    let sent = 0

    for (const email of emails) {
      const raw = await kv.get(`sub:${email}`)
      if (!raw) continue

      const subscriber = typeof raw === 'string' ? JSON.parse(raw) : raw
      const subscribedAt = new Date(subscriber.subscribedAt)
      const hoursSinceSignup = (Date.now() - subscribedAt.getTime()) / (1000 * 60 * 60)
      const nextEmail = REMINDER_SCHEDULE[subscriber.emailsSent]

      if (!nextEmail) continue // all emails sent
      if (hoursSinceSignup < nextEmail.hoursAfter) continue // not time yet

      const content = getEmailContent(subscriber, nextEmail.emailIndex)
      if (!content) continue

      await transporter.sendMail({
        from: `Vedant Soni <${process.env.GMAIL_USER}>`,
        to: email,
        subject: content.subject,
        html: content.html,
      })

      // Update subscriber
      subscriber.emailsSent += 1
      subscriber.lastEmailAt = new Date().toISOString()
      await kv.set(`sub:${email}`, JSON.stringify(subscriber))

      sent++
    }

    return res.status(200).json({ ok: true, sent })
  } catch (err) {
    console.error('Send reminders error:', err)
    return res.status(500).json({ error: 'internal error' })
  }
}
