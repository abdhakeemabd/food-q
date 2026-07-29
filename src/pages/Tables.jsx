import React, { useState } from 'react';
import { useDbStore } from '../store/dbStore';
import { useAuth } from '../store/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Search, UtensilsCrossed, Plus, LayoutGrid } from 'lucide-react';
import Swal from 'sweetalert2';

const Tables = () => {
  const tables = useDbStore(state => state.tables);
  const updateTableStatus = useDbStore(state => state.updateTableStatus);
  const activeOrders = useDbStore(state => state.activeOrders);
  const clearTableOrder = useDbStore(state => state.clearTableOrder);
  const addTable = useDbStore(state => state.addTable);
  const { currentUser } = useAuth(); // Import useAuth to get user info if needed
  const navigate = useNavigate();
  
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTables = tables.filter(t => 
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    t.status.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', height: '100%', margin: '16px', borderRadius: '16px', overflow: 'hidden' }}>
      {/* Header Area */}
      <div style={{ padding: '24px', borderBottom: '1px solid var(--border-color)', display: 'flex', flexWrap: 'wrap', gap: '16px', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <LayoutGrid size={24} color="var(--primary-color)" /> Table Management
          </h2>
          <p style={{ margin: 0, color: 'var(--text-muted)' }}>Manage your dining floor, check status, and take orders.</p>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ position: 'relative' }}>
            <input 
              type="text" 
              placeholder="Search table (e.g. Table 1, Available)..." 
              className="form-input" 
              style={{ width: '320px', padding: '10px 16px 10px 40px', borderRadius: '20px' }} 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          </div>
          
          <button 
            className="btn btn-primary" 
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', borderRadius: '20px' }}
            onClick={() => {
              Swal.fire({
                title: 'Add New Table',
                html: `
                  <input id="swal-input1" class="swal2-input" placeholder="Table Name (e.g., Table 6)">
                  <input id="swal-input2" type="number" class="swal2-input" placeholder="Capacity (e.g., 4)">
                `,
                focusConfirm: false,
                showCancelButton: true,
                confirmButtonColor: 'var(--primary-color)',
                preConfirm: () => {
                  const name = document.getElementById('swal-input1').value;
                  const capacity = document.getElementById('swal-input2').value;
                  if (!name || !capacity) {
                    Swal.showValidationMessage('Please enter both name and capacity');
                  }
                  return { name, capacity: Number(capacity) };
                }
              }).then((result) => {
                if (result.isConfirmed) {
                  addTable(result.value, currentUser);
                  Swal.fire('Added!', 'New table has been added.', 'success');
                }
              });
            }}
          >
            <Plus size={18} /> Add Table
          </button>
        </div>
      </div>

      {/* Tables Grid */}
      <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
        {filteredTables.length === 0 ? (
          <div style={{ color: 'var(--text-muted)', padding: '24px 0', textAlign: 'center' }}>No tables match your search.</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '20px' }}>
            {filteredTables.map(table => {
              const isAvailable = table.status === 'Available';
              const statusColor = isAvailable ? '#10b981' : '#ef4444'; // Green for available, Red for occupied
              const bgColor = isAvailable ? 'var(--bg-tertiary)' : 'rgba(239, 68, 68, 0.05)';
              const orderTotal = activeOrders[table.id] ? activeOrders[table.id].reduce((sum, item) => sum + (item.price * item.qty), 0) : 0;
              
              return (
                <div 
                  key={table.id}
                  style={{
                    backgroundColor: bgColor,
                    border: `2px solid ${isAvailable ? 'var(--border-color)' : statusColor}`,
                    borderRadius: '12px',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                    position: 'relative'
                  }}
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
                      {/* Chairs */}
                      <rect x="30" y="8" width="40" height="12" rx="6" fill="currentColor" opacity="0.4"/>
                      <rect x="30" y="80" width="40" height="12" rx="6" fill="currentColor" opacity="0.4"/>
                      <rect x="8" y="30" width="12" height="40" rx="6" fill="currentColor" opacity="0.4"/>
                      <rect x="80" y="30" width="12" height="40" rx="6" fill="currentColor" opacity="0.4"/>
                      {/* Table Body */}
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
                  <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)' }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                        <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{table.capacity} Pax</span>
                      </div>
                      
                      {!isAvailable && orderTotal > 0 && (
                        <div style={{ fontWeight: 700, color: 'var(--primary-color)' }}>
                          ₹{orderTotal}
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid var(--border-color)', display: 'flex', gap: '8px' }}>
                      {isAvailable ? (
                        <button 
                          className="btn btn-primary"
                          style={{ flex: 1, padding: '10px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px' }}
                          onClick={() => {
                            navigate('/order', { state: { tableId: table.id } });
                          }}
                        >
                          <Plus size={16} /> New Order
                        </button>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button 
                              className="btn btn-secondary"
                              style={{ flex: 1, padding: '10px', fontSize: '0.9rem' }}
                              onClick={() => navigate('/order', { state: { tableId: table.id } })}
                            >
                              Add Items
                            </button>
                            <button 
                              className="btn btn-primary"
                              style={{ flex: 1, padding: '10px', fontSize: '0.9rem' }}
                              onClick={() => navigate('/billing', { state: { tableId: table.id } })}
                            >
                              Settle Bill
                            </button>
                          </div>
                          <button 
                            style={{ 
                              background: 'transparent',
                              border: '1px solid var(--border-color)',
                              color: 'var(--text-main)',
                              padding: '8px 14px',
                              borderRadius: 'var(--radius-sm)',
                              fontSize: '0.85rem',
                              cursor: 'pointer',
                              transition: '0.2s',
                              width: '100%'
                            }}
                            onMouseOver={(e) => e.target.style.background = 'rgba(239, 68, 68, 0.1)'}
                            onMouseOut={(e) => e.target.style.background = 'transparent'}
                            onClick={() => {
                              Swal.fire({
                                title: 'Clear Table & Order?',
                                text: "This will cancel the active order and mark the table as Available. Proceed?",
                                icon: 'warning',
                                showCancelButton: true,
                                confirmButtonColor: '#ef4444',
                                cancelButtonColor: 'var(--text-muted)',
                                confirmButtonText: 'Yes, clear it!'
                              }).then((result) => {
                                if (result.isConfirmed) {
                                  clearTableOrder(table.id);
                                  Swal.fire('Cleared!', 'Table is now available.', 'success');
                                }
                              })
                            }}
                          >
                            Clear Table
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Tables;
