const envs = {
  LOCAL_TEST: './local-test-config.json',
  LOCAL: './local-config.json',
  PROD: './prod-config.json',
}

/**
 * @typedef {Object} Env
 * @property {string} baseUrl
 * @property {string} daoType
 */

/**
 * @type {Env}
 */
const env = {
  "baseUrl": "http://localhost:8080",
  "daoType": "api",
};
