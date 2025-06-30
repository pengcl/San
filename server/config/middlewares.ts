export default [
  'strapi::logger',
  'strapi::errors',
  'strapi::security',
  {
    name: 'strapi::cors',
    config: {
      headers: '*',
      origin: [
        'http://localhost:3000',
        'http://localhost:3001',
        'http://127.0.0.1:3000',
        'http://127.0.0.1:3001'
      ]
    }
  },
  'strapi::poweredBy',
  'strapi::query',
  'strapi::body',
  'global::auth',
  'strapi::session',
  'strapi::favicon',
  'strapi::public',
];
