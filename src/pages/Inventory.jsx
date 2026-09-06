import React, { useState } from 'react';
import { useDbStore } from '../store/dbStore';
import { useAuth } from '../store/AuthContext';
import { Plus, Edit2, Trash2, X, Image as ImageIcon, Package, Search, UtensilsCrossed, ArrowUp, ArrowDown } from 'lucide-react';
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

  const backendCategories = useDbStore(state => state.categories);

  const categoriesList = Array.from(new Set([
    ...backendCategories.map(c => (typeof c === 'string' ? c : c?.name)).filter(Boolean),
    ...inventory.map(i => i.category).filter(Boolean)
  ]));
  const categories = categoriesList.length > 0 ? categoriesList : ['Main Course'];

  const filteredInventory = inventory.filter(i => {
    const name = i?.itemName || i?.name || '';
    return i?.status !== 'Archived' && name.toLowerCase().includes((searchQuery || '').toLowerCase());
  });

  const openAddModal = () => {
    setEditItem(null);
    setFormData({ itemName: '', category: categories[0] || 'Main Course', price: '', quantity: '', img: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditItem(item);
    setFormData({ 
      itemName: item?.itemName || item?.name || '', 
      category: item?.category || categories[0] || 'Main Course', 
      price: item?.price || '', 
      quantity: item?.stock !== undefined ? item.stock : (item?.quantity || 0), 
      img: item?.img || '' 
    });
    setIsModalOpen(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!formData.itemName || !formData.price || !formData.quantity || !formData.category) {
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
      Swal.fire({ title: 'Updated!', text: 'Menu item has been updated.', icon: 'success', timer: 5000, timerProgressBar: true });
    } else {
      addRecord('inventory', payload, currentUser);
      Swal.fire({ title: 'Added!', text: 'New menu item has been added.', icon: 'success', timer: 5000, timerProgressBar: true });
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
        Swal.fire({ title: 'Deleted!', text: 'Item has been deleted.', icon: 'success', timer: 5000, timerProgressBar: true });
      }
    });
  };

  const moveUp = (index) => {
    if (index === 0) return;
    const current = filteredInventory[index];
    const previous = filteredInventory[index - 1];
    const tempOrder = current.display_order !== undefined ? current.display_order : index;
    const prevOrder = previous.display_order !== undefined ? previous.display_order : (index - 1);
    
    updateRecord('inventory', current.id, { display_order: prevOrder }, currentUser);
    updateRecord('inventory', previous.id, { display_order: tempOrder }, currentUser);
  };

  const moveDown = (index) => {
    if (index === filteredInventory.length - 1) return;
    const current = filteredInventory[index];
    const next = filteredInventory[index + 1];
    const tempOrder = current.display_order !== undefined ? current.display_order : index;
    const nextOrder = next.display_order !== undefined ? next.display_order : (index + 1);

    updateRecord('inventory', current.id, { display_order: nextOrder }, currentUser);
    updateRecord('inventory', next.id, { display_order: tempOrder }, currentUser);
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
          <div className="pos-rel d-flex align-center mobile-w-100">
            <Search size={18} className="text-muted" style={{ position: 'absolute', left: '14px', zIndex: 10, pointerEvents: 'none' }} />
            <input 
              type="text" 
              placeholder="Search inventory..." 
              className="form-input mobile-w-100" 
              style={{ width: '300px', maxWidth: '100%', padding: '10px 16px 10px 40px', borderRadius: '20px' }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="w-100" style={{ overflowX: 'auto' }}>
          <table className="data-table" style={{ minWidth: '800px' }}>
          <thead>
            <tr>
              <th>S.No.</th>
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
                <td colSpan="8" className="text-center p-32 text-muted">
                  No items found matching your search. Add some to get started.
                </td>
              </tr>
            ) : (
              filteredInventory.map((item, index) => (
                <tr key={item.id}>
                  <td className="text-muted fw-600">{index + 1}</td>
                  <td>
                    {item.img ? (
                      <div className="radius-sm" style={{ width: '40px', height: '40px', backgroundImage: `url(${item.img})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
                    ) : (
                      <div className="radius-sm bg-tertiary d-flex align-center justify-center text-muted" style={{ width: '40px', height: '40px' }}>
                        <UtensilsCrossed size={20} />
                      </div>
                    )}
                  </td>
                  <td className="fw-600">{item.itemName || item.name || 'Unnamed Item'}</td>
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
                      <div className="d-flex flex-col gap-4 mr-8">
                        <button onClick={() => moveUp(index)} disabled={index === 0} className="bg-transparent border-none p-0 cursor-pointer text-muted hover-text-primary d-flex align-center justify-center" style={{ opacity: index === 0 ? 0.3 : 1 }}>
                          <ArrowUp size={16} />
                        </button>
                        <button onClick={() => moveDown(index)} disabled={index === filteredInventory.length - 1} className="bg-transparent border-none p-0 cursor-pointer text-muted hover-text-primary d-flex align-center justify-center" style={{ opacity: index === filteredInventory.length - 1 ? 0.3 : 1 }}>
                          <ArrowDown size={16} />
                        </button>
                      </div>
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
                <select 
                  className="form-input p-12" 
                  value={formData.category} 
                  onChange={e => setFormData({ ...formData, category: e.target.value })}
                >
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
