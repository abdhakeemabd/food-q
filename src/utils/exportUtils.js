/**
 * Utility functions for exporting data to CSV and printing clean reports.
 * Formats all headers and data cells (including numbers and S.No.) with clean left-alignment.
 */

export const exportToCSV = (filename, columns, data) => {
  if (!data || !data.length) return;

  const headers = columns.map(col => `"${String(col.label).replace(/"/g, '""')}"`).join(',');
  
  const rows = data.map((row, rowIndex) => 
    columns.map(col => {
      let val = typeof col.accessor === 'function' ? col.accessor(row, rowIndex) : row[col.accessor];
      if (val === null || val === undefined) val = '';
      // Strip large base64 image strings from CSV to avoid breaking formatting
      if (typeof val === 'string' && val.startsWith('data:image')) val = '[Image Data]';
      val = String(val).replace(/"/g, '""');
      return `"${val}"`;
    }).join(',')
  );

  const csvString = '\uFEFF' + [headers, ...rows].join('\r\n');
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const printReport = (title, columns, data) => {
  if (!data || !data.length) return;

  const tableHeaders = columns.map(col => `<th style="border: 1px solid #cbd5e1; padding: 10px; background: #f8fafc; text-align: left; font-weight: 600;">${col.label}</th>`).join('');
  const tableRows = data.map((row, rowIndex) => 
    `<tr>${columns.map(col => {
      let val = typeof col.accessor === 'function' ? col.accessor(row, rowIndex) : row[col.accessor];
      if (val === null || val === undefined) val = '-';
      if (typeof val === 'string' && val.startsWith('data:image')) val = '[Image]';
      return `<td style="border: 1px solid #cbd5e1; padding: 10px; text-align: left;">${val}</td>`;
    }).join('')}</tr>`
  ).join('');

  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    window.print();
    return;
  }

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>${title} - Report</title>
        <style>
          body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 24px; color: #0f172a; }
          .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #e23744; padding-bottom: 12px; margin-bottom: 20px; }
          h2 { margin: 0; color: #e23744; font-size: 22px; font-weight: 700; }
          .meta { font-size: 12px; color: #64748b; margin-top: 4px; }
          table { width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 13px; }
          th, td { text-align: left !important; }
          tr:nth-child(even) { background-color: #f8fafc; }
          @media print {
            @page { margin: 12mm; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <h2>FOOD Q POS</h2>
            <div class="meta">${title} • Report Generated on ${new Date().toLocaleString()}</div>
          </div>
        </div>
        <table>
          <thead><tr>${tableHeaders}</tr></thead>
          <tbody>${tableRows}</tbody>
        </table>
        <script>
          window.onload = function() {
            window.print();
            setTimeout(function() { window.close(); }, 600);
          };
        </script>
      </body>
    </html>
  `);
  printWindow.document.close();
};
