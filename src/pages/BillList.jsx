import React, { useState } from 'react';
import { useDbStore } from '../store/dbStore';
import * as XLSX from 'xlsx';
import { Download, Eye, X, Trash2 } from 'lucide-react';
import Swal from 'sweetalert2';
import { useAuth } from '../store/AuthContext';

const BillList = () => {
  const { currentUser } = useAuth();
  const bills = useDbStore(state => state.bills).filter(b => b.status !== 'Archived');
  const deleteRecord = useDbStore(state => state.deleteRecord);
  const [selectedBill, setSelectedBill] = useState(null);

  const handleDelete = (id) => {
    Swal.fire({
      title: 'Delete this Bill?',
      text: "This action will permanently delete the bill.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e23744',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        deleteRecord('bills', id, currentUser);
        Swal.fire('Deleted!', 'The bill has been deleted.', 'success');
      }
    });
  };

  const handleExport = () => {
    if (bills.length === 0) {
      Swal.fire('No Data', 'No bills available to export.', 'info');
      return;
    }
    
    const exportData = bills.map(bill => ({
      Date: new Date(bill.createdDate).toLocaleString(),
      OrderType: bill.orderType,
      TableID: bill.tableId || 'N/A',
      Customer: bill.customerPhone || 'N/A',
      ItemsCount: bill.items.reduce((sum, i) => sum + i.qty, 0),
      PaymentMethod: bill.paymentMethod,
      Amount: bill.totalAmount,
      Status: bill.status
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Bills");
    XLSX.writeFile(workbook, "FoodQ_Bills_Report.xlsx");
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
        <div>
          <h2 style={{ margin: '0 0 4px 0' }}>Bill History</h2>
          <div style={{ color: 'var(--text-muted)' }}>Total Bills: {bills.length}</div>
        </div>
        <button onClick={handleExport} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Download size={18} /> Export to Excel
        </button>
      </div>

      <div className="glass-panel" style={{ overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto', width: '100%' }}>
          <table className="data-table" style={{ minWidth: '800px' }}>
          <thead>
            <tr>
              <th>Date</th>
              <th>Order Type</th>
              <th>Items</th>
              <th>Payment</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {bills.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                  No bills generated yet.
                </td>
              </tr>
            ) : (
              bills.slice().reverse().map(bill => (
                <tr key={bill.id}>
                  <td>{new Date(bill.createdDate).toLocaleString()}</td>
                  <td>
                    <span style={{ fontWeight: 500 }}>{bill.orderType}</span>
                    {bill.tableId && <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Table ID: {bill.tableId}</div>}
                  </td>
                  <td>{bill.items.reduce((sum, i) => sum + i.qty, 0)} items</td>
                  <td>
                    <span className={`badge ${bill.paymentMethod === 'UPI' ? 'badge-active' : ''}`} style={{ backgroundColor: bill.paymentMethod === 'UPI' ? 'rgba(42, 157, 143, 0.2)' : 'var(--bg-tertiary)', color: bill.paymentMethod === 'UPI' ? 'var(--status-active)' : 'var(--text-main)' }}>
                      {bill.paymentMethod}
                    </span>
                  </td>
                  <td style={{ fontWeight: 'bold', color: 'var(--primary-color)' }}>₹{bill.totalAmount}</td>
                  <td>
                    <span className={`badge badge-${bill.status.toLowerCase()}`}>{bill.status}</span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                      <button onClick={() => setSelectedBill(bill)} className="btn btn-secondary" style={{ padding: '6px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Eye size={16} />
                      </button>
                      <button onClick={() => handleDelete(bill.id)} className="btn btn-secondary" style={{ padding: '6px', color: '#e23744', borderColor: 'rgba(226, 55, 68, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        </div>
      </div>

      {/* Bill View Modal */}
      {selectedBill && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '400px', padding: '24px', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-main)', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
            
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px dashed var(--border-color)', paddingBottom: '16px', marginBottom: '16px' }}>
              <div>
                <h3 style={{ margin: '0 0 4px 0' }}>Food-Q Receipt</h3>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Date: {new Date(selectedBill.createdDate).toLocaleString()}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Order: {selectedBill.orderType} {selectedBill.tableId ? `- Table ${selectedBill.tableId}` : ''}</div>
              </div>
              <button onClick={() => setSelectedBill(null)} style={{ background: 'transparent', border: 'none', color: 'var(--text-main)', cursor: 'pointer' }}>
                <X size={24} />
              </button>
            </div>
            
            {/* Items */}
            <div style={{ borderBottom: '1px dashed var(--border-color)', paddingBottom: '16px', marginBottom: '16px', maxHeight: '300px', overflowY: 'auto' }}>
              {selectedBill.items.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.9rem' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 500 }}>{item.itemName}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{item.qty} x ₹{item.price}</div>
                  </div>
                  <div style={{ fontWeight: 600 }}>₹{item.qty * item.price}</div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.2rem', fontWeight: 700, marginBottom: '8px' }}>
                <span>Total:</span>
                <span style={{ color: 'var(--primary-color)' }}>₹{selectedBill.totalAmount}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Payment Method:</span>
                <span style={{ fontWeight: 500 }}>{selectedBill.paymentMethod}</span>
              </div>
              {selectedBill.customerPhone && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginTop: '4px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Customer:</span>
                  <span style={{ fontWeight: 500 }}>{selectedBill.customerPhone}</span>
                </div>
              )}
            </div>
            
            <button onClick={() => setSelectedBill(null)} className="btn btn-primary" style={{ width: '100%', marginTop: '24px', padding: '12px' }}>
              Close Receipt
            </button>

          </div>
        </div>
      )}
    </div>
  );
};

export default BillList;
