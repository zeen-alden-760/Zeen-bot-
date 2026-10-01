import makeWASocket, { DisconnectReason, useMultiFileAuthState } from '@whiskeysockets/baileys'
import pino from 'pino'

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState('session')
    const sock = makeWASocket({
        auth: state,
        logger: pino({ level: 'silent' }),
        browser: ['Zeen Bot', 'Chrome', '1.0.0']
    })
    sock.ev.on('creds.update', saveCreds)
    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update
        if(connection === 'close') {
            const shouldReconnect = lastDisconnect?.error?.output?.statusCode!== DisconnectReason.loggedOut
            if(shouldReconnect) startBot()
        } else if(connection === 'open') {
            console.log('Zeen Bot Connected!')
        }
    })
    sock.ev.on('messages.upsert', async ({ messages }) => {
        const m = messages[0]
        if(!m.message || m.key.fromMe) return
        const from = m.key.remoteJid
        const text = m.message.conversation || m.message.extendedTextMessage?.text || ''
        if(text == '.menu') {
            await sock.sendMessage(from, { text: '*ZEEN BOT MENU*\n\n.menu - show menu\n.zeen - bot info\n.ping - check bot' })
        }
        if(text == '.zeen') {
            await sock.sendMessage(from, { text: 'I am ZEEN BOT Online 24h' })
        }
        if(text == '.ping') {
            await sock.sendMessage(from, { text: 'Pong! Fast speed' })
        }
    })
}
startBot()
