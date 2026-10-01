import { default as makeWASocket, useMultiFileAuthState } from '@whiskeysockets/baileys'
import pino from 'pino'
import qrcode from 'qrcode-terminal'

async function start() {
  const { state, saveCreds } = await useMultiFileAuthState('auth')
  const sock = makeWASocket({ logger: pino({ level: 'silent' }), auth: state })
  sock.ev.on('creds.update', saveCreds)
  sock.ev.on('connection.update', (u) => {
    if(u.qr){ qrcode.generate(u.qr, {small:true}) }
    if(u.connection === 'open'){ console.log('✅ Connected') }
  })
  sock.ev.on('messages.upsert', async m => {
    const msg = m.messages[0]
    if(!msg.message || msg.key.fromMe) return
    const t = msg.message.conversation || msg.message.extendedTextMessage?.text || ''
    const jid = msg.key.remoteJid
    if(t === '.menu') await sock.sendMessage(jid, {text:'*ZEEN BOT*\n.menu\n.zeen\n.ping'})
    if(t === '.zeen') await sock.sendMessage(jid, {text:'انا زين 😎'})
    if(t === '.ping') await sock.sendMessage(jid, {text:'Pong ⚡'})
  })
}
start()