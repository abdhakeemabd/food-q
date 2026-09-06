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
      Swal.fire({ title: 'Updated!', text: 'Customer details updated.', icon: 'success', timer: 5000, timerProgressBar: true });
    } else {
      addRecord('customers', formData, currentUser);
      Swal.fire({ title: 'Added!', text: 'New customer added.', icon: 'success', timer: 5000, timerProgressBar: true });
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
        Swal.fire({ title: 'Deleted!', text: 'Customer removed.', icon: 'success', timer: 5000, timerProgressBar: true });
      }
    });
  };

  return (
    <div>
      <div className="d-flex justify-between align-center mb-32 flex-wrap gap-16">
        <div>
          <h2 className="page-title d-flex align-center gap-8">
            <Users size={24} color="var(--primary-color)" /> Customer Management
          </h2>
          <div className="text-muted">Manage your customer database and viewing history</div>
        </div>
        <button onClick={openAddModal} className="btn btn-primary d-flex align-center gap-8">
          <Plus size={18} /> Add Customer
        </button>
      </div>

      <div className="glass-panel overflow-hidden">
        <div className="w-100" style={{ overflowX: 'auto' }}>
          <table className="data-table" style={{ minWidth: '800px' }}>
          <thead>
            <tr>
              <th>S.No.</th>
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
                <td colSpan="7" className="text-center p-32 text-muted">
                  No customers added yet.
                </td>
              </tr>
            ) : (
              activeCustomers.map((customer, index) => {
                const orderCount = bills.filter(b => b.customerPhone === customer.phone).length;
                return (
                  <tr key={customer.id}>
                    <td className="text-muted fw-600">{index + 1}</td>
                    <td>
                      <div className="d-flex align-center gap-12">
                        <div className="radius-full bg-tertiary d-flex align-center justify-center" style={{ width: '36px', height: '36px' }}>
                          <Users size={16} />
                        </div>
                        <span className="fw-600">{customer.name}</span>
                      </div>
                    </td>
                    <td style={{ fontFamily: 'monospace' }}>{customer.phone}</td>
                    <td>{customer.address || '-'}</td>
                    <td>
                      <span className="badge badge-active bg-tertiary" style={{ color: 'var(--text-main)' }}>
                        {orderCount} Orders
                      </span>
                    </td>
                    <td>
                      <span style={{ color: 'var(--status-active)' }}>Active</span>
                    </td>
                    <td>
                      <div className="d-flex gap-8">
                        <button onClick={() => openEditModal(customer)} className="btn btn-secondary p-4">
                          <Edit2 size={16} />
                        </button>
                        <button onClick={() => handleDelete(customer.id)} className="btn btn-secondary p-4 text-danger border-danger">
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

      {isModalOpen && (
        <div className="pos-abs w-100 h-100 d-flex align-center justify-center z-2000 backdrop-blur" style={{ top: 0, left: 0, backgroundColor: 'rgba(0,0,0,0.7)', position: 'fixed' }}>
          <div className="glass-panel w-100 p-32 border-light shadow-xl" style={{ maxWidth: '400px' }}>
            <div className="d-flex justify-between align-center mb-32">
              <h3 className="m-0 fs-xl">{editItem ? 'Edit Customer' : 'Add Customer'}</h3>
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
                <label className="d-block mb-8 fs-sm text-muted">Phone Number *</label>
                <input type="tel" className="form-input p-12 w-100" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} required placeholder="1234567890" />
              </div>

              <div>
                <label className="d-block mb-8 fs-sm text-muted">Delivery Address (Optional)</label>
                <textarea className="form-input p-12 w-100 resize-y" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} rows="3"></textarea>
              </div>

              <div className="d-flex justify-end gap-16 mt-16">
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary px-24 py-12">Cancel</button>
                <button type="submit" className="btn btn-primary px-24 py-12">Save Customer</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Customers;
