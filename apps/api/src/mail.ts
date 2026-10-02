import nodemailer from 'nodemailer'
import { env } from './env.ts'

// In sviluppo SMTP_URL punta a Mailpit: le email si leggono su http://localhost:8025.
const transport = nodemailer.createTransport(env.SMTP_URL)

export async function sendLoginCode(to: string, code: string) {
  await transport.sendMail({
    from: env.MAIL_FROM,
    to,
    subject: `${code} è il tuo codice per entrare in Dev City`,
    text: `Il tuo codice per entrare in Dev City è ${code}.\n\nVale 10 minuti e si può usare una volta sola. Se non l'hai chiesto tu, ignora questa email.`,
  })
}
