/**
 * user-profile router
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreRouter('api::user-profile.user-profile', {
  config: {
    find: {
      auth: false,
    },
    findOne: {
      auth: false,
    },
    create: {
      auth: false,
    },
    update: {
      auth: false,
    },
  },
}); 