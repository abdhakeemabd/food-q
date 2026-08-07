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
    <div className="glass-panel p-24 d-flex align-center gap-20">
      <div 
        className="p-16 radius-md d-flex align-center justify-center"
        style={{ backgroundColor: color + '20', color: color }}
      >
        <Icon size={28} />
      </div>
      <div>
        <div className="text-muted fs-sm fw-600 text-uppercase tracking-wide">
          {title}
        </div>
        <div className="fs-2xl fw-700 mt-4">
          {value}
        </div>
        {subtext && <div className="fs-sm text-muted mt-4">{subtext}</div>}
      </div>
    </div>
  );

  return (
    <div>
      <div className="d-flex justify-between align-start mb-32 flex-wrap gap-16">
        <div>
          <h2 className="page-title">Financial Reports</h2>
          <p className="text-muted m-0">Analyze your sales, expenses, and overall profit.</p>
        </div>
        
        <div className="d-flex gap-16 align-center flex-wrap">
          <div className="glass-panel d-flex p-4 radius-sm">
            <button 
              onClick={() => setReportType('daily')}
              className="border-none py-8 px-16 radius-sm cursor-pointer fw-500"
              style={{ background: reportType === 'daily' ? 'var(--primary-color)' : 'transparent', color: reportType === 'daily' ? 'white' : 'var(--text-muted)' }}
            >
              Daily
            </button>
            <button 
              onClick={() => setReportType('monthly')}
              className="border-none py-8 px-16 radius-sm cursor-pointer fw-500"
              style={{ background: reportType === 'monthly' ? 'var(--primary-color)' : 'transparent', color: reportType === 'monthly' ? 'white' : 'var(--text-muted)' }}
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

          <button onClick={handleExport} className="btn btn-primary d-flex align-center gap-8">
            <Download size={18} /> Export Excel
          </button>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid-cols-auto-fit gap-24 mb-32">
        <StatCard title={`Total Revenue (${reportType})`} value={`₹${totalRevenue}`} icon={TrendingUp} color="#2a9d8f" />
        <StatCard title={`Total Expenses (${reportType})`} value={`₹${totalExpenses}`} icon={TrendingDown} color="#f59e0b" />
        <StatCard 
          title={`Net Profit (${reportType})`} 
          value={`₹${netProfit}`} 
          icon={IndianRupee} 
          color={netProfit >= 0 ? "#2a9d8f" : "#e23744"} 
          subtext={netProfit >= 0 ? "Profitable period" : "Loss-making period"}
        />
      </div>

      <div className="glass-panel overflow-hidden">
        <div className="p-24 border-bottom">
          <h3 className="m-0">Recorded Expenses ({reportType})</h3>
        </div>
        <div className="w-100" style={{ overflowX: 'auto' }}>
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
                  <td colSpan="4" className="text-center p-32 text-muted">
                    No expenses recorded for this period.
                  </td>
                </tr>
              ) : (
                filteredExpenses.map(exp => (
                  <tr key={exp.id}>
                    <td>{new Date(exp.date).toLocaleDateString()}</td>
                    <td>
                      <span className="badge bg-tertiary">{exp.category}</span>
                    </td>
                    <td>{exp.title}</td>
                    <td className="fw-600" style={{ color: '#e23744' }}>-₹{exp.amount}</td>
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
