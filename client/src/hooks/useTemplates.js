import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import * as db from '../api/databaseApi';

// Saved serial/label setups (database/templates.json).
// Shape: { id, name, start, end, label, lastPrinted: {start, end} | null }
export default function useTemplates() {
  const [templates, setTemplates] = useState([]);

  useEffect(() => {
    db.getTemplates()
      .then((res) => setTemplates(res.templates))
      .catch((err) => toast.error(`Could not load templates: ${err.message}`));
  }, []);

  // Saving with an existing name overwrites that template. Returns the saved template.
  const saveTemplate = useCallback(async (template) => {
    const res = await db.saveTemplate(template);
    setTemplates(res.templates);
    return res.saved;
  }, []);

  const deleteTemplate = useCallback(async (id) => {
    const res = await db.deleteTemplate(id);
    setTemplates(res.templates);
  }, []);

  const markPrinted = useCallback(async (id, range) => {
    const res = await db.markTemplatePrinted(id, range);
    setTemplates(res.templates);
  }, []);

  return { templates, saveTemplate, deleteTemplate, markPrinted };
}
