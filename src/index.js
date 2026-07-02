import { handleSubmit } from './api/submit.js';
import { handleAdminSubmissions } from './api/admin-submissions.js';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === '/api/submit' && request.method === 'POST') {
      return handleSubmit(request, env);
    }
    if (url.pathname === '/api/admin/submissions' && request.method === 'GET') {
      return handleAdminSubmissions(request, env);
    }

    return env.ASSETS.fetch(request);
  },
};
