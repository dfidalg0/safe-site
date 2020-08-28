const mbcrypt = require('bcrypt');
const margon2 = require('argon2');
const crypto = require('crypto');

const bcrypt = {
    /**
     * @param {String} pass
     * @return {Promise <String>}
     */
    hash: function (pass) {
        return new Promise((resolve, reject) => {
            mbcrypt.hash(pass, 12, (err, hash) => {
                if (err) reject(err);
                else resolve(hash);
            });
        });
    },
    /**
     * @param {String} hash
     * @param {String} pass
     * @return {Promise <Boolean>}
     */
    verify : function (hash, pass) {
        return new Promise ((resolve, reject) => {
            mbcrypt.compare(pass, hash, (err, result) => {
                if (err) reject(err);
                else resolve(result);
            });
        })
    }
}

const pbkdf2 = {
    /**
     * @param {String} pass
     * @return {Promise <String>}
     */
    hash: function (pass) {
        return new Promise((resolve, reject) => {
            let salt = crypto.randomBytes(256);
            crypto.pbkdf2(pass, salt, 200000, 64, 'sha256', (err, derivedKey) => {
                if (err) reject(err);
                else resolve(
                    salt.toString('hex') +
                    derivedKey.toString('hex')
                );
                let x = derivedKey.toString('hex');
            });
        });
    },
    /**
     * @param {String} hash
     * @param {String} pass
     * @return {Promise <Boolean>}
     */
    verify: function (hash, pass) {
        return new Promise ((resolve, reject) => {
            let salt = Buffer.from(hash.slice(0,512), 'hex');
            hash = Buffer.from(hash.slice(512), 'hex');
            crypto.pbkdf2(pass, salt, 200000, 64, 'sha256', (err, derivedKey) => {
                if (err) reject(err);
                else resolve(Buffer.compare(hash, derivedKey) === 0);
            });
        });
    }
}

const argon2 = {
    /**
    * @param {String} pass
    * @return {Promise <String>}
    */
    hash: function (pass) {
        return margon2.hash(pass, {
            timeCost: 80
        })
    },
    /**
     * @param {String} hash
     * @param {String} pass
     * @return {Promise <Boolean>}
     */
    verify: function (hash, pass){
        return margon2.verify(hash, pass)
    }
}

module.exports = { bcrypt, argon2, pbkdf2 }
