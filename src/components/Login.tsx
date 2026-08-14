import { useState, useCallback } from 'react';
import { Page, Card, FormLayout, TextField, Button, Banner, Text, Box } from '@shopify/polaris';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '../store';
import { clearError, shopifyAutoLogin } from '../store/authSlice';

const API_URL = 'https://course-api-veiu.onrender.com';

export default function Login() {
  const dispatch = useDispatch<AppDispatch>();
  const { error, loading } = useSelector((state: RootState) => state.auth);
  
  const [shop, setShop] = useState(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const shopParam = urlParams.get('shop');
    if (shopParam) return shopParam;
    
    const savedShop = localStorage.getItem('merchant_shop');
    if (savedShop) return savedShop;
    
    return 'quickstart-shop.myshopify.com';
  });

  const handleShopChange = useCallback((value: string) => setShop(value), []);

  let shopDomain = shop.trim().toLowerCase();
  if (shopDomain && !shopDomain.includes('.')) {
    shopDomain = `${shopDomain}.myshopify.com`;
  }

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!shopDomain) return;
      dispatch(shopifyAutoLogin(shopDomain))
        .unwrap()
        .catch(() => {
          // If auto-login fails (app not installed/unauthorized), redirect to initiate OAuth installation
          const authUrl = `${API_URL}/shopify/auth?shop=${encodeURIComponent(shopDomain)}`;
          if (window.top) {
            window.top.location.href = authUrl;
          } else {
            window.location.href = authUrl;
          }
        });
    },
    [dispatch, shopDomain]
  );

  return (
    <Page narrowWidth>
      <Box paddingBlockStart="300" paddingBlockEnd="600">
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <Text variant="headingXl" as="h1">
            Merchant Portal
          </Text>
          <Text variant="bodyMd" as="p" tone="subdued">
            Log in or install the application using your Shopify store domain
          </Text>
        </div>

        <Card>
          <form onSubmit={handleSubmit}>
            <FormLayout>
              {error && (
                <Banner tone="critical" onDismiss={() => dispatch(clearError())}>
                  <p>{error}</p>
                </Banner>
              )}

              <TextField
                label="Shop Domain"
                value={shop}
                onChange={handleShopChange}
                autoComplete="off"
                placeholder="quickstart-shop.myshopify.com"
                helpText="Enter your Shopify store domain name (e.g. storename.myshopify.com)."
                requiredIndicator
              />

              <Button submit variant="primary" fullWidth size="large" loading={loading}>
                Login & Manage Courses
              </Button>
            </FormLayout>
          </form>
        </Card>
      </Box>
    </Page>
  );
}
