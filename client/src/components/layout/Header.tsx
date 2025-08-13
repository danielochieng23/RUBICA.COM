import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, Search, User, Plus, Heart, LogOut, Settings, MessageCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Menu as HeadlessMenu, Transition } from '@headlessui/react';

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/listings?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="flex items-center">
              <div className="w-8 h-8 bg-gradient-to-r from-primary-600 to-primary-800 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">R</span>
              </div>
              <span className="ml-2 text-2xl font-bold text-gradient">
                Rubica
              </span>
            </Link>
          </div>

          {/* Search Bar - Desktop */}
          <div className="hidden md:flex flex-1 max-w-lg mx-8">
            <form onSubmit={handleSearch} className="w-full">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search services..."
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </form>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            <Link
              to="/listings"
              className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Browse Services
            </Link>

            {user ? (
              <>
                <Link
                  to="/create-listing"
                  className="btn-primary text-sm"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Post Service
                </Link>

                {/* User Menu */}
                <HeadlessMenu as="div" className="relative">
                  <HeadlessMenu.Button className="flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                    <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                      {user.profileImage ? (
                        <img
                          src={user.profileImage}
                          alt={user.fullName}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      ) : (
                        <User className="w-4 h-4 text-primary-600" />
                      )}
                    </div>
                  </HeadlessMenu.Button>

                  <Transition
                    enter="transition ease-out duration-100"
                    enterFrom="transform opacity-0 scale-95"
                    enterTo="transform opacity-100 scale-100"
                    leave="transition ease-in duration-75"
                    leaveFrom="transform opacity-100 scale-100"
                    leaveTo="transform opacity-0 scale-95"
                  >
                    <HeadlessMenu.Items className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5 focus:outline-none">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900">{user.fullName}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>

                      <HeadlessMenu.Item>
                        {({ active }) => (
                          <Link
                            to="/profile"
                            className={`${
                              active ? 'bg-gray-50' : ''
                            } flex items-center px-4 py-2 text-sm text-gray-700`}
                          >
                            <User className="w-4 h-4 mr-3" />
                            My Profile
                          </Link>
                        )}
                      </HeadlessMenu.Item>

                      <HeadlessMenu.Item>
                        {({ active }) => (
                          <Link
                            to="/profile?tab=listings"
                            className={`${
                              active ? 'bg-gray-50' : ''
                            } flex items-center px-4 py-2 text-sm text-gray-700`}
                          >
                            <MessageCircle className="w-4 h-4 mr-3" />
                            My Listings
                          </Link>
                        )}
                      </HeadlessMenu.Item>

                      <HeadlessMenu.Item>
                        {({ active }) => (
                          <Link
                            to="/profile?tab=favorites"
                            className={`${
                              active ? 'bg-gray-50' : ''
                            } flex items-center px-4 py-2 text-sm text-gray-700`}
                          >
                            <Heart className="w-4 h-4 mr-3" />
                            Favorites
                          </Link>
                        )}
                      </HeadlessMenu.Item>

                      <HeadlessMenu.Item>
                        {({ active }) => (
                          <Link
                            to="/profile?tab=settings"
                            className={`${
                              active ? 'bg-gray-50' : ''
                            } flex items-center px-4 py-2 text-sm text-gray-700`}
                          >
                            <Settings className="w-4 h-4 mr-3" />
                            Settings
                          </Link>
                        )}
                      </HeadlessMenu.Item>

                      {user.role === 'admin' && (
                        <HeadlessMenu.Item>
                          {({ active }) => (
                            <Link
                              to="/admin"
                              className={`${
                                active ? 'bg-gray-50' : ''
                              } flex items-center px-4 py-2 text-sm text-gray-700 border-t border-gray-100`}
                            >
                              <Settings className="w-4 h-4 mr-3" />
                              Admin Panel
                            </Link>
                          )}
                        </HeadlessMenu.Item>
                      )}

                      <HeadlessMenu.Item>
                        {({ active }) => (
                          <button
                            onClick={handleLogout}
                            className={`${
                              active ? 'bg-gray-50' : ''
                            } flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 border-t border-gray-100`}
                          >
                            <LogOut className="w-4 h-4 mr-3" />
                            Sign Out
                          </button>
                        )}
                      </HeadlessMenu.Item>
                    </HeadlessMenu.Items>
                  </Transition>
                </HeadlessMenu>
              </>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="btn-primary text-sm"
                >
                  Join Now
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500 p-2 rounded-md"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Mobile Search */}
        <div className="md:hidden pb-3">
          <form onSubmit={handleSearch}>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search services..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </form>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link
              to="/listings"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Browse Services
            </Link>

            {user ? (
              <>
                <Link
                  to="/create-listing"
                  className="block px-3 py-2 rounded-md text-base font-medium text-primary-600 hover:text-primary-700 hover:bg-primary-50"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Post Service
                </Link>
                <Link
                  to="/profile"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  My Profile
                </Link>
                {user.role === 'admin' && (
                  <Link
                    to="/admin"
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Admin Panel
                  </Link>
                )}
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="block px-3 py-2 rounded-md text-base font-medium text-primary-600 hover:text-primary-700 hover:bg-primary-50"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Join Now
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;