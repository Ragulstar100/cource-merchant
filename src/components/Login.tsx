import { useState, useCallback } from 'react';
import { Page, Card, FormLayout, TextField, Button, Banner, Text, Box } from '@shopify/polaris';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../store';
import { clearError } from '../store/authSlice';

const API_URL = 'https://course-api-veiu.onrender.com';

export default function Login() {
  const dispatch = useDispatch<AppDispatch>();
  const { loading, error } = useSelector((state: RootState) => state.auth);
  const [shop, setShop] = useState('');

  const handleShopChange = useCallback((value: string) => setShop(value), []);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      dispatch(clearError());

      if (!shop) return;

      let shopDomain = shop.trim().toLowerCase();
      if (!shopDomain.includes('.')) {
        shopDomain = `${shopDomain}.myshopify.com`;
      }

      // Redirect browser window directly to backend initiating Shopify OAuth flow
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
    },
    [shop, dispatch]
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

              <Button submit variant="primary" loading={loading} fullWidth size="large">
                Login / Install with Shopify
              </Button>
            </FormLayout>
          </form>
        </Card>
      </Box>
    </Page>
  );
}
