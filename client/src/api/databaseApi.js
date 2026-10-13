import { request } from './http';

// Everything below is stored by the server in the project's database/ folder.

// Printers
export const getPrinters = () => request('/printers');
export const createPrinter = (printer) => request('/printers', { method: 'POST', body: printer });
export const updatePrinter = (id, printer) =>
  request(`/printers/${encodeURIComponent(id)}`, { method: 'PUT', body: printer });
export const deletePrinter = (id) => request(`/printers/${encodeURIComponent(id)}`, { method: 'DELETE' });
export const selectPrinter = (id) => request('/printers/selected', { method: 'PUT', body: { id } });

// Templates
export const getTemplates = () => request('/templates');
export const saveTemplate = (template) => request('/templates', { method: 'POST', body: template });
export const deleteTemplate = (id) => request(`/templates/${encodeURIComponent(id)}`, { method: 'DELETE' });
export const markTemplatePrinted = (id, range) =>
  request(`/templates/${encodeURIComponent(id)}/printed`, { method: 'PATCH', body: range });

// Serial range + label settings
export const getSettings = () => request('/settings');
export const saveSettings = (settings) => request('/settings', { method: 'PUT', body: settings });

// Print history (finished jobs, newest first)
export const getHistory = () => request('/history');
export const addHistoryEntry = (entry) => request('/history', { method: 'POST', body: entry });
export const clearHistory = () => request('/history', { method: 'DELETE' });
