const envs = {
  LOCAL_TEST: './local-test-config.json',
  LOCAL: './local-config.json',
  PROD: './prod-config.json',
}

/**
 * @typedef {Object} Env
 * @property {string} baseUrl
 */

/**
 * @type {Env}
 */
const env = {
  "baseUrl": "http://localhost:8080",
  //"baseUrl": "https://nikispoon.xyz",
};