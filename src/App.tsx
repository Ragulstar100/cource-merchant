import { useState, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from './store';
import { logout } from './store/authSlice';
import {
  AppProvider,
  Frame,
  Navigation,
  TopBar,
  Page,
  Box,
} from '@shopify/polaris';
import { HomeIcon, ProductIcon, PersonIcon } from '@shopify/polaris-icons';
import enTranslations from '@shopify/polaris/locales/en.json';
import '@shopify/polaris/build/esm/styles.css';

// Components
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Courses from './components/Courses';
import Enrollments from './components/Enrollments';

export default function App() {
  const dispatch = useDispatch<AppDispatch>();
  const { token, merchant } = useSelector((state: RootState) => state.auth);

  // Simple routing state: 'dashboard' | 'courses' | 'enrollments'
  const [activeTab, setActiveTab] = useState<'dashboard' | 'courses' | 'enrollments'>('dashboard');
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const toggleUserMenu = useCallback(() => setUserMenuOpen((open) => !open), []);
  const handleLogout = useCallback(() => {
    dispatch(logout());
  }, [dispatch]);

  const userMenuMarkup = merchant ? (
    <TopBar.UserMenu
      actions={[
        {
          items: [{ content: 'Log out', onAction: handleLogout }],
        },
      ]}
      name={merchant.name || merchant.username}
      detail={merchant.shop}
      initials={merchant.username.substring(0, 2).toUpperCase()}
      open={userMenuOpen}
      onToggle={toggleUserMenu}
    />
  ) : null;

  const topBarMarkup = (
    <TopBar
      showNavigationToggle
      userMenu={userMenuMarkup}
    />
  );

  const navigationMarkup = (
    <Navigation location="/">
      <Navigation.Section
        items={[
          {
            label: 'Dashboard',
            icon: HomeIcon,
            selected: activeTab === 'dashboard',
            onClick: () => setActiveTab('dashboard'),
          },
          {
            label: 'Courses',
            icon: ProductIcon,
            selected: activeTab === 'courses',
            onClick: () => setActiveTab('courses'),
          },
          {
            label: 'Enrollments',
            icon: PersonIcon,
            selected: activeTab === 'enrollments',
            onClick: () => setActiveTab('enrollments'),
          },
        ]}
      />
    </Navigation>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'courses':
        return <Courses />;
      case 'enrollments':
        return <Enrollments />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <AppProvider i18n={enTranslations}>
      {!token ? (
        <div style={{ backgroundColor: '#f6f6f7', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Login />
        </div>
      ) : (
        <Frame
          topBar={topBarMarkup}
          navigation={navigationMarkup}
        >
          <Page>
            <Box paddingBlockStart="400" paddingBlockEnd="400">
              {renderContent()}
            </Box>
          </Page>
        </Frame>
      )}
    </AppProvider>
  );
}
