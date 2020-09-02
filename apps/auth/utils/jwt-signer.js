const jwt = require('jsonwebtoken');

/**
 * @name JWTSigner
 */
class JWTSigner {
    constructor (publicKey, privateKey, algorithm){
        this.privateKey = privateKey;
        this.publicKey = publicKey;
        this.algorithm = algorithm;
    }

    /**
     * @function sign
     * @param {object} user
     */
    sign (payload) {
        return new Promise((resolve, reject) => {
            let algorithm = this.algorithm;
            jwt.sign(payload, this.privateKey, { algorithm }, (err, token) => {
                if (err) reject(err)
                else resolve(token);
            });
        });
    }

    /**
     * @function decode
     * @param {string} token
     */
    decode(token) {
        return new Promise((resolve, reject) => {
            jwt.verify(token, this.publicKey, (err, token) => {
                if (err) reject(err)
                else resolve(token);
            });
        });
    }

    middleware (sessionConfig) {
        let cookieConfig = sessionConfig.cookie;
        let cookieName = sessionConfig.name;

        const signer = this;

        return async function (req, res, next) {
            if (req.cookies[cookieName]) {
                req.session = await signer.decode(req.cookies[cookieName]);
            }
            else {
                req.session = {};
            }

            Object.defineProperties(req.session, {
                save : {
                    value: async function () {
                        res.cookie(
                            cookieName,
                            await signer.sign(req.session),
                            cookieConfig
                        );
                    }
                },
                clear : {
                    value: function () {
                        req.session = {};
                    }
                },
                destroy : {
                    value: function () {
                        res.clearCookie(cookieName);
                    }
                }
            });

            next();
        }
    }
}

module.exports = new JWTSigner(process.env.JWT_PUBLIC_KEY, process.env.JWT_PRIVATE_KEY, 'ES256');
