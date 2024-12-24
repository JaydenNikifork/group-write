import local from './local-config.json';
import localTest from './local-test-config.json';
import prod from './prod-config.json';

/**
 * @typedef {Object} Env
 * @property {string} baseUrl
 */

/**
 * @type {Env}
 */
export let env = undefined;

switch(process.env.env) {
  case "local": env = local; break;
  case "localTest": env = localTest; break;
  case "prod": env = prod; break;
  default: throw new Error("`process.env.env` invalid value!");
}
