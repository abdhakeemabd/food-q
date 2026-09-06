import React, { useState } from 'react';
import { useDbStore } from '../store/dbStore';
import { useAuth } from '../store/AuthContext';
import { Plus, Edit2, Trash2, X, Users, DollarSign, Calendar, CreditCard } from 'lucide-react';
import Swal from 'sweetalert2';

const Employees = () => {
  const { currentUser } = useAuth();
  const employeesRaw = useDbStore(state => state.employees);
  const storeRolesRaw = useDbStore(state => state.roles);
  const salaryRecordsRaw = useDbStore(state => state.salaryRecords);

  const employees = Array.isArray(employeesRaw) ? employeesRaw : [];
  const storeRoles = Array.isArray(storeRolesRaw) ? storeRolesRaw : [];
  const salaryRecords = Array.isArray(salaryRecordsRaw) ? salaryRecordsRaw : [];

  const addRecord = useDbStore(state => state.addRecord);
  const updateRecord = useDbStore(state => state.updateRecord);
  const deleteRecord = useDbStore(state => state.deleteRecord);

  const [activeTab, setActiveTab] = useState('staff'); // 'staff' or 'salaries'
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSalaryModalOpen, setIsSalaryModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);

  // Dynamic roles strictly from Settings / DB Store
  const availableRoles = Array.from(new Set(
    storeRoles.map(r => (typeof r === 'string' ? r : r?.name)).filter(Boolean)
  ));

  const [formData, setFormData] = useState({
    name: '',
    role: availableRoles[0] || 'Staff',
    phone: '',
    salaryType: 'Monthly',
    salary: '',
    dailySalary: ''
  });

  const [salaryForm, setSalaryForm] = useState({
    employee_name: '',
    amount: '',
    payment_type: 'Monthly',
    payment_mode: 'Cash',
    date: new Date().toISOString().split('T')[0],
    notes: ''
  });

  const activeEmployees = employees.filter(e => e.status !== 'Archived');

  const openAddModal = () => {
    setEditItem(null);
    setFormData({ name: '', role: availableRoles[0] || 'Staff', phone: '', salaryType: 'Monthly', salary: '', dailySalary: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditItem(item);
    const mAmt = item.salary || 0;
    const dAmt = item.dailySalary || item.daily_salary || 0;
    let sType = 'Monthly';
    if (mAmt > 0 && dAmt > 0) sType = 'Both';
    else if (dAmt > 0 && !mAmt) sType = 'Daily';

    setFormData({ 
      name: item.name, 
      role: item.role, 
      phone: item.phone || '', 
      salaryType: item.salaryType || sType,
      salary: mAmt || '',
      dailySalary: dAmt || ''
    });
    setIsModalOpen(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.role) {
      Swal.fire('Error', 'Please fill required fields', 'error');
      return;
    }

    const payload = {
      ...formData,
      salary: formData.salaryType === 'Daily' ? 0 : (Number(formData.salary) || 0),
      daily_salary: formData.salaryType === 'Monthly' ? 0 : (Number(formData.dailySalary) || 0),
      dailySalary: formData.salaryType === 'Monthly' ? 0 : (Number(formData.dailySalary) || 0)
    };

    if (editItem) {
      updateRecord('employees', editItem.id, payload, currentUser);
      Swal.fire({ title: 'Updated!', text: 'Staff details updated.', icon: 'success', timer: 5000, timerProgressBar: true });
    } else {
      addRecord('employees', payload, currentUser);
      Swal.fire({ title: 'Added!', text: 'New staff member added.', icon: 'success', timer: 5000, timerProgressBar: true });
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id) => {
    Swal.fire({
      title: 'Are you sure?',
      text: "You are removing this staff member.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e23744',
      confirmButtonText: 'Yes, delete!'
    }).then((result) => {
      if (result.isConfirmed) {
        deleteRecord('employees', id, currentUser);
        Swal.fire({ title: 'Deleted!', text: 'Staff member removed.', icon: 'success', timer: 5000, timerProgressBar: true });
      }
    });
  };

  const openSalaryModal = (emp = null) => {
    const selectedEmp = emp || activeEmployees[0];
    const initialName = selectedEmp ? selectedEmp.name : '';
    const initialAmount = selectedEmp ? (selectedEmp.salary || selectedEmp.dailySalary || selectedEmp.daily_salary || '') : '';
    setSalaryForm({
      employee_name: initialName,
      amount: initialAmount,
      payment_type: 'Monthly',
      payment_mode: 'Cash',
      date: new Date().toISOString().split('T')[0],
      notes: ''
    });
    setIsSalaryModalOpen(true);
  };

  const handleEmployeeSelect = (empName) => {
    const emp = activeEmployees.find(e => e.name.toLowerCase() === empName.toLowerCase());
    if (emp) {
      const amt = salaryForm.payment_type === 'Daily' ? (emp.dailySalary || emp.daily_salary || 0) : (emp.salary || 0);
      setSalaryForm(prev => ({ ...prev, employee_name: emp.name, amount: amt || prev.amount }));
    } else {
      setSalaryForm(prev => ({ ...prev, employee_name: empName }));
    }
  };

  const handleSaveSalaryPayout = async (e) => {
    e.preventDefault();
    if (!salaryForm.employee_name || !salaryForm.amount || !salaryForm.date) {
      Swal.fire('Error', 'Please fill required fields', 'error');
      return;
    }

    const payload = {
      ...salaryForm,
      amount: Number(salaryForm.amount)
    };

    await addRecord('salary-records', payload, currentUser);

    // Automatically record as an expense in Finance module
    await addRecord('expenses', {
      title: `Salary Payout - ${salaryForm.employee_name} (${salaryForm.payment_type})`,
      amount: Number(salaryForm.amount),
      category: 'Salary',
      date: salaryForm.date,
      notes: `Payment mode: ${salaryForm.payment_mode}. ${salaryForm.notes || ''}`
    }, currentUser);

    setIsSalaryModalOpen(false);
    Swal.fire({ title: 'Paid!', text: `Salary payout recorded for ${salaryForm.employee_name}.`, icon: 'success', timer: 5000, timerProgressBar: true });
  };

  const handleDeleteSalaryRecord = (id) => {
    Swal.fire({
      title: 'Delete Payout Record?',
      text: "This action cannot be undone.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e23744',
      confirmButtonText: 'Yes, delete!'
    }).then((result) => {
      if (result.isConfirmed) {
        deleteRecord('salary-records', id, currentUser);
        Swal.fire({ title: 'Deleted!', text: 'Payout record removed.', icon: 'success', timer: 5000, timerProgressBar: true });
      }
    });
  };

  return (
    <div>
      <div className="d-flex justify-between align-center mb-32 flex-wrap gap-16">
        <div>
          <h2 className="page-title d-flex align-center gap-8">
            <Users size={24} color="var(--primary-color)" /> Staff & Salary Management
          </h2>
          <div className="d-flex gap-8 mt-8">
            <button 
              onClick={() => setActiveTab('staff')}
              className={`btn ${activeTab === 'staff' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '6px 16px', borderRadius: '20px' }}
            >
              Staff List
            </button>
            <button 
              onClick={() => setActiveTab('salaries')}
              className={`btn ${activeTab === 'salaries' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '6px 16px', borderRadius: '20px' }}
            >
              Salary Payouts
            </button>
          </div>
        </div>

        {activeTab === 'staff' ? (
          <button onClick={openAddModal} className="btn btn-primary d-flex align-center gap-8">
            <Plus size={18} /> Add Staff
          </button>
        ) : (
          <button onClick={() => openSalaryModal()} className="btn btn-primary d-flex align-center gap-8">
            <DollarSign size={18} /> Record Salary Payout
          </button>
        )}
      </div>

      {activeTab === 'staff' ? (
        <div className="glass-panel overflow-hidden">
          <div className="w-100" style={{ overflowX: 'auto' }}>
            <table className="data-table" style={{ minWidth: '800px' }}>
              <thead>
                <tr>
                  <th>S.No.</th>
                  <th>Name</th>
                  <th>Role</th>
                  <th>Phone</th>
                  <th>Salary Type</th>
                  <th>Salary Rate (₹)</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {activeEmployees.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center p-32 text-muted">
                      No staff members added yet.
                    </td>
                  </tr>
                ) : (
                  activeEmployees.map((emp, index) => {
                    const mVal = emp.salary || 0;
                    const dVal = emp.dailySalary || emp.daily_salary || 0;
                    const sType = emp.salaryType || (mVal > 0 && dVal > 0 ? 'Both' : (dVal > 0 ? 'Daily' : 'Monthly'));
                    return (
                      <tr key={emp.id}>
                        <td className="text-muted fw-600">{index + 1}</td>
                        <td>
                          <div className="d-flex align-center gap-12">
                            <div className="radius-full bg-tertiary d-flex align-center justify-center" style={{ width: '36px', height: '36px' }}>
                              <Users size={16} />
                            </div>
                            <span className="fw-600">{emp.name}</span>
                          </div>
                        </td>
                        <td>
                          <span className="badge badge-active">{emp.role}</span>
                        </td>
                        <td>{emp.phone || '-'}</td>
                        <td>
                          <span className="badge bg-tertiary">{sType}</span>
                        </td>
                        <td className="fw-600">
                          {sType === 'Daily' ? (
                            <span style={{ color: '#2a9d8f' }}>₹{dVal} / day</span>
                          ) : sType === 'Both' ? (
                            <span>₹{mVal}/mo <small style={{ color: '#2a9d8f' }}>(₹{dVal}/day)</small></span>
                          ) : (
                            <span>₹{mVal} / month</span>
                          )}
                        </td>
                      <td>
                        <span style={{ color: 'var(--status-active)' }}>Active</span>
                      </td>
                      <td>
                        <div className="d-flex gap-8">
                          <button onClick={() => openSalaryModal(emp)} className="btn btn-secondary p-8" title="Pay Salary">
                            <DollarSign size={16} color="#2a9d8f" />
                          </button>
                          <button onClick={() => openEditModal(emp)} className="btn btn-secondary p-8" title="Edit Details">
                            <Edit2 size={16} />
                          </button>
                          <button onClick={() => handleDelete(emp.id)} className="btn btn-secondary p-8 text-danger border-danger" title="Delete Staff">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="glass-panel overflow-hidden">
          <div className="w-100" style={{ overflowX: 'auto' }}>
            <table className="data-table" style={{ minWidth: '850px' }}>
              <thead>
                <tr>
                  <th>S.No.</th>
                  <th>Date</th>
                  <th>Staff Member</th>
                  <th>Payment Type</th>
                  <th>Payment Mode</th>
                  <th>Amount Paid (₹)</th>
                  <th>Notes</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {salaryRecords.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center p-32 text-muted">
                      No salary payouts recorded yet. Click "Record Salary Payout" to add one.
                    </td>
                  </tr>
                ) : (
                  salaryRecords.slice().reverse().map((rec, index) => (
                    <tr key={rec.id}>
                      <td className="text-muted fw-600">{index + 1}</td>
                      <td className="fw-500">{rec.date}</td>
                      <td className="fw-600">{rec.employee_name}</td>
                      <td>
                        <span className="badge bg-tertiary">{rec.payment_type || 'Monthly'}</span>
                      </td>
                      <td>{rec.payment_mode || 'Cash'}</td>
                      <td className="fw-700" style={{ color: '#2a9d8f' }}>₹{rec.amount}</td>
                      <td className="text-muted">{rec.notes || '-'}</td>
                      <td>
                        <button onClick={() => handleDeleteSalaryRecord(rec.id)} className="btn btn-secondary p-8 text-danger border-danger">
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal for Add/Edit Staff */}
      {isModalOpen && (
        <div className="pos-abs w-100 h-100 d-flex align-center justify-center z-2000 backdrop-blur" style={{ top: 0, left: 0, backgroundColor: 'rgba(0,0,0,0.7)', position: 'fixed' }}>
          <div className="glass-panel w-100 p-32 border-light shadow-xl" style={{ maxWidth: '440px' }}>
            <div className="d-flex justify-between align-center mb-32">
              <h3 className="m-0 fs-xl">{editItem ? 'Edit Staff' : 'Add Staff'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="bg-transparent border-none text-muted cursor-pointer d-flex">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="d-flex flex-col gap-20">
              <div>
                <label className="d-block mb-8 fs-sm text-muted">Full Name *</label>
                <input type="text" className="form-input p-12 w-100" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required placeholder="John Doe" />
              </div>
              
              <div>
                <label className="d-block mb-8 fs-sm text-muted">Role *</label>
                {availableRoles.length > 0 ? (
                  <select 
                    className="form-input p-12 w-100" 
                    value={formData.role} 
                    onChange={e => setFormData({...formData, role: e.target.value})}
                  >
                    {availableRoles.map(r => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                ) : (
                  <input 
                    type="text" 
                    className="form-input p-12 w-100" 
                    value={formData.role} 
                    onChange={e => setFormData({...formData, role: e.target.value})} 
                    required 
                    placeholder="Enter role (or add roles in Settings)..." 
                  />
                )}
              </div>

              <div>
                <label className="d-block mb-8 fs-sm text-muted">Phone Number</label>
                <input type="tel" className="form-input p-12 w-100" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="1234567890" />
              </div>

              <div>
                <label className="d-block mb-8 fs-sm text-muted">Salary Structure *</label>
                <select 
                  className="form-input p-12 w-100" 
                  value={formData.salaryType} 
                  onChange={e => setFormData({...formData, salaryType: e.target.value})}
                >
                  <option value="Monthly">Monthly Salary</option>
                  <option value="Daily">Daily Wage / Salary</option>
                  <option value="Both">Both (Monthly & Daily)</option>
                </select>
              </div>

              {(formData.salaryType === 'Monthly' || formData.salaryType === 'Both') && (
                <div>
                  <label className="d-block mb-8 fs-sm text-muted">Monthly Salary (₹) *</label>
                  <input 
                    type="number" 
                    className="form-input p-12 w-100" 
                    value={formData.salary} 
                    onChange={e => setFormData({...formData, salary: e.target.value})} 
                    min="0" 
                    placeholder="e.g. 15000"
                  />
                </div>
              )}

              {(formData.salaryType === 'Daily' || formData.salaryType === 'Both') && (
                <div>
                  <label className="d-block mb-8 fs-sm text-muted">Daily Salary (₹) *</label>
                  <input 
                    type="number" 
                    className="form-input p-12 w-100" 
                    value={formData.dailySalary} 
                    onChange={e => setFormData({...formData, dailySalary: e.target.value})} 
                    min="0" 
                    placeholder="e.g. 500"
                  />
                </div>
              )}

              <div className="d-flex justify-end gap-16 mt-16">
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary px-24 py-12">Cancel</button>
                <button type="submit" className="btn btn-primary px-24 py-12">Save Staff</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal for Salary Payout */}
      {isSalaryModalOpen && (
        <div className="pos-abs w-100 h-100 d-flex align-center justify-center z-2000 backdrop-blur" style={{ top: 0, left: 0, backgroundColor: 'rgba(0,0,0,0.7)', position: 'fixed' }}>
          <div className="glass-panel w-100 p-32 border-light shadow-xl" style={{ maxWidth: '460px' }}>
            <div className="d-flex justify-between align-center mb-32">
              <h3 className="m-0 fs-xl">Record Salary Payout</h3>
              <button onClick={() => setIsSalaryModalOpen(false)} className="bg-transparent border-none text-muted cursor-pointer d-flex">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSaveSalaryPayout} className="d-flex flex-col gap-20">
              <div>
                <label className="d-block mb-8 fs-sm text-muted">Staff Member *</label>
                {activeEmployees.length > 0 ? (
                  <select 
                    className="form-input p-12 w-100" 
                    value={salaryForm.employee_name} 
                    onChange={e => handleEmployeeSelect(e.target.value)}
                    required
                  >
                    {activeEmployees.map(emp => (
                      <option key={emp.id} value={emp.name}>{emp.name} ({emp.role})</option>
                    ))}
                  </select>
                ) : (
                  <input 
                    type="text" 
                    className="form-input p-12 w-100" 
                    value={salaryForm.employee_name} 
                    onChange={e => setSalaryForm({...salaryForm, employee_name: e.target.value})} 
                    required 
                    placeholder="Employee Name" 
                  />
                )}
              </div>

              <div className="d-flex gap-16">
                <div className="flex-1">
                  <label className="d-block mb-8 fs-sm text-muted">Payout Type *</label>
                  <select 
                    className="form-input p-12 w-100" 
                    value={salaryForm.payment_type} 
                    onChange={e => {
                      const newType = e.target.value;
                      setSalaryForm(prev => {
                        const emp = activeEmployees.find(em => em.name.toLowerCase() === prev.employee_name.toLowerCase());
                        let amt = prev.amount;
                        if (emp) {
                          if (newType === 'Daily') amt = emp.dailySalary || emp.daily_salary || prev.amount;
                          else if (newType === 'Monthly') amt = emp.salary || prev.amount;
                        }
                        return { ...prev, payment_type: newType, amount: amt };
                      });
                    }}
                  >
                    <option value="Monthly">Monthly Salary</option>
                    <option value="Daily">Daily Salary</option>
                    <option value="Advance">Advance Payout</option>
                    <option value="Bonus">Bonus / Extra</option>
                  </select>
                </div>

                <div className="flex-1">
                  <label className="d-block mb-8 fs-sm text-muted">Amount (₹) *</label>
                  <input 
                    type="number" 
                    className="form-input p-12 w-100" 
                    value={salaryForm.amount} 
                    onChange={e => setSalaryForm({...salaryForm, amount: e.target.value})} 
                    required 
                    min="0" 
                    step="0.01" 
                  />
                </div>
              </div>

              <div className="d-flex gap-16">
                <div className="flex-1">
                  <label className="d-block mb-8 fs-sm text-muted">Date *</label>
                  <input 
                    type="date" 
                    className="form-input p-12 w-100" 
                    value={salaryForm.date} 
                    onChange={e => setSalaryForm({...salaryForm, date: e.target.value})} 
                    required 
                  />
                </div>

                <div className="flex-1">
                  <label className="d-block mb-8 fs-sm text-muted">Payment Mode *</label>
                  <select 
                    className="form-input p-12 w-100" 
                    value={salaryForm.payment_mode} 
                    onChange={e => setSalaryForm({...salaryForm, payment_mode: e.target.value})}
                  >
                    <option value="Cash">Cash</option>
                    <option value="UPI">UPI / GPay</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="d-block mb-8 fs-sm text-muted">Notes / Remarks</label>
                <input 
                  type="text" 
                  className="form-input p-12 w-100" 
                  value={salaryForm.notes} 
                  onChange={e => setSalaryForm({...salaryForm, notes: e.target.value})} 
                  placeholder="e.g. Paid for August or Daily Wage" 
                />
              </div>

              <div className="d-flex justify-end gap-16 mt-16">
                <button type="button" onClick={() => setIsSalaryModalOpen(false)} className="btn btn-secondary px-24 py-12">Cancel</button>
                <button type="submit" className="btn btn-primary px-24 py-12">Save Payout</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Employees;
