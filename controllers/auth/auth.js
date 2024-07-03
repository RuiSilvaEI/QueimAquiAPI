const bcrypt = require('bcryptjs');
const authenticateUtil = require('../../utils/authenticate.js');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const nodemailer = require('nodemailer');
const crypto = require('crypto');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASSWORD,
    },
});

exports.signin = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await prisma.users.findUnique({
            where: {
                email: email,
            },
        });

        if (user) {
            if (user.state !== 'ENABLED') {
                return res.status(403).json({ msg: "Account is disabled" });
            }

            const passwordIsValid = bcrypt.compareSync(password, user.password);

            if (passwordIsValid) {
                const accessToken = authenticateUtil.generateAccessToken({ id: user.id, name: user.name, type: user.type, state: user.state });
                res.status(200).json({ name: user.name, token: accessToken });
                return;
            }
        }

        res.status(401).json({ msg: "Invalid email/password" });

    } catch (error) {
        console.error(`Error while trying to sign in: ${ error }`);
        res.status(500).json({ msg: "Internal Server Error" });
    }
}

exports.signup = async (req, res) => {
    try {
        const { name, email, password, type, nif, state } = req.body;

        const existingUser = await prisma.users.findUnique({
            where: {
                email: email,
            },
        });

        if (existingUser) {
            return res.status(400).json({ msg: "User already exists" });
        }

        const hashedPassword = bcrypt.hashSync(password, 8);

        const newUser = await prisma.users.create({
            data: {
                name: name,
                email: email,
                password: hashedPassword,
                type: type,
                nif: nif,
                state: state,
            },
        });

        const accessToken = authenticateUtil.generateAccessToken({ id: newUser.id, name: newUser.name, type: newUser.type, state: newUser.state });
        res.status(201).json({ name: newUser.name, token: accessToken });

    } catch (error) {
        console.error(`Error while trying to sign up: ${ error }`);
        res.status(500).json({ msg: 'Internal Server Error' });
    }
}

exports.getAllUsers = async (req, res) => {
    try {
        const users = await prisma.users.findMany();
        return res.json(users);
    } catch (error) {
        console.error(`Error while trying to get users: ${error}`);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}

exports.getUser = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const user = await prisma.users.findUnique({
            where: { id: id }
        });

        if (user) {
            res.status(200).json(user);
        } else {
            res.status(404).json({ msg: "User not found" });
        }
    } catch (error) {
        console.error(`Error while trying to get user: ${error}`);
        res.status(500).json({ msg: "Internal Server Error" });
    }
}

exports.updateUser = async (req, res) => {
    try {
        const userId = parseInt(req.params.id);
        const { name, email, nif } = req.body;

        if (email) {
            const existingEmailUser = await prisma.users.findUnique({
                where: { email: email },
            });

            if (existingEmailUser && existingEmailUser.id !== userId) {
                return res.status(400).json({ msg: "Email already in use by another user" });
            }
        }

        if (nif) {
            const existingNifUser = await prisma.users.findUnique({
                where: { nif: nif },
            });

            if (existingNifUser && existingNifUser.id !== userId) {;
                return res.status(400).json({ msg: "NIF already in use by another user" });
            }
        }

        const updatedUser = await prisma.users.update({
            where: { id: userId },
            data: {
                name: name,
                email: email,
                nif: nif,
            },
        });

        res.status(200).json(updatedUser);
    } catch (error) {
        console.error(`Error while trying to update user: ${error}`);
        res.status(500).json({ msg: "Internal Server Error" });
    }
}

exports.updateUserState = async (req, res) => {
    try {
        const userId = parseInt(req.params.id);
        const { state } = req.body;

        const updatedUser = await prisma.users.update({
            where: { id: userId },
            data: { state: state },
        });

        res.status(200).json(updatedUser);
    } catch (error) {
        console.error(`Error while trying to update user state: ${error}`);
        res.status(500).json({ msg: "Internal Server Error" });
    }
};

exports.changePassword = async (req, res) => {
    try {
        const userId = parseInt(req.params.id);
        const { oldPassword, newPassword } = req.body;

        const user = await prisma.users.findUnique({
            where: { id: userId },
        });

        if (!user) {
            return res.status(404).json({ msg: "User not found" });
        }

        const passwordIsValid = bcrypt.compareSync(oldPassword, user.password);
        if (!passwordIsValid) {
            return res.status(401).json({ msg: "Invalid old password" });
        }

        const hashedNewPassword = bcrypt.hashSync(newPassword, 8);

        await prisma.users.update({
            where: { id: userId },
            data: { password: hashedNewPassword },
        });

        res.status(200).json({ msg: "Password updated successfully" });
    } catch (error) {
        console.error(`Error while trying to change password: ${error}`);
        res.status(500).json({ msg: "Internal Server Error" });
    }
}

exports.changePasswordIcnf = async (req, res) => {
    try {
        const userId = parseInt(req.params.id);
        const { newPassword } = req.body;

        const user = await prisma.users.findUnique({
            where: { id: userId },
        });

        if (!user) {
            return res.status(404).json({ msg: "User not found" });
        }

        const hashedNewPassword = bcrypt.hashSync(newPassword, 8);

        await prisma.users.update({
            where: { id: userId },
            data: { password: hashedNewPassword },
        });

        res.status(200).json({ msg: "Password updated successfully" });
    } catch (error) {
        console.error(`Error while trying to change password: ${error}`);
        res.status(500).json({ msg: "Internal Server Error" });
    }
}

exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        const user = await prisma.users.findUnique({
            where: { email },
        });

        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
        const resetExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        await prisma.users.update({
            where: { email },
            data: {
                resetToken: resetCode,
                resetTokenExpires: resetExpires,
            },
        });

        const mailOptions = {
            from: process.env.GMAIL_USER,
            to: email,
            subject: 'Chama Segura APP - Password Reset Request',
            text: `You requested a password reset. Use the following code to reset your password: ${resetCode}`,
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Error sending email:', error);
                return res.status(500).json({ error: 'Failed to send email' });
            } else {
                console.log('Email sent:', info.response);
                return res.status(200).json({ msg: 'Password reset email sent' });
            }
        });

    } catch (error) {
        console.error(`Error while requesting password reset: ${error}`);
        res.status(500).json({ msg: 'Internal Server Error' });
    }
};

exports.verifyResetToken = async (req, res) => {
    try {
        const { token } = req.body;

        const user = await prisma.users.findUnique({
            where: { resetToken: token },
        });

        if (!user || user.resetTokenExpires < new Date()) {
            return res.status(400).json({ msg: 'Invalid or expired token' });
        }

        return res.status(200).json({ msg: 'Token is valid' });

    } catch (error) {
        console.error(`Error while verifying reset token: ${error}`);
        res.status(500).json({ msg: 'Internal Server Error' });
    }
};

exports.resetPassword = async (req, res) => {
    try {
        const { token, password } = req.body;

        const user = await prisma.users.findUnique({
            where: { resetToken: token },
        });

        if (!user || user.resetTokenExpires < new Date()) {
            return res.status(400).json({ msg: 'Invalid or expired token' });
        }

        const hashedNewPassword = bcrypt.hashSync(password, 8);

        await prisma.users.update({
            where: { resetToken: token },
            data: {
                password: hashedNewPassword,
                resetToken: null,
                resetTokenExpires: null,
            },
        });

        return res.status(200).json({ msg: 'Password updated successfully' });

    } catch (error) {
        console.error(`Error while resetting password: ${error}`);
        res.status(500).json({ msg: 'Internal Server Error' });
    }
};