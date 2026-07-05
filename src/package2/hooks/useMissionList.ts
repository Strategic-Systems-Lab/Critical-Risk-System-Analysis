import { useState, useCallback } from 'react';
import { Mission } from '../types';

export function useMissionList(initial: Mission[] = []) {
  const [missions, setMissions] = useState<Mission[]>(initial);

  const updateMissionStatus = useCallback((missionId: string, status: string) => {
    setMissions(prev =>
      prev.map(m => m.id === missionId ? { ...m, status: status as any } : m)
    );
  }, []);

  const resetMissions = useCallback(() => {
    setMissions(initial);
  }, [initial]);

  return { missions, updateMissionStatus, resetMissions };
}
