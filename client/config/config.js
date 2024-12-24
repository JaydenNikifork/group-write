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
export const env = local;