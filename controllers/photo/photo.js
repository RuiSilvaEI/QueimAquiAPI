const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bucket = require('../../utils/firebaseAdmin');

exports.updatePhoto = async (req, res) => {
    const userId = parseInt(req.params.id, 10);
    const file = req.file;

    console.log(`Received request to update photo for user ID: ${userId}`);

    try {
        const existingUser = await prisma.users.findUnique({
            where: {
                id: userId,
            },
        });

        if (!existingUser) {
            console.log(`User with ID ${userId} not found`);
            return res.status(404).json({ msg: 'User not found' });
        }

        if (file) {
            console.log(`File received: ${file.originalname}`);
            const fileName = `${Date.now()}_${file.originalname}`;
            const fileUpload = bucket.file(`uploads/${fileName}`);
            const blobStream = fileUpload.createWriteStream({
                metadata: {
                    contentType: file.mimetype,
                },
            });

            blobStream.on('error', (error) => {
                console.error('Error uploading file:', error);
                return res.status(500).json({ error: 'Internal Server Error' });
            });

            blobStream.on('finish', async () => {
                // Gera o token de acesso para a URL pública da imagem
                const [url] = await fileUpload.getSignedUrl({
                    action: 'read',
                    expires: '03-17-2025', // Defina a data de expiração do token conforme necessário
                });

                console.log(`File uploaded successfully: ${url}`);

                const updatedUser = await prisma.users.update({
                    where: { id: userId },
                    data: { photo: url },
                });

                console.log(`User photo updated successfully for user ID: ${userId}`);
                return res.status(200).json(updatedUser);
            });

            console.log('Starting file upload');
            blobStream.end(file.buffer);
        } else {
            console.log('No file uploaded');
            return res.status(400).json({ msg: 'No file uploaded' });
        }
    } catch (error) {
        console.error('Error updating user photo:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};
