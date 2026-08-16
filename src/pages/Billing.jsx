import React, { useState, useMemo } from 'react';
import { useDbStore } from '../store/dbStore';
import { useAuth } from '../store/AuthContext';
import { Plus, Minus, Search, UtensilsCrossed, Trash2 } from 'lucide-react';
import Swal from 'sweetalert2';
import { wrap } from 'idb';
import { useLocation } from 'react-router-dom';

const Billing = () => {
  const location = useLocation();
  const initialTableId = location.state?.tableId || '';
  const { currentUser } = useAuth();
  const tables = useDbStore(state => state.tables);
  const inventory = useDbStore(state => state.inventory);
  const updateTableStatus = useDbStore(state => state.updateTableStatus);
  const addBill = useDbStore(state => state.addBill);
  const activeOrders = useDbStore(state => state.activeOrders);

  // Force all existing tables to 4 seats immediately on load
  React.useEffect(() => {
    useDbStore.setState(state => ({
      tables: state.tables.map(t => ({ ...t, capacity: 4 }))
    }));
  }, []);

  const [orderType, setOrderType] = useState('Dine In');
  const [selectedTable, setSelectedTable] = useState(initialTableId);
  const [customerPhone, setCustomerPhone] = useState('');
  const [cart, setCart] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');



  React.useEffect(() => {
    if (orderType === 'Dine In' && selectedTable && activeOrders[selectedTable]) {
      setCart(activeOrders[selectedTable]);
    } else if (orderType !== 'Dine In') {
      setCart([]);
    }
  }, [selectedTable, orderType, activeOrders]);

  // Derived state
  const isSelectingTable = orderType === 'Dine In' && !selectedTable;

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

  const handleGenerateBill = () => {
    if (cart.length === 0) {
      Swal.fire('Empty Cart', 'Please add items to the cart first.', 'warning');
      return;
    }
    if (orderType === 'Dine In' && !selectedTable) {
      Swal.fire('Table Required', 'Please select a table for Dine In orders.', 'warning');
      return;
    }

    const billData = {
      orderType,
      tableId: orderType === 'Dine In' ? selectedTable : null,
      customerPhone,
      items: cart,
      totalAmount: cartTotal,
      paymentMethod,
      // If payment is UPI, we can log it explicitly
      paymentDetails: paymentMethod === 'UPI' ? 'UPI Payment Logged' : 'Standard Payment'
    };

    addBill(billData, currentUser);
    
    setCart([]);
    setSelectedTable('');
    setCustomerPhone('');
    setSearchQuery('');
    Swal.fire({
      title: 'Success!',
      text: 'Bill generated successfully!',
      icon: 'success',
      timer: 2000,
      showConfirmButton: false
    });
  };

  return (
    <div className="billing-layout">
      
      {/* 1. Categories Sidebar */}
      {!isSelectingTable && (
        <div className="glass-panel billing-categories">
          <h3 className="p-16 border-bottom m-0 fs-lg">Categories</h3>
          <div className="d-flex flex-col">
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
        <div className="p-16 border-bottom d-flex flex-col gap-16">
           {/* Petpooja style order type tabs */}
           <div className="d-flex gap-8">
             {['Dine In', 'Parcel', 'Swiggy'].map(type => (
               <button 
                 key={type}
                 onClick={() => {
                   setOrderType(type);
                   setSearchQuery('');
                   if (type !== 'Dine In') setSelectedTable('');
                 }}
                 className={`btn ${orderType === type ? 'btn-primary' : 'btn-secondary'} flex-1 p-12 radius-md fw-600`}
               >
                 {type}
               </button>
             ))}
           </div>
           
           <div className="d-flex flex-wrap gap-16 justify-between align-center">
             <h3 className="m-0">
               {isSelectingTable ? 'Dine In Tables' : `Menu Items (${selectedCategory})`}
             </h3>
             <div className="pos-rel">
               <input 
                 type="text" 
                 placeholder={isSelectingTable ? "Search table (e.g. Table 1, Available)..." : "Search item..."} 
                 className="form-input search-input" 
                 style={{ width: '280px' }} 
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
               />
               <Search size={18} className="search-icon-pos text-muted" />
             </div>
           </div>
        </div>
        
        <div className="p-16 overflow-y-auto flex-1">
          {isSelectingTable ? (
            <div className="p-24">
              <h2 className="mb-24 d-flex align-center gap-8">
                <UtensilsCrossed size={24} /> Select a Table
              </h2>
              {filteredTables.length === 0 ? (
                <div className="text-muted py-24 text-center">No tables match your search.</div>
              ) : (
                <div className="grid-cols-auto-fill gap-20">
                  {filteredTables.map(table => {
                    const isAvailable = table.status === 'Available';
                  const statusColor = isAvailable ? '#10b981' : '#ef4444'; // Green for available, Red for occupied
                  const bgColor = isAvailable ? 'var(--bg-tertiary)' : 'rgba(239, 68, 68, 0.05)';
                  
                  return (
                    <div 
                      key={table.id}
                      onClick={() => {
                        setSelectedTable(table.id);
                        if(isAvailable) updateTableStatus(table.id, 'Occupied');
                      }}
                      className="d-flex flex-col radius-md overflow-hidden pos-rel shadow-sm transition-all cursor-pointer"
                      style={{
                        backgroundColor: bgColor,
                        border: `2px solid ${isAvailable ? 'var(--border-color)' : statusColor}`,
                      }}
                      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 10px 15px rgba(0,0,0,0.2)'; }}
                      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)'; }}
                    >
                      {/* Top icon area */}
                      <div 
                        className="d-flex align-center justify-center pos-rel"
                        style={{ 
                          height: '110px', 
                          backgroundColor: isAvailable ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                          color: statusColor
                        }}
                      >
                        {/* Table Vector Graphic */}
                        <svg viewBox="0 0 100 100" width="70" height="70">
                          {/* Chairs */}
                          <rect x="30" y="8" width="40" height="12" rx="6" fill="currentColor" opacity="0.4"/>
                          <rect x="30" y="80" width="40" height="12" rx="6" fill="currentColor" opacity="0.4"/>
                          <rect x="8" y="30" width="12" height="40" rx="6" fill="currentColor" opacity="0.4"/>
                          <rect x="80" y="30" width="12" height="40" rx="6" fill="currentColor" opacity="0.4"/>
                          {/* Table Body */}
                          <rect x="24" y="24" width="52" height="52" rx="12" fill="currentColor" />
                        </svg>

                        <div 
                          className="pos-abs w-100 text-center text-white fw-700 px-8"
                          style={{ 
                            fontSize: '1.1rem', 
                            textShadow: '0 1px 3px rgba(0,0,0,0.6)'
                          }}
                        >
                          {table.name || `Table ${table.number}`}
                        </div>

                        <div 
                          className="pos-abs text-white px-12 py-4 radius-sm fw-700 text-uppercase"
                          style={{
                            top: '10px',
                            right: '10px',
                            backgroundColor: statusColor,
                            fontSize: '0.75rem',
                            letterSpacing: '0.5px'
                          }}
                        >
                          {table.status}
                        </div>
                      </div>

                      {/* Details area */}
                      <div className="p-16 flex-1 d-flex flex-col gap-12">
                        <div className="d-flex justify-between align-center">
                          <div className="d-flex align-center gap-6 text-muted">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                            <span className="fs-sm fw-600">{table.capacity} Pax</span>
                          </div>
                          
                          <div className="d-flex align-center gap-4 text-muted">
                            <UtensilsCrossed size={14} />
                            <span style={{ fontSize: '0.85rem' }}>Dine In</span>
                          </div>
                        </div>

                        {!isAvailable && (
                          <div className="mt-auto pt-12 d-flex justify-between align-center" style={{ borderTop: '1px dashed var(--border-color)' }}>
                            <div className="text-danger fw-600" style={{ fontSize: '0.8rem' }}>In Use</div>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                updateTableStatus(table.id, 'Available');
                              }}
                              className="bg-transparent border-none text-main px-12 py-6 radius-sm cursor-pointer transition-all"
                              style={{ 
                                border: '1px solid var(--border-color)',
                                fontSize: '0.8rem'
                              }}
                              onMouseOver={(e) => e.target.style.background = 'var(--bg-tertiary)'}
                              onMouseOut={(e) => e.target.style.background = 'transparent'}
                            >
                              Clear Table
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              )}
            </div>
          ) : (
            <div className="grid-cols-auto-fill gap-16">
              {filteredInventory.map(item => {
                const qty = getProductQty(item.id);
                return (
                  <div 
                    key={item.id} 
                    className="bg-tertiary radius-md overflow-hidden d-flex flex-col transition-all pos-rel"
                    style={{ 
                      border: qty > 0 ? '2px solid var(--primary-color)' : '2px solid var(--border-color)',
                      boxShadow: qty > 0 ? '0 4px 14px rgba(226, 55, 68, 0.25)' : 'none',
                      userSelect: 'none'
                    }}
                  >
                    {/* Image Container */}
                    <div className="d-flex align-center justify-center pos-rel overflow-hidden" style={{ height: '110px', backgroundColor: 'rgba(255,255,255,0.05)' }}>
                      {item.img ? (
                        <img 
                          src={item.img} 
                          alt={item.itemName} 
                          className="w-100 h-100"
                          style={{ objectFit: 'cover' }}
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.parentNode.innerHTML = `<span style="font-size: 2rem;">🍲</span>`;
                          }}
                        />
                      ) : (
                        <span className="fs-2xl">🍲</span>
                      )}
                      
                      {qty > 0 && (
                        <div 
                          className="pos-abs px-8 py-2 radius-sm fw-700 fs-xs text-white" 
                          style={{ top: '8px', right: '8px', background: 'var(--primary-color)', boxShadow: '0 2px 8px rgba(0,0,0,0.5)' }}
                        >
                          {qty} in cart
                        </div>
                      )}
                    </div>
                    
                    <div className="p-12 flex-1 d-flex flex-col justify-between">
                      <div>
                        <div className="fw-600 mb-4" style={{ fontSize: '0.95rem', color: '#ffffff', wordBreak: 'break-word' }}>{item.itemName}</div>
                        <div className="fw-500 mb-12 fs-sm" style={{ color: '#94a3b8' }}>₹{Number(item.price).toFixed(2)}</div>
                      </div>
                      
                      {/* Redesigned +/- Controls */}
                      {qty === 0 ? (
                        <button 
                          type="button"
                          onClick={() => increaseQty(item)} 
                          className="btn btn-primary w-100 p-8 fw-600 d-flex align-center justify-center gap-6"
                          style={{ borderRadius: '10px' }}
                        >
                          <Plus size={16} /> Add
                        </button>
                      ) : (
                        <div 
                          className="d-flex align-center justify-between w-100 p-4 radius-md" 
                          style={{ 
                            background: 'rgba(226, 55, 68, 0.15)', 
                            border: '1px solid rgba(226, 55, 68, 0.5)',
                            borderRadius: '10px'
                          }}
                        >
                          <button 
                            type="button"
                            onClick={() => decreaseQty(item.id)} 
                            className="d-flex align-center justify-center border-none text-white cursor-pointer radius-sm transition-all"
                            style={{ width: '32px', height: '32px', background: '#e23744', borderRadius: '8px', boxShadow: '0 2px 6px rgba(226, 55, 68, 0.4)' }}
                            title="Decrease Quantity"
                          >
                            <Minus size={16} />
                          </button>
                          
                          <span className="fw-700 fs-md px-8" style={{ color: '#ffffff', minWidth: '32px', textAlign: 'center' }}>
                            {qty}
                          </span>
                          
                          <button 
                            type="button"
                            onClick={() => increaseQty(item)} 
                            className="d-flex align-center justify-center border-none text-white cursor-pointer radius-sm transition-all"
                            style={{ width: '32px', height: '32px', background: '#e23744', borderRadius: '8px', boxShadow: '0 2px 6px rgba(226, 55, 68, 0.4)' }}
                            title="Increase Quantity"
                          >
                            <Plus size={16} />
                          </button>
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
        <div className="p-16 border-bottom">
          {orderType === 'Dine In' && selectedTable && (
            <div className="mb-12 p-12 bg-tertiary radius-sm d-flex justify-between align-center">
              <span className="fw-600">{tables.find(t => t.id === selectedTable)?.name}</span>
              <button onClick={() => setSelectedTable('')} className="btn btn-secondary p-4 fs-sm">Change Table</button>
            </div>
          )}
          {orderType !== 'Dine In' && (
            <div className="mb-12 p-12 bg-tertiary radius-sm">
              <span className="fw-600">{orderType} Order</span>
            </div>
          )}
          <input type="text" className="form-input p-8 w-100" placeholder="Customer Phone (Optional)" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} />
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-16">
          {cart.length === 0 ? (
            <div className="text-muted text-center" style={{ marginTop: '40px' }}>Cart is empty</div>
          ) : (
            cart.map((item, index) => (
              <div key={index} className="d-flex justify-between align-center py-12 border-bottom">
                <div className="flex-1">
                  <div className="fw-500 fs-sm">{item.itemName}</div>
                  <div className="fs-sm text-muted">₹{item.price} x {item.qty}</div>
                </div>
                <div className="fw-600 mr-12">₹{item.price * item.qty}</div>
                <button 
                  onClick={() => setCart(cart.filter(i => i.id !== item.id))} 
                  className="bg-transparent border-none text-danger cursor-pointer p-4 d-flex align-center justify-center"
                  title="Remove Item"
                >
                  <Trash2 size={16} />
                </button>

              </div>
            ))
          )}
        </div>

        {/* Total & Checkout */}
        <div className="p-16 border-top" style={{ backgroundColor: 'rgba(0,0,0,0.2)' }}>
          <div className="d-flex justify-between mb-16 fs-xl fw-700">
            <span>Total:</span>
            <span className="text-primary">₹{cartTotal}</span>
          </div>
          
          <div className="grid-cols-2 gap-8 mb-16">
            {['Cash', 'UPI'].map(method => (
              <button 
                key={method}
                onClick={() => setPaymentMethod(method)}
                className="py-12 radius-sm cursor-pointer fw-600 transition-all border-solid"
                style={{ 
                  backgroundColor: paymentMethod === method ? 'var(--primary-color)' : 'transparent',
                  borderColor: paymentMethod === method ? 'var(--primary-color)' : 'var(--border-color)',
                  color: paymentMethod === method ? 'white' : 'var(--text-muted)'
                }}
              >
                {method}
              </button>
            ))}
          </div>

          <button 
            onClick={handleGenerateBill} 
            className="btn btn-primary w-100 p-16 fs-lg radius-md" 
            style={{ opacity: (cart.length === 0 || (orderType === 'Dine In' && !selectedTable)) ? 0.5 : 1 }}
            disabled={cart.length === 0 || (orderType === 'Dine In' && !selectedTable)}
          >
            Generate Bill
          </button>
        </div>

      </div>
    </div>
  );
};

export default Billing;
