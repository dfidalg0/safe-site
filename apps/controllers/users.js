const sqlite3 = require('sqlite3');

const db = new sqlite3.Database('databases/users.sqlite');

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
 * @param {String | Number} name_or_id
 * @return {Promise <User>}
 */
function findUser(name_or_id) {
    return new Promise ((resolve, reject) => {
        let username = name_or_id;
        if (typeof name_or_id === 'string') {
            let stmt = db.prepare('SELECT * FROM users WHERE username = (?)');
            stmt.get(username, (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
            stmt.finalize();
        }
        else if (Number.isInteger(name_or_id)) {
            let id = name_or_id;
            let stmt = db.prepare('SELECT * FROM users WHERE id = (?)');
            stmt.get(id, (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        }
        else resolve(null);
    });
}

/**
 * @param {String} username
 * @param {String} password
 */
function addUser (username, password){
    return new Promise (async (resolve, reject) => {
        if (
            typeof username !== 'string' ||
            typeof password !== 'string'
        ){
            reject(TypeError('username and password must be strings'));
        }

        let user = await findUser(username);

        if (user){
            return resolve(null);
        }

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

/**
 * @name userController
 */
module.exports = {
    findUser, addUser
}
