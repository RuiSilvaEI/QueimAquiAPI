const fs = require('fs');

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

//return all burns
exports.getAll = async (req, res) => {
    try {
        const burns = await prisma.burns.findMany();
        return res.json(burns);
    } catch (error) {
        console.error(`Error while trying to get burns: ${ error }`);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}

//return burn by his id (burn number)
exports.getById = async (req, res) => {
    try {
        const id = parseInt(req.params.number);
        const burn = await prisma.burns.findUnique({
            where: { id }
        });
        if (!burn) return res.status(404).json({ error: 'Burn not found' });
        return res.json(burn);
    } catch (error) {
        console.error(`Error while trying to get burn by id: ${ error }`);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}

// Return all burns for a specific user by user ID
exports.getByUser = async (req, res) => {
    try {
        const userId = parseInt(req.params.id);
        const burns = await prisma.burns.findMany({
            where: { userId }
        });
        return res.json(burns);
    } catch (error) {
        console.error(`Error while trying to get burns by user: ${ error }`);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}

// Return all burns for a specific user by user ID and type
exports.getByUserAndType = async (req, res) => {
    try {
        const userId = parseInt(req.params.userId);
        const type = req.params.type;
        const burns = await prisma.burns.findMany({
            where: {
                userId,
                type
            }
        });
        return res.json(burns);
    } catch (error) {
        console.error(`Error while trying to get burns by user and type: ${error}`);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}

// Return all burns by type
exports.getByType = async (req, res) => {
    try {
        const type = req.params.type;
        const burns = await prisma.burns.findMany({
            where: { type }
        });
        return res.json(burns);
    } catch (error) {
        console.error(`Error while trying to get burns by type: ${error}`);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Return all burns by state and type
exports.getByStateAndType = async (req, res) => {
    try {
        const state = req.params.state;
        const type = req.params.type;
        const burns = await prisma.burns.findMany({
            where: {
                state,
                type
            }
        });
        return res.json(burns);
    } catch (error) {
        console.error(`Error while trying to get burns by state and type: ${error}`);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}

exports.getByState = async (req, res) => {
    try {
        const state = req.params.state;
        const burns = await prisma.burns.findMany({
            where: { state: state }
        });
        return res.json(burns);
    } catch (error) {
        console.error(`Error while trying to get burns by state: ${error}`);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Return all burns by state and concelho
exports.getByStateAndConcelho = async (req, res) => {
    try {
        const state = req.params.state;
        const concelho = req.params.concelho;
        const burns = await prisma.burns.findMany({
            where: {
                state,
                concelho
            }
        });
        return res.json(burns);
    } catch (error) {
        console.error(`Error while trying to get burns by state and concelho: ${error}`);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}

// Return all burns by state, concelho and type
exports.getByStateConcelhoAndType = async (req, res) => {
    try {
        const state = req.params.state;
        const concelho = req.params.concelho;
        const type = req.params.type;
        const burns = await prisma.burns.findMany({
            where: {
                state,
                concelho,
                type
            }
        });
        return res.json(burns);
    } catch (error) {
        console.error(`Error while trying to get burns by state, concelho and type: ${error}`);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}

// Return all burns by concelho
exports.getByConcelho = async (req, res) => {
    try {
        const concelho = req.params.concelho;
        const burns = await prisma.burns.findMany({
            where: {
                concelho
            }
        });
        return res.json(burns);
    } catch (error) {
        console.error(`Error while trying to get burns by concelho: ${error}`);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}

// Update the status of a burn
exports.updateBurnState = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const newState = req.params.state;

        if (!['APPROVED', 'PENDING', 'DENIED', 'DELETED'].includes(newState)) {
            return res.status(400).json({ error: 'Invalid state' });
        }

        const updatedBurn = await prisma.burns.update({
            where: { id },
            data: { state: newState }
        });

        return res.json(updatedBurn);
    } catch (error) {
        if (error.code === 'P2025') {
            return res.status(404).json({ error: 'Burn not found' });
        }
        console.error(`Error while trying to update burn state: ${error}`);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};

exports.getNumberOfBurnRequests = async (req, res) => {
    try {
        const userId = parseInt(req.params.userId);

        const burnCount = await prisma.burns.count({
            where: { userId: userId }
        });

        res.status(200).json({ count: burnCount });
    } catch (error) {
        console.error(`Error while trying to get number of burn requests: ${error}`);
        res.status(500).json({ msg: "Internal Server Error" });
    }
}

//creates burn
exports.create = async (req, res) => {
    try {
        const { date, reason, latitude, longitude, otherData, userId, type, distrito, concelho, freguesia, state } = req.body;

        if (!reason || !latitude || !longitude || !userId || !type || !distrito || !concelho || !freguesia) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const newBurn = await prisma.burns.create({
            data: {
                date: date,
                reason,
                latitude,
                longitude,
                otherData,
                userId,
                type,
                distrito,
                concelho,
                freguesia,
                state
            }
        });
        return res.status(201).json(newBurn);
    } catch (error) {
        console.error(`Error while trying to create burns: ${ error }`);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}


//delete burn by his id (burn number)
exports.delete = async (req, res) => {
    try {
        const id = parseInt(req.params.number);
        await prisma.burns.delete({
            where: { id }
        });
        return res.send("ok");
    } catch (error) {
        console.error(`Error while trying to delete burns: ${ error }`);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}