'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from './ThemeToggle';
import NotificationCenter from './NotificationCenter';

/**
 * Dashboard layout with collapsible sidebar and header
 * Requirements: 164.1, 164.2, 164.3, 164.4, 164.5
 */
export default function DashboardLayout({ children }) {
  const router = useRouter();
  const { user, logout, isAuthenticated, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileBtnRef = useRef(null);
  const profileDropdownRef = useRef(null);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, loading, router]);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setProfileMenuOpen(false);
  }, [router.pathname]);

  // Close profile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuOpen && !event.target.closest('.profile-menu-container')) {
        setProfileMenuOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [profileMenuOpen]);

  // FM-02 / KN-02: keyboard nav for profile dropdown (ArrowDown/Up/Escape)
  useEffect(() => {
    if (!profileMenuOpen || !profileDropdownRef.current) return;

    // Move focus to first item when dropdown opens
    const firstItem = profileDropdownRef.current.querySelector(
      'a, button:not(:disabled)'
    );
    firstItem?.focus();

    const handleKeyDown = (e) => {
      const items = Array.from(
        profileDropdownRef.current?.querySelectorAll('a, button:not(:disabled)') ?? []
      );
      const idx = items.indexOf(document.activeElement);

      if (e.key === 'Escape') {
        setProfileMenuOpen(false);
        profileBtnRef.current?.focus();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        items[(idx + 1) % items.length]?.focus();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        items[(idx - 1 + items.length) % items.length]?.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [profileMenuOpen]);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const toggleProfileMenu = () => {
    setProfileMenuOpen(!profileMenuOpen);
  };

  // Navigation links
  const navLinks = [
    { href: '/dashboard', label: 'Dashboard', icon: '📊' },
    { href: '/leaderboard', label: 'Leaderboard', icon: '🏆' },
    { href: '/rewards', label: 'Rewards', icon: '🎁' },
    { href: '/history', label: 'History', icon: '📜' },
    { href: '/referral', label: 'Referral', icon: '👥', tourId: 'referral-link' },
    { href: '/analytics', label: 'Analytics', icon: '📊' },
    { href: '/settings', label: 'Settings', icon: '⚙️' },
    { href: '/help', label: 'Help Center', icon: '❓' },
  ];

  // Get page title from current route
  const getPageTitle = () => {
    const currentLink = navLinks.find(link => link.href === router.pathname);
    return currentLink ? currentLink.label : 'Dashboard';
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'sidebar-open' : 'sidebar-collapsed'} ${mobileMenuOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-header">
          <Link href="/dashboard" className="sidebar-logo">
            {/* SR-04: aria-hidden on decorative icon */}
            <span className="logo-icon" aria-hidden="true">⭐</span>
            {sidebarOpen && <span className="logo-text">NovaRewards</span>}
          </Link>
          <button
            className="sidebar-toggle desktop-only"
            onClick={toggleSidebar}
            aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          >
            {sidebarOpen ? '◀' : '▶'}
          </button>
        </div>

        <nav className="sidebar-nav" aria-label="Main navigation">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`nav-link ${router.pathname === link.href ? 'nav-link-active' : ''}`}
              {...(link.tourId ? { 'data-tour': link.tourId } : {})}
              /* SR-04: when collapsed, provide accessible label via aria-label */
              aria-label={!sidebarOpen ? link.label : undefined}
              aria-current={router.pathname === link.href ? 'page' : undefined}
            >
              {/* SR-04: aria-hidden on emoji icons so screen readers use the link label */}
              <span className="nav-icon" aria-hidden="true">{link.icon}</span>
              {sidebarOpen && <span className="nav-label">{link.label}</span>}
            </Link>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button
            className="btn btn-secondary btn-full"
            onClick={handleLogout}
          >
            <span className="nav-icon" aria-hidden="true">🚪</span>
            {sidebarOpen && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Mobile overlay — FM-05: aria-hidden main content when sidebar open */}
      {mobileMenuOpen && (
        <div
          className="mobile-overlay"
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Main content area — FM-05: aria-hidden when mobile sidebar is open */}
      <div
        className={`main-wrapper ${sidebarOpen ? '' : 'sidebar-collapsed'}`}
        aria-hidden={mobileMenuOpen ? 'true' : undefined}
        inert={mobileMenuOpen ? '' : undefined}
      >
        {/* Header */}
        <header className="header">
          <div className="header-left">
            <button
              className="mobile-menu-btn mobile-only"
              onClick={toggleMobileMenu}
              aria-label="Toggle menu"
              aria-expanded={mobileMenuOpen}
            >
              ☰
            </button>
            <h1 className="page-title">{getPageTitle()}</h1>
          </div>

          <div className="header-right">
            {/* Theme toggle */}
            <ThemeToggle />

            {/* Notification centre */}
            <NotificationCenter />

            {/* User profile menu */}
            <div className="profile-menu-container">
              <button
                ref={profileBtnRef}
                className="profile-btn"
                onClick={toggleProfileMenu}
                aria-label="User menu"
                aria-expanded={profileMenuOpen}
                aria-haspopup="menu"
              >
                <div className="user-avatar" aria-hidden="true">
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <span className="user-name desktop-only">{user?.name || 'User'}</span>
                <span className="dropdown-arrow" aria-hidden="true">▼</span>
              </button>

              {profileMenuOpen && (
                <div
                  ref={profileDropdownRef}
                  className="profile-dropdown"
                  role="menu"
                  aria-label="User menu"
                >
                  <div className="profile-dropdown-header" role="presentation">
                    <div className="user-avatar-large" aria-hidden="true">
                      {user?.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div className="user-info">
                      <p className="user-name">{user?.name || 'User'}</p>
                      <p className="user-email">{user?.email || ''}</p>
                    </div>
                  </div>
                  <div className="profile-dropdown-divider" role="separator" />
                  <Link href="/settings" className="profile-dropdown-item" role="menuitem">
                    <span aria-hidden="true">⚙️</span> Settings
                  </Link>
                  <button
                    className="profile-dropdown-item"
                    role="menuitem"
                    onClick={handleLogout}
                  >
                    <span aria-hidden="true">🚪</span> Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="main-content">
          {children}
        </main>
      </div>

      {/* Bottom navigation — mobile only */}
      <BottomNav />
    </div>
  );
}
