import React from 'react';
import { motion } from 'framer-motion';

/**
 * Universal Enterprise Data Table Component.
 * Supports dynamic columns, custom cell renderers, loading skeletons, and empty states.
 * 
 * @author Barkat Bashir
 * @version 1.0.0
 */
export const DataTable = ({
  columns = [],
  data = [],
  loading = false,
  emptyMessage = 'No records found.',
  keyExtractor = (item, index) => item.id || index
}) => {
  if (loading) {
    return (
      <div style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
        Fetching live records from database...
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
        {emptyMessage}
      </div>
    );
  }

  return (
    <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 0.6rem', fontSize: '0.88rem' }}>
      <thead>
        <tr>
          {columns.map((col, idx) => (
            <th
              key={idx}
              style={{
                textAlign: col.align || 'left',
                color: 'var(--text-muted)',
                padding: '0 1rem 0.6rem',
                fontWeight: '600',
                fontSize: '0.78rem',
                textTransform: 'uppercase',
                letterSpacing: '0.04em'
              }}
            >
              {col.header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((row, rowIdx) => (
          <motion.tr
            key={keyExtractor(row, rowIdx)}
            whileHover={{ scale: 1.002, backgroundColor: 'rgba(255, 255, 255, 0.02)' }}
            style={{ background: 'rgba(0, 0, 0, 0.25)', borderRadius: '8px' }}
          >
            {columns.map((col, colIdx) => {
              const isFirst = colIdx === 0;
              const isLast = colIdx === columns.length - 1;

              return (
                <td
                  key={colIdx}
                  style={{
                    padding: '1rem',
                    textAlign: col.align || 'left',
                    color: 'var(--text-heading)',
                    borderTopLeftRadius: isFirst ? '8px' : '0',
                    borderBottomLeftRadius: isFirst ? '8px' : '0',
                    borderTopRightRadius: isLast ? '8px' : '0',
                    borderBottomRightRadius: isLast ? '8px' : '0'
                  }}
                >
                  {col.render ? col.render(row, rowIdx) : row[col.key]}
                </td>
              );
            })}
          </motion.tr>
        ))}
      </tbody>
    </table>
  );
};
