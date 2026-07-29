import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Helper to generate IDs
const generateId = () => Math.random().toString(36).substr(2, 9);

// Base API URL for backend calls. Falls back to local SQLite backend if env var is not set.
const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:5000' : 'https://foood-q-backend.onrender.com');

export const useDbStore = create(
  persist(
    (set, get) => ({
      // Collections
      customers: [],
      bills: [],
      inventory: [
        { id: 'p1', itemName: 'Masala Shawaya', category: 'Chicken', quantity: 100, price: 120, status: 'Active', img: 'https://images.unsplash.com/photo-1598514982205-f36b96d1e8d4?auto=format&fit=crop&w=300&q=80' },
        { id: 'p2', itemName: 'Romali', category: 'Breads', quantity: 200, price: 15, status: 'Active', img: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=300&q=80' },
        { id: 'p3', itemName: 'Kuboos', category: 'Breads', quantity: 200, price: 10, status: 'Active', img: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=300&q=80' },
        { id: 'p4', itemName: 'Water 500ml', category: 'Beverages', quantity: 100, price: 10, status: 'Active', img: 'https://images.unsplash.com/photo-1523362628745-0c100150b504?auto=format&fit=crop&w=300&q=80' },
        { id: 'p5', itemName: 'Water 1 Lt', category: 'Beverages', quantity: 100, price: 20, status: 'Active', img: 'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?auto=format&fit=crop&w=300&q=80' },
        { id: 'p6', itemName: 'Pepsi 500ml', category: 'Beverages', quantity: 100, price: 20, status: 'Active', img: '/images/pepsi.png' },
        { id: 'p7', itemName: 'Pepsi 1 Lt', category: 'Beverages', quantity: 100, price: 40, status: 'Active', img: '/images/pepsi.png' },
        { id: 'p8', itemName: '7 Up 500ml', category: 'Beverages', quantity: 100, price: 20, status: 'Active', img: '/images/7up.png' },
        { id: 'p9', itemName: '7 Up 1 Lt', category: 'Beverages', quantity: 100, price: 40, status: 'Active', img: '/images/7up.png' },
        { id: 'p10', itemName: 'Mandi Quarter', category: 'Main Course', quantity: 50, price: 75, status: 'Active', img: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=300&q=80' },
        { id: 'p11', itemName: 'Combo: Shawaya + Kuboos', category: 'Combos', quantity: 50, price: 480, status: 'Active', img: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=300&q=80' },
        { id: 'p12', itemName: 'Combo: Shawaya + Romali', category: 'Combos', quantity: 50, price: 500, status: 'Active', img: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=300&q=80' },
        { id: 'p13', itemName: 'Tea', category: 'Hot Drinks', quantity: 100, price: 15, status: 'Active', img: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=300&q=80' },
        { id: 'p14', itemName: 'Mint Lime', category: 'Beverages', quantity: 50, price: 35, status: 'Active', img: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=300&q=80' },
        { id: 'p15', itemName: 'Fresh Lime', category: 'Beverages', quantity: 50, price: 25, status: 'Active', img: 'https://images.unsplash.com/photo-1523688881242-cb729dbdb825?auto=format&fit=crop&w=300&q=80' },
      ],
      purchases: [],
      expenses: [],
      income: [],
      tables: [
        { id: 't1', tableNumber: '1', name: 'Table 1', capacity: 4, status: 'Available' },
        { id: 't2', tableNumber: '2', name: 'Table 2', capacity: 4, status: 'Available' },
        { id: 't3', tableNumber: '3', name: 'Table 3', capacity: 4, status: 'Available' },
        { id: 'tf', tableNumber: '4', name: 'Family Table', capacity: 4, status: 'Available' },
        { id: 'to', tableNumber: '5', name: 'Outdoor Table', capacity: 4, status: 'Available' },
      ],
      employees: [],
      salaryRecords: [],
      auditLogs: [],
      activeOrders: {},

      // --- Generics for Data Protection (Soft Delete & Audit) ---
      
      // Fetch inventory from Node backend
      fetchInventory: async () => {
        try {
          const res = await fetch(`${API_URL}/api/inventory`);
          const data = await res.json();
          // Backend createdAt vs frontend createdDate mapping is fine, we just replace local state
          set({ inventory: data });
        } catch (err) {
          console.error("Failed to fetch inventory from API", err);
        }
      },

      // Add a record
      addRecord: async (collection, data, user) => {
        const newRecord = {
          ...data,
          id: generateId(),
          status: 'Active', // For soft delete
          createdBy: user?.name || 'System',
          createdDate: new Date().toISOString(),
          lastUpdatedBy: user?.name || 'System',
          lastUpdatedDate: new Date().toISOString(),
        };

        if (collection === 'inventory') {
          try {
            await fetch(`${API_URL}/api/inventory`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ ...newRecord, createdAt: newRecord.createdDate })
            });
          } catch (e) { console.error('API Error:', e); }
        }

        const log = {
          id: generateId(),
          action: `ADD_${collection.toUpperCase()}`,
          details: `Added new ${collection} record`,
          user: user?.name || 'System',
          timestamp: new Date().toISOString()
        };

        set((state) => ({
          [collection]: [...state[collection], newRecord],
          auditLogs: [...state.auditLogs, log]
        }));
      },

      // Update a record
      updateRecord: async (collection, id, data, user) => {
        if (collection === 'inventory') {
          try {
            await fetch(`${API_URL}/api/inventory/${id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(data)
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

        set((state) => ({
          [collection]: state[collection].map(record => 
            record.id === id 
              ? { ...record, ...data, lastUpdatedBy: user?.name, lastUpdatedDate: new Date().toISOString() } 
              : record
          ),
          auditLogs: [...state.auditLogs, log]
        }));
      },

      // Soft Delete a record (Move to Archive)
      deleteRecord: async (collection, id, user) => {
        if (collection === 'inventory') {
          try {
            // Soft delete via PUT
            await fetch(`${API_URL}/api/inventory/${id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ status: 'Archived' })
            });
          } catch (e) { console.error('API Error:', e); }
        }

        const log = {
          id: generateId(),
          action: `DELETE_${collection.toUpperCase()}`,
          details: `Archived ${collection} record ID: ${id}`,
          user: user?.name || 'System',
          timestamp: new Date().toISOString()
        };

        set((state) => ({
          [collection]: state[collection].map(record => 
            record.id === id 
              ? { ...record, status: 'Archived', lastUpdatedBy: user?.name, lastUpdatedDate: new Date().toISOString() } 
              : record
          ),
          auditLogs: [...state.auditLogs, log]
        }));
      },

      // Restore Soft Deleted record (Admin only in UI)
      restoreRecord: (collection, id, user) => set((state) => {
        const updatedCollection = state[collection].map(record => 
          record.id === id 
            ? { ...record, status: 'Active', lastUpdatedBy: user?.name, lastUpdatedDate: new Date().toISOString() } 
            : record
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
      addBill: (billData, user) => set((state) => {
        const newBill = {
          ...billData,
          id: generateId(),
          status: 'Active',
          createdBy: user?.name || 'System',
          createdDate: new Date().toISOString(),
        };

        const log = {
          id: generateId(),
          action: 'ADD_BILL',
          details: `Generated bill for ${billData.orderType}`,
          user: user?.name || 'System',
          timestamp: new Date().toISOString()
        };

        // If Dine In, mark table as Available after bill is paid and clear order
        let updatedTables = state.tables;
        let updatedOrders = { ...state.activeOrders };
        if (billData.orderType === 'Dine In' && billData.tableId) {
            updatedTables = state.tables.map(t => t.id === billData.tableId ? { ...t, status: 'Available' } : t);
            delete updatedOrders[billData.tableId];
        }

        return {
          bills: [...state.bills, newBill],
          tables: updatedTables,
          activeOrders: updatedOrders,
          auditLogs: [...state.auditLogs, log]
        };
      }),

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
        
        return {
          activeOrders: { ...state.activeOrders, [tableId]: cartItems },
          tables: state.tables.map(t => t.id === tableId ? { ...t, status: 'Occupied' } : t),
          auditLogs: [...state.auditLogs, log]
        };
      }),

      clearTableOrder: (tableId) => set((state) => {
        const newOrders = { ...state.activeOrders };
        delete newOrders[tableId];
        return {
          activeOrders: newOrders,
          tables: state.tables.map(t => t.id === tableId ? { ...t, status: 'Available' } : t)
        };
      }),

      // Tables
      addTable: (tableData, user) => set((state) => {
        const newTable = {
          ...tableData,
          id: generateId(),
          status: 'Available',
          tableNumber: String(state.tables.length + 1)
        };
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
      }),

      updateTableStatus: (tableId, status) => set((state) => ({
        tables: state.tables.map(t => t.id === tableId ? { ...t, status } : t)
      })),

      // Purchases (Auto update inventory)
      addPurchase: (data, user) => set((state) => {
        // Logic to add purchase and update inventory
        const purchase = {
          ...data,
          id: generateId(),
          status: 'Active',
          createdBy: user?.name || 'System',
          createdDate: new Date().toISOString()
        };
        
        // Find if inventory item exists
        const existingInv = state.inventory.find(i => i.itemName === data.itemName && i.category === data.category);
        let newInventory = [...state.inventory];
        
        if (existingInv) {
          newInventory = newInventory.map(i => 
            i.id === existingInv.id ? { ...i, quantity: i.quantity + Number(data.quantity) } : i
          );
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

    }),
    {
      name: 'food-q-db-v7', // name of the item in the storage (updated to v7 to clear cache)
    }
  )
);
