import React, { useState } from 'react';
import { useDbStore } from '../store/dbStore';
import { useAuth } from '../store/AuthContext';
import { Plus, Edit2, Trash2, X } from 'lucide-react';
import Swal from 'sweetalert2';

const Finance = () => {
  const { currentUser } = useAuth();
  const expenses = useDbStore(state => state.expenses);
  const income = useDbStore(state => state.income);
  const addRecord = useDbStore(state => state.addRecord);
  const updateRecord = useDbStore(state => state.updateRecord);
  const deleteRecord = useDbStore(state => state.deleteRecord);

  const [activeTab, setActiveTab] = useState('expenses'); // 'expenses' or 'income'
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    category: '',
    
    date: new Date().toISOString().split('T')[0],
    notes: ''
  });

  const activeData = activeTab === 'expenses' ? expenses : income;
  const activeCollection = activeTab === 'expenses' ? 'expenses' : 'income';

  const categories = activeTab === 'expenses' 
    ? ['Rent', 'Utilities', 'Inventory', 'Salary', 'Maintenance', 'Other']
    : ['Sales', 'Catering', 'Other'];

  const handleOpenModal = (item = null) => {
    if (item) {
      setEditItem(item);
      setFormData({
        title: item.title,
        amount: item.amount,
        category: item.category,
        date: item.date || item.createdDate.split('T')[0],
        notes: item.notes || ''
      });
    } else {
      setEditItem(null);
      setFormData({ title: '', amount: '', category: categories[0], date: new Date().toISOString().split('T')[0], notes: '' });
    }
    setIsModalOpen(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!formData.title || !formData.amount || !formData.category) {
      Swal.fire('Error', 'Please fill required fields', 'error');
      return;
    }

    const payload = {
      ...formData,
      amount: Number(formData.amount)
    };

    if (editItem) {
      updateRecord(activeCollection, editItem.id, payload, currentUser);
    } else {
      addRecord(activeCollection, payload, currentUser);
    }
    setIsModalOpen(false);
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
        deleteRecord(activeCollection, id, currentUser);
        Swal.fire({ title: 'Deleted!', text: 'Record has been deleted.', icon: 'success', timer: 5000, timerProgressBar: true });
      }
    });
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-title">Finance Management</h2>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button 
              onClick={() => setActiveTab('expenses')}
              className={`btn ${activeTab === 'expenses' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '6px 16px', borderRadius: '20px' }}
            >
              Expenses
            </button>
            <button 
              onClick={() => setActiveTab('income')}
              className={`btn ${activeTab === 'income' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '6px 16px', borderRadius: '20px' }}
            >
              Other Income
            </button>
          </div>
        </div>
        <button onClick={() => handleOpenModal()} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Plus size={18} /> Add {activeTab === 'expenses' ? 'Expense' : 'Income'}
        </button>
      </div>

      <div className="glass-panel" style={{ overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto', width: '100%' }}>
          <table className="data-table" style={{ minWidth: '800px' }}>
          <thead>
            <tr>
              <th>Date</th>
              <th>Title</th>
              <th>Category</th>
              <th>Amount</th>
              <th>Notes</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {activeData.filter(i => i.status !== 'Archived').length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                  No {activeTab} recorded.
                </td>
              </tr>
            ) : (
              activeData.filter(i => i.status !== 'Archived').slice().reverse().map(item => (
                <tr key={item.id}>
                  <td>{item.date || new Date(item.createdDate).toLocaleDateString()}</td>
                  <td style={{ fontWeight: 500 }}>{item.title}</td>
                  <td><span className="badge" style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-muted)' }}>{item.category}</span></td>
                  <td style={{ fontWeight: 'bold', color: activeTab === 'expenses' ? '#ef233c' : '#2a9d8f' }}>
                    {activeTab === 'expenses' ? '-' : '+'}₹{item.amount}
                  </td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{item.notes || '-'}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={() => handleOpenModal(item)} style={{ background: 'transparent', border: 'none', color: 'var(--text-main)', cursor: 'pointer' }}>
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => handleDelete(item.id)} style={{ background: 'transparent', border: 'none', color: '#ef233c', cursor: 'pointer' }}>
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

      {/* Modal */}
      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '500px', padding: '32px', border: '1px solid var(--border-light)', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
              <h3 style={{ margin: 0, fontSize: '1.4rem' }}>{editItem ? 'Edit' : 'Add'} {activeTab === 'expenses' ? 'Expense' : 'Income'}</h3>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex' }}>
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Title *</label>
                <input type="text" className="form-input" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required placeholder="e.g. Electricity Bill" style={{ padding: '12px' }} />
              </div>
              
              <div style={{ display: 'flex', gap: '20px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Amount (₹) *</label>
                  <input type="number" className="form-input" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} required min="0" style={{ padding: '12px' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Date *</label>
                  <input type="date" className="form-input" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} required style={{ padding: '12px' }} />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Category *</label>
                <select className="form-input" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} style={{ padding: '12px' }}>
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Notes</label>
                <textarea className="form-input" value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} rows="3" style={{ padding: '12px', resize: 'vertical' }}></textarea>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px', marginTop: '16px' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary" style={{ padding: '12px 24px' }}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ padding: '12px 24px' }}>Save Record</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Finance;
