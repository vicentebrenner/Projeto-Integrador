const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
        user: 'reese.oconnell@ethereal.email',
        pass: 'mJ461Sh4UeSnwZfPyG'
    }
});

async function sendVerificationEmail(nome, email, verificationCode) {
    const mailOptions = {
        from: '"Music Makers" <no-reply@musicmakers.com>',
        to: email,
        subject: 'Seu Código de Verificação',
        html: `<p>Olá ${nome},</p><p>Seu código de verificação para o Music Makers é: <strong>${verificationCode}</strong></p><p>Este código expira em 15 minutos.</p>`
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`Código enviado para ${email}: ${verificationCode}`);
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
}

module.exports = { sendVerificationEmail };