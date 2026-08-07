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
      <div className="d-flex justify-between align-center mb-32 flex-wrap gap-16">
        <div>
          <h2 className="page-title d-flex align-center gap-8">
            <Receipt size={24} color="var(--primary-color)" /> Bill History
          </h2>
          <div className="text-muted">Total Bills: {bills.length}</div>
        </div>
        <button onClick={handleExport} className="btn btn-primary d-flex align-center gap-8">
          <Download size={18} /> Export CSV
        </button>
      </div>

      <div className="glass-panel overflow-hidden">
        <div className="w-100" style={{ overflowX: 'auto' }}>
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
                <td colSpan="7" className="text-center p-32 text-muted">
                  No bills generated yet.
                </td>
              </tr>
            ) : (
              bills.slice().reverse().map(bill => (
                <tr key={bill.id}>
                  <td>{new Date(bill.createdDate).toLocaleString()}</td>
                  <td>
                    <div className="fw-500">{bill.orderType}</div>
                    {bill.tableId && <div className="fs-sm text-muted">Table ID: {bill.tableId}</div>}
                  </td>
                  <td>{bill.items?.length || 0}</td>
                  <td>
                    <span className={`badge ${bill.paymentMethod === 'UPI' ? 'badge-active' : ''}`} style={{ backgroundColor: bill.paymentMethod === 'UPI' ? 'rgba(42, 157, 143, 0.2)' : 'var(--bg-tertiary)', color: bill.paymentMethod === 'UPI' ? 'var(--status-active)' : 'var(--text-main)' }}>
                      {bill.paymentMethod}
                    </span>
                  </td>
                  <td className="fw-700 text-primary">₹{bill.totalAmount}</td>
                  <td>
                    <span className={`badge badge-${bill.status.toLowerCase()}`}>{bill.status}</span>
                  </td>
                  <td>
                    <div className="d-flex gap-8 justify-center">
                      <button onClick={() => setSelectedBill(bill)} className="btn btn-secondary p-6 fs-sm d-flex align-center justify-center">
                        <Eye size={16} />
                      </button>
                      <button onClick={() => handleDelete(bill.id)} className="btn btn-secondary p-6 text-danger border-danger d-flex align-center justify-center">
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

      {/* Receipt Modal */}
      {selectedBill && (
        <div className="pos-abs w-100 h-100 d-flex align-center justify-center z-2000" style={{ top: 0, left: 0, backgroundColor: 'rgba(0,0,0,0.5)', position: 'fixed' }}>
          <div className="glass-panel w-100 p-24 bg-secondary text-main border-light radius-md" style={{ maxWidth: '400px' }}>
            
            {/* Header */}
            <div className="d-flex justify-between align-center mb-16 pb-16" style={{ borderBottom: '1px dashed var(--border-color)' }}>
              <div>
                <h3 className="m-0 mb-4">Food-Q Receipt</h3>
                <div className="fs-sm text-muted">Date: {new Date(selectedBill.createdDate).toLocaleString()}</div>
                <div className="fs-sm text-muted">Order: {selectedBill.orderType} {selectedBill.tableId ? `- Table ${selectedBill.tableId}` : ''}</div>
              </div>
              <button onClick={() => setSelectedBill(null)} className="bg-transparent border-none text-main cursor-pointer">
                <X size={24} />
              </button>
            </div>
            
            {/* Items */}
            <div className="mb-16 pb-16 overflow-y-auto" style={{ borderBottom: '1px dashed var(--border-color)', maxHeight: '300px' }}>
              {selectedBill.items?.map((item, idx) => (
                <div key={idx} className="d-flex justify-between mb-8 fs-sm">
                  <div className="flex-1">
                    <div className="fw-500">{item.itemName}</div>
                    <div className="fs-sm text-muted">{item.qty} x ₹{item.price}</div>
                  </div>
                  <div className="fw-600">₹{item.qty * item.price}</div>
                </div>
              ))}
            </div>

            {/* Total */}
            <div>
              <div className="d-flex justify-between mb-8 fs-lg fw-700">
                <span>Total Amount</span>
                <span className="text-primary">₹{selectedBill.totalAmount}</span>
              </div>
              <div className="d-flex justify-between fs-sm">
                <span className="text-muted">Payment Method:</span>
                <span className="fw-500">{selectedBill.paymentMethod}</span>
              </div>
              {selectedBill.customerPhone && (
                <div className="d-flex justify-between fs-sm mt-4">
                  <span className="text-muted">Customer:</span>
                  <span className="fw-500">{selectedBill.customerPhone}</span>
                </div>
              )}
            </div>
            
            <button onClick={() => setSelectedBill(null)} className="btn btn-primary w-100 mt-24 p-12">
              Close
            </button>

          </div>
        </div>
      )}
    </div>
  );
};

export default BillList;
