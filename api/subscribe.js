import { Redis } from '@upstash/redis'

const kv = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
})

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'method not allowed' })
  }

  try {
    const { email, engagement } = req.body

    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: 'invalid email' })
    }

    // Store subscriber with engagement data
    const subscriber = {
      email,
      engagement,
      subscribedAt: new Date().toISOString(),
      emailsSent: 0,
      lastEmailAt: null,
    }

    // Use email as key, prefixed
    await kv.set(`sub:${email}`, JSON.stringify(subscriber))

    // Add to the set of all subscribers for cron lookups
    await kv.sadd('subscribers', email)

    return res.status(200).json({ ok: true })
  } catch (err) {
    console.error('Subscribe error:', err)
    return res.status(500).json({ error: 'internal error' })
  }
}
