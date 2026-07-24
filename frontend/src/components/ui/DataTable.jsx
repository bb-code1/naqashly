import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import * as XLSX from 'xlsx';
import { Button } from './Button';

/**
 * Enterprise Power Data Table Engine.
 * Decoupled Props API: Supports separate `headers`, `keys`, `renderers`, and `data` props.
 * Also supports custom row rendering via `renderRow` prop.
 * 
 * @author Barkat Bashir
 * @version 4.0.0
 */
export const DataTable = ({
  headers = [],          // Simple array of header title strings: ['Contact Person', 'Amount ($)', 'Type']
  keys = [],             // Simple array of object key strings: ['personName', 'amount', 'debtType']
  renderers = {},        // Custom cell formatter map: { amount: (val, row) => ..., debtType: (val) => ... }
  columns = [],          // Optional backward-compatible combined columns array
  data = [],
  loading = false,
  emptyMessage = 'No records found.',
  keyExtractor = (item, index) => item.id || index,
  onRowClick,
  onDeleteSelected,
  renderRow              // Optional custom row renderer function: (row, index) => <tr>...</tr>
}) => {
  const [selectedIds, setSelectedIds] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  // Normalize column definitions from either `headers` + `keys` OR `columns` prop
  const normalizedColumns = useMemo(() => {
    if (headers.length > 0) {
      return headers.map((headerTitle, idx) => {
        const key = keys[idx] || `col_${idx}`;
        return {
          header: headerTitle,
          key: key,
          render: (row) => (renderers[key] ? renderers[key](row[key], row) : row[key])
        };
      });
    }
    return columns;
  }, [headers, keys, renderers, columns]);

  // 1. Live Search Filter
  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return data;
    const query = searchQuery.toLowerCase();
    return data.filter(row =>
      Object.values(row).some(val =>
        val !== null && val !== undefined && String(val).toLowerCase().includes(query)
      )
    );
  }, [data, searchQuery]);

  // 2. Dynamic Column Sorting
  const sortedData = useMemo(() => {
    if (!sortConfig.key) return filteredData;
    return [...filteredData].sort((a, b) => {
      const valA = a[sortConfig.key];
      const valB = b[sortConfig.key];

      if (valA === valB) return 0;
      if (valA === null || valA === undefined) return 1;
      if (valB === null || valB === undefined) return -1;

      if (typeof valA === 'number' && typeof valB === 'number') {
        return sortConfig.direction === 'asc' ? valA - valB : valB - valA;
      }

      return sortConfig.direction === 'asc'
        ? String(valA).localeCompare(String(valB))
        : String(valB).localeCompare(String(valA));
    });
  }, [filteredData, sortConfig]);

  // 3. Pagination Slicing
  const totalPages = Math.ceil(sortedData.length / pageSize) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, currentPage, pageSize]);

  // 4. Selection Handlers
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const allIds = paginatedData.map((row, idx) => keyExtractor(row, idx));
      setSelectedIds(allIds);
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectRow = (id, e) => {
    e.stopPropagation();
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleSort = (key) => {
    if (!key) return;
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  // 5. Native Excel Exporter
  const exportToExcel = () => {
    if (sortedData.length === 0) return;

    const excelRows = sortedData.map(row => {
      const formattedRow = {};
      normalizedColumns.forEach(col => {
        formattedRow[col.header] = row[col.key] ?? '';
      });
      return formattedRow;
    });

    const worksheet = XLSX.utils.json_to_sheet(excelRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Ledger Data');
    XLSX.writeFile(workbook, `Naqashly_Ledger_Export_${Date.now()}.xlsx`);
  };

  const allPaginatedSelected = paginatedData.length > 0 && paginatedData.every((row, idx) => selectedIds.includes(keyExtractor(row, idx)));

  if (loading) {
    return (
      <div style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
        Fetching live records from database...
      </div>
    );
  }

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      
      {/* TOOLBAR */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, maxWidth: '380px' }}>
          <input
            type="text"
            placeholder="🔍 Filter records by person, note, category..."
            value={searchQuery}
            onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            style={{
              width: '100%', padding: '0.6rem 1rem', background: 'rgba(0,0,0,0.3)',
              border: '1px solid var(--border-subtle)', borderRadius: '8px', color: '#FFF', fontSize: '0.85rem'
            }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {selectedIds.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(245, 158, 11, 0.15)', padding: '0.4rem 0.85rem', borderRadius: '8px', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--accent-amber)', fontWeight: '700' }}>
                {selectedIds.length} Selected
              </span>
              {onDeleteSelected && (
                <Button variant="danger" onClick={() => onDeleteSelected(selectedIds)} style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem' }}>
                  🗑️ Delete
                </Button>
              )}
            </div>
          )}

          <Button variant="emerald" onClick={exportToExcel} style={{ fontSize: '0.8rem', padding: '0.55rem 0.95rem' }}>
            📊 Export Excel (.xlsx)
          </Button>
        </div>
      </div>

      {/* TABLE CONTENT */}
      {sortedData.length === 0 ? (
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
                    whileHover={{ scale: 1.001, backgroundColor: 'rgba(255, 255, 255, 0.03)' }}
                    onClick={() => onRowClick && onRowClick(row)}
                    style={{
                      background: isSelected ? 'rgba(245, 158, 11, 0.08)' : 'rgba(0, 0, 0, 0.25)',
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
                          {col.render ? col.render(row, rowIdx) : row[col.key]}
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

      {/* PAGINATION FOOTER */}
      {sortedData.length > 0 && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          <div>
            Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, sortedData.length)} of {sortedData.length} entries
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <select
              value={pageSize}
              onChange={e => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
              style={{ background: '#080B11', border: '1px solid var(--border-subtle)', color: '#FFF', borderRadius: '6px', padding: '0.3rem 0.5rem', fontSize: '0.78rem' }}
            >
              <option value={5}>5 per page</option>
              <option value={10}>10 per page</option>
              <option value={25}>25 per page</option>
            </select>

            <Button
              variant="outline"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              style={{ fontSize: '0.75rem', padding: '0.3rem 0.7rem' }}
            >
              ← Prev
            </Button>
            <span>Page {currentPage} of {totalPages}</span>
            <Button
              variant="outline"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              style={{ fontSize: '0.75rem', padding: '0.3rem 0.7rem' }}
            >
              Next →
            </Button>
          </div>
        </div>
      )}

    </div>
  );
};
