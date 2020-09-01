const jwt = require('jsonwebtoken');

const public = process.env.JWT_PUBLIC_KEY;
const private = process.env.JWT_PRIVATE_KEY;
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
                console.error(`Invalid token: ${req.cookies.token}`);
            }
        }

        next();
    }
}
