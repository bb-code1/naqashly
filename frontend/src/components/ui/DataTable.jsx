import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';

/**
 * Universal Power Table Component for Naqashly Suite.
 * Built-in Formatted Excel (.xls) and CSV Exporter.
 * Built-in Enterprise Pagination Controls (Page numbers, Prev/Next, Rows per page selector, Entry counter).
 * Features Dynamic Top Action Bar (Batch Selection, Multi-Delete & Single-Edit Safeguards).
 * Accepts Decoupled Props: headers, keys, renderers, data, showSearch, or columns (key/accessorKey, render/cell).
 * Fully theme-aware supporting Obsidian Dark, Luxe Light, Cyberpunk, and Forest themes!
 * 
 * @author Barkat Bashir
 * @version 11.0.0
 */
export const DataTable = ({
  // Decoupled API Standard Props
  headers,
  keys,
  renderers = {},
  data = [],

  // Direct Column Schema
  columns,

  // Custom Row Renderer
  renderRow,

  // Event Handlers
  onRowClick,
  onSelectionChange,
  onEditSelected,
  onDeleteSelected,

  // UI Config
  showSearch = true,
  showExport = true,

  // Loading & Empty States
  loading = false,
  emptyMessage = 'No records found matching criteria.',
  keyExtractor = (item, index) => item.id || index,

  // Pagination Config
  pageSize = 10,

  // Initial Sort
  defaultSortColumn = null,
  defaultSortDirection = 'asc',

  // Exporter Title / Filename
  exportFilename = 'Naqashly_Statement_Export'
}) => {
  // Normalize Columns Schema
  const normalizedColumns = useMemo(() => {
    if (columns && Array.isArray(columns)) {
      return columns.map(col => {
        const headerText = col.header || col.title || col.label || col.key || col.accessorKey || 'Column';
        const dataKey = col.key || col.accessorKey || col.dataIndex;
        const colRender = col.render || col.cell;

        return {
          header: headerText,
          key: dataKey,
          align: col.align || 'left',
          render: (rawValue, row, index) => {
            if (colRender) {
              return colRender(rawValue, row, index);
            }
            return rawValue !== undefined && rawValue !== null ? String(rawValue) : '—';
          }
        };
      });
    }

    if (headers && keys && Array.isArray(headers) && Array.isArray(keys)) {
      return headers.map((headerText, index) => {
        const dataKey = keys[index];
        return {
          header: headerText,
          key: dataKey,
          align: 'left',
          render: (val, row, idx) => (renderers[dataKey] ? renderers[dataKey](val, row, idx) : val !== undefined && val !== null ? String(val) : '—')
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
  const [rowsPerPage, setRowsPerPage] = useState(pageSize || 10);
  const [currentPage, setCurrentPage] = useState(1);

  // Reset page when search or data changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, data, rowsPerPage]);

  // Filtered & Searched Data
  const filteredData = useMemo(() => {
    if (!searchTerm.trim() || !showSearch) return data;
    const query = searchTerm.toLowerCase();

    return data.filter(item => {
      return Object.values(item).some(val => {
        if (val === null || val === undefined) return false;
        return String(val).toLowerCase().includes(query);
      });
    });
  }, [data, searchTerm, showSearch]);

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

  // Paginated Data Calculation
  const totalPages = Math.max(1, Math.ceil(sortedData.length / rowsPerPage));
  const startIdx = (currentPage - 1) * rowsPerPage;
  const endIdx = Math.min(sortedData.length, startIdx + rowsPerPage);

  const paginatedData = useMemo(() => {
    return sortedData.slice(startIdx, startIdx + rowsPerPage);
  }, [sortedData, startIdx, rowsPerPage]);

  // CSV Exporter Engine
  const handleExportCSV = () => {
    if (!sortedData || sortedData.length === 0) return;

    const headerRow = normalizedColumns.map(c => `"${c.header.replace(/"/g, '""')}"`).join(',');
    const dataRows = sortedData.map((row) => {
      return normalizedColumns.map((col) => {
        let rawValue = col.key ? row[col.key] : '';
        if (rawValue === undefined || rawValue === null) rawValue = '';
        let textValue = String(rawValue).replace(/<[^>]*>?/gm, '').trim();
        return `"${textValue.replace(/"/g, '""')}"`;
      }).join(',');
    });

    const csvContent = [headerRow, ...dataRows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${exportFilename}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Formatted Excel (.xls) Exporter Engine
  const handleExportExcel = () => {
    if (!sortedData || sortedData.length === 0) return;

    const formattedDate = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    let xml = `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
  xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
  <Worksheet ss:Name="Naqashly Export">
    <Table>
      <Row><Cell><Data ss:Type="String">Naqashly Bank Statement (${formattedDate})</Data></Cell></Row>
      <Row>
        ${normalizedColumns.map(c => `<Cell><Data ss:Type="String">${c.header}</Data></Cell>`).join('')}
      </Row>
      ${sortedData.map(row => `
        <Row>
          ${normalizedColumns.map(col => {
            let val = col.key ? row[col.key] : '';
            if (val === undefined || val === null) val = '';
            let cleanVal = String(val).replace(/<[^>]*>?/gm, '').trim();
            const isNum = !isNaN(cleanVal) && cleanVal !== '';
            return `<Cell><Data ss:Type="${isNum ? 'Number' : 'String'}">${cleanVal}</Data></Cell>`;
          }).join('')}
        </Row>
      `).join('')}
    </Table>
  </Worksheet>
</Workbook>`;

    const blob = new Blob([xml], { type: 'application/vnd.ms-excel' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${exportFilename}_${new Date().toISOString().split('T')[0]}.xls`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Selection Logic
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const allIds = paginatedData.map((item, idx) => keyExtractor(item, idx));
      setSelectedIds(allIds);
      if (onSelectionChange) onSelectionChange(allIds);
    } else {
      setSelectedIds([]);
      if (onSelectionChange) onSelectionChange([]);
    }
  };

  const handleSelectOne = (id) => {
    setSelectedIds(prev => {
      const updated = prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id];
      if (onSelectionChange) onSelectionChange(updated);
      return updated;
    });
  };

  // Sort Handler
  const handleSort = (key) => {
    if (!key) return;
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  return (
    <div className="datatable-container" style={{ width: '100%' }}>
      {/* Top Action Bar (Search & Export Controls) */}
      {(showSearch || showExport || selectedIds.length > 0) && (
        <div style={{
          display: 'flex',
          justify: 'space-between',
          alignItems: 'center',
          marginBottom: '1rem',
          gap: '1rem',
          flexWrap: 'wrap'
        }}>
          {/* Left: Search Box */}
          {showSearch ? (
            <div style={{ position: 'relative', minWidth: '240px', flex: '1', maxWidth: '360px' }}>
              <input
                type="text"
                placeholder="Search records..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.55rem 0.85rem 0.55rem 2.2rem',
                  borderRadius: '8px',
                  border: '1px solid var(--border-subtle)',
                  background: 'var(--bg-surface-elevated)',
                  color: 'var(--text-heading)',
                  fontSize: '0.85rem',
                  outline: 'none'
                }}
              />
              <span style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.5, fontSize: '0.85rem' }}>
                🔍
              </span>
            </div>
          ) : <div />}

          {/* Right: Actions / Batch Bar */}
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            {/* Batch Selection Action Controls */}
            {selectedIds.length > 0 && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: 'var(--bg-surface-elevated)',
                padding: '0.35rem 0.75rem',
                borderRadius: '8px',
                border: '1px solid var(--border-subtle)'
              }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-heading)', fontWeight: '600' }}>
                  {selectedIds.length} selected
                </span>

                {selectedIds.length === 1 && onEditSelected && (
                  <button
                    type="button"
                    onClick={() => onEditSelected(selectedIds[0])}
                    style={{
                      padding: '0.25rem 0.55rem',
                      borderRadius: '6px',
                      background: 'var(--accent-indigo)',
                      color: '#FFF',
                      border: 'none',
                      fontSize: '0.75rem',
                      cursor: 'pointer'
                    }}
                  >
                    ✏️ Edit
                  </button>
                )}

                {onDeleteSelected && (
                  <button
                    type="button"
                    onClick={() => onDeleteSelected(selectedIds)}
                    style={{
                      padding: '0.25rem 0.55rem',
                      borderRadius: '6px',
                      background: 'var(--accent-danger)',
                      color: '#FFF',
                      border: 'none',
                      fontSize: '0.75rem',
                      cursor: 'pointer'
                    }}
                  >
                    🗑️ Delete ({selectedIds.length})
                  </button>
                )}
              </div>
            )}

            {/* Export Buttons */}
            {showExport && sortedData.length > 0 && (
              <>
                <button
                  type="button"
                  onClick={handleExportCSV}
                  style={{
                    padding: '0.55rem 0.85rem',
                    borderRadius: '8px',
                    border: '1px solid var(--border-subtle)',
                    background: 'var(--bg-surface-elevated)',
                    color: 'var(--text-heading)',
                    fontSize: '0.82rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem'
                  }}
                >
                  📥 Export CSV
                </button>

                <button
                  type="button"
                  onClick={handleExportExcel}
                  style={{
                    padding: '0.55rem 0.85rem',
                    borderRadius: '8px',
                    border: '1px solid var(--border-subtle)',
                    background: 'var(--bg-surface-elevated)',
                    color: 'var(--text-heading)',
                    fontSize: '0.82rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem'
                  }}
                >
                  📊 Export Excel (.xls)
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Main Table Content */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          🌀 Synchronizing records...
        </div>
      ) : sortedData.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '3rem 1.5rem',
          background: 'var(--bg-surface-elevated)',
          borderRadius: '12px',
          border: '1px solid var(--border-subtle)',
          color: 'var(--text-muted)',
          fontSize: '0.88rem'
        }}>
          {emptyMessage}
        </div>
      ) : (
        <div style={{ overflowX: 'auto', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
          <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 4px', fontSize: '0.88rem' }}>
            {/* Table Header */}
            <thead>
              <tr style={{ background: 'var(--bg-surface-elevated)' }}>
                {onSelectionChange && (
                  <th style={{ padding: '0.85rem 1rem', width: '40px', textAlign: 'center' }}>
                    <input
                      type="checkbox"
                      onChange={handleSelectAll}
                      checked={paginatedData.length > 0 && paginatedData.every((item, idx) => selectedIds.includes(keyExtractor(item, idx)))}
                      style={{ cursor: 'pointer' }}
                    />
                  </th>
                )}

                {normalizedColumns.map((col, idx) => (
                  <th
                    key={idx}
                    onClick={() => handleSort(col.key)}
                    style={{
                      padding: '0.85rem 1rem',
                      textAlign: col.align || 'left',
                      fontWeight: '700',
                      color: 'var(--text-muted)',
                      fontSize: '0.78rem',
                      letterSpacing: '0.05em',
                      textTransform: 'uppercase',
                      cursor: col.key ? 'pointer' : 'default',
                      userSelect: 'none'
                    }}
                  >
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                      <span>{col.header}</span>
                      {sortConfig.key === col.key && (
                        <span>{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            {/* Table Body */}
            <tbody>
              {paginatedData.map((row, index) => {
                const rowId = keyExtractor(row, index);
                const isSelected = selectedIds.includes(rowId);

                if (renderRow) {
                  return renderRow(row, index, isSelected, () => handleSelectOne(rowId));
                }

                return (
                  <motion.tr
                    key={rowId}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.15 }}
                    onClick={() => onRowClick && onRowClick(row)}
                    style={{
                      background: isSelected ? 'var(--bg-surface-elevated)' : 'var(--bg-surface)',
                      borderBottom: '1px solid var(--border-subtle)',
                      cursor: onRowClick ? 'pointer' : 'default'
                    }}
                  >
                    {onSelectionChange && (
                      <td style={{ padding: '1rem', textAlign: 'center' }}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => {
                            e.stopPropagation();
                            handleSelectOne(rowId);
                          }}
                          style={{ cursor: 'pointer' }}
                        />
                      </td>
                    )}

                    {normalizedColumns.map((col, colIdx) => {
                      const rawValue = col.key ? row[col.key] : undefined;
                      const renderedCell = col.render(rawValue, row, index);
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

      {/* Universal Enterprise Pagination Footer */}
      {sortedData.length > 0 && (
        <div style={{
          display: 'flex',
          justify: 'space-between',
          alignItems: 'center',
          marginTop: '1.25rem',
          paddingTop: '0.85rem',
          borderTop: '1px solid var(--border-subtle)',
          flexWrap: 'wrap',
          gap: '0.75rem'
        }}>
          {/* Left: Entry Counter */}
          <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Showing <strong style={{ color: 'var(--text-heading)' }}>{sortedData.length === 0 ? 0 : startIdx + 1}</strong> to <strong style={{ color: 'var(--text-heading)' }}>{endIdx}</strong> of <strong style={{ color: 'var(--text-heading)' }}>{sortedData.length}</strong> entries
          </div>

          {/* Center: Rows Per Page Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            <span>Rows per page:</span>
            <select
              value={rowsPerPage}
              onChange={(e) => {
                setRowsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              style={{
                background: 'var(--bg-surface-elevated)',
                color: 'var(--text-heading)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '6px',
                padding: '0.25rem 0.5rem',
                fontSize: '0.8rem',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              {[5, 10, 25, 50, 100].map(size => (
                <option key={size} value={size}>{size}</option>
              ))}
            </select>
          </div>

          {/* Right: Page Navigation Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <button
              type="button"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              style={{
                padding: '0.35rem 0.75rem',
                borderRadius: '6px',
                border: '1px solid var(--border-subtle)',
                background: 'var(--bg-surface-elevated)',
                color: 'var(--text-heading)',
                fontSize: '0.8rem',
                cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                opacity: currentPage === 1 ? 0.4 : 1
              }}
            >
              ← Prev
            </button>

            {/* Page Number Buttons */}
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                type="button"
                onClick={() => setCurrentPage(page)}
                style={{
                  minWidth: '32px',
                  height: '32px',
                  borderRadius: '6px',
                  border: page === currentPage ? '1px solid var(--accent-indigo)' : '1px solid var(--border-subtle)',
                  background: page === currentPage ? 'var(--accent-indigo)' : 'var(--bg-surface-elevated)',
                  color: page === currentPage ? '#FFF' : 'var(--text-heading)',
                  fontSize: '0.8rem',
                  fontWeight: page === currentPage ? '700' : '500',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {page}
              </button>
            ))}

            <button
              type="button"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              style={{
                padding: '0.35rem 0.75rem',
                borderRadius: '6px',
                border: '1px solid var(--border-subtle)',
                background: 'var(--bg-surface-elevated)',
                color: 'var(--text-heading)',
                fontSize: '0.8rem',
                cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                opacity: currentPage === totalPages ? 0.4 : 1
              }}
            >
              Next →
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
