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
} from '@shopify/polaris';
import { HomeIcon, ProductIcon, PersonIcon } from '@shopify/polaris-icons';
import enTranslations from '@shopify/polaris/locales/en.json';
import '@shopify/polaris/build/esm/styles.css';

// Components
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Courses from './components/Courses';
import Enrollments from './components/Enrollments';

const API_URL = 'https://course-api-veiu.onrender.com';

export default function App() {
  const dispatch = useDispatch<AppDispatch>();
  const { token, shop, merchant } = useSelector((state: RootState) => state.auth);

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

      // Clean up URL query parameters
      const cleanUrl = window.location.pathname;
      window.history.replaceState({}, document.title, cleanUrl);
    } else if (shopParam && (!token || shopParam !== shop)) {
      // Automatic find store & install/login initiation:
      // Redirect to initiate Shopify OAuth flow
      let shopDomain = shopParam.trim().toLowerCase();
      if (!shopDomain.includes('.')) {
        shopDomain = `${shopDomain}.myshopify.com`;
      }
      const authUrl = `${API_URL}/shopify/auth?shop=${encodeURIComponent(shopDomain)}`;
      
      // Redirect using top-level window if inside iframe to prevent 'refused to connect'
      try {
        if (window.top && window.top !== window) {
          window.top.location.href = authUrl;
        } else {
          window.location.href = authUrl;
        }
      } catch (e) {
        window.location.href = authUrl;
      }
    } else if (token) {
      dispatch(fetchMerchantProfile());
    }
  }, [dispatch, token, shop]);

  const displayName = merchant ? (merchant.shopOwner || merchant.name || merchant.shop) : '';
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
