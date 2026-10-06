import { useCallback, useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { getSettings, saveSettings } from '../api/databaseApi';
import { DEFAULT_SETTINGS } from '../constants/defaults';
import { toSavedLabel } from '../utils/label';

const SAVE_DELAY_MS = 400;

// Fills anything missing in the saved data with defaults.
const withDefaults = (data) => ({
  serial: {
    start: { ...DEFAULT_SETTINGS.serial.start, ...data?.serial?.start },
    end: { ...DEFAULT_SETTINGS.serial.end, ...data?.serial?.end },
  },
  label: { ...DEFAULT_SETTINGS.label, ...data?.label },
});

// The current serial range + label settings, kept in database/settings.json.
// Changes are saved automatically shortly after you stop typing.
export default function useSettings() {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [status, setStatus] = useState('loading'); // 'loading' | 'ready' | 'error'
  const [error, setError] = useState('');
  const dirty = useRef(false);

  const load = useCallback(() => {
    setStatus('loading');
    getSettings()
      .then((data) => {
        setSettings(withDefaults(data));
        setStatus('ready');
      })
      .catch((err) => {
        setError(err.message);
        setStatus('error');
      });
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Accepts a new settings object or an updater function, like setState.
  const update = useCallback((next) => {
    dirty.current = true;
    setSettings(next);
  }, []);

  useEffect(() => {
    if (!dirty.current) return undefined;
    const timer = setTimeout(() => {
      dirty.current = false;
      saveSettings({ serial: settings.serial, label: toSavedLabel(settings.label) }).catch((err) =>
        toast.error(`Could not save settings: ${err.message}`),
      );
    }, SAVE_DELAY_MS);
    return () => clearTimeout(timer);
  }, [settings]);

  return { settings, update, status, error, reload: load };
}
