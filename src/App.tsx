import { useState, useCallback, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from './store';
import { logout, setAuth, fetchMerchantProfile, shopifyAutoLogin } from './store/authSlice';
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

  // Handle URL query parameters for Shopify OAuth completion redirect, or trigger auto-login
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tokenParam = urlParams.get('token');
    const shopParam = urlParams.get('shop');

    if (tokenParam && shopParam) {
      dispatch(setAuth({ token: tokenParam, shop: shopParam }));
      dispatch(fetchMerchantProfile());
    } else if (shopParam && !token) {
      // Automatically log in by communicating with the local backend using shopifyAutoLogin
      dispatch(shopifyAutoLogin(shopParam));
    } else if (!token) {
      // If we have a saved shop domain from a previous installation/login, log in automatically
      const savedShop = localStorage.getItem('merchant_shop');
      if (savedShop) {
        dispatch(shopifyAutoLogin(savedShop));
      }
    } else {
      dispatch(fetchMerchantProfile());
    }
  }, [dispatch, token]);

  const displayName = merchant ? (merchant.shopOwner || merchant.name || merchant.username || merchant.shop) : '';
  const initials = displayName ? displayName.substring(0, 2).toUpperCase() : 'ME';

  const userMenuMarkup = merchant ? (
    <TopBar.UserMenu
      actions={[
        {
          items: [{ content: 'Log out', onAction: handleLogout }],
        },
      ]}
      name={displayName}
      detail={merchant.shop}
      initials={initials}
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
