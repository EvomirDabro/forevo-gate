// bot.js
// Ready-made Telegram bot (Telegraf) that sends a WebApp button
// with ?tg_id=<telegram user id> appended to WEBAPP_URL.
//
// ENV required:
// - BOT_TOKEN        : Telegram bot token
// - WEBAPP_URL       : e.g. https://eloquent-panda-7f356a.netlify.app/webapp/
// - INVITE_LINK      : (optional) link to your private chat to join
// - CHAT_ID          : (optional) admin chat id for error logs
//
// Usage: node src/bot.js

require('dotenv').config();
const { Telegraf, Markup } = require('telegraf');

const BOT_TOKEN  = process.env.BOT_TOKEN;
const WEBAPP_URL = String(process.env.WEBAPP_URL || '').trim();
const INVITE_LINK = process.env.INVITE_LINK || '';
const ADMIN_CHAT = process.env.CHAT_ID ? Number(process.env.CHAT_ID) : null;

if (!BOT_TOKEN) {
  console.error('❌ BOT_TOKEN is not set in .env');
  process.exit(1);
}
if (!WEBAPP_URL) {
  console.error('❌ WEBAPP_URL is not set in .env');
  process.exit(1);
}

const bot = new Telegraf(BOT_TOKEN);

// Small helper to build URL with tg_id param safely
function buildWebAppUrl(userId) {
  try {
    const url = new URL(WEBAPP_URL);
    url.searchParams.set('tg_id', String(userId));
    return url.toString();
  } catch (e) {
    // if WEBAPP_URL is a path or invalid URL, fallback to simple concat
    const sep = WEBAPP_URL.includes('?') ? '&' : '?';
    return `${WEBAPP_URL}${sep}tg_id=${userId}`;
  }
}

// /start handler
bot.start(async (ctx) => {
  const url = buildWebAppUrl(ctx.from.id);
  const kb = Markup.inlineKeyboard([
    Markup.button.webApp('🔗 Подключить TON‑кошелёк', url)
  ]);

  await ctx.reply(
    'Привет! Я проверю твоё право на доступ по FOREVO NFT.\n' +
    'Нажми кнопку ниже и подключи TON‑кошелёк.',
    kb
  );

  if (INVITE_LINK) {
    await ctx.reply(
      'Если доступ уже подтверждён, вот ссылка в закрытый чат:',
    );
    await ctx.reply(INVITE_LINK);
  }
});

// Optional: /connect command does the same as /start
bot.command('connect', async (ctx) => {
  const url = buildWebAppUrl(ctx.from.id);
  const kb = Markup.inlineKeyboard([
    Markup.button.webApp('🔗 Подключить TON‑кошелёк', url)
  ]);
  await ctx.reply('Открой мини‑приложение и подключи TON‑кошелёк:', kb);
});

// Basic error logging
bot.catch(async (err, ctx) => {
  console.error('Bot error:', err);
  if (ADMIN_CHAT) {
    try {
      await ctx.telegram.sendMessage(ADMIN_CHAT, `⚠️ Bot error:\n${err?.message || err}`);
    } catch (_) {}
  }
});

bot.launch().then(() => {
  console.log('✅ Bot launched. Listening for updates...');
});

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
