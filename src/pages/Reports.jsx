import React, { useState } from 'react';
import { useDbStore } from '../store/dbStore';
import * as XLSX from 'xlsx';
import { Download, Calendar, IndianRupee, TrendingUp, ShoppingBag, ArrowDownRight } from 'lucide-react';
import Swal from 'sweetalert2';

const Reports = () => {
  const [reportType, setReportType] = useState('daily'); // 'daily' or 'monthly'
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]); // YYYY-MM-DD
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM
  
  const bills = useDbStore(state => state.bills).filter(b => b.status !== 'Archived');
  const expenses = useDbStore(state => state.expenses).filter(e => e.status !== 'Archived');

  // Filter Data based on selection
  const filteredBills = bills.filter(bill => {
    const billDate = bill.createdDate.split('T')[0];
    if (reportType === 'daily') {
      return billDate === selectedDate;
    } else {
      return billDate.startsWith(selectedMonth);
    }
  });

  const filteredExpenses = expenses.filter(exp => {
    const expDate = exp.date;
    if (reportType === 'daily') {
      return expDate === selectedDate;
    } else {
      return expDate.startsWith(selectedMonth);
    }
  });

  // Calculate Metrics
  const totalRevenue = filteredBills.reduce((sum, bill) => sum + bill.totalAmount, 0);
  const totalOrders = filteredBills.length;
  const totalExpenses = filteredExpenses.reduce((sum, exp) => sum + Number(exp.amount), 0);
  const netProfit = totalRevenue - totalExpenses;

  const handleExport = () => {
    if (filteredBills.length === 0 && filteredExpenses.length === 0) {
      Swal.fire('No Data', 'No records found for the selected period.', 'info');
      return;
    }
    
    // Export Bills
    const billData = filteredBills.map(bill => ({
      Type: 'Income (Bill)',
      Date: new Date(bill.createdDate).toLocaleString(),
      Category: bill.orderType,
      Description: `Order #${bill.id}`,
      Amount: bill.totalAmount
    }));

    // Export Expenses
    const expData = filteredExpenses.map(exp => ({
      Type: 'Expense',
      Date: exp.date,
      Category: exp.category,
      Description: exp.title,
      Amount: -Number(exp.amount)
    }));

    const combinedData = [...billData, ...expData];
    
    // Add Summary Row
    combinedData.push({});
    combinedData.push({
      Type: 'SUMMARY',
      Date: reportType === 'daily' ? selectedDate : selectedMonth,
      Category: '',
      Description: 'Net Profit',
      Amount: netProfit
    });

    const worksheet = XLSX.utils.json_to_sheet(combinedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Financial Report");
    
    const fileName = `FoodQ_Report_${reportType}_${reportType === 'daily' ? selectedDate : selectedMonth}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  const StatCard = ({ title, value, icon: Icon, color, subtext }) => (
    <div className="glass-panel" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
      <div style={{ 
        width: '60px', height: '60px', 
        borderRadius: '50%', 
        backgroundColor: `rgba(${color}, 0.1)`, 
        color: `rgb(${color})`,
        display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}>
        <Icon size={28} />
      </div>
      <div>
        <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {title}
        </div>
        <div style={{ fontSize: '1.8rem', fontWeight: 700, marginTop: '4px' }}>
          {value}
        </div>
        {subtext && <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>{subtext}</div>}
      </div>
    </div>
  );

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ margin: '0 0 8px 0' }}>Financial Reports</h2>
          <p style={{ color: 'var(--text-muted)', margin: 0 }}>Analyze your sales, expenses, and overall profit.</p>
        </div>
        
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div className="glass-panel" style={{ display: 'flex', padding: '4px', borderRadius: '8px' }}>
            <button 
              className={`btn ${reportType === 'daily' ? 'btn-primary' : ''}`}
              style={{ background: reportType === 'daily' ? 'var(--primary-color)' : 'transparent', color: reportType === 'daily' ? 'white' : 'var(--text-muted)', border: 'none', padding: '8px 16px' }}
              onClick={() => setReportType('daily')}
            >
              Daily
            </button>
            <button 
              className={`btn ${reportType === 'monthly' ? 'btn-primary' : ''}`}
              style={{ background: reportType === 'monthly' ? 'var(--primary-color)' : 'transparent', color: reportType === 'monthly' ? 'white' : 'var(--text-muted)', border: 'none', padding: '8px 16px' }}
              onClick={() => setReportType('monthly')}
            >
              Monthly
            </button>
          </div>

          {reportType === 'daily' ? (
            <input 
              type="date" 
              className="form-input" 
              value={selectedDate} 
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          ) : (
            <input 
              type="month" 
              className="form-input" 
              value={selectedMonth} 
              onChange={(e) => setSelectedMonth(e.target.value)}
            />
          )}

          <button onClick={handleExport} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Download size={18} /> Export Excel
          </button>
        </div>
      </div>

      {/* Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px', marginBottom: '32px' }}>
        <StatCard title="Total Revenue" value={`₹${totalRevenue}`} icon={IndianRupee} color="42, 157, 143" subtext="From generated bills" />
        <StatCard title="Total Orders" value={totalOrders} icon={ShoppingBag} color="67, 97, 238" subtext="Successful transactions" />
        <StatCard title="Total Expenses" value={`₹${totalExpenses}`} icon={ArrowDownRight} color="226, 55, 68" subtext="Staff, inventory, etc." />
        <StatCard title="Net Profit" value={`₹${netProfit}`} icon={TrendingUp} color={netProfit >= 0 ? "42, 157, 143" : "226, 55, 68"} subtext="Revenue minus Expenses" />
      </div>

      <div className="glass-panel" style={{ overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-color)' }}>
          <h3 style={{ margin: 0 }}>Recorded Expenses ({reportType})</h3>
        </div>
        <div style={{ overflowX: 'auto', width: '100%' }}>
          <table className="data-table" style={{ minWidth: '800px' }}>
            <thead>
              <tr>
                <th>Date</th>
                <th>Category</th>
                <th>Description</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                    No expenses recorded for this period.
                  </td>
                </tr>
              ) : (
                filteredExpenses.map(exp => (
                  <tr key={exp.id}>
                    <td>{exp.date}</td>
                    <td>
                      <span className="badge" style={{ backgroundColor: 'var(--bg-tertiary)' }}>{exp.category}</span>
                    </td>
                    <td>{exp.title}</td>
                    <td style={{ color: '#e23744', fontWeight: 600 }}>-₹{exp.amount}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Reports;
