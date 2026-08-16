import React, { useState } from 'react';
import { useDbStore } from '../store/dbStore';
import { useAuth } from '../store/AuthContext';
import { Settings as SettingsIcon, Tag, Plus, Edit2, Trash2, ShieldCheck, Server } from 'lucide-react';
import Swal from 'sweetalert2';

const getCategoryName = (cat) => {
  if (!cat) return '';
  if (typeof cat === 'string') return cat;
  if (typeof cat === 'object' && cat.name) return String(cat.name);
  return String(cat);
};

const Settings = () => {
  const { currentUser, isAdmin } = useAuth();
  const categories = useDbStore(state => state.categories);
  const inventory = useDbStore(state => state.inventory);
  const addRecord = useDbStore(state => state.addRecord);
  const updateRecord = useDbStore(state => state.updateRecord);
  const deleteRecord = useDbStore(state => state.deleteRecord);

  const [newCatName, setNewCatName] = useState('');

  // Combined list of categories from DB and inventory items
  const allCategoriesMap = new Map();
  
  categories.forEach(c => {
    const name = getCategoryName(c);
    if (name) {
      allCategoriesMap.set(name.toLowerCase(), { id: c.id || null, name });
    }
  });

  inventory.forEach(i => {
    const name = getCategoryName(i.category || i.category_name);
    if (name && !allCategoriesMap.has(name.toLowerCase())) {
      allCategoriesMap.set(name.toLowerCase(), { id: null, name });
    }
  });

  const allCategories = Array.from(allCategoriesMap.values());

  const handleAddCategorySubmit = async (catName) => {
    const trimmed = (catName || '').trim();
    if (!trimmed) {
      Swal.fire('Error', 'Category name cannot be empty', 'error');
      return;
    }

    if (allCategories.some(c => c.name.toLowerCase() === trimmed.toLowerCase())) {
      Swal.fire('Warning', 'Category already exists', 'warning');
      return;
    }

    await addRecord('categories', { name: trimmed }, currentUser);
    setNewCatName('');
    Swal.fire({ title: 'Added!', text: `Category "${trimmed}" has been created.`, icon: 'success', timer: 5000, timerProgressBar: true });
  };

  const handleOpenAddModal = async () => {
    if (newCatName.trim()) {
      handleAddCategorySubmit(newCatName);
      return;
    }

    const { value: categoryName } = await Swal.fire({
      title: 'Add New Category',
      input: 'text',
      inputLabel: 'Category Name',
      inputPlaceholder: 'e.g. Starters, Juices, Desserts...',
      showCancelButton: true,
      confirmButtonText: 'Save Category',
      confirmButtonColor: '#e23744',
      inputValidator: (value) => {
        if (!value || !value.trim()) {
          return 'Please enter a category name!';
        }
      }
    });

    if (categoryName) {
      handleAddCategorySubmit(categoryName);
    }
  };

  const handleEditCategory = async (cat) => {
    const { value: updatedName } = await Swal.fire({
      title: 'Edit Category',
      input: 'text',
      inputLabel: 'New Category Name',
      inputValue: cat.name,
      showCancelButton: true,
      confirmButtonText: 'Update',
      confirmButtonColor: '#e23744',
      inputValidator: (value) => {
        if (!value || !value.trim()) {
          return 'Category name cannot be empty!';
        }
      }
    });

    if (updatedName && updatedName.trim().toLowerCase() !== cat.name.toLowerCase()) {
      const trimmedNew = updatedName.trim();

      // Find matching categories in store state
      const matchingCategories = categories.filter(c => getCategoryName(c).toLowerCase() === cat.name.toLowerCase());

      if (matchingCategories.length > 0) {
        for (const c of matchingCategories) {
          if (c.id) {
            await updateRecord('categories', c.id, { name: trimmedNew }, currentUser);
          }
        }
      } else {
        await addRecord('categories', { name: trimmedNew }, currentUser);
      }

      // Update existing inventory items assigned to old category
      const matchingItems = inventory.filter(i => getCategoryName(i.category || i.category_name).toLowerCase() === cat.name.toLowerCase());
      for (const item of matchingItems) {
        await updateRecord('inventory', item.id, { category: trimmedNew }, currentUser);
      }

      Swal.fire({ title: 'Updated!', text: `Category changed to "${trimmedNew}".`, icon: 'success', timer: 5000, timerProgressBar: true });
    }
  };

  const handleDeleteCategory = (cat) => {
    const itemCount = inventory.filter(i => getCategoryName(i.category || i.category_name).toLowerCase() === cat.name.toLowerCase()).length;

    Swal.fire({
      title: `Delete "${cat.name}"?`,
      text: itemCount > 0 
        ? `Warning: ${itemCount} menu item(s) are currently assigned to this category.` 
        : "This action will remove the category.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e23744',
      confirmButtonText: 'Yes, delete it!'
    }).then(async (result) => {
      if (result.isConfirmed) {
        // Delete all matching category records from backend
        const matchingCategories = categories.filter(c => getCategoryName(c).toLowerCase() === cat.name.toLowerCase());
        
        for (const c of matchingCategories) {
          if (c.id) {
            await deleteRecord('categories', c.id, currentUser);
          }
        }

        // Also clean up local Zustand state if item had no DB id
        useDbStore.setState(state => ({
          categories: state.categories.filter(c => getCategoryName(c).toLowerCase() !== cat.name.toLowerCase())
        }));

        Swal.fire({ title: 'Deleted!', text: 'Category has been removed.', icon: 'success', timer: 5000, timerProgressBar: true });
      }
    });
  };
 
  // Role Management State
  const dbRolesRaw = useDbStore(state => state.roles);
  const employeesRaw = useDbStore(state => state.employees);
  const dbRoles = Array.isArray(dbRolesRaw) ? dbRolesRaw : [];
  const employees = Array.isArray(employeesRaw) ? employeesRaw : [];
  const [newRoleName, setNewRoleName] = useState('');

  const allRolesMap = new Map();
  dbRoles.forEach(r => {
    const name = typeof r === 'string' ? r : r?.name;
    if (name) allRolesMap.set(name.toLowerCase(), { id: r.id || null, name });
  });
  const allRolesList = Array.from(allRolesMap.values());

  const handleAddRoleSubmit = async (roleName) => {
    const trimmed = (roleName || '').trim();
    if (!trimmed) {
      Swal.fire('Error', 'Role name cannot be empty', 'error');
      return;
    }
    if (allRolesList.some(r => r.name.toLowerCase() === trimmed.toLowerCase())) {
      Swal.fire('Warning', 'Role already exists', 'warning');
      return;
    }
    await addRecord('roles', { name: trimmed }, currentUser);
    setNewRoleName('');
    Swal.fire({ title: 'Added!', text: `Role "${trimmed}" has been created.`, icon: 'success', timer: 5000, timerProgressBar: true });
  };

  const handleOpenAddRoleModal = async () => {
    if (newRoleName.trim()) {
      handleAddRoleSubmit(newRoleName);
      return;
    }

    const { value: roleName } = await Swal.fire({
      title: 'Add New Staff Role',
      input: 'text',
      inputLabel: 'Role Name',
      inputPlaceholder: 'e.g. Head Chef, Cashier, Supervisor...',
      showCancelButton: true,
      confirmButtonText: 'Save Role',
      confirmButtonColor: '#e23744',
      inputValidator: (value) => {
        if (!value || !value.trim()) {
          return 'Please enter a role name!';
        }
      }
    });

    if (roleName) {
      handleAddRoleSubmit(roleName);
    }
  };

  const handleDeleteRole = (roleItem) => {
    const count = employees.filter(e => String(e.role).toLowerCase() === roleItem.name.toLowerCase()).length;
    Swal.fire({
      title: `Delete Role "${roleItem.name}"?`,
      text: count > 0 ? `Warning: ${count} staff member(s) currently have this role.` : "Are you sure?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e23744',
      confirmButtonText: 'Yes, delete!'
    }).then(async (result) => {
      if (result.isConfirmed) {
        if (roleItem.id) {
          await deleteRecord('roles', roleItem.id, currentUser);
        } else {
          useDbStore.setState(state => ({
            roles: state.roles.filter(r => (typeof r === 'string' ? r : r.name).toLowerCase() !== roleItem.name.toLowerCase())
          }));
        }
        Swal.fire({ title: 'Deleted!', text: 'Role has been removed.', icon: 'success', timer: 5000, timerProgressBar: true });
      }
    });
  };

  const [activeTab, setActiveTab] = useState('categories'); // 'categories' or 'roles'

  return (
    <div>
      <div className="d-flex justify-between align-center mb-24 flex-wrap gap-16">
        <div>
          <h2 className="page-title d-flex align-center gap-8">
            <SettingsIcon size={24} color="var(--primary-color)" /> System Settings
          </h2>
          <div className="text-muted mb-12">Manage food categories, staff roles, and POS configurations</div>
          
          <div className="d-flex gap-8 mt-12">
            <button 
              type="button"
              onClick={() => setActiveTab('categories')}
              className={`btn ${activeTab === 'categories' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '6px 16px', borderRadius: '20px' }}
            >
              Food Categories
            </button>
            <button 
              type="button"
              onClick={() => setActiveTab('roles')}
              className={`btn ${activeTab === 'roles' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '6px 16px', borderRadius: '20px' }}
            >
              Staff Roles
            </button>
          </div>
        </div>
      </div>

      <div className="d-flex flex-col gap-32">
        {activeTab === 'categories' ? (
          /* Category Management Section */
          <div className="glass-panel p-24">
            <div className="d-flex justify-between align-center flex-wrap gap-12 mb-16">
              <h3 className="m-0 d-flex align-center gap-8 fs-lg">
                Food Categories
              </h3>
            </div>

            <div className="d-flex gap-12 mb-24 flex-wrap">
              <input
                type="text"
                className="form-input flex-1"
                style={{ minWidth: '220px', padding: '12px 16px' }}
                placeholder="Enter category name or click Add Category..."
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleOpenAddModal();
                }}
              />
              <button 
                type="button" 
                onClick={handleOpenAddModal} 
                className="btn btn-primary d-flex align-center gap-8 px-20"
              >
                <Plus size={18} /> Add Category
              </button>
            </div>

            {allCategories.length === 0 ? (
              <div className="text-center p-32 text-muted border-light radius-md">
                No categories configured yet. Click "+ Add Category" to create one!
              </div>
            ) : (
              <div className="w-100" style={{ overflowX: 'auto' }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Category Name</th>
                      <th>Associated Menu Items</th>
                      <th style={{ width: '120px' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allCategories.map((cat, index) => {
                      const count = inventory.filter(i => getCategoryName(i.category || i.category_name).toLowerCase() === cat.name.toLowerCase()).length;
                      return (
                        <tr key={`cat-${cat.id || 'no-id'}-${cat.name}-${index}`}>
                          <td className="fw-600">{cat.name}</td>
                          <td>
                            <span className="badge bg-tertiary">
                              {count} item{count !== 1 ? 's' : ''}
                            </span>
                          </td>
                          <td>
                            <div className="d-flex gap-8">
                              <button
                                onClick={() => handleEditCategory(cat)}
                                className="btn btn-secondary p-8"
                                title="Edit Category"
                              >
                                <Edit2 size={16} />
                              </button>
                              <button
                                onClick={() => handleDeleteCategory(cat)}
                                className="btn btn-secondary p-8 text-danger border-danger"
                                title="Delete Category"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : (
          /* Staff Roles Management Section */
          <div className="glass-panel p-24">
            <div className="d-flex justify-between align-center flex-wrap gap-12 mb-16">
              <h3 className="m-0 d-flex align-center gap-8 fs-lg">
                Staff Roles Configuration
              </h3>
            </div>

            <div className="d-flex gap-12 mb-24 flex-wrap">
              <input
                type="text"
                className="form-input flex-1"
                style={{ minWidth: '220px', padding: '12px 16px' }}
                placeholder="Enter new staff role (e.g., Head Chef, Cashier)..."
                value={newRoleName}
                onChange={(e) => setNewRoleName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleOpenAddRoleModal();
                }}
              />
              <button 
                type="button" 
                onClick={handleOpenAddRoleModal} 
                className="btn btn-primary d-flex align-center gap-8 px-20"
              >
                <Plus size={18} /> Add Role
              </button>
            </div>

            {allRolesList.length === 0 ? (
              <div className="text-center p-32 text-muted border-light radius-md">
                No staff roles configured yet. Click "+ Add Role" to create one!
              </div>
            ) : (
              <div className="w-100" style={{ overflowX: 'auto' }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Role Name</th>
                      <th>Assigned Staff</th>
                      <th style={{ width: '120px' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allRolesList.map((r, index) => {
                      const empCount = employees.filter(e => String(e.role).toLowerCase() === r.name.toLowerCase()).length;
                      return (
                        <tr key={`role-${r.id || 'no-id'}-${r.name}-${index}`}>
                          <td className="fw-600">{r.name}</td>
                          <td>
                            <span className="badge bg-tertiary">
                              {empCount} staff member{empCount !== 1 ? 's' : ''}
                            </span>
                          </td>
                          <td>
                            <button
                              onClick={() => handleDeleteRole(r)}
                              className="btn btn-secondary p-8 text-danger border-danger"
                              title="Delete Role"
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Settings;
