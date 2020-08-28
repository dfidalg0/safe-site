const jwt = require('jsonwebtoken');
const fs = require('fs');

const public = fs.readFileSync('keys/jwt/public.key', 'utf-8');
const private = fs.readFileSync('keys/jwt/private.key', 'utf-8');
const algorithm = 'ES256';

/**
 * @name JWTSigner
 */
module.exports = {
    /**
     * @function sign
     * @param {object} user
     */
    sign : function (user) {
        let payload = {
            id : user.id
        }
        return new Promise ((resolve, reject) => {
            jwt.sign(payload, private, { algorithm }, (err, token) => {
                if (err) reject(err)
                else resolve(token);
            });
        });
    },

    /**
     * @function decode
     * @param {string} token
     */
    decode : function (token) {
        return new Promise ((resolve, reject) => {
            jwt.verify(token, public, (err, token) => {
                if (err) reject(err)
                else resolve(token);
            });
        });
    },

    middleware: async (req, res, next) => {
        try {
            if (req.cookies.token) {
                res.locals.cred = await signer.decode(req.cookies.token);
            }
        }
        catch (err) {
            if (err.message === 'invalid token') {
                console.log(`Invalid token: ${req.cookies.token}`);
            }
        }

        next();
    }
}
