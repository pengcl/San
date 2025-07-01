/**
 * formation router
 */

export default {
  routes: [
    {
      method: 'GET',
      path: '/formations',
      handler: 'formation.find',
      config: {
        auth: false
      }
    },
    {
      method: 'GET',
      path: '/formations/:id',
      handler: 'formation.findOne',
      config: {
        auth: {
          scope: ['authenticated']
        }
      }
    },
    {
      method: 'POST',
      path: '/formations',
      handler: 'formation.create',
      config: {
        auth: {
          scope: ['authenticated']
        }
      }
    },
    {
      method: 'PUT',
      path: '/formations/:id',
      handler: 'formation.update',
      config: {
        auth: {
          scope: ['authenticated']
        }
      }
    },
    {
      method: 'DELETE',
      path: '/formations/:id',
      handler: 'formation.delete',
      config: {
        auth: {
          scope: ['authenticated']
        }
      }
    }
  ]
};