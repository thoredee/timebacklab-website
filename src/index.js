import { handleSubmit } from './api/submit.js';
import { handleAdminSubmissions, handleDeleteSubmission } from './api/admin-submissions.js';
import { handleReportNodes, handleUpdateReportNode } from './api/report-nodes.js';
import { handleReport } from './api/report.js';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === '/api/submit' && request.method === 'POST') {
      return handleSubmit(request, env);
    }
    if (url.pathname === '/api/admin/submissions' && request.method === 'GET') {
      return handleAdminSubmissions(request, env);
    }
    if (url.pathname === '/api/admin/submissions' && request.method === 'DELETE') {
      return handleDeleteSubmission(request, env);
    }
    if (url.pathname === '/api/admin/report-nodes' && request.method === 'GET') {
      return handleReportNodes(request, env);
    }
    if (url.pathname === '/api/admin/report-nodes' && request.method === 'PUT') {
      return handleUpdateReportNode(request, env);
    }
    if (url.pathname === '/api/report' && request.method === 'GET') {
      return handleReport(request, env);
    }

    return env.ASSETS.fetch(request);
  },
};
