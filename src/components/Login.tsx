import { useState, useCallback, useEffect } from 'react';
import { Page, Card, FormLayout, TextField, Button, Banner, Text, Box } from '@shopify/polaris';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../store';
import { clearError } from '../store/authSlice';

const API_URL = 'http://localhost:1000';

export default function Login() {
  const dispatch = useDispatch();
  const { error } = useSelector((state: RootState) => state.auth);
  const [shop, setShop] = useState('');

  const handleShopChange = useCallback((value: string) => setShop(value), []);

  // Pre-populate shop from window.location.search if present
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const shopParam = urlParams.get('shop');
    if (shopParam) {
      setShop(shopParam);
    }
  }, []);

  let shopDomain = shop.trim().toLowerCase();
  if (shopDomain && !shopDomain.includes('.')) {
    shopDomain = `${shopDomain}.myshopify.com`;
  }

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
          <form action={`${API_URL}/shopify/auth`} method="GET" target="_top">
            <input type="hidden" name="shop" value={shopDomain} />
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

              <Button submit variant="primary" fullWidth size="large">
                Login / Install with Shopify
              </Button>
            </FormLayout>
          </form>
        </Card>
      </Box>
    </Page>
  );
}
