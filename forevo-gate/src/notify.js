import axios from 'axios'
import dotenv from 'dotenv'
dotenv.config()

const TOKEN = process.env.BOT_TOKEN
const INVITE_LINK = process.env.INVITE_LINK

export async function sendJoinLink(tg_id) {
  if (!TOKEN || !INVITE_LINK) return
  const url = `https://api.telegram.org/bot${TOKEN}/sendMessage`
  const payload = {
    chat_id: tg_id,
    text: 'Готово! Жми, чтобы отправить заявку на вступление в закрытый чат FOREVO:',
    reply_markup: {
      inline_keyboard: [[{ text: 'Вступить в закрытый чат', url: INVITE_LINK }]]
    }
  }
  try {
    await axios.post(url, payload)
  } catch (e) {
    console.error('sendJoinLink error', e?.response?.data || e.message)
  }
}
