import express from 'express'
import dotenv from 'dotenv'
import path from 'node:path'
import cors from 'cors'
import { fileURLToPath } from 'node:url'
import { db } from './db.js'
import { hasNft } from './ton.js'
import { sendJoinLink } from './notify.js'

dotenv.config()

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app = express()
app.use(cors())
app.use(express.json())

// Отдаём статические файлы (WebApp)
const publicDir = path.join(__dirname, '..', 'public')
app.use(express.static(publicDir))

// Проверка кошелька от WebApp
// ожидает: { tg_id, wallet }
app.post('/api/verify', async (req, res) => {
  try {
    const { tg_id, wallet } = req.body || {}
    if (!tg_id || !wallet) return res.status(400).json({ ok: false, error: 'tg_id и wallet обязательны' })

    const ok = await hasNft(wallet)

    // апсерт в БД
    await db.read()
    const u = db.data.users.find(x => String(x.tg_id) === String(tg_id))
    if (u) {
      u.wallet = wallet
      u.verified = ok
      u.verified_at = new Date().toISOString()
    } else {
      db.data.users.push({ tg_id, wallet, verified: ok, verified_at: new Date().toISOString() })
    }
    await db.write()

    if (ok) {
      await sendJoinLink(tg_id)
    }

    res.json({ ok, message: ok ? 'NFT найден' : 'NFT не найден' })
  } catch (e) {
    console.error(e)
    res.status(500).json({ ok: false, error: 'server_error' })
  }
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => console.log(`Server on http://localhost:${PORT}`))
