import './DataTable.css';

/**
 * DataTable — generic sortable data table.
 *
 * @param {Array<{key: string, label: string, width?: string, align?: 'left'|'right'|'center'}>} columns
 * @param {Array<Object>} rows - array of data objects; each column.key is read from the row
 * @param {Function}      renderCell - optional custom cell renderer: (row, column) => ReactNode
 * @param {string}        rowKey - the key to use as row identifier (default: 'id')
 * @param {Function}      onRowClick
 * @param {boolean}       loading
 * @param {string}        emptyMessage
 */
export default function DataTable({
  columns = [],
  rows = [],
  renderCell,
  rowKey = 'id',
  onRowClick,
  loading = false,
  emptyMessage = 'No data available.',
  className = '',
}) {
  if (loading) {
    return (
      <div className="data-table-loading" aria-busy="true" aria-label="Loading data">
        <div className="data-table-loading__spinner" />
        <span>Loading...</span>
      </div>
    );
  }

  return (
    <div className={`data-table-wrapper ${className}`} role="region" aria-label="Data table">
      <table className="data-table" aria-rowcount={rows.length}>
        <thead className="data-table__head">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className="data-table__th"
                style={{ width: col.width, textAlign: col.align ?? 'left' }}
                scope="col"
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="data-table__body">
          {rows.length === 0 ? (
            <tr>
              <td className="data-table__empty" colSpan={columns.length}>
                {emptyMessage}
              </td>
            </tr>
          ) : (
            rows.map((row) => (
              <tr
                key={row[rowKey]}
                className={`data-table__row${onRowClick ? ' data-table__row--clickable' : ''}`}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                tabIndex={onRowClick ? 0 : undefined}
                onKeyDown={onRowClick ? (e) => e.key === 'Enter' && onRowClick(row) : undefined}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className="data-table__td"
                    style={{ textAlign: col.align ?? 'left' }}
                  >
                    {renderCell ? renderCell(row, col) : row[col.key] ?? '—'}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
