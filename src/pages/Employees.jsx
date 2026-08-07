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
      <div className="d-flex justify-between align-center mb-32 flex-wrap gap-16">
        <div>
          <h2 className="page-title d-flex align-center gap-8">
            <Users size={24} color="var(--primary-color)" /> Staff Management
          </h2>
          <div className="text-muted">Manage your employees, roles, and salaries</div>
        </div>
        <button onClick={openAddModal} className="btn btn-primary d-flex align-center gap-8">
          <Plus size={18} /> Add Staff
        </button>
      </div>

      <div className="glass-panel overflow-hidden">
        <div className="w-100" style={{ overflowX: 'auto' }}>
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
            {employees.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center p-32 text-muted">
                  No staff members added yet.
                </td>
              </tr>
            ) : (
              activeEmployees.map(emp => (
                <tr key={emp.id}>
                  <td>
                    <div className="d-flex align-center gap-12">
                      <div className="radius-full bg-tertiary d-flex align-center justify-center" style={{ width: '36px', height: '36px' }}>
                        <Users size={16} />
                      </div>
                      <span className="fw-600">{emp.name}</span>
                    </div>
                  </td>
                  <td>
                    <span className="badge badge-active">{emp.role}</span>
                  </td>
                  <td>{emp.phone || '-'}</td>
                  <td className="fw-600">₹{emp.salary || 0}</td>
                  <td>
                    <span style={{ color: 'var(--status-active)' }}>Active</span>
                  </td>
                  <td>
                    <div className="d-flex gap-8">
                      <button onClick={() => openEditModal(emp)} className="btn btn-secondary p-4">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => handleDelete(emp.id)} className="btn btn-secondary p-4 text-danger border-danger">
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

      {/* Modal for Add/Edit */}
      {isModalOpen && (
        <div className="pos-abs w-100 h-100 d-flex align-center justify-center z-2000 backdrop-blur" style={{ top: 0, left: 0, backgroundColor: 'rgba(0,0,0,0.7)', position: 'fixed' }}>
          <div className="glass-panel w-100 p-32 border-light shadow-xl" style={{ maxWidth: '400px' }}>
            <div className="d-flex justify-between align-center mb-32">
              <h3 className="m-0 fs-xl">{editItem ? 'Edit Staff' : 'Add Staff'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="bg-transparent border-none text-muted cursor-pointer d-flex">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="d-flex flex-col gap-20">
              <div>
                <label className="d-block mb-8 fs-sm text-muted">Full Name *</label>
                <input type="text" className="form-input p-12 w-100" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required placeholder="John Doe" />
              </div>
              
              <div>
                <label className="d-block mb-8 fs-sm text-muted">Role *</label>
                <select className="form-input p-12 w-100" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
                  <option value="Server">Server</option>
                  <option value="Chef">Chef</option>
                  <option value="Manager">Manager</option>
                </select>
              </div>

              <div>
                <label className="d-block mb-8 fs-sm text-muted">Phone Number</label>
                <input type="tel" className="form-input p-12 w-100" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="1234567890" />
              </div>

              <div>
                <label className="d-block mb-8 fs-sm text-muted">Monthly Salary (₹)</label>
                <input type="number" className="form-input p-12 w-100" value={formData.salary} onChange={e => setFormData({...formData, salary: e.target.value})} min="0" />
              </div>

              <div className="d-flex justify-end gap-16 mt-16">
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary px-24 py-12">Cancel</button>
                <button type="submit" className="btn btn-primary px-24 py-12">Save Staff</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Employees;
