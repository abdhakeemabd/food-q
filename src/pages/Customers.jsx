import React, { useState } from 'react';
import { useDbStore } from '../store/dbStore';
import { useAuth } from '../store/AuthContext';
import { Plus, Edit2, Trash2, X, Users } from 'lucide-react';
import Swal from 'sweetalert2';

const Customers = () => {
  const { currentUser } = useAuth();
  const customers = useDbStore(state => state.customers);
  const bills = useDbStore(state => state.bills);
  const addRecord = useDbStore(state => state.addRecord);
  const updateRecord = useDbStore(state => state.updateRecord);
  const deleteRecord = useDbStore(state => state.deleteRecord);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: ''
  });

  const activeCustomers = customers.filter(c => c.status !== 'Archived');

  const openAddModal = () => {
    setEditItem(null);
    setFormData({ name: '', phone: '', address: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditItem(item);
    setFormData({ 
      name: item.name || '', 
      phone: item.phone || '', 
      address: item.address || ''
    });
    setIsModalOpen(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) {
      Swal.fire('Error', 'Please fill required fields (Name & Phone)', 'error');
      return;
    }

    if (editItem) {
      updateRecord('customers', editItem.id, formData, currentUser);
      Swal.fire('Updated!', 'Customer details updated.', 'success');
    } else {
      addRecord('customers', formData, currentUser);
      Swal.fire('Added!', 'New customer added.', 'success');
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id) => {
    Swal.fire({
      title: 'Are you sure?',
      text: "You are removing this customer.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e23744',
      confirmButtonText: 'Yes, delete!'
    }).then((result) => {
      if (result.isConfirmed) {
        deleteRecord('customers', id, currentUser);
        Swal.fire('Deleted!', 'Customer removed.', 'success');
      }
    });
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
        <div>
          <h2 style={{ margin: '0 0 4px 0' }}>Customer Directory</h2>

        </div>
        <button onClick={openAddModal} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Plus size={18} /> Add Customer
        </button>
      </div>

      <div className="glass-panel" style={{ overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto', width: '100%' }}>
          <table className="data-table" style={{ minWidth: '800px' }}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Phone</th>
              <th>Address</th>
              <th>Total Orders</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {activeCustomers.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                  No customers added yet.
                </td>
              </tr>
            ) : (
              activeCustomers.map(customer => {
                // Derived order count from bills
                const orderCount = bills.filter(b => b.customerPhone === customer.phone).length;
                return (
                  <tr key={customer.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Users size={16} />
                        </div>
                        <span style={{ fontWeight: 600 }}>{customer.name}</span>
                      </div>
                    </td>
                    <td style={{ fontFamily: 'monospace' }}>{customer.phone}</td>
                    <td>{customer.address || '-'}</td>
                    <td>
                      <span className="badge badge-active" style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-main)' }}>
                        {orderCount} Orders
                      </span>
                    </td>
                    <td>
                      <span style={{ color: 'var(--status-active)' }}>Active</span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button onClick={() => openEditModal(customer)} className="btn btn-secondary" style={{ padding: '6px' }}>
                          <Edit2 size={16} />
                        </button>
                        <button onClick={() => handleDelete(customer.id)} className="btn btn-secondary" style={{ padding: '6px', color: '#e23744', borderColor: 'rgba(226, 55, 68, 0.2)' }}>
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '400px', padding: '32px', border: '1px solid var(--border-light)', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
              <h3 style={{ margin: 0, fontSize: '1.4rem' }}>{editItem ? 'Edit Customer' : 'Add Customer'}</h3>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex' }}>
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Full Name *</label>
                <input type="text" className="form-input" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required placeholder="John Doe" style={{ padding: '12px', width: '100%' }} />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Phone Number *</label>
                <input type="tel" className="form-input" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} required placeholder="1234567890" style={{ padding: '12px', width: '100%' }} />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Delivery Address (Optional)</label>
                <textarea className="form-input" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} rows="3" style={{ padding: '12px', width: '100%', resize: 'vertical' }}></textarea>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px', marginTop: '16px' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary" style={{ padding: '12px 24px' }}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ padding: '12px 24px' }}>Save Customer</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Customers;
