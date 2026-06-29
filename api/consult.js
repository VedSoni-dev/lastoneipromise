import { Redis } from '@upstash/redis'
import { Resend } from 'resend'

const kv = new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
})

const resend = new Resend(process.env.RESEND_API_KEY)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'method not allowed' })
  }

  try {
    const { email, problem } = req.body

    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: 'invalid email' })
    }
    if (!problem || problem.trim().length < 10) {
      return res.status(400).json({ error: 'please describe your situation' })
    }

    const request = {
      email,
      problem: problem.trim(),
      submittedAt: new Date().toISOString(),
    }

    // Store in Redis
    await kv.set(`consult:${email}`, JSON.stringify(request))
    await kv.lpush('consult_requests', email)

    // Notify Vedant
    await resend.emails.send({
      from: 'vedantsoni.com <notifications@vedantsoni.com>',
      to: 'ved.06.soni@gmail.com',
      subject: `new inquiry from ${email}`,
      html: `
        <div style="font-family: monospace; max-width: 600px; padding: 32px; background: #0d1117; color: #e6edf3; border-radius: 8px;">
          <p style="color: #7d8590; font-size: 12px; margin: 0 0 24px;">new consulting request · ${new Date().toLocaleString('en-US', { timeZone: 'America/Chicago' })} CT</p>
          <p style="font-size: 13px; color: #7d8590; margin: 0 0 4px;">from</p>
          <p style="font-size: 16px; margin: 0 0 24px;"><a href="mailto:${email}" style="color: #58a6ff;">${email}</a></p>
          <p style="font-size: 13px; color: #7d8590; margin: 0 0 8px;">what they're working on</p>
          <div style="background: #161b22; border: 1px solid #30363d; border-radius: 6px; padding: 16px; font-size: 15px; line-height: 1.6; white-space: pre-wrap;">${problem.trim()}</div>
          <p style="margin: 24px 0 0; font-size: 13px; color: #7d8590;">reply directly to this email to reach them.</p>
        </div>
      `,
      replyTo: email,
    })

    return res.status(200).json({ ok: true })
  } catch (err) {
    console.error('Consult error:', err)
    return res.status(500).json({ error: 'internal error' })
  }
}
