import { create } from 'zustand';
import { API_URL } from '../config';

// Helper to generate IDs for local-only state items
const generateId = () => Math.random().toString(36).substr(2, 9);

const getAuthHeaders = () => {
  const token = localStorage.getItem('access_token');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

export const useDbStore = create((set, get) => ({
  // Backend Supported Collections
  customers: [],
  bills: [],
  inventory: [],
  tables: [],
  categories: [],
  dailyExpenses: [],
  dailyTrackers: [],
  
  // Local-only Collections
  purchases: [],
  expenses: [],
  income: [],
  employees: [],
  salaryRecords: [],
  auditLogs: [],
  activeOrders: {},

  // Fetch all core data from Node/Django backend
  fetchAllData: async () => {
    try {
      const opts = { headers: getAuthHeaders() };
      const [invRes, tablesRes, customersRes, categoriesRes, billsRes, expRes, trackRes] = await Promise.all([
        fetch(`${API_URL}/api/inventory/`, opts).catch(() => ({ ok: false, json: () => [] })),
        fetch(`${API_URL}/api/tables/`, opts).catch(() => ({ ok: false, json: () => [] })),
        fetch(`${API_URL}/api/customers/`, opts).catch(() => ({ ok: false, json: () => [] })),
        fetch(`${API_URL}/api/categories/`, opts).catch(() => ({ ok: false, json: () => [] })),
        fetch(`${API_URL}/api/bills/`, opts).catch(() => ({ ok: false, json: () => [] })),
        fetch(`${API_URL}/api/daily-expenses/`, opts).catch(() => ({ ok: false, json: () => [] })),
        fetch(`${API_URL}/api/daily-trackers/`, opts).catch(() => ({ ok: false, json: () => [] }))
      ]);

      const inventoryRaw = invRes.ok ? await invRes.json() : [];
      const inventory = Array.isArray(inventoryRaw) ? inventoryRaw.map(i => ({
        ...i,
        itemName: i.name || i.itemName || '',
        quantity: i.stock !== undefined ? i.stock : (i.quantity || 0),
        status: i.is_available !== false ? 'Active' : 'Archived',
        img: i.img || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=300&q=80',
      })) : [];

      const tablesRaw = tablesRes.ok ? await tablesRes.json() : [];
      const tables = Array.isArray(tablesRaw) ? tablesRaw.map(t => ({
        ...t,
        name: t.name || `Table ${t.number}`,
        tableNumber: String(t.number || t.tableNumber || ''),
        status: t.status ? t.status.charAt(0).toUpperCase() + t.status.slice(1) : 'Available'
      })) : [];

      const customers = customersRes.ok ? await customersRes.json() : [];
      const categories = categoriesRes.ok ? await categoriesRes.json() : [];

      const billsRaw = billsRes.ok ? await billsRes.json() : [];
      const bills = Array.isArray(billsRaw) ? billsRaw.map(b => ({
        ...b,
        total: b.amount_paid || b.total || 0,
        status: b.status || 'Paid',
        date: b.created_at || b.date,
        orderType: b.orderType || 'Dine In'
      })) : [];

      const dailyExpensesRaw = expRes.ok ? await expRes.json() : [];
      const dailyExpenses = Array.isArray(dailyExpensesRaw) ? dailyExpensesRaw : [];
      
      const dailyTrackersRaw = trackRes.ok ? await trackRes.json() : [];
      const dailyTrackers = Array.isArray(dailyTrackersRaw) ? dailyTrackersRaw : [];

      set({ 
        inventory, 
        tables, 
        customers: Array.isArray(customers) ? customers : [],
        categories: Array.isArray(categories) ? categories : [],
        bills,
        dailyExpenses,
        dailyTrackers
      });
    } catch (err) {
      console.error("Failed to fetch data from API", err);
    }
  },

  // Add a record
  addRecord: async (collection, data, user) => {
    let savedRecord = { ...data, id: generateId() }; 
    const backendModels = ['inventory', 'tables', 'customers', 'categories', 'daily-expenses', 'daily-trackers'];
    
    if (backendModels.includes(collection)) {
      let payload = { ...data };
      if (collection === 'inventory') {
        payload.name = data.itemName;
        payload.stock = data.quantity;
      }
      try {
        const res = await fetch(`${API_URL}/api/${collection}/`, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          savedRecord = await res.json();
        } else {
          console.error("Failed to save to backend:", await res.text());
        }
      } catch (e) { console.error('API Error:', e); }
    } else {
       // Local only models get mock timestamps
       savedRecord.status = 'Active';
       savedRecord.createdBy = user?.name || 'System';
       savedRecord.createdDate = new Date().toISOString();
    }

    const log = {
      id: generateId(),
      action: `ADD_${collection.toUpperCase()}`,
      details: `Added new ${collection} record`,
      user: user?.name || 'System',
      timestamp: new Date().toISOString()
    };

    const stateKey = collection === 'daily-expenses' ? 'dailyExpenses' : (collection === 'daily-trackers' ? 'dailyTrackers' : collection);

    set((state) => ({
      [stateKey]: [...state[stateKey], savedRecord],
      auditLogs: [...state.auditLogs, log]
    }));
  },

  // Update a record
  updateRecord: async (collection, id, data, user) => {
    const backendModels = ['inventory', 'tables', 'customers', 'categories', 'daily-expenses', 'daily-trackers'];
    
    if (backendModels.includes(collection)) {
      let payload = { ...data };
      if (collection === 'inventory') {
        if (data.itemName !== undefined) payload.name = data.itemName;
        if (data.quantity !== undefined) payload.stock = data.quantity;
      }
      try {
        await fetch(`${API_URL}/api/${collection}/${id}/`, {
          method: 'PATCH',
          headers: getAuthHeaders(),
          body: JSON.stringify(payload)
        });
      } catch (e) { console.error('API Error:', e); }
    }

    const log = {
      id: generateId(),
      action: `EDIT_${collection.toUpperCase()}`,
      details: `Edited ${collection} record ID: ${id}`,
      user: user?.name || 'System',
      timestamp: new Date().toISOString()
    };

    const stateKey = collection === 'daily-expenses' ? 'dailyExpenses' : (collection === 'daily-trackers' ? 'dailyTrackers' : collection);

    set((state) => ({
      [stateKey]: state[stateKey].map(record => 
        record.id === id ? { ...record, ...data, lastUpdatedBy: user?.name, lastUpdatedDate: new Date().toISOString() } : record
      ),
      auditLogs: [...state.auditLogs, log]
    }));
  },

  // Soft Delete a record (Move to Archive)
  deleteRecord: async (collection, id, user) => {
    const backendModels = ['inventory', 'tables', 'customers', 'categories', 'daily-expenses', 'daily-trackers'];
    
    if (backendModels.includes(collection)) {
      try {
        await fetch(`${API_URL}/api/${collection}/${id}/`, {
          method: 'DELETE',
          headers: getAuthHeaders()
        });
      } catch (e) { console.error('API Error:', e); }
    }

    const log = {
      id: generateId(),
      action: `DELETE_${collection.toUpperCase()}`,
      details: `Deleted ${collection} record ID: ${id}`,
      user: user?.name || 'System',
      timestamp: new Date().toISOString()
    };

    const stateKey = collection === 'daily-expenses' ? 'dailyExpenses' : (collection === 'daily-trackers' ? 'dailyTrackers' : collection);

    set((state) => ({
      [stateKey]: state[stateKey].filter(record => record.id !== id),
      auditLogs: [...state.auditLogs, log]
    }));
  },

  restoreRecord: (collection, id, user) => set((state) => {
    const updatedCollection = state[collection].map(record => 
      record.id === id ? { ...record, status: 'Active' } : record
    );

    const log = {
      id: generateId(),
      action: `RESTORE_${collection.toUpperCase()}`,
      details: `Restored ${collection} record ID: ${id}`,
      user: user?.name || 'System',
      timestamp: new Date().toISOString()
    };

    return {
      [collection]: updatedCollection,
      auditLogs: [...state.auditLogs, log]
    };
  }),

  // Bills
  addBill: async (billData, user) => {
    let savedBill = {
      ...billData,
      id: generateId(),
      status: 'Active',
      createdBy: user?.name || 'System',
      createdDate: new Date().toISOString(),
    };

    try {
      const res = await fetch(`${API_URL}/api/bills/`, {
         method: 'POST',
         headers: getAuthHeaders(),
         body: JSON.stringify(billData)
      });
      if (res.ok) {
        savedBill = await res.json();
      }
    } catch(e) { console.error(e) }

    set((state) => {
      const log = {
        id: generateId(),
        action: 'ADD_BILL',
        details: `Generated bill for ${billData.orderType}`,
        user: user?.name || 'System',
        timestamp: new Date().toISOString()
      };

      let updatedTables = state.tables;
      let updatedOrders = { ...state.activeOrders };
      if (billData.orderType === 'Dine In' && billData.tableId) {
          updatedTables = state.tables.map(t => t.id === billData.tableId ? { ...t, status: 'Available' } : t);
          delete updatedOrders[billData.tableId];
          
          fetch(`${API_URL}/api/tables/${billData.tableId}/`, {
             method: 'PATCH',
             headers: getAuthHeaders(),
             body: JSON.stringify({status: 'available'})
          }).catch(console.error);
      }

      return {
        bills: [...state.bills, savedBill],
        tables: updatedTables,
        activeOrders: updatedOrders,
        auditLogs: [...state.auditLogs, log]
      };
    });
  },

  // --- Specific Actions ---

  // Orders
  saveTableOrder: (tableId, cartItems, user) => set((state) => {
    const log = {
      id: generateId(),
      action: 'SAVE_ORDER',
      details: `Saved KOT for table ${tableId}`,
      user: user?.name || 'System',
      timestamp: new Date().toISOString()
    };
    
    fetch(`${API_URL}/api/tables/${tableId}/`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({status: 'occupied'})
    }).catch(console.error);

    return {
      activeOrders: { ...state.activeOrders, [tableId]: cartItems },
      tables: state.tables.map(t => t.id === tableId ? { ...t, status: 'Occupied' } : t),
      auditLogs: [...state.auditLogs, log]
    };
  }),

  clearTableOrder: (tableId) => set((state) => {
    const newOrders = { ...state.activeOrders };
    delete newOrders[tableId];
    
    fetch(`${API_URL}/api/tables/${tableId}/`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({status: 'available'})
    }).catch(console.error);

    return {
      activeOrders: newOrders,
      tables: state.tables.map(t => t.id === tableId ? { ...t, status: 'Available' } : t)
    };
  }),

  // Tables
  addTable: async (tableData, user) => {
    let newTable = {
      ...tableData,
      id: generateId(),
      status: 'Available',
    };
    
    let payload = {
      number: tableData.tableNumber || Math.floor(Math.random() * 100) + 1,
      capacity: tableData.capacity || 4,
      status: 'available'
    };

    try {
      const res = await fetch(`${API_URL}/api/tables/`, {
         method: 'POST',
         headers: getAuthHeaders(),
         body: JSON.stringify(payload)
      });
      if (res.ok) {
         newTable = await res.json();
      }
    } catch(e) { console.error(e) }

    set((state) => {
      const log = {
        id: generateId(),
        action: 'ADD_TABLE',
        details: `Added new table: ${tableData.name}`,
        user: user?.name || 'System',
        timestamp: new Date().toISOString()
      };
      return {
        tables: [...state.tables, newTable],
        auditLogs: [...state.auditLogs, log]
      };
    });
  },

  updateTableStatus: async (tableId, status) => {
    try {
      await fetch(`${API_URL}/api/tables/${tableId}/`, {
         method: 'PATCH',
         headers: getAuthHeaders(),
         body: JSON.stringify({status: status.toLowerCase()})
      });
    } catch(e) { console.error(e) }

    set((state) => ({
      tables: state.tables.map(t => t.id === tableId ? { ...t, status } : t)
    }));
  },

  // Purchases
  addPurchase: (data, user) => set((state) => {
    const purchase = {
      ...data,
      id: generateId(),
      status: 'Active',
      createdBy: user?.name || 'System',
      createdDate: new Date().toISOString()
    };
    
    const existingInv = state.inventory.find(i => i.name === data.itemName || i.itemName === data.itemName);
    let newInventory = [...state.inventory];
    
    if (existingInv) {
      newInventory = newInventory.map(i => 
        i.id === existingInv.id ? { ...i, stock: (i.stock || i.quantity || 0) + Number(data.quantity) } : i
      );
      fetch(`${API_URL}/api/inventory/${existingInv.id}/`, {
          method: 'PATCH',
          headers: getAuthHeaders(),
          body: JSON.stringify({stock: (existingInv.stock || existingInv.quantity || 0) + Number(data.quantity)})
      }).catch(console.error);
    } else {
      newInventory.push({
        id: generateId(),
        itemName: data.itemName,
        category: data.category,
        quantity: Number(data.quantity),
        unit: data.unit,
        status: 'Active'
      });
    }

    const log = {
      id: generateId(),
      action: `ADD_PURCHASE`,
      details: `Added purchase for ${data.itemName}`,
      user: user?.name || 'System',
      timestamp: new Date().toISOString()
    };

    return {
      purchases: [...state.purchases, purchase],
      inventory: newInventory,
      auditLogs: [...state.auditLogs, log]
    };
  })
}));
