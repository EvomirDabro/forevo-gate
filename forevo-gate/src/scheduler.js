import cron from 'node-cron'
import dotenv from 'dotenv'
import { db } from './db.js'
import { hasNft } from './ton.js'
import { Telegraf } from 'telegraf'

dotenv.config()

const BOT_TOKEN = process.env.BOT_TOKEN
const CHAT_ID = process.env.CHAT_ID
const bot = new Telegraf(BOT_TOKEN)

// каждые 6 часов
cron.schedule('0 */6 * * *', async () => {
  console.log('[cron] recheck start')
  await db.read()
  for (const u of db.data.users) {
    try {
      const ok = await hasNft(u.wallet)
      u.verified = ok
      if (!ok) {
        try {
          // мягкий «кик» (бан→анбан)
          await bot.telegram.banChatMember(CHAT_ID, u.tg_id, Math.floor(Date.now()/1000)+30)
          await bot.telegram.unbanChatMember(CHAT_ID, u.tg_id)
        } catch (e) {
          console.warn('kick error', e.message)
        }
        await bot.telegram.sendMessage(u.tg_id, 'Доступ приостановлен: FOREVO NFT не найден. Вернёшь — я впущу снова 🤝')
      }
    } catch (e) {
      console.error('recheck error', e)
    }
  }
  await db.write()
  console.log('[cron] recheck done')
})

// запустить планировщик
console.log('Scheduler running (every 6h)')
