import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import {
  getAssistants,
  createAssistant,
  getConstraints,
  updateConstraints,
  generateSchedule,
  AssistantDto,
  ConstraintsDto,
  LabSessionDto,
  deleteAssistant
} from '../lib/api';

/**
 * ScheduleContext
 * 
 * Centralized state + actions for everything related to:
 * - Lab assistants (list, create, delete)
 * - Global scheduling constraints
 * - Generated lab sessions
 * 
 * This context lets multiple screens (Dashboard, Schedule, Forms, etc.)
 * share the same data and operations without prop-drilling.
 */

type ScheduleContextType = {
  // Current list of assistants loaded from the backend.
  assistants: AssistantDto[];
  // Global constraints that influence schedule generation.
  constraints: ConstraintsDto | null;
  // Lab sessions produced by the schedule generator.
  sessions: LabSessionDto[];
  // Indicates whether the context is currently doing a network operation.
  loading: boolean;
  // User-friendly error message for failed operations (optional).
  error?: string;
  // Re-fetches assistants + constraints from the backend.
  refresh(): void;
  // Creates or updates an assistant, then refreshes data.
  saveAssistant(a: AssistantDto): Promise<void>;
  // Saves updated constraints, then refreshes data.
  saveConstraints(c: ConstraintsDto): Promise<void>;
  // Calls backend schedule generation and stores the resulting sessions.
  runGenerate(): Promise<void>;
  // Deletes an asstant by id, then refreshes data.
  removeAssistant: (id: number) => Promise<void>;
};

// React context that will hold the schedule-related state and actions.
// We initialize with 'undefined' so we can throw if someone uses the hook outside the provider.
const ScheduleContext = createContext<ScheduleContextType | undefined>(
  undefined
);

// Top-level provider component that owns the actual state.
export const ScheduleProvider = ({ children }: { children: ReactNode }) => {
  const [assistants, setAssistants] = useState<AssistantDto[]>([]);
  const [constraints, setConstraints] = useState<ConstraintsDto | null>(null);
  const [sessions, setSessions] = useState<LabSessionDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();

  /**
   * Helper to load all baseline data required by the app:
   * - assistants
   * - constraints
   * 
   * This is called on mount and whenever we need to refresh the main state.
   */
  const loadAll = async () => {
    try {
      setLoading(true);
      setError(undefined);
      const [assts, cons] = await Promise.all([
        getAssistants(),
        getConstraints(),
      ]);
      setAssistants(assts);
      setConstraints(cons);
    } catch (e) {
      console.error(e);
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  // On initial mount, populate the context with data from the backend.
  useEffect(() => {
    loadAll();
  }, []);

  // Convenience method so screens can explicitly re-trigger a full reload.
  const refresh = () => {
    loadAll();
  };

  /**
   * Creates (or updates, depending on API semantics) an assistant.
   * After a successful save, we reload the core data so all screen stay in sync.
   */
  const saveAssistant = async (a: AssistantDto) => {
    try {
      await createAssistant(a);
      await loadAll();
    } catch (e) {
      console.error('Failed to save assistant', e);
      setError('Failed to save assistant. Check your network/backend.');
      throw e; // so the form can react if needed
    }
  };

  /**
   * Persists updated scheduling constraints, then reloads assistants + constraints.
   * Errors are allowed to bubble up to the caller for now.
   */
  const saveConstraints = async (c: ConstraintsDto) => {
    await updateConstraints(c);
    await loadAll();
  };

  /**
   * Calls the backend schedule generator and stores the resulting sessions.
   * We only toggle 'loading' around the gneration itself so other UI elements
   * can choose to react (e.g., show a spinner on the "Generate" button).
   */
  const runGenerate = async () => {
    try {
      setLoading(true);
      const schedule = await generateSchedule();
      setSessions(schedule);
    } catch (e) {
      console.error(e);
      setError('Failed to generate schedule');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Deletes an assistant and then refreshes the assistant list.
   * This keeps the source of truth on the server and avoids local manual updates.
   */
  const removeAssistant = async (id: number) => {
  try {
    setLoading(true);
    await deleteAssistant(id);
    await loadAll();
  } catch (e) {
    console.error('Failed to delete assistant', e);
    setError('Failed to delete assistant.');
  } finally {
    setLoading(false);
  }
  };

  return (
    <ScheduleContext.Provider
      value={{
        assistants,
        constraints,
        sessions,
        loading,
        error,
        refresh,
        saveAssistant,
        saveConstraints,
        runGenerate,
        removeAssistant
      }}
    >
      {children}
    </ScheduleContext.Provider>
  );
};

/**
 * Hook to access the ScheduleContext.
 * Throws an error if used outside of <ScheduleProvider>, which helps catch
 * incorrect usage early in development.
 */
export const useSchedule = () => {
  const ctx = useContext(ScheduleContext);
  if (!ctx) throw new Error('useSchedule must be used within ScheduleProvider');
  return ctx;
};
