import React, { useState } from 'react';
import { useDbStore } from '../store/dbStore';
import { useAuth } from '../store/AuthContext';
import { Plus, Edit2, Trash2, X, User } from 'lucide-react';
import Swal from 'sweetalert2';

const Employees = () => {
  const { currentUser } = useAuth();
  const employees = useDbStore(state => state.employees);
  const addRecord = useDbStore(state => state.addRecord);
  const updateRecord = useDbStore(state => state.updateRecord);
  const deleteRecord = useDbStore(state => state.deleteRecord);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    role: 'Staff',
    phone: '',
    salary: ''
  });

  const roles = ['Staff', 'Manager', 'Chef', 'Waiter', 'Delivery'];

  const activeEmployees = employees.filter(e => e.status !== 'Archived');

  const openAddModal = () => {
    setEditItem(null);
    setFormData({ name: '', role: 'Staff', phone: '', salary: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditItem(item);
    setFormData({ 
      name: item.name, 
      role: item.role, 
      phone: item.phone || '', 
      salary: item.salary || '' 
    });
    setIsModalOpen(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.role) {
      Swal.fire('Error', 'Please fill required fields', 'error');
      return;
    }

    const payload = {
      ...formData,
      salary: Number(formData.salary) || 0
    };

    if (editItem) {
      updateRecord('employees', editItem.id, payload, currentUser);
      Swal.fire('Updated!', 'Staff details updated.', 'success');
    } else {
      addRecord('employees', payload, currentUser);
      Swal.fire('Added!', 'New staff member added.', 'success');
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id) => {
    Swal.fire({
      title: 'Are you sure?',
      text: "You are removing this staff member.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e23744',
      confirmButtonText: 'Yes, delete!'
    }).then((result) => {
      if (result.isConfirmed) {
        deleteRecord('employees', id, currentUser);
        Swal.fire('Deleted!', 'Staff member removed.', 'success');
      }
    });
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
        <div>
          <h2 style={{ margin: '0 0 4px 0' }}>Staff Management</h2>
          <div style={{ color: 'var(--text-muted)' }}>Manage your employees, roles, and salaries</div>
        </div>
        <button onClick={openAddModal} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Plus size={18} /> Add Staff
        </button>
      </div>

      <div className="glass-panel" style={{ overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto', width: '100%' }}>
          <table className="data-table" style={{ minWidth: '800px' }}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Role</th>
              <th>Phone</th>
              <th>Salary (₹)</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {activeEmployees.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                  No staff members added yet.
                </td>
              </tr>
            ) : (
              activeEmployees.map(emp => (
                <tr key={emp.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <User size={16} />
                      </div>
                      <span style={{ fontWeight: 600 }}>{emp.name}</span>
                    </div>
                  </td>
                  <td>
                    <span className="badge badge-active">{emp.role}</span>
                  </td>
                  <td>{emp.phone || '-'}</td>
                  <td style={{ fontWeight: 600 }}>₹{emp.salary || 0}</td>
                  <td>
                    <span style={{ color: 'var(--status-active)' }}>Active</span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={() => openEditModal(emp)} className="btn btn-secondary" style={{ padding: '6px' }}>
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => handleDelete(emp.id)} className="btn btn-secondary" style={{ padding: '6px', color: '#e23744', borderColor: 'rgba(226, 55, 68, 0.2)' }}>
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

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '400px', padding: '32px', border: '1px solid var(--border-light)', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
              <h3 style={{ margin: 0, fontSize: '1.4rem' }}>{editItem ? 'Edit Staff' : 'Add Staff'}</h3>
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
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Role *</label>
                <select className="form-input" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} style={{ padding: '12px', width: '100%' }}>
                  {roles.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Phone Number</label>
                <input type="tel" className="form-input" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="1234567890" style={{ padding: '12px', width: '100%' }} />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Monthly Salary (₹)</label>
                <input type="number" className="form-input" value={formData.salary} onChange={e => setFormData({...formData, salary: e.target.value})} min="0" style={{ padding: '12px', width: '100%' }} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px', marginTop: '16px' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary" style={{ padding: '12px 24px' }}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ padding: '12px 24px' }}>Save Staff</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Employees;
