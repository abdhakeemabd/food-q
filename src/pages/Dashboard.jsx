import React from 'react';
import { useDbStore } from '../store/dbStore';
import { IndianRupee, ShoppingBag, Utensils, TrendingUp } from 'lucide-react';

const Dashboard = () => {
  const bills = useDbStore(state => state.bills);
  const inventory = useDbStore(state => state.inventory);
  const customers = useDbStore(state => state.customers);

  // Derived metrics
  const totalRevenue = bills.reduce((sum, bill) => sum + bill.totalAmount, 0);
  const totalOrders = bills.length;
  const activeItems = inventory.filter(i => i.status === 'Active').length;
  const totalCustomers = customers.length; // Actually, we can derive unique customers from bills if customers list is empty, but let's use the DB array.
  
  const recentBills = [...bills].reverse().slice(0, 10);

  const StatCard = ({ title, value, icon: Icon, color }) => (
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
      </div>
    </div>
  );

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ margin: '0 0 8px 0' }}>Dashboard Overview</h2>
        <p style={{ color: 'var(--text-muted)', margin: 0 }}>Welcome back! Here is what's happening at Food-Q today.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px', marginBottom: '32px' }}>
        <StatCard title="Total Revenue" value={`₹${totalRevenue}`} icon={IndianRupee} color="226, 55, 68" />
        <StatCard title="Total Orders" value={totalOrders} icon={ShoppingBag} color="245, 158, 11" />
        <StatCard title="Active Menu Items" value={activeItems} icon={Utensils} color="42, 157, 143" />
        <StatCard title="Registered Customers" value={totalCustomers} icon={TrendingUp} color="67, 97, 238" />
      </div>

      <div className="glass-panel" style={{ overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0 }}>Recent Orders</h3>
        </div>
        <div style={{ overflowX: 'auto', width: '100%' }}>
          <table className="data-table" style={{ minWidth: '800px' }}>
            <thead>
              <tr>
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
                  <td colSpan="6" style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                    No orders placed yet today.
                  </td>
                </tr>
              ) : (
                recentBills.map(bill => (
                  <tr key={bill.id}>
                    <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>#{bill.id.toUpperCase()}</td>
                    <td>{new Date(bill.createdDate).toLocaleString()}</td>
                    <td>
                      <span style={{ fontWeight: 500 }}>{bill.orderType}</span>
                    </td>
                    <td>{bill.items.reduce((sum, i) => sum + i.qty, 0)} items</td>
                    <td style={{ fontWeight: 'bold', color: 'var(--primary-color)' }}>₹{bill.totalAmount}</td>
                    <td>
                      <span className={`badge badge-${bill.status.toLowerCase()}`}>{bill.status}</span>
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
