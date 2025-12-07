import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Lightweight app settings that users may configure.
 * These personalize UI and potentially labels in the generated schedule.
 */
type Settings = {
  labName: string;
  piName: string;
};

/**
 * Values and actions exposed by SettingsContext
 * - settings: Current lab configuration
 * - updateSettings: Persist selective updates to AsyncStorage
 * - loading: Indicates whether settings are still being retrieved from storage
 */
type SettingsContextType = {
  settings: Settings;
  updateSettings: (partial: Partial<Settings>) => Promise<void>;
  loading: boolean;
};

// Default values used on first install or if storage is missing/corrupt.
const defaultSettings: Settings = {
  labName: 'Behavioral Neuroscience Lab',
  piName: 'Dr. Minervini',
};

// React context storing persistent configuration settings.
const SettingsContext = createContext<SettingsContextType | undefined>(
  undefined
);

// AsyncStorage key used to store JSON-serialized settings.
const STORAGE_KEY = 'labshift_settings_v2';

//Provider component that loads/saves settings and exposes update methods.
export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  // Local state for settings. Initialized with defaults until storage loads.
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  //Loading tracks whether we've completed AsyncStorage retrieval.
  const [loading, setLoading] = useState(true);

  /**
   * On mount: 
   * - Load stored settings from AsyncStorage (if present)
   * - Merge with defaults to ensure required fields exist.
   */
  useEffect(() => {
    const load = async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          // Merge to allow new defaults to be applied automatically
          setSettings({ ...defaultSettings, ...parsed });
        }
      } catch (e) {
        console.warn('Failed to load settings', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  /**
   * Update a subset of settings and persist result to AsyncStorage.
   * 'partial' allows updating one field without overwriting the entire object.
   */
  const updateSettings = async (partial: Partial<Settings>) => {
    const next = { ...settings, ...partial };
    setSettings(next);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch (e) {
      console.warn('Failed to save settings', e);
    }
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, loading }}>
      {children}
    </SettingsContext.Provider>
  );
};

/**
 * Hook to access settings & actions.
 * Ensures consumer is inside the <SettingsProvider>.
 */
export const useSettings = () => {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used inside SettingsProvider');
  return ctx;
};
