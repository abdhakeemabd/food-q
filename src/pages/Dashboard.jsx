import React from 'react';
import { useDbStore } from '../store/dbStore';
import { IndianRupee, ShoppingBag, Utensils, TrendingUp } from 'lucide-react';

const Dashboard = () => {
  const bills = useDbStore(state => state.bills);
  const inventory = useDbStore(state => state.inventory);
  const customers = useDbStore(state => state.customers);

  // Derived metrics
  const totalRevenue = bills.reduce((sum, bill) => sum + Number(bill.totalAmount || bill.amount_paid || bill.total || 0), 0);
  const totalOrders = bills.length;
  const activeItems = inventory.filter(i => i.status === 'Active').length;
  const totalCustomers = customers.length; // Actually, we can derive unique customers from bills if customers list is empty, but let's use the DB array.
  
  const recentBills = [...bills].reverse().slice(0, 10);

  const StatCard = ({ title, value, icon: Icon, color }) => (
    <div className="glass-panel p-24 d-flex align-center gap-20">
      <div 
        className="p-16 radius-md d-flex align-center justify-center"
        style={{ backgroundColor: color + '20', color: color }}
      >
        <Icon size={28} />
      </div>
      <div>
        <div className="text-muted fw-600 text-uppercase" style={{ fontSize: '0.9rem', letterSpacing: '0.05em' }}>
          {title}
        </div>
        <div className="fw-700 mt-4" style={{ fontSize: '1.8rem' }}>
          {value}
        </div>
      </div>
    </div>
  );

  return (
    <div>
      <div className="mb-32">
        <h2 className="page-title">Dashboard Overview</h2>
        <p className="text-muted m-0">Welcome back! Here is what's happening at AREA 51 today.</p>
      </div>

      <div className="mb-32 grid-cols-auto-fit gap-24">
        <StatCard title="Total Revenue" value={`₹${totalRevenue.toFixed(2)}`} icon={IndianRupee} color="#e23744" />
        <StatCard title="Total Orders" value={totalOrders} icon={ShoppingBag} color="#f59e0b" />
        <StatCard title="Active Menu Items" value={activeItems} icon={Utensils} color="#2a9d8f" />
        <StatCard title="Registered Customers" value={totalCustomers} icon={TrendingUp} color="#4361ee" />
      </div>

      {/* Recent Orders */}
      <div className="glass-panel overflow-hidden">
        <div className="p-24 border-bottom d-flex justify-between align-center">
          <h3 className="m-0">Recent Orders</h3>
        </div>
        <div className="w-100" style={{ overflowX: 'auto' }}>
          <table className="data-table" style={{ minWidth: '800px' }}>
            <thead>
              <tr>
                <th>S.No.</th>
                <th>Order ID</th>
                <th>Date & Time</th>
                <th>Type</th>
                <th>Items</th>
                <th>Total</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentBills.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center p-32 text-muted">
                    No recent orders today.
                  </td>
                </tr>
              ) : (
                recentBills.map((bill, index) => (
                  <tr key={bill.id}>
                    <td className="text-muted fw-600">{index + 1}</td>
                    <td className="fw-600" style={{ fontFamily: 'monospace' }}>#{String(bill?.id || 'BILL').toUpperCase()}</td>
                    <td>{bill?.createdDate ? new Date(bill.createdDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}</td>
                    <td>
                      <span className="fw-500">{bill?.orderType || 'Dine In'}</span>
                    </td>
                    <td>{Array.isArray(bill?.items) ? bill.items.reduce((sum, i) => sum + (i?.qty || 1), 0) : 0} items</td>
                    <td className="fw-700 text-primary">₹{bill?.totalAmount || bill?.amount_paid || 0}</td>
                    <td>
                      <span className={`badge badge-${(bill?.status || 'Paid').toLowerCase()}`}>{bill?.status || 'Paid'}</span>
                    </td>
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

export default Dashboard;
