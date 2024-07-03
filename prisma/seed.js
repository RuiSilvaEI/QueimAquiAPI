const { PrismaClient } = require('@prisma/client')

const usersSeed = require('./data/users.json');

const db = new PrismaClient();
const now = new Date();

async function persist(name, data, entity) {
    return entity
        .createMany({
            data
        })
        .catch((err) => {
            if (err.code === 'P2002') {
                console.log(`${name} already in db. skipping...`);
                console.error(err);
                return;
            }
            console.error(`error seeding ${name}`, err);
        });
}

async function seed() {
    await persist('users', users(), db.users);
}

async function clear() {
    console.log('cleaning...');
    await db.$queryRaw`TRUNCATE TABLE users
    , municipalities
    , burns
    `;
}

async function disconnect() {
    await db.$disconnect();
}

clear().then(() => seed().then(disconnect).catch(disconnect));

function users() {
    return usersSeed.map((u) => {
        return {
            ...u,
            createdAt: now,
            updatedAt: now
        }
    });
}