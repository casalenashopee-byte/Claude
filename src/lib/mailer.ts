import nodemailer from "nodemailer";

function isSmtpConfigured() {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
}

let transporter: ReturnType<typeof nodemailer.createTransport> | null = null;

function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
  }
  return transporter;
}

/**
 * Envia e-mail via SMTP se configurado (.env: SMTP_HOST/PORT/USER/PASS/FROM).
 * Sem SMTP configurado (comum em self-host sem servidor de e-mail), não
 * envia nada — quem chama decide o que fazer nesse caso (ex.: logar no
 * console do servidor em vez de expor o link na tela).
 */
export async function sendMail(opts: { to: string; subject: string; html: string; text: string }) {
  if (!isSmtpConfigured()) {
    return { sent: false as const, reason: "smtp-not-configured" as const };
  }

  await getTransporter().sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to: opts.to,
    subject: opts.subject,
    html: opts.html,
    text: opts.text,
  });

  return { sent: true as const };
}

export { isSmtpConfigured };
