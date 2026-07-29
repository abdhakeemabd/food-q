import React, { useState } from 'react';
import { useDbStore } from '../store/dbStore';
import { useAuth } from '../store/AuthContext';
import { Plus, Edit2, Trash2, X, Image as ImageIcon } from 'lucide-react';
import Swal from 'sweetalert2';

const Inventory = () => {
  const { currentUser } = useAuth();
  const inventory = useDbStore(state => state.inventory);
  const addRecord = useDbStore(state => state.addRecord);
  const updateRecord = useDbStore(state => state.updateRecord);
  const deleteRecord = useDbStore(state => state.deleteRecord);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const [formData, setFormData] = useState({
    itemName: '',
    category: 'Main Course',
    price: '',
    quantity: '',
    img: ''
  });

  const categories = ['Main Course', 'Chicken', 'Breads', 'Combos', 'Beverages', 'Hot Drinks', 'Desserts', 'Extras'];

  const filteredInventory = inventory.filter(i => 
    i.status !== 'Archived' && 
    i.itemName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const openAddModal = () => {
    setEditItem(null);
    setFormData({ itemName: '', category: 'Main Course', price: '', quantity: '', img: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditItem(item);
    setFormData({ 
      itemName: item.itemName, 
      category: item.category, 
      price: item.price, 
      quantity: item.quantity, 
      img: item.img || '' 
    });
    setIsModalOpen(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!formData.itemName || !formData.price || !formData.quantity) {
      Swal.fire('Error', 'Please fill all required fields', 'error');
      return;
    }

    const payload = {
      ...formData,
      price: Number(formData.price),
      quantity: Number(formData.quantity)
    };

    if (editItem) {
      updateRecord('inventory', editItem.id, payload, currentUser);
      Swal.fire('Updated!', 'Menu item has been updated.', 'success');
    } else {
      addRecord('inventory', payload, currentUser);
      Swal.fire('Added!', 'New menu item has been added.', 'success');
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id) => {
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this! This removes the item from the POS menu.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e23744',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        deleteRecord('inventory', id, currentUser);
        Swal.fire('Deleted!', 'Item has been deleted.', 'success');
      }
    });
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
        <div>
          <h2 style={{ margin: '0 0 4px 0' }}>Inventory Management</h2>
          <div style={{ color: 'var(--text-muted)' }}>Manage menu items, prices, and stock levels</div>
        </div>
        <button onClick={openAddModal} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Plus size={18} /> Add Menu Item
        </button>
      </div>

      <div className="glass-panel" style={{ overflow: 'hidden' }}>
        <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <input 
            type="text" 
            placeholder="Search inventory..." 
            className="form-input" 
            style={{ width: '300px', padding: '10px 16px', borderRadius: '20px' }}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div style={{ overflowX: 'auto', width: '100%' }}>
          <table className="data-table" style={{ minWidth: '800px' }}>
          <thead>
            <tr>
              <th>Image</th>
              <th>Item Name</th>
              <th>Category</th>
              <th>Price (₹)</th>
              <th>Stock Qty</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredInventory.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                  No items found. Add some to get started.
                </td>
              </tr>
            ) : (
              filteredInventory.map(item => (
                <tr key={item.id}>
                  <td>
                    {item.img ? (
                      <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundImage: `url(${item.img})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
                    ) : (
                      <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                        <ImageIcon size={20} />
                      </div>
                    )}
                  </td>
                  <td style={{ fontWeight: 600 }}>{item.itemName}</td>
                  <td>{item.category}</td>
                  <td style={{ color: 'var(--primary-color)', fontWeight: 600 }}>₹{item.price}</td>
                  <td>
                    <span style={{ color: item.quantity <= 10 ? '#e23744' : 'inherit', fontWeight: item.quantity <= 10 ? 700 : 400 }}>
                      {item.quantity} units
                    </span>
                  </td>
                  <td>
                    <span className={`badge badge-active`}>Active</span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={() => openEditModal(item)} className="btn btn-secondary" style={{ padding: '6px' }}>
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => handleDelete(item.id)} className="btn btn-secondary" style={{ padding: '6px', color: '#e23744', borderColor: 'rgba(226, 55, 68, 0.2)' }}>
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
          <div className="glass-panel" style={{ width: '100%', maxWidth: '500px', padding: '32px', border: '1px solid var(--border-light)', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
              <h3 style={{ margin: 0, fontSize: '1.4rem' }}>{editItem ? 'Edit Item' : 'Add New Item'}</h3>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex' }}>
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Item Name *</label>
                <input type="text" className="form-input" value={formData.itemName} onChange={e => setFormData({...formData, itemName: e.target.value})} required placeholder="e.g. Chicken Shawaya" style={{ padding: '12px' }} />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Category *</label>
                <select className="form-input" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} style={{ padding: '12px' }}>
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div style={{ display: 'flex', gap: '20px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Price (₹) *</label>
                  <input type="number" className="form-input" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} required min="0" style={{ padding: '12px' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Stock Quantity *</label>
                  <input type="number" className="form-input" value={formData.quantity} onChange={e => setFormData({...formData, quantity: e.target.value})} required min="0" style={{ padding: '12px' }} />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Image (URL or Upload from PC)</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <input type="text" className="form-input" value={formData.img} onChange={e => setFormData({...formData, img: e.target.value})} placeholder="https://... or /images/..." style={{ padding: '12px', width: '100%' }} />
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>OR upload from PC:</span>
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (event) => {
                            const img = new Image();
                            img.onload = () => {
                              const canvas = document.createElement('canvas');
                              const MAX_WIDTH = 300; // Resize to make it small enough for localStorage
                              const scaleSize = Math.min(MAX_WIDTH / img.width, 1); // Only shrink, don't enlarge
                              canvas.width = img.width * scaleSize;
                              canvas.height = img.height * scaleSize;
                              const ctx = canvas.getContext('2d');
                              ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                              // Compress as JPEG
                              const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.7);
                              setFormData({ ...formData, img: compressedDataUrl });
                            };
                            img.src = event.target.result;
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      style={{ fontSize: '0.9rem', color: 'var(--text-main)' }}
                    />
                  </div>
                </div>
                {formData.img && formData.img.startsWith('data:image') && (
                  <div style={{ marginTop: '8px', fontSize: '0.85rem', color: '#10b981' }}>✓ Image loaded from PC</div>
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px', marginTop: '16px' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary" style={{ padding: '12px 24px' }}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ padding: '12px 24px' }}>Save Item</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;
