const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('db.sqlite');

/**
 * @typedef {Object} User
 * @property {Number} id
 * @property {String} username
 * @property {String} password
 *
 */

db.run(
    `CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY,
        username VARCHAR(32) UNIQUE NOT NULL,
        password VARCHAR(2000) NOT NULL
    )`
);

/**
 * @param {String | Number} user
 * @return {Promise <User>}
 */
function findUser (user) {
    return new Promise ((resolve, reject) => {
        if (typeof user === 'string') {
            let stmt = db.prepare('SELECT * FROM users WHERE username = (?)');
            stmt.get(user, (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
            stmt.finalize();
        }
        else if (Number.isInteger(user)) {
            let id = user;
            let stmt = db.prepare('SELECT * FROM users WHERE id = (?)');
            stmt.get(id, (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        }
    });
}

/**
 * @param {String} username
 * @param {String} password
 */
function addUser (username, password){
    return new Promise ((resolve, reject) => {
        let stmt = db.prepare(`
        INSERT INTO users ("username", "password")
            VALUES ((?),(?))`
        );
        stmt.run([username, password], (err) => {
            if (err) reject(err);
            else {
                stmt.finalize();
                db.get(
                    'SELECT * FROM users WHERE id=(SELECT max(id) FROM users)',
                    (err, row) => {
                        if (err) reject (err)
                        else resolve(row);
                    }
                );
            }
        });
    });
}

module.exports = {
    findUser, addUser
}
