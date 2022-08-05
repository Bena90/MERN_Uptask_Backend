import nodemailer from 'nodemailer';

export const emailRegister = async (data) =>{
    const { email, name, token } = data;

    const transport = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      });

    // Email information
    const info = await transport.sendMail({
        from: '"UpTask - Project management" <cuentas@uptask.com>',
        to: email,
        subject: "UpTask- Confirm your account",
        text: "Confirm your account in UpTask",
        html:
            `
                <p> Hola: ${name}. Confirm your account</p>
                <p>Your account is almost ready. You just have to confirm your email in the following link: </p>
                <a href="${process.env.FRONTEND_URI}/confirm/${token}">Reset Password</a>
            `
    })
    
}

export const emailPassword = async (data) =>{
    const { email, name, token } = data;

    const transport = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    // Email information
    const info = await transport.sendMail({
        from: '"UpTask - Project management" <cuentas@uptask.com>',
        to: email,
        subject: "UpTask- Reset your password",
        text: "Reset your password in UpTask",
        html:
            `
                <p> Hola: ${name}. You have requested to reset your password</p>
                <p>Enter the following link to reset your password: </p>
                <a href="${process.env.FRONTEND_URI}/forget-password/${token}">Confirm Account</a>
                <p> If you didn't request this email, you can ignore it</p>
            `
    })
    
}