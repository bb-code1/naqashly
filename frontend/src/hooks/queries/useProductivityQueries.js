import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as productivityApi from '../../api/productivityApi';

export const useGoals = () => {
  return useQuery({
    queryKey: ['goals'],
    queryFn: async () => {
      const data = await productivityApi.getGoals();
      return data || [];
    }
  });
};

export const useTasks = () => {
  return useQuery({
    queryKey: ['tasks'],
    queryFn: async () => {
      const data = await productivityApi.getTasks();
      return data || [];
    }
  });
};

export const useProductivityTimeBlocks = () => {
  return useQuery({
    queryKey: ['productivityTimeBlocks'],
    queryFn: async () => {
      const data = await productivityApi.getTimeBlocks();
      return data || [];
    }
  });
};

// MUTATIONS

export const useCreateGoal = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (goalData) => {
      return productivityApi.createGoal(goalData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
    }
  });
};

export const useUpdateGoalProgress = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ goalId, progressPercentage }) => {
      return productivityApi.updateGoalProgress(goalId, progressPercentage);
    },
    onMutate: async ({ goalId, progressPercentage }) => {
      await queryClient.cancelQueries({ queryKey: ['goals'] });
      const previousGoals = queryClient.getQueryData(['goals']);

      if (previousGoals) {
        queryClient.setQueryData(['goals'], (old) =>
          old.map((g) => (g.id === goalId ? { ...g, progressPercentage } : g))
        );
      }

      return { previousGoals };
    },
    onError: (err, variables, context) => {
      if (context?.previousGoals) {
        queryClient.setQueryData(['goals'], context.previousGoals);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
    }
  });
};

export const useCreateTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (taskData) => {
      return productivityApi.createTask(taskData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    }
  });
};

export const useUpdateTaskStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ taskId, status }) => {
      return productivityApi.updateTaskStatus(taskId, status);
    },
    onMutate: async ({ taskId, status }) => {
      await queryClient.cancelQueries({ queryKey: ['tasks'] });
      const previousTasks = queryClient.getQueryData(['tasks']);

      if (previousTasks) {
        queryClient.setQueryData(['tasks'], (old) =>
          old.map((t) => (t.id === taskId ? { ...t, status } : t))
        );
      }

      return { previousTasks };
    },
    onError: (err, variables, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(['tasks'], context.previousTasks);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    }
  });
};

export const useSaveTimeBlock = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (blockData) => {
      return productivityApi.saveTimeBlock(blockData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['productivityTimeBlocks'] });
    }
  });
};
