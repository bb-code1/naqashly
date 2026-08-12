import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as routineApi from '../../api/routineApi';

export const useHabits = () => {
  return useQuery({
    queryKey: ['habits'],
    queryFn: async () => {
      const data = await routineApi.getHabits();
      return data || [];
    }
  });
};

export const useConsistencyScore = () => {
  return useQuery({
    queryKey: ['consistencyScore'],
    queryFn: async () => {
      const data = await routineApi.getConsistencyScore();
      return data || { consistencyPercentage: 0 };
    }
  });
};

export const useTodayMuhasabah = () => {
  return useQuery({
    queryKey: ['muhasabah', 'today'],
    queryFn: async () => {
      return routineApi.getTodayMuhasabah();
    }
  });
};

export const useRoutineSettings = () => {
  return useQuery({
    queryKey: ['routineSettings'],
    queryFn: async () => {
      return routineApi.getRoutineSettings();
    }
  });
};

export const useTimeBlocks = () => {
  return useQuery({
    queryKey: ['timeBlocks'],
    queryFn: async () => {
      const data = await routineApi.getTimeBlocks();
      return data || [];
    }
  });
};

// MUTATIONS

export const useLogHabitStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ habitId, status, completionPercentage = 100, qualityGrade = 'EXCELLENT' }) => {
      return routineApi.logHabitStatus(habitId, status, completionPercentage, qualityGrade);
    },
    onMutate: async ({ habitId, status }) => {
      await queryClient.cancelQueries({ queryKey: ['habits'] });
      const previousHabits = queryClient.getQueryData(['habits']);

      if (previousHabits) {
        queryClient.setQueryData(['habits'], (old) =>
          old.map((h) => (h.id === habitId ? { ...h, status: status === 'COMPLETED' ? 'COMPLETED' : 'PENDING' } : h))
        );
      }

      return { previousHabits };
    },
    onError: (err, variables, context) => {
      if (context?.previousHabits) {
        queryClient.setQueryData(['habits'], context.previousHabits);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits'] });
      queryClient.invalidateQueries({ queryKey: ['consistencyScore'] });
    }
  });
};

export const useCreateHabit = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (habitData) => {
      return routineApi.createHabit(habitData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits'] });
    }
  });
};

export const useSaveMuhasabah = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data) => {
      return routineApi.saveMuhasabah(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['muhasabah', 'today'] });
    }
  });
};
