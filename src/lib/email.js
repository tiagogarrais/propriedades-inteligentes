import nodemailer from "nodemailer";

export async function sendVerificationRequest({
  identifier: email,
  url,
  provider,
}) {
  // provider contains server config passed from NextAuth options
  const { server, from } = provider;

  const transporter = nodemailer.createTransport(server);

  const message = {
    to: email,
    from,
    subject: "Seu link mágico de login",
    text: `Use este link para entrar: ${url}`,
    html: `<p>Use este link para entrar:</p><p><a href="${url}">${url}</a></p>`,
  };

  await transporter.sendMail(message);
}

export async function sendNewUserNotification({ newUserEmail, provider }) {
  // provider contains server config passed from NextAuth options
  const { server, from } = provider;

  const transporter = nodemailer.createTransport(server);

  const adminEmail = process.env.EMAIL_SERVER_USER;

  const message = {
    to: adminEmail,
    from,
    subject: "Novo usuário cadastrado na plataforma",
    text: `Um novo usuário se cadastrou na plataforma Propriedades Inteligentes.\n\nE-mail: ${newUserEmail}\nData/Hora: ${new Date().toLocaleString(
      "pt-BR"
    )}\n\nAcesse o painel administrativo para mais detalhes.`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #059669;">Novo Usuário Cadastrado</h2>
        <p>Um novo usuário se cadastrou na plataforma <strong>Propriedades Inteligentes</strong>.</p>
        <div style="background-color: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>E-mail:</strong> ${newUserEmail}</p>
          <p><strong>Data/Hora:</strong> ${new Date().toLocaleString(
            "pt-BR"
          )}</p>
        </div>
        <p>Acesse o painel administrativo para mais detalhes sobre o novo usuário.</p>
      </div>
    `,
  };

  await transporter.sendMail(message);
}
