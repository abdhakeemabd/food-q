import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { useAuth } from '../store/AuthContext';
import { useDbStore } from '../store/dbStore';
import logoImg from '../assets/logo.jpeg';
import { 
  LayoutDashboard, 
  Receipt, 
  Package, 
  Users, 
  BarChart3, 
  Settings,
  LogOut,
  Menu,
  User,
  LayoutGrid
} from 'lucide-react';
import Swal from 'sweetalert2';

const SidebarItem = ({ to, icon: Icon, label, onClick }) => (
  <NavLink 
    to={to} 
    onClick={onClick}
    style={({ isActive }) => ({
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '12px 20px',
      color: isActive ? 'white' : 'var(--text-muted)',
      backgroundColor: isActive ? 'var(--primary-color)' : 'transparent',
      textDecoration: 'none',
      transition: 'var(--transition-fast)',
      borderLeft: isActive ? '4px solid white' : '4px solid transparent'
    })}
  >
    <Icon size={20} />
    <span style={{ fontWeight: 500 }}>{label}</span>
  </NavLink>
);

const Layout = () => {
  const { currentUser, isAdmin, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = React.useState(window.innerWidth > 1024);

  // Handle window resize and data fetch
  React.useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 1024) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };
    window.addEventListener('resize', handleResize);
    
    // Fetch inventory from backend
    useDbStore.getState().fetchAllData();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLinkClick = () => {
    if (window.innerWidth <= 1024) {
      setSidebarOpen(false);
    }
  };

  const handleLogout = () => {
    Swal.fire({
      title: 'Ready to leave?',
      text: "You are about to log out of Food-Q.",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: 'var(--primary-color)',
      confirmButtonText: 'Yes, Logout'
    }).then((result) => {
      if (result.isConfirmed) {
        logout();
      }
    });
  };

  return (
    <div className="app-container">
      {/* Mobile Overlay */}
      {sidebarOpen && window.innerWidth <= 1024 && (
        <div 
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 999 }}
          onClick={() => setSidebarOpen(false)}
        />
      )}
      {/* Sidebar */}
      <aside className={`sidebar ${!sidebarOpen ? 'closed' : ''}`} style={window.innerWidth > 1024 ? { width: sidebarOpen ? '260px' : '0' } : {}}>
        <div style={{ height: '70px', display: 'flex', alignItems: 'center', padding: '0 24px', borderBottom: '1px solid var(--border-color)' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '8px', overflow: 'hidden', marginRight: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img src={logoImg} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }} />
            </div>
          <h2 style={{ margin: 0, fontSize: '1.3rem', color: 'var(--primary-color)', fontWeight: 700 }}>Food-Q</h2>
        </div>
        
        <nav style={{ flex: 1, padding: '24px 0', display: 'flex', flexDirection: 'column', gap: '4px', overflowY: 'auto' }}>
          <SidebarItem to="/" icon={LayoutDashboard} label="Dashboard" onClick={handleLinkClick} />
          <SidebarItem to="/billing" icon={Receipt} label="Add Bill (POS)" onClick={handleLinkClick} />
          <SidebarItem to="/tables" icon={LayoutGrid} label="Tables" onClick={handleLinkClick} />
          <SidebarItem to="/bills" icon={Receipt} label="Bill History" onClick={handleLinkClick} />
          <SidebarItem to="/finance" icon={BarChart3} label="Income/Expenses" onClick={handleLinkClick} />
          <SidebarItem to="/inventory" icon={Package} label="Inventory" onClick={handleLinkClick} />
          <SidebarItem to="/customers" icon={Users} label="Customers" onClick={handleLinkClick} />
          
          {isAdmin && (
            <>
              <div style={{ padding: '16px 24px 8px', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.05em' }}>
                Admin
              </div>
              <SidebarItem to="/employees" icon={Users} label="Staff" onClick={handleLinkClick} />
              <SidebarItem to="/reports" icon={BarChart3} label="Reports" onClick={handleLinkClick} />
              <SidebarItem to="/settings" icon={Settings} label="Settings" onClick={handleLinkClick} />
            </>
          )}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              style={{ background: 'transparent', border: 'none', color: 'var(--text-main)', cursor: 'pointer', padding: '4px' }}
            >
              <Menu size={24} />
            </button>
            <h3 style={{ margin: 0, fontWeight: 500 }}>{/* Route Title could go here */}</h3>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
             {/* Header User Profile & Logout */}
             <div style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingLeft: '16px', borderLeft: '1px solid var(--border-color)' }}>
                <div className="hide-on-mobile" style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{currentUser?.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--primary-color)' }}>{currentUser?.role}</div>
                </div>
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <User size={18} />
                </div>
                <button 
                  onClick={handleLogout}
                  className="btn btn-secondary" 
                  style={{ padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}
                  title="Logout"
                >
                  <LogOut size={16} />
                </button>
             </div>
          </div>
        </header>
        
        <div className="content-area">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
