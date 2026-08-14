import { useState, useCallback, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from './store';
import { logout, setAuth, fetchMerchantProfile } from './store/authSlice';
import {
  AppProvider,
  Frame,
  Navigation,
  TopBar,
  Page,
  Box,
  Card,
  Text,
} from '@shopify/polaris';
import { HomeIcon, ProductIcon, PersonIcon } from '@shopify/polaris-icons';
import enTranslations from '@shopify/polaris/locales/en.json';
import '@shopify/polaris/build/esm/styles.css';

// Components
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

  // Handle URL query parameters for Shopify OAuth completion redirect
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tokenParam = urlParams.get('token');
    const shopParam = urlParams.get('shop');

    if (tokenParam && shopParam) {
      dispatch(setAuth({ token: tokenParam, shop: shopParam }));
      dispatch(fetchMerchantProfile());
    } else if (token) {
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

  const renderFallback = () => {
    return (
      <Page narrowWidth>
        <Box paddingBlockStart="600" paddingBlockEnd="600">
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <Text variant="headingXl" as="h1">
              Merchant Portal
            </Text>
            <Text variant="bodyMd" as="p" tone="subdued">
              Please access this application from your Shopify Admin.
            </Text>
          </div>

          <Card>
            <Box padding="500">
              <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <Text variant="bodyMd" as="p">
                  This app is designed to run embedded inside your Shopify Admin dashboard.
                </Text>
                <Text variant="bodyMd" as="p" tone="subdued">
                  Log into your Shopify store and go to <strong>Apps</strong> &gt; <strong>Course Merchant</strong> to access your academy management portal.
                </Text>
              </div>
            </Box>
          </Card>
        </Box>
      </Page>
    );
  };

  return (
    <AppProvider i18n={enTranslations}>
      {!token ? (
        <div style={{ backgroundColor: '#f6f6f7', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {renderFallback()}
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
