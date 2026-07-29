import React, { useState, useEffect } from 'react';
import { useDbStore } from '../store/dbStore';
import { useAuth } from '../store/AuthContext';
import { Plus, Minus, Search, UtensilsCrossed, Trash2 } from 'lucide-react';
import Swal from 'sweetalert2';
import { useLocation, useNavigate } from 'react-router-dom';

const Order = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const initialTableId = location.state?.tableId || '';
  
  const { currentUser } = useAuth();
  const tables = useDbStore(state => state.tables);
  const inventory = useDbStore(state => state.inventory);
  const activeOrders = useDbStore(state => state.activeOrders);
  const saveTableOrder = useDbStore(state => state.saveTableOrder);

  const [selectedTable, setSelectedTable] = useState(initialTableId);
  const [cart, setCart] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Load existing order if editing
  useEffect(() => {
    if (selectedTable && activeOrders[selectedTable]) {
      setCart(activeOrders[selectedTable]);
    } else {
      setCart([]);
    }
  }, [selectedTable, activeOrders]);

  const isSelectingTable = !selectedTable;

  const categories = ['All', ...new Set(inventory.map(item => item.category))];
  const filteredInventory = inventory.filter(i => {
    const matchCategory = selectedCategory === 'All' || i.category === selectedCategory;
    const matchSearch = i.itemName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  const filteredTables = tables.filter(t => 
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    t.status.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);

  // Handlers
  const increaseQty = (product) => {
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
      setCart(cart.map(item => item.id === product.id ? { ...item, qty: item.qty + 1 } : item));
    } else {
      setCart([...cart, { ...product, qty: 1 }]);
    }
  };

  const decreaseQty = (productId) => {
    const existing = cart.find(item => item.id === productId);
    if (existing) {
      if (existing.qty === 1) {
        setCart(cart.filter(item => item.id !== productId));
      } else {
        setCart(cart.map(item => item.id === productId ? { ...item, qty: item.qty - 1 } : item));
      }
    }
  };

  const getProductQty = (productId) => {
    const item = cart.find(i => i.id === productId);
    return item ? item.qty : 0;
  };

  const handleSaveKOT = () => {
    if (cart.length === 0) {
      Swal.fire('Empty Order', 'Please add items to the order first.', 'warning');
      return;
    }
    if (!selectedTable) {
      Swal.fire('Table Required', 'Please select a table to save the order.', 'warning');
      return;
    }

    saveTableOrder(selectedTable, cart, currentUser);
    
    Swal.fire({
      title: 'KOT Saved!',
      text: 'Order sent to kitchen.',
      icon: 'success',
      timer: 1500,
      showConfirmButton: false
    });
    
    navigate('/tables');
  };

  return (
    <div className="billing-layout">
      
      {/* 1. Categories Sidebar */}
      {!isSelectingTable && (
        <div className="glass-panel billing-categories">
          <h3 style={{ padding: '16px', borderBottom: '1px solid var(--border-color)', margin: 0, fontSize: '1.1rem' }}>Categories</h3>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`category-btn ${selectedCategory === cat ? 'active' : ''}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 2. Product Grid (Middle) */}
      <div className="glass-panel billing-grid">
        <div style={{ padding: '16px', borderBottom: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
           <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', justifyContent: 'space-between', alignItems: 'center' }}>
             <h3 style={{ margin: 0 }}>
               {isSelectingTable ? 'Dine In Tables' : `Menu Items (${selectedCategory})`}
             </h3>
             <div style={{ position: 'relative' }}>
               <input 
                 type="text" 
                 placeholder={isSelectingTable ? "Search table (e.g. Table 1, Available)..." : "Search item..."} 
                 className="form-input" 
                 style={{ width: '280px', padding: '10px 16px 10px 40px', borderRadius: '20px' }} 
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
               />
               <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
             </div>
           </div>
        </div>
        
        <div style={{ padding: '16px', overflowY: 'auto', flex: 1 }}>
          {isSelectingTable ? (
            <div style={{ padding: '24px' }}>
              <h2 style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <UtensilsCrossed size={24} /> Select a Table for Order
              </h2>
              {filteredTables.length === 0 ? (
                <div style={{ color: 'var(--text-muted)', padding: '24px 0' }}>No tables match your search.</div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '20px' }}>
                  {filteredTables.map(table => {
                    const isAvailable = table.status === 'Available';
                  const statusColor = isAvailable ? '#10b981' : '#ef4444'; // Green for available, Red for occupied
                  const bgColor = isAvailable ? 'var(--bg-tertiary)' : 'rgba(239, 68, 68, 0.05)';
                  
                  return (
                    <div 
                      key={table.id}
                      onClick={() => {
                        setSelectedTable(table.id);
                        setSearchQuery('');
                      }}
                      style={{
                        backgroundColor: bgColor,
                        border: `2px solid ${isAvailable ? 'var(--border-color)' : statusColor}`,
                        borderRadius: '12px',
                        overflow: 'hidden',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        transition: 'transform 0.2s, box-shadow 0.2s',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                        position: 'relative'
                      }}
                      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 10px 15px rgba(0,0,0,0.2)'; }}
                      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)'; }}
                    >
                      {/* Top icon area */}
                      <div style={{ 
                        height: '110px', 
                        backgroundColor: isAvailable ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative',
                        color: statusColor
                      }}>
                        {/* Table Vector Graphic */}
                        <svg viewBox="0 0 100 100" width="70" height="70">
                          <rect x="30" y="8" width="40" height="12" rx="6" fill="currentColor" opacity="0.4"/>
                          <rect x="30" y="80" width="40" height="12" rx="6" fill="currentColor" opacity="0.4"/>
                          <rect x="8" y="30" width="12" height="40" rx="6" fill="currentColor" opacity="0.4"/>
                          <rect x="80" y="30" width="12" height="40" rx="6" fill="currentColor" opacity="0.4"/>
                          <rect x="24" y="24" width="52" height="52" rx="12" fill="currentColor" />
                        </svg>

                        <div style={{ 
                          position: 'absolute', 
                          fontWeight: 800, 
                          fontSize: '1.1rem', 
                          color: 'white', 
                          textShadow: '0 1px 3px rgba(0,0,0,0.6)',
                          textAlign: 'center',
                          width: '100%',
                          padding: '0 8px'
                        }}>
                          {table.name}
                        </div>

                        <div style={{
                          position: 'absolute',
                          top: '10px',
                          right: '10px',
                          backgroundColor: statusColor,
                          color: 'white',
                          padding: '4px 10px',
                          borderRadius: '12px',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px'
                        }}>
                          {table.status}
                        </div>
                      </div>

                      {/* Details area */}
                      <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)' }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                            <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{table.capacity} Pax</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              )}
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '16px' }}>
              {filteredInventory.map(item => {
                const qty = getProductQty(item.id);
                return (
                  <div 
                    key={item.id} 
                    style={{ 
                      backgroundColor: 'var(--bg-tertiary)', 
                      borderRadius: 'var(--radius-md)',
                      border: qty > 0 ? '2px solid var(--primary-color)' : '2px solid var(--border-color)',
                      overflow: 'hidden',
                      display: 'flex',
                      flexDirection: 'column',
                      transition: 'var(--transition-fast)'
                    }}
                  >
                    <div style={{ height: '110px', backgroundColor: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
                      {item.img ? (
                        <img 
                          src={item.img} 
                          alt={item.itemName} 
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.parentNode.innerHTML = `<span style="font-size: 2rem;">🍲</span>`;
                          }}
                        />
                      ) : (
                        <span style={{ fontSize: '2rem' }}>🍲</span>
                      )}
                    </div>
                    
                    <div style={{ padding: '12px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.95rem', marginBottom: '4px' }}>{item.itemName}</div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '12px' }}>₹{item.price}</div>
                      </div>
                      
                      {/* +/- Controls */}
                      {qty === 0 ? (
                        <button onClick={() => increaseQty(item)} className="btn btn-primary" style={{ width: '100%', padding: '6px' }}>
                          Add
                        </button>
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'var(--bg-primary)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
                          <button onClick={() => decreaseQty(item.id)} style={{ padding: '8px', background: 'var(--primary-color)', color: 'white', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Minus size={16} /></button>
                          <span style={{ fontWeight: 600, padding: '0 12px' }}>{qty}</span>
                          <button onClick={() => increaseQty(item)} style={{ padding: '8px', background: 'var(--primary-color)', color: 'white', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Plus size={16} /></button>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* 3. Cart Pane (Right) */}
      <div className="glass-panel billing-cart">
        
        {/* Order Info */}
        <div style={{ padding: '16px', borderBottom: '1px solid var(--border-color)' }}>
          {selectedTable && (
            <div style={{ marginBottom: '12px', padding: '12px', backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-sm)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 600 }}>{tables.find(t => t.id === selectedTable)?.name}</span>
              <button onClick={() => setSelectedTable('')} className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '0.8rem' }}>Change Table</button>
            </div>
          )}
        </div>

        {/* Cart Items */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
          {cart.length === 0 ? (
            <div style={{ color: 'var(--text-muted)', textAlign: 'center', marginTop: '40px' }}>No items in KOT</div>
          ) : (
            cart.map((item, index) => (
              <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid var(--border-color)' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 500, fontSize: '0.9rem' }}>{item.itemName}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>₹{item.price} x {item.qty}</div>
                </div>
                <div style={{ fontWeight: 600, marginRight: '12px' }}>₹{item.price * item.qty}</div>
                <button 
                  onClick={() => setCart(cart.filter(i => i.id !== item.id))} 
                  style={{ background: 'transparent', border: 'none', color: '#e23744', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  title="Remove Item"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Total & Checkout */}
        <div style={{ padding: '16px', borderTop: '1px solid var(--border-color)', backgroundColor: 'rgba(0,0,0,0.2)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', fontSize: '1.4rem', fontWeight: 700 }}>
            <span>KOT Total:</span>
            <span style={{ color: 'var(--primary-color)' }}>₹{cartTotal}</span>
          </div>
          
          <button 
            onClick={handleSaveKOT} 
            className="btn btn-primary" 
            style={{ width: '100%', padding: '16px', fontSize: '1.1rem', borderRadius: 'var(--radius-md)', opacity: (cart.length === 0 || !selectedTable) ? 0.5 : 1 }}
            disabled={cart.length === 0 || !selectedTable}
          >
            Save KOT
          </button>
        </div>

      </div>
    </div>
  );
};

export default Order;
