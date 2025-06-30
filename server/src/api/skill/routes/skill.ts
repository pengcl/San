/**
 * skill router
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreRouter('api::skill.skill', {
  config: {
    find: {
      auth: false,
    },
    findOne: {
      auth: false,
    },
  },
}); 