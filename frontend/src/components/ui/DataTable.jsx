import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';

/**
 * Universal Power Table Component for Naqashly Suite.
 * Built-in Formatted Excel (.xls) and CSV Exporter.
 * Features Dynamic Top Action Bar (Batch Selection, Multi-Delete & Single-Edit Safeguards).
 * Accepts Decoupled Props: headers, keys, renderers, data.
 * Fully theme-aware supporting Obsidian Dark, Luxe Light, Cyberpunk, and Forest themes!
 * 
 * @author Barkat Bashir
 * @version 8.0.0
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

  // Formatted Excel Exporter Engine (XML SpreadsheetML format for Excel & Google Sheets)
  const handleExportExcel = () => {
    if (!sortedData || sortedData.length === 0) return;

    const formattedDate = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    let xml = `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
  xmlns:o="urn:schemas-microsoft-com:office:office"
  xmlns:x="urn:schemas-microsoft-com:office:excel"
  xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
  <Styles>
    <Style ss:ID="Title">
      <Font ss:FontName="Calibri" ss:Size="16" ss:Bold="1" ss:Color="#0F172A"/>
      <Alignment ss:Horizontal="Left" ss:Vertical="Center"/>
    </Style>
    <Style ss:ID="Header">
      <Font ss:FontName="Calibri" ss:Size="11" ss:Bold="1" ss:Color="#FFFFFF"/>
      <Interior ss:Color="#0F172A" ss:Pattern="Solid"/>
      <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
      <Borders>
        <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="2" ss:Color="#64748B"/>
      </Borders>
    </Style>
    <Style ss:ID="DataCell">
      <Font ss:FontName="Calibri" ss:Size="10" ss:Color="#1E293B"/>
      <Alignment ss:Horizontal="Left" ss:Vertical="Center"/>
      <Borders>
        <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
      </Borders>
    </Style>
    <Style ss:ID="Currency">
      <Font ss:FontName="Calibri" ss:Size="10" ss:Bold="1" ss:Color="#059669"/>
      <NumberFormat ss:Format="$#,##0.00"/>
      <Alignment ss:Horizontal="Right" ss:Vertical="Center"/>
      <Borders>
        <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
      </Borders>
    </Style>
  </Styles>
  <Worksheet ss:Name="Bank Account Statement">
    <Table>
      <Column ss:Width="180"/>
      <Column ss:Width="120"/>
      <Column ss:Width="110"/>
      <Column ss:Width="140"/>
      <Column ss:Width="250"/>

      <Row ss:Height="30">
        <Cell ss:StyleID="Title" ss:MergeAcross="${Math.max(0, normalizedColumns.length - 1)}"><Data ss:Type="String">Naqashly Life OS — Official Bank Account Statement (${formattedDate})</Data></Cell>
      </Row>

      <Row ss:Height="24">
        ${normalizedColumns.map(col => `<Cell ss:StyleID="Header"><Data ss:Type="String">${col.header.replace(/<[^>]*>?/gm, '')}</Data></Cell>`).join('')}
      </Row>
      ${sortedData.map(row => `
      <Row ss:Height="20">
        ${normalizedColumns.map(col => {
          let rawVal = col.key ? row[col.key] : '';
          let textVal = String(rawVal !== undefined && rawVal !== null ? rawVal : '').replace(/<[^>]*>?/gm, '').trim();
          let cleanNum = textVal.replace(/[^0-9.-]+/g, '');
          let isNum = cleanNum !== '' && !isNaN(parseFloat(cleanNum)) && isFinite(cleanNum);
          return `<Cell ss:StyleID="${isNum ? 'Currency' : 'DataCell'}"><Data ss:Type="${isNum ? 'Number' : 'String'}">${isNum ? parseFloat(cleanNum) : textVal}</Data></Cell>`;
        }).join('')}
      </Row>`).join('')}
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

  const handleTopEdit = () => {
    if (selectedIds.length !== 1) return;
    const selectedItem = data.find((item, idx) => keyExtractor(item, idx) === selectedIds[0]);
    if (selectedItem && onEditSelected) {
      onEditSelected(selectedItem);
    }
  };

  const handleTopDelete = () => {
    if (selectedIds.length === 0) return;
    if (onDeleteSelected) {
      onDeleteSelected(selectedIds);
      setSelectedIds([]);
    }
  };

  const allPaginatedSelected = paginatedData.length > 0 && paginatedData.every((item, idx) => selectedIds.includes(keyExtractor(item, idx)));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' }}>
      
      {/* Dynamic Toolbar Header (Search + Dynamic Selection Action Bar + Exporters) */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ position: 'relative', width: '240px' }}>
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

          {/* DYNAMIC TOP BATCH ACTION BAR WHEN ROWS ARE CHECKED */}
          {selectedIds.length > 0 && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--bg-surface-elevated)', padding: '0.25rem 0.5rem', borderRadius: '8px', border: '1px solid var(--border-highlight)' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--accent-amber)', fontWeight: '700', padding: '0 0.4rem' }}>
                ☑️ {selectedIds.length} Selected
              </span>

              <button
                onClick={handleTopEdit}
                disabled={selectedIds.length !== 1}
                style={{
                  padding: '0.35rem 0.75rem',
                  borderRadius: '6px',
                  border: '1px solid var(--border-subtle)',
                  background: selectedIds.length === 1 ? 'var(--bg-surface)' : 'transparent',
                  color: selectedIds.length === 1 ? 'var(--text-heading)' : 'var(--text-muted)',
                  fontSize: '0.78rem',
                  fontWeight: '600',
                  cursor: selectedIds.length === 1 ? 'pointer' : 'not-allowed',
                  opacity: selectedIds.length === 1 ? 1 : 0.4
                }}
                title={selectedIds.length === 1 ? 'Edit Selected Record' : 'Select exactly 1 row to edit'}
              >
                ✏️ Edit Selected
              </button>

              <button
                onClick={handleTopDelete}
                style={{
                  padding: '0.35rem 0.75rem',
                  borderRadius: '6px',
                  border: '1px solid rgba(239, 68, 68, 0.4)',
                  background: 'rgba(239, 68, 68, 0.12)',
                  color: 'var(--accent-danger)',
                  fontSize: '0.78rem',
                  fontWeight: '700',
                  cursor: 'pointer'
                }}
                title={`Delete ${selectedIds.length} Selected Entries`}
              >
                🗑️ Delete ({selectedIds.length})
              </button>
            </motion.div>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
          <button
            onClick={handleExportExcel}
            disabled={sortedData.length === 0}
            style={{
              padding: '0.45rem 0.85rem',
              background: 'var(--accent-emerald-glow)',
              border: '1px solid rgba(16, 185, 129, 0.4)',
              borderRadius: '8px',
              color: 'var(--accent-emerald)',
              fontSize: '0.8rem',
              fontWeight: '700',
              cursor: sortedData.length === 0 ? 'not-allowed' : 'pointer',
              opacity: sortedData.length === 0 ? 0.5 : 1,
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem'
            }}
            title="Download formatted Excel spreadsheet with headers & currency formatting"
          >
            📊 Export to Excel (.xls)
          </button>

          <button
            onClick={handleExportCSV}
            disabled={sortedData.length === 0}
            style={{
              padding: '0.45rem 0.85rem',
              background: 'var(--bg-surface-elevated)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '8px',
              color: 'var(--text-heading)',
              fontSize: '0.8rem',
              fontWeight: '600',
              cursor: sortedData.length === 0 ? 'not-allowed' : 'pointer',
              opacity: sortedData.length === 0 ? 0.5 : 1,
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem'
            }}
            title="Download raw CSV bank statement"
          >
            📥 Export CSV
          </button>

          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginLeft: '0.4rem' }}>
            {sortedData.length} entries
          </div>
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
