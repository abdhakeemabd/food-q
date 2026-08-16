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
    (t?.name || `Table ${t?.number || t?.id || ''}`).toLowerCase().includes((searchQuery || '').toLowerCase()) || 
    (t?.status || '').toLowerCase().includes((searchQuery || '').toLowerCase())
  );

  return (
    <div className="glass-panel d-flex flex-col h-100 m-16 radius-lg overflow-hidden">
      {/* Header Area */}
      <div className="p-24 border-bottom d-flex flex-wrap gap-16 justify-between align-center">
        <div>
          <h2 className="page-title d-flex align-center gap-8">
            <LayoutGrid size={24} color="var(--primary-color)" /> Table Management
          </h2>
          <p className="m-0 text-muted">Manage your dining floor, check status, and take orders.</p>
        </div>
        
        <div className="d-flex align-center gap-16">
          <div className="pos-rel">
            <input 
              type="text" 
              placeholder="Search table (e.g. Table 1, Available)..." 
              className="form-input w-320 search-input" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search size={18} className="search-icon-pos text-muted" />
          </div>
          
          <button 
            className="btn btn-primary d-flex align-center gap-8 px-16 py-12" 
            style={{ borderRadius: '20px' }}
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
      <div className="p-24 overflow-y-auto flex-1">
        {filteredTables.length === 0 ? (
          <div className="text-muted p-24 text-center">No tables match your search.</div>
        ) : (
          <div className="grid-cols-auto-fill gap-20">
            {filteredTables.map(table => {
              const isAvailable = table.status === 'Available';
              const statusColor = isAvailable ? '#10b981' : '#ef4444'; // Green for available, Red for occupied
              const bgColor = isAvailable ? 'var(--bg-tertiary)' : 'rgba(239, 68, 68, 0.05)';
              const orderTotal = activeOrders[table.id] ? activeOrders[table.id].reduce((sum, item) => sum + (item.price * item.qty), 0) : 0;
              
              return (
                <div 
                  key={table.id}
                  className="d-flex flex-col radius-md overflow-hidden pos-rel shadow-sm transition-all"
                  style={{
                    backgroundColor: bgColor,
                    border: `2px solid ${isAvailable ? 'var(--border-color)' : statusColor}`,
                  }}
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
                  <div className="p-16 flex-1 d-flex flex-col gap-16">
                    <div className="d-flex justify-between align-center">
                      <div className="d-flex align-center gap-6 text-muted">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                        <span className="fs-sm fw-600">{table.capacity} Pax</span>
                      </div>
                      
                      {!isAvailable && orderTotal > 0 && (
                        <div className="fw-700 text-primary">
                          ₹{orderTotal}
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-auto pt-16 border-top d-flex gap-8">
                      {isAvailable ? (
                        <button 
                          className="btn btn-primary flex-1 p-12 d-flex justify-center align-center gap-6"
                          onClick={() => {
                            navigate('/order', { state: { tableId: table.id } });
                          }}
                        >
                          <Plus size={16} /> New Order
                        </button>
                      ) : (
                        <div className="d-flex flex-col gap-8 w-100">
                          <div className="d-flex gap-8">
                            <button 
                              className="btn btn-secondary flex-1 p-12 fs-sm"
                              onClick={() => navigate('/order', { state: { tableId: table.id } })}
                            >
                              Add Items
                            </button>
                            <button 
                              className="btn btn-primary flex-1 p-12 fs-sm"
                              onClick={() => navigate('/billing', { state: { tableId: table.id } })}
                            >
                              Settle Bill
                            </button>
                          </div>
                          <button 
                            className="btn-clear"
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
