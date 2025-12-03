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

type ScheduleContextType = {
  assistants: AssistantDto[];
  constraints: ConstraintsDto | null;
  sessions: LabSessionDto[];
  loading: boolean;
  error?: string;
  refresh(): void;
  saveAssistant(a: AssistantDto): Promise<void>;
  saveConstraints(c: ConstraintsDto): Promise<void>;
  runGenerate(): Promise<void>;
  removeAssistant: (id: number) => Promise<void>;
};

const ScheduleContext = createContext<ScheduleContextType | undefined>(
  undefined
);

export const ScheduleProvider = ({ children }: { children: ReactNode }) => {
  const [assistants, setAssistants] = useState<AssistantDto[]>([]);
  const [constraints, setConstraints] = useState<ConstraintsDto | null>(null);
  const [sessions, setSessions] = useState<LabSessionDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();

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

  useEffect(() => {
    loadAll();
  }, []);

  const refresh = () => {
    loadAll();
  };

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

  const saveConstraints = async (c: ConstraintsDto) => {
    await updateConstraints(c);
    await loadAll();
  };

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

export const useSchedule = () => {
  const ctx = useContext(ScheduleContext);
  if (!ctx) throw new Error('useSchedule must be used within ScheduleProvider');
  return ctx;
};
