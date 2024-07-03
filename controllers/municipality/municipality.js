const fs = require('fs');

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Return all municipalities
exports.getAll = async (req, res) => {
    try {
        const municipalities = await prisma.municipalities.findMany({
            orderBy: {
                name: 'asc'
            }
        });
        return res.json(municipalities);
    } catch (error) {
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}

// Return municipality by its id (municipality number)
exports.getById = async (req, res) => {
    try {
        const id = parseInt(req.params.number);
        const municipality = await prisma.municipalities.findUnique({
            where: { id }
        });
        if (!municipality || municipality && municipality.state === 'DISABLED') return res.status(404).json({ error: 'Municipality not found' });
        return res.json(municipality);
    } catch (error) {
        console.error(`Error while trying to get Municipality by id: ${ error }`);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}

// Return municipality by responsible user ID
exports.getByResponsibleUserId = async (req, res) => {
    try {
        const userId = parseInt(req.params.userId);
        const municipality = await prisma.municipalities.findFirst({
            where: { responsible: userId }
        });
        if (!municipality) return res.status(404).json({ error: 'Municipality not found' });
        return res.json(municipality);
    } catch (error) {
        console.error(`Error while trying to get Municipality by responsible user ID: ${ error }`);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Create a new municipality
exports.create = async (req, res) => {
    try {
        const { name, taxNumber, address, state, responsible } = req.body;

        // Check if the responsible user is of type CM or ICNF
        if (responsible) {
            const user = await prisma.users.findUnique({
                where: { id: responsible }
            });

            if (!user || (user.type !== 'CM' && user.type !== 'ICNF')) {
                return res.status(400).json({ error: 'User must be of type CM or ICNF to be responsible for a municipality' });
            }

            // Check if the user is already responsible for another municipality
            const existingMunicipality = await prisma.municipalities.findFirst({
                where: { responsible }
            });
            if (existingMunicipality) {
                return res.status(400).json({ error: 'User is already responsible for another municipality' });
            }
        }

        const newMunicipality = await prisma.municipalities.create({
            data: {
                name,
                taxNumber,
                address,
                state,
                responsible: responsible || null
            }
        });
        return res.status(201).json(newMunicipality);
    } catch (error) {
        console.error(`Error while trying to create Municipality: ${error}`);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Update a municipality
exports.update = async (req, res) => {
    try {
        const id = parseInt(req.params.number);
        const { name, taxNumber, address, state, responsible } = req.body;

        // Check if the responsible user is of type CM or ICNF
        if (responsible) {
            const user = await prisma.users.findUnique({
                where: { id: responsible }
            });

            if (!user || (user.type !== 'CM' && user.type !== 'ICNF')) {
                return res.status(400).json({ error: 'User must be of type CM or ICNF to be responsible for a municipality' });
            }

            // Check if the user is already responsible for another municipality
            const existingMunicipality = await prisma.municipalities.findFirst({
                where: {
                    responsible,
                    id: {
                        not: id
                    }
                }
            });
            if (existingMunicipality) {
                return res.status(400).json({ error: 'User is already responsible for another municipality' });
            }
        }

        const updatedMunicipality = await prisma.municipalities.update({
            where: { id },
            data: {
                name,
                taxNumber,
                address,
                state,
                responsible
            }
        });
        return res.json(updatedMunicipality);
    } catch (error) {
        console.error(`Error updating municipality: ${error}`);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Delete a municipality by its id (municipality number)
exports.delete = async (req, res) => {
    try {
        const id = parseInt(req.params.number);
        await prisma.municipalities.delete({
            where: { id }
        });
        return res.send("ok");
    } catch (error) {
        console.error(`Error while trying to delete Municipality: ${error}`);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};