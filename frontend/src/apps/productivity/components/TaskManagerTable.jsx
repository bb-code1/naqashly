import React from 'react';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { DataTable } from '../../../components/ui/DataTable';

export const TaskManagerTable = ({
  tasks,
  tasksLoading,
  goals,
  setShowTaskModal,
  handleUpdateTaskStatus,
  setDeleteConfirmTask,
  TASK_PRIORITIES,
  TASK_STATUSES
}) => {
  const taskColumns = [
    {
      header: 'Task Title',
      key: 'title',
      render: (val, row) => (
        <div>
          <strong style={{ color: 'var(--text-heading)', fontSize: '0.88rem' }}>{row?.title || val || 'Untitled Task'}</strong>
          {row?.category && <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>🏷️ {row.category}</span>}
        </div>
      )
    },
    {
      header: 'Priority',
      key: 'priority',
      render: (val, row) => {
        const priorityVal = row?.priority || val || 'MEDIUM';
        const pObj = TASK_PRIORITIES.find(p => p.value === priorityVal);
        return <Badge variant={pObj ? pObj.badgeVariant : 'secondary'}>{pObj ? pObj.label : priorityVal}</Badge>;
      }
    },
    {
      header: 'Status',
      key: 'status',
      render: (val, row) => {
        const statusVal = row?.status || val || 'TODO';
        const sObj = TASK_STATUSES.find(s => s.value === statusVal);
        return <Badge variant={sObj ? sObj.badgeVariant : 'secondary'}>{sObj ? sObj.label : statusVal}</Badge>;
      }
    },
    {
      header: 'Linked Goal',
      key: 'goalId',
      render: (val, row) => {
        const goalId = row?.goalId || val;
        if (!goalId) return <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>— Standalone</span>;
        const linkedGoal = goals.find(g => Number(g.id) === Number(goalId));
        return linkedGoal ? (
          <Badge variant="indigo">
            🎯 {linkedGoal.title} ({linkedGoal.progressPercentage}%)
          </Badge>
        ) : <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Goal #{goalId}</span>;
      }
    },
    {
      header: 'Actions',
      key: 'id',
      render: (val, row) => (
        <div style={{ display: 'flex', gap: '0.35rem' }}>
          {row.status !== 'COMPLETED' && (
            <Button variant="emerald" onClick={() => handleUpdateTaskStatus(row.id, 'COMPLETED')} style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}>
              ✓ Complete
            </Button>
          )}
          <Button variant="danger" onClick={() => setDeleteConfirmTask(row)} style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}>
            🗑️ Delete
          </Button>
        </div>
      )
    }
  ];

  return (
    <Card>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--text-heading)', margin: 0 }}>
            📋 Task Board
          </h3>
        </div>
        <Button variant="emerald" onClick={() => setShowTaskModal(true)}>+ Priority Task</Button>
      </div>

      <DataTable
        data={tasks}
        columns={taskColumns}
        loading={tasksLoading}
        pageSize={10}
        showSearch={true}
        showExport={true}
        exportFilename="Naqashly_Priority_Tasks"
        emptyMessage="No priority tasks found. Click '+ Priority Task' above to start!"
      />
    </Card>
  );
};
