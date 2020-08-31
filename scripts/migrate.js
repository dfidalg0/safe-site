if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const path = require('path');
const fs = require('fs');
const db = require('../apps/controllers/clients/database');

let migrations_folder = path.join(__dirname, 'migrations')

let migrations = fs.readdirSync(migrations_folder).sort();

async function main () {
    let client = await db.connect();

    try {
        await client.query(`
            CREATE TABLE IF NOT EXISTS migrations (
                id SERIAL,
                name VARCHAR(100),
                applied TIMESTAMP
            );
        `);

        let rows = (await client.query(`
            SELECT name FROM migrations
            WHERE applied = (
                SELECT max(applied) FROM migrations
            );
        `)).rows;

        let last = rows.length ? 1 + migrations.indexOf(rows[0].name) : 0;

        migrations = migrations.map(name => ({
            name,
            path: path.join(migrations_folder, name)
        }));

        migrations = migrations.slice(last);

        if (migrations.length) console.log('Migrations to perform:');
        else console.log('No migrations to apply');

        for (migration of migrations) {
            process.stdout.write(migration.name);
            let instructions = fs.readFileSync(migration.path, 'utf-8');
            await client.query(instructions);
            await client.query(`
                INSERT INTO migrations (name, applied)
                VALUES ($1, NOW())
            `, [migration.name]);
            console.log(' - Done.');
        }
    }
    catch (err){
        console.error(err.stack);
        process.exitCode = 1;
    }
    finally {
        client.release();
        await db.end();
    }
};

main();
