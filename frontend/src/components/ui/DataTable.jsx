import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';

/**
 * Universal Power Table Component for Naqashly Suite.
 * Accepts Decoupled Props: headers, keys, renderers, data.
 * Fully theme-aware supporting Obsidian Dark, Luxe Light, Cyberpunk, and Forest themes!
 * 
 * @author Barkat Bashir
 * @version 4.0.0
 */
export const DataTable = ({
  // Decoupled API Standard Props
  headers,
  keys,
  renderers = {},
  data = [],

  // Direct Column Schema (Fallback / Legacy support)
  columns,

  // Custom Row Renderer
  renderRow,

  // Event Handlers
  onRowClick,
  onSelectionChange,

  // Loading & Empty States
  loading = false,
  emptyMessage = 'No records found matching criteria.',
  keyExtractor = (item, index) => item.id || index,

  // Pagination Config
  pageSize = 10,

  // Initial Sort
  defaultSortColumn = null,
  defaultSortDirection = 'asc'
}) => {
  // Normalize Column Definitions
  const normalizedColumns = useMemo(() => {
    if (columns && Array.isArray(columns) && columns.length > 0) {
      return columns;
    }

    if (headers && keys && Array.isArray(headers) && Array.isArray(keys)) {
      return headers.map((headerText, index) => {
        const dataKey = keys[index];
        return {
          header: headerText,
          key: dataKey,
          render: renderers[dataKey] || ((val) => (val !== undefined && val !== null ? String(val) : '—'))
        };
      });
    }

    return [];
  }, [columns, headers, keys, renderers]);

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);

  // Sorting State
  const [sortConfig, setSortConfig] = useState({
    key: defaultSortColumn,
    direction: defaultSortDirection
  });

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);

  // Filtered & Searched Data
  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return data;
    const query = searchTerm.toLowerCase();

    return data.filter(item => {
      return Object.values(item).some(val => {
        if (val === null || val === undefined) return false;
        return String(val).toLowerCase().includes(query);
      });
    });
  }, [data, searchTerm]);

  // Sorted Data
  const sortedData = useMemo(() => {
    if (!sortConfig.key) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];

      if (aVal === bVal) return 0;
      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;

      let comparison = 0;
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        comparison = aVal - bVal;
      } else {
        comparison = String(aVal).localeCompare(String(bVal));
      }

      return sortConfig.direction === 'asc' ? comparison : -comparison;
    });
  }, [filteredData, sortConfig]);

  // Paginated Data
  const totalPages = Math.ceil(sortedData.length / pageSize) || 1;
  const paginatedData = useMemo(() => {
    const startIdx = (currentPage - 1) * pageSize;
    return sortedData.slice(startIdx, startIdx + pageSize);
  }, [sortedData, currentPage, pageSize]);

  // Column Sort Toggle Handler
  const handleSort = (key) => {
    if (!key) return;
    setSortConfig(prev => {
      if (prev.key === key) {
        return { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' };
      }
      return { key, direction: 'asc' };
    });
  };

  // Checkbox Selection Handlers
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const allPaginatedKeys = paginatedData.map((item, idx) => keyExtractor(item, idx));
      const newSelected = Array.from(new Set([...selectedIds, ...allPaginatedKeys]));
      setSelectedIds(newSelected);
      if (onSelectionChange) onSelectionChange(newSelected);
    } else {
      const paginatedKeysSet = new Set(paginatedData.map((item, idx) => keyExtractor(item, idx)));
      const newSelected = selectedIds.filter(id => !paginatedKeysSet.has(id));
      setSelectedIds(newSelected);
      if (onSelectionChange) onSelectionChange(newSelected);
    }
  };

  const handleSelectRow = (key, e) => {
    e.stopPropagation();
    let newSelected = [];
    if (selectedIds.includes(key)) {
      newSelected = selectedIds.filter(id => id !== key);
    } else {
      newSelected = [...selectedIds, key];
    }
    setSelectedIds(newSelected);
    if (onSelectionChange) onSelectionChange(newSelected);
  };

  const allPaginatedSelected = paginatedData.length > 0 && paginatedData.every((item, idx) => selectedIds.includes(keyExtractor(item, idx)));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' }}>
      
      {/* Search Bar Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ position: 'relative', width: '280px' }}>
          <input
            type="text"
            placeholder="🔍 Search records..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            style={{
              width: '100%',
              padding: '0.55rem 0.85rem 0.55rem 2.2rem',
              background: 'var(--bg-surface-elevated)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '8px',
              color: 'var(--text-heading)',
              fontSize: '0.82rem',
              outline: 'none',
              boxSizing: 'border-box'
            }}
          />
        </div>

        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
          Showing {paginatedData.length} of {sortedData.length} entries
        </div>
      </div>

      {/* Main Table Container */}
      {loading ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
          Loading table records...
        </div>
      ) : paginatedData.length === 0 ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
          {emptyMessage}
        </div>
      ) : (
        <div style={{ overflowX: 'auto', width: '100%' }}>
          <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 0.6rem', fontSize: '0.88rem' }}>
            <thead>
              <tr>
                <th style={{ width: '40px', padding: '0 0.75rem 0.6rem', textAlign: 'center' }}>
                  <input
                    type="checkbox"
                    checked={allPaginatedSelected}
                    onChange={handleSelectAll}
                    style={{ cursor: 'pointer', accentColor: 'var(--accent-amber)' }}
                  />
                </th>

                {normalizedColumns.map((col, idx) => {
                  const isSorted = sortConfig.key === col.key;
                  return (
                    <th
                      key={idx}
                      onClick={() => col.key && handleSort(col.key)}
                      style={{
                        textAlign: col.align || 'left',
                        color: isSorted ? 'var(--accent-amber)' : 'var(--text-muted)',
                        padding: '0 1rem 0.6rem',
                        fontWeight: '600',
                        fontSize: '0.78rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                        cursor: col.key ? 'pointer' : 'default',
                        userSelect: 'none'
                      }}
                    >
                      {col.header} {col.key && (isSorted ? (sortConfig.direction === 'asc' ? '▲' : '▼') : '⇅')}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((row, rowIdx) => {
                const rowKey = keyExtractor(row, rowIdx);
                const isSelected = selectedIds.includes(rowKey);

                if (renderRow) {
                  return renderRow(row, rowIdx, { isSelected, onSelect: (e) => handleSelectRow(rowKey, e) });
                }

                return (
                  <motion.tr
                    key={rowKey}
                    whileHover={{ scale: 1.001, backgroundColor: 'var(--bg-surface-hover)' }}
                    onClick={() => onRowClick && onRowClick(row)}
                    style={{
                      background: isSelected ? 'var(--accent-amber-glow)' : 'var(--bg-surface-elevated)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '8px',
                      cursor: onRowClick ? 'pointer' : 'default'
                    }}
                  >
                    <td style={{ textAlign: 'center', padding: '1rem', borderTopLeftRadius: '8px', borderBottomLeftRadius: '8px' }} onClick={e => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={e => handleSelectRow(rowKey, e)}
                        style={{ cursor: 'pointer', accentColor: 'var(--accent-amber)' }}
                      />
                    </td>

                    {normalizedColumns.map((col, colIdx) => {
                      const isLast = colIdx === normalizedColumns.length - 1;
                      const rawValue = col.key ? row[col.key] : undefined;
                      const renderedCell = col.render ? col.render(rawValue, row, rowIdx) : rawValue;

                      return (
                        <td
                          key={colIdx}
                          style={{
                            padding: '1rem',
                            textAlign: col.align || 'left',
                            color: 'var(--text-heading)',
                            borderTopRightRadius: isLast ? '8px' : '0',
                            borderBottomRightRadius: isLast ? '8px' : '0'
                          }}
                        >
                          {renderedCell}
                        </td>
                      );
                    })}
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.75rem' }}>
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            style={{
              padding: '0.4rem 0.85rem',
              borderRadius: '6px',
              border: '1px solid var(--border-subtle)',
              background: 'var(--bg-surface-elevated)',
              color: 'var(--text-heading)',
              fontSize: '0.8rem',
              cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
              opacity: currentPage === 1 ? 0.5 : 1
            }}
          >
            ← Previous
          </button>

          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Page {currentPage} of {totalPages}
          </span>

          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            style={{
              padding: '0.4rem 0.85rem',
              borderRadius: '6px',
              border: '1px solid var(--border-subtle)',
              background: 'var(--bg-surface-elevated)',
              color: 'var(--text-heading)',
              fontSize: '0.8rem',
              cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
              opacity: currentPage === totalPages ? 0.5 : 1
            }}
          >
            Next →
          </button>
        </div>
      )}

    </div>
  );
};
