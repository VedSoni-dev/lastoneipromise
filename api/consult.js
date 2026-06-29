import { Redis } from '@upstash/redis'

const kv = new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
})

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

    await kv.set(`consult:${email}`, JSON.stringify(request))
    await kv.lpush('consult_requests', email)

    return res.status(200).json({ ok: true })
  } catch (err) {
    console.error('Consult error:', err)
    return res.status(500).json({ error: 'internal error' })
  }
}
