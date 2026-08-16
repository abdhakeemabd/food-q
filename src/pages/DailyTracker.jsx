import React, { useState, useEffect } from 'react';
import { useDbStore } from '../store/dbStore';
import { useAuth } from '../store/AuthContext';
import { Plus, Edit2, Trash2, X } from 'lucide-react';
import Swal from 'sweetalert2';

const DailyTracker = () => {
  const { currentUser } = useAuth();
  
  const dailyTrackers = useDbStore(state => state.dailyTrackers || []);
  const dailyExpenses = useDbStore(state => state.dailyExpenses || []);
  const addRecord = useDbStore(state => state.addRecord);
  const updateRecord = useDbStore(state => state.updateRecord);
  const deleteRecord = useDbStore(state => state.deleteRecord);
  const fetchAllData = useDbStore(state => state.fetchAllData);

  const [activeTab, setActiveTab] = useState('sales'); // 'sales' or 'expense'
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  const defaultSalesData = {
    date: new Date().toISOString().split('T')[0],
    total_sale: '', swiggy: '', total_expense: '', cash_balance: ''
  };

  const defaultExpenseData = {
    date: new Date().toISOString().split('T')[0],
    rent: '', salary: '', kalikattan: '', chicken: '', kuboos: '',
    gas: '', mandi: '', pepsi: '', purchase: '', bill: '', extra: ''
  };

  const [formData, setFormData] = useState({});

  const handleOpenModal = (item = null) => {
    if (item) {
      setEditItem(item);
      setFormData(item);
    } else {
      setEditItem(null);
      setFormData(activeTab === 'sales' ? defaultSalesData : defaultExpenseData);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditItem(null);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!formData.date) {
      Swal.fire('Error', 'Date is required', 'error');
      return;
    }

    let payload = { ...formData };
    
    if (activeTab === 'sales') {
      payload.total_sale = payload.total_sale ? Number(payload.total_sale) : 0;
      payload.swiggy = payload.swiggy ? Number(payload.swiggy) : 0;
      payload.total_expense = payload.total_expense ? Number(payload.total_expense) : 0;
      payload.cash_balance = payload.cash_balance ? Number(payload.cash_balance) : 0;
    } else if (activeTab === 'expense') {
      ['rent', 'salary', 'kalikattan', 'chicken', 'kuboos', 'gas', 'mandi', 'pepsi', 'purchase', 'bill', 'extra'].forEach(key => {
        payload[key] = payload[key] ? Number(payload[key]) : 0;
      });
    }

    const collection = activeTab === 'sales' ? 'daily-trackers' : 'daily-expenses';

    if (editItem) {
      updateRecord(collection, editItem.id, payload, currentUser);
    } else {
      addRecord(collection, payload, currentUser);
    }
    handleCloseModal();
    
    setTimeout(() => {
      fetchAllData();
    }, 500);
  };

  const handleDelete = (id) => {
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef233c',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        deleteRecord(activeTab === 'sales' ? 'daily-trackers' : 'daily-expenses', id, currentUser);
        Swal.fire({ title: 'Deleted!', text: 'Record has been deleted.', icon: 'success', timer: 5000, timerProgressBar: true });
      }
    });
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-title">Daily Tracker</h2>
          <div className="d-flex gap-8">
            <button 
              onClick={() => setActiveTab('sales')}
              className={`btn ${activeTab === 'sales' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '6px 16px', borderRadius: '20px' }}
            >
              Sales Tracker
            </button>
            <button 
              onClick={() => setActiveTab('expense')}
              className={`btn ${activeTab === 'expense' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '6px 16px', borderRadius: '20px' }}
            >
              Expense Breakdown
            </button>
          </div>
        </div>
        <button onClick={() => handleOpenModal()} className="btn btn-primary d-flex align-center gap-8">
          <Plus size={18} /> Add {activeTab === 'sales' ? 'Sales Record' : 'Expense Record'}
        </button>
      </div>

      <div className="glass-panel overflow-hidden">
        <div className="w-100" style={{ overflowX: 'auto' }}>
          
          {activeTab === 'sales' ? (
            <table className="data-table" style={{ minWidth: '800px' }}>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Day Total Sale</th>
                  <th>Swiggy</th>
                  <th>Day Total Expense</th>
                  <th>Cash Balance</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {dailyTrackers.length === 0 ? (
                  <tr><td colSpan="6" className="text-center p-32">No Sales Records Found</td></tr>
                ) : (
                  dailyTrackers.sort((a,b) => new Date(b.date) - new Date(a.date)).map(item => (
                    <tr key={item.id}>
                      <td className="fw-500">{item.date}</td>
                      <td className="fw-700" style={{ color: '#2a9d8f' }}>₹{item.total_sale}</td>
                      <td className="fw-700" style={{ color: '#fca311' }}>₹{item.swiggy}</td>
                      <td className="fw-700 text-danger">₹{item.total_expense}</td>
                      <td className="fw-700">₹{item.cash_balance}</td>
                      <td>
                        <div className="d-flex gap-8">
                          <button onClick={() => handleOpenModal(item)} className="bg-transparent border-none text-main cursor-pointer">
                            <Edit2 size={18} />
                          </button>
                          <button onClick={() => handleDelete(item.id)} className="bg-transparent border-none text-danger cursor-pointer">
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          ) : (
            <table className="data-table" style={{ minWidth: '1200px' }}>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Chicken</th>
                  <th>Mutton</th>
                  <th>Fish</th>
                  <th>Vegetable</th>
                  <th>Grocery</th>
                  <th>Dairy</th>
                  <th>Salary</th>
                  <th>Rent</th>
                  <th>EB Bill</th>
                  <th>Gas</th>
                  <th>Other</th>
                  <th className="text-danger">TOTAL</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {dailyExpenses.length === 0 ? (
                  <tr><td colSpan="14" className="text-center p-32">No Expense Records Found</td></tr>
                ) : (
                  dailyExpenses.sort((a,b) => new Date(b.date) - new Date(a.date)).map(item => (
                    <tr key={item.id}>
                      <td className="fw-500">{item.date}</td>
                      <td>{item.chicken || '-'}</td>
                      <td>{item.mutton || '-'}</td>
                      <td>{item.fish || '-'}</td>
                      <td>{item.vegetable || '-'}</td>
                      <td>{item.grocery || '-'}</td>
                      <td>{item.dairy || '-'}</td>
                      <td>{item.salary || '-'}</td>
                      <td>{item.rent || '-'}</td>
                      <td>{item.eb_bill || '-'}</td>
                      <td>{item.gas || '-'}</td>
                      <td>{item.other || '-'}</td>
                      <td className="fw-700 text-danger">₹{item.total}</td>
                      <td>
                        <div className="d-flex gap-8">
                          <button onClick={() => handleOpenModal(item)} className="bg-transparent border-none text-main cursor-pointer">
                            <Edit2 size={18} />
                          </button>
                          <button onClick={() => handleDelete(item.id)} className="bg-transparent border-none text-danger cursor-pointer">
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="pos-abs w-100 h-100 d-flex align-center justify-center z-2000 backdrop-blur" style={{ top: 0, left: 0, backgroundColor: 'rgba(0,0,0,0.7)', position: 'fixed' }}>
          <div className="glass-panel w-100 p-32 border-light shadow-xl overflow-y-auto" style={{ maxWidth: activeTab === 'sales' ? '500px' : '800px', maxHeight: '90vh' }}>
            <div className="d-flex justify-between align-center mb-32">
              <h3 className="m-0 fs-xl">{editItem ? 'Edit' : 'Add'} {activeTab === 'sales' ? 'Sales Record' : 'Expense Record'}</h3>
              <button onClick={handleCloseModal} className="bg-transparent border-none text-muted cursor-pointer d-flex">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="d-flex flex-col gap-20">
              <div>
                <label className="d-block mb-8 fs-sm text-muted">Date *</label>
                <input type="date" className="form-input p-12 w-100" value={formData.date || ''} onChange={e => setFormData({...formData, date: e.target.value})} required />
              </div>

              {activeTab === 'sales' ? (
                <>
                  <div className="d-flex gap-20 flex-wrap">
                    <div className="flex-1">
                      <label className="d-block mb-8 fs-sm text-muted">Day Total Sale (₹)</label>
                      <input type="number" className="form-input p-12 w-100" value={formData.total_sale || ''} onChange={e => setFormData({...formData, total_sale: e.target.value})} min="0" step="0.01" />
                    </div>
                    <div className="flex-1">
                      <label className="d-block mb-8 fs-sm text-muted">Swiggy Sale (₹)</label>
                      <input type="number" className="form-input p-12 w-100" value={formData.swiggy || ''} onChange={e => setFormData({...formData, swiggy: e.target.value})} min="0" step="0.01" />
                    </div>
                  </div>
                  <div className="d-flex gap-20 flex-wrap">
                    <div className="flex-1">
                      <label className="d-block mb-8 fs-sm text-muted">Day Total Expense (₹)</label>
                      <input type="number" className="form-input p-12 w-100" value={formData.total_expense || ''} onChange={e => setFormData({...formData, total_expense: e.target.value})} min="0" step="0.01" />
                    </div>
                    <div className="flex-1">
                      <label className="d-block mb-8 fs-sm text-muted">Cash Balance (₹)</label>
                      <input type="number" className="form-input p-12 w-100" value={formData.cash_balance || ''} onChange={e => setFormData({...formData, cash_balance: e.target.value})} step="0.01" />
                    </div>
                  </div>
                </>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                  {['chicken', 'mutton', 'fish', 'vegetable', 'grocery', 'dairy', 'salary', 'rent', 'eb_bill', 'gas', 'other'].map(field => (
                    <div key={field}>
                      <label className="d-block mb-8 fs-sm text-muted text-capitalize">{field} (₹)</label>
                      <input type="number" className="form-input p-12 w-100" value={formData[field] || ''} onChange={e => setFormData({...formData, [field]: e.target.value})} min="0" step="0.01" />
                    </div>
                  ))}
                </div>
              )}

              <div className="d-flex justify-end gap-16 mt-16">
                <button type="button" onClick={handleCloseModal} className="btn btn-secondary px-24 py-12">Cancel</button>
                <button type="submit" className="btn btn-primary px-24 py-12">Save Record</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DailyTracker;
