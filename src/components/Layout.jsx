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
  LayoutGrid,
  Wallet,
  Calendar
} from 'lucide-react';
import Swal from 'sweetalert2';

const SidebarItem = ({ to, icon: Icon, label, onClick }) => (
  <NavLink 
    to={to} 
    onClick={onClick}
    className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
  >
    <Icon size={20} />
    <span className="fw-500">{label}</span>
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
          className="pos-abs w-100 h-100"
          style={{ top: 0, left: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 999 }}
          onClick={() => setSidebarOpen(false)}
        />
      )}
      {/* Sidebar */}
      <aside className={`sidebar ${!sidebarOpen ? 'closed' : ''}`} style={window.innerWidth > 1024 ? { width: sidebarOpen ? '260px' : '0' } : {}}>
        <div className="sidebar-header">
            <div className="d-flex align-center justify-center overflow-hidden radius-sm mr-12" style={{ width: '40px', height: '40px' }}>
              <img src={logoImg} alt="Logo" className="w-100 h-100 radius-sm object-cover" />
            </div>
          <h2 className="m-0 text-primary fw-700" style={{ fontSize: '1.3rem' }}>Food-Q</h2>
        </div>
        
        <nav className="flex-1 d-flex flex-col gap-4 overflow-hidden py-24 overflow-y-auto">
          <SidebarItem to="/" icon={LayoutDashboard} label="Dashboard" onClick={handleLinkClick} />
          <SidebarItem to="/billing" icon={Receipt} label="Add Bill (POS)" onClick={handleLinkClick} />
          <SidebarItem to="/tables" icon={LayoutGrid} label="Tables" onClick={handleLinkClick} />
          <SidebarItem to="/bills" icon={Receipt} label="Bill History" onClick={handleLinkClick} />
          <SidebarItem to="/finance" icon={BarChart3} label="Income/Expenses" onClick={handleLinkClick} />
          <SidebarItem to="/daily-tracker" icon={Wallet} label="Daily Tracker" onClick={handleLinkClick} />
          <SidebarItem to="/inventory" icon={Package} label="Inventory" onClick={handleLinkClick} />
          <SidebarItem to="/customers" icon={Users} label="Customers" onClick={handleLinkClick} />
          
          {isAdmin && (
            <>
              <div className="text-muted fw-600 text-uppercase" style={{ padding: '16px 24px 8px', fontSize: '0.75rem', letterSpacing: '0.05em' }}>
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
          <div className="d-flex align-center gap-16">
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-4 bg-transparent border-none cursor-pointer"
              style={{ color: 'var(--text-main)' }}
            >
              <Menu size={24} />
            </button>
            <h3 className="m-0 fw-500">{/* Route Title could go here */}</h3>
          </div>
          <div className="d-flex align-center gap-16">
             {/* Header User Profile & Logout */}
             <div className="d-flex align-center gap-12 pl-16 border-left">
                <div className="hide-on-mobile text-right">
                  <div className="fw-600 fs-sm">{currentUser?.name}</div>
                  <div className="fs-xs text-primary">{currentUser?.role}</div>
                </div>
                <div className="d-flex align-center justify-center radius-full" style={{ width: '36px', height: '36px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '50%' }}>
                  <User size={18} />
                </div>
                <button 
                  onClick={handleLogout}
                  className="btn btn-secondary d-flex align-center gap-6 fs-sm px-12 py-6" 
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
