import React, { useState } from 'react';
import { useDbStore } from '../store/dbStore';
import { useAuth } from '../store/AuthContext';
import { Plus, Edit2, Trash2, X, Image as ImageIcon, Package, Search, UtensilsCrossed } from 'lucide-react';
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
      <div className="d-flex justify-between align-center mb-32 flex-wrap gap-16">
        <div>
          <h2 className="page-title d-flex align-center gap-8">
            <Package size={24} color="var(--primary-color)" /> Inventory
          </h2>
          <div className="text-muted">Manage menu items, prices, and stock levels</div>
        </div>
        <button onClick={openAddModal} className="btn btn-primary d-flex align-center gap-8">
          <Plus size={18} /> Add Menu Item
        </button>
      </div>

      <div className="glass-panel overflow-hidden">
        <div className="px-24 py-16 border-bottom d-flex justify-between align-center">
          <h3 className="m-0">Menu Items</h3>
          <div className="pos-rel">
            <input 
              type="text" 
              placeholder="Search inventory..." 
              className="form-input" 
              style={{ width: '300px', padding: '10px 16px 10px 40px', borderRadius: '20px' }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search size={18} className="pos-abs text-muted" style={{ left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          </div>
        </div>

        <div className="w-100" style={{ overflowX: 'auto' }}>
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
                <td colSpan="7" className="text-center p-32 text-muted">
                  No items found matching your search. Add some to get started.
                </td>
              </tr>
            ) : (
              filteredInventory.map(item => (
                <tr key={item.id}>
                  <td>
                    {item.img ? (
                      <div className="radius-sm" style={{ width: '40px', height: '40px', backgroundImage: `url(${item.img})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
                    ) : (
                      <div className="radius-sm bg-tertiary d-flex align-center justify-center text-muted" style={{ width: '40px', height: '40px' }}>
                        <UtensilsCrossed size={20} />
                      </div>
                    )}
                  </td>
                  <td className="fw-600">{item.itemName}</td>
                  <td>{item.category}</td>
                  <td className="text-primary fw-600">₹{item.price}</td>
                  <td>
                    <span style={{ color: item.quantity <= 10 ? '#e23744' : 'inherit', fontWeight: item.quantity <= 10 ? 700 : 400 }}>
                      {item.quantity} units
                    </span>
                  </td>
                  <td>
                    <span className="badge badge-active">Active</span>
                  </td>
                  <td>
                    <div className="d-flex gap-8">
                      <button onClick={() => openEditModal(item)} className="btn btn-secondary p-4">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => handleDelete(item.id)} className="btn btn-secondary p-4 text-danger border-danger">
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

      {isModalOpen && (
        <div className="pos-abs w-100 h-100 d-flex align-center justify-center z-2000 backdrop-blur" style={{ top: 0, left: 0, backgroundColor: 'rgba(0,0,0,0.7)', position: 'fixed' }}>
          <div className="glass-panel w-100 p-32 border-light shadow-xl" style={{ maxWidth: '500px' }}>
            <div className="d-flex justify-between align-center mb-32">
              <h3 className="m-0 fs-xl">{editItem ? 'Edit Item' : 'Add New Item'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="bg-transparent border-none text-muted cursor-pointer d-flex">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="d-flex flex-col gap-20">
              <div>
                <label className="d-block mb-8 fs-sm text-muted">Item Name *</label>
                <input type="text" className="form-input p-12" value={formData.itemName} onChange={e => setFormData({...formData, itemName: e.target.value})} required placeholder="e.g. Chicken Shawaya" />
              </div>
              
              <div>
                <label className="d-block mb-8 fs-sm text-muted">Category *</label>
                <select className="form-input p-12" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div className="d-flex gap-20">
                <div className="flex-1">
                  <label className="d-block mb-8 fs-sm text-muted">Price (₹) *</label>
                  <input type="number" className="form-input p-12" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} required min="0" />
                </div>
                <div className="flex-1">
                  <label className="d-block mb-8 fs-sm text-muted">Stock Quantity *</label>
                  <input type="number" className="form-input p-12" value={formData.quantity} onChange={e => setFormData({...formData, quantity: e.target.value})} required min="0" />
                </div>
              </div>

              <div>
                <label className="d-block mb-8 fs-sm text-muted">Image (URL or Upload from PC)</label>
                <div className="d-flex flex-col gap-12">
                  <input type="text" className="form-input p-12 w-100" value={formData.img} onChange={e => setFormData({...formData, img: e.target.value})} placeholder="https://... or /images/..." />
                  <div className="d-flex align-center gap-12">
                    <span className="fs-sm text-muted text-nowrap">OR upload from PC:</span>
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
                              const MAX_WIDTH = 300;
                              const scaleSize = Math.min(MAX_WIDTH / img.width, 1);
                              canvas.width = img.width * scaleSize;
                              canvas.height = img.height * scaleSize;
                              const ctx = canvas.getContext('2d');
                              ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                              const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.7);
                              setFormData({ ...formData, img: compressedDataUrl });
                            };
                            img.src = event.result;
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="fs-sm"
                    />
                  </div>
                </div>
                {formData.img && formData.img.startsWith('data:image') && (
                  <div className="fs-sm mt-8" style={{ color: '#10b981' }}>✓ Image loaded from PC</div>
                )}
              </div>

              <div className="d-flex justify-end gap-16 mt-16">
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary px-24 py-12">Cancel</button>
                <button type="submit" className="btn btn-primary px-24 py-12">Save Item</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;
