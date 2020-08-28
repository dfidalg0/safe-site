const { performance } = require('perf_hooks');

/**
 * @callback verifyHashCallback
 * @param {String} hash
 * @param {String} pass
 * @return {Boolean}
 *
 * @callback hashCallback
 * @param {String} pass
 * @return {String}
 *
 * @typedef {Object} HashObject
 * @property {hashCallback} hash
 * @property {verifyHashCallback} verify
 */

module.exports = {
    /**
    * @param {HashObject} hasher
    * @returns {Promise <{hash: String, time: Number}>}
    */
    timer: async function (hasher) {
        let t0 = performance.now();
        let hash = await hasher.hash('password');
        let time = performance.now() - t0;

        return { hash, time }
    },
    /**
    * @param {HashObject} hasher
    * @returns {Promise <Boolean>}
    */
    check: async function (hasher) {
        let {hash, verify} = hasher;
        let pass = 'password';
        let wrng = 'something_else';

        let [phash, whash] = await Promise.all([hash(pass), hash(wrng)]);

        let check = [
            verify(phash , pass),
            verify(whash , pass)
        ]

        try {
            return Promise.all(check);
        }
        catch (e){
            throw e;
        }
    }
}
