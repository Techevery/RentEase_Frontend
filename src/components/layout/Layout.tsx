// src/layout/Layout.tsx
import React, { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../redux/store';
import { logout as logoutAction } from '../../redux/slices/authSlice';
import {
  Menu, X, ChevronDown, Bell, Settings, LogOut, 
  Home, Users, Building, CreditCard, BarChart2,
} from 'lucide-react';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const location = useLocation();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);



  const logout = () => {
    dispatch(logoutAction());
  };

  const isLandlord = user?.role === 'landlord';

  const navigationItems = isLandlord
    ? [
        { name: 'Dashboard', path: '/landlord/dashboard', icon: <Home size={20} /> },
        { name: 'Properties', path: '/landlord/properties', icon: <Building size={20} /> },
        { name: 'Managers', path: '/landlord/managers', icon: <Users size={20} /> },
        { name: 'Tenants', path: '/landlord/tenants', icon: <Users size={20} /> },
        { name: 'Payments', path: '/landlord/payments', icon: <CreditCard size={20} /> },
        { name: 'Expenses', path: '/landlord/expenses', icon: <span className='h-[20px] w-[20px] text-white'>₦</span> },
        { name: 'Reports', path: '/landlord/reports', icon: <BarChart2 size={20} /> },
      ]
    : [
        { name: 'Dashboard', path: '/manager/dashboard', icon: <Home size={20} /> },
        { name: 'Payments', path: '/manager/payments', icon: <CreditCard size={20} /> },
        { name: 'Expenses', path: '/manager/expenses', icon: <span className='h-[20px] w-[20px] text-white'>₦</span> },
        { name: 'Tenants', path: '/manager/tenants', icon: <Users size={20} /> },
      ];

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="flex h-screen bg-gray-50">
      {sidebarOpen && (
        <div className="fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden" onClick={closeSidebar}></div>
      )}

      <aside className={`fixed inset-y-0 left-0 z-30 w-64 transform transition-transform duration-300 ease-in-out bg-blue-900 lg:translate-x-0 lg:static lg:inset-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex items-center justify-between h-16 px-4 bg-blue-950">
          <span className="text-xl font-semibold text-white">RentEase</span>
          <button onClick={closeSidebar} className="p-1 text-white rounded-md lg:hidden hover:bg-blue-800">
            <X size={24} />
          </button>
        </div>
        <nav className="px-2 py-4 space-y-1">
          {navigationItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors ${
                location.pathname === item.path
                  ? 'bg-blue-800 text-white'
                  : 'text-blue-100 hover:bg-blue-800 hover:text-white'
              }`}
            >
              <span className="mr-3">{item.icon}</span>
              {item.name}
            </Link>
          ))}
        </nav>
      </aside>

      <div className="flex flex-col flex-1 overflow-hidden">
        <header className="flex items-center justify-between h-16 px-4 bg-white border-b border-gray-200">
          <button onClick={toggleSidebar} className="p-1 mr-3 text-gray-500 rounded-md lg:hidden hover:bg-gray-100">
            <Menu size={24} />
          </button>

          <div className="flex items-center space-x-4">
            <div className="relative">
              <button onClick={() => setNotificationsOpen(!notificationsOpen)} className="p-1 text-gray-500 rounded-md hover:bg-gray-100 relative">
                <Bell size={22} />
              
              </button>

             
            </div>

            <div className="relative">
              <button onClick={() => setProfileDropdownOpen(!profileDropdownOpen)} className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 focus:outline-none">
                {/* <img src={user?.avatar || 'https://i.pravatar.cc/150?img=1'} alt="Profile" className="w-8 h-8 rounded-full object-cover" /> */}
                <span className="hidden md:block text-sm font-medium">{user?.name}</span>
                <ChevronDown size={16} />
              </button>

              {profileDropdownOpen && (
                <div className="absolute right-[-6] mt-2 w-48 bg-white rounded-md shadow-lg z-50">
                  <div className="py-1">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                      <p className="text-xs text-gray-500">{user?.email}</p>
                    </div>
                    <Link to="/settings" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      <Settings size={16} className="mr-2" /> Settings
                    </Link>
                    <button onClick={logout} className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      <LogOut size={16} className="mr-2" /> Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 bg-gray-50">{children}</main>
      </div>
    </div>
  );
};

export default Layout;
