import { APIDao, IDao, TestDao } from "../dao";

const envs = {
  LOCAL_TEST: './local-test-config.json',
  LOCAL: './local-config.json',
  PROD: './prod-config.json',
}

const localConfig = require(envs.LOCAL);
const localTestConfig = require(envs.LOCAL_TEST);

/**
 * @typedef {Object} Env
 * @property {string} baseUrl
 * @property {string} daoType
 * @property {IDao} dao
 */

/**
 * @type {Env}
 */
export const env = localConfig;

switch (env.daoType) {
  case 'api':
    env.dao = new APIDao();
    break;
  case 'test':
    env.dao = new TestDao();
    break;
  default:
    throw new Error(`Config attempted to load invalid dao type: ${env.daoType}!`);
}