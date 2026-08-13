import { useState, useCallback } from 'react';
import { Page, Card, FormLayout, TextField, Button, Banner, Link, Text, Box } from '@shopify/polaris';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../store';
import { loginMerchant, registerMerchant, clearError } from '../store/authSlice';

export default function Login() {
  const dispatch = useDispatch<AppDispatch>();
  const { loading, error } = useSelector((state: RootState) => state.auth);

  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [shop, setShop] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const handleUsernameChange = useCallback((value: string) => setUsername(value), []);
  const handlePasswordChange = useCallback((value: string) => setPassword(value), []);
  const handleShopChange = useCallback((value: string) => setShop(value), []);
  const handleNameChange = useCallback((value: string) => setName(value), []);
  const handleEmailChange = useCallback((value: string) => setEmail(value), []);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      dispatch(clearError());

      if (isRegisterMode) {
        if (!shop || !username || !password) return;
        dispatch(
          registerMerchant({
            shop,
            username,
            password,
            name: name || undefined,
            email: email || undefined,
          })
        );
      } else {
        if (!username || !password) return;
        dispatch(loginMerchant({ username, password }));
      }
    },
    [isRegisterMode, username, password, shop, name, email, dispatch]
  );

  const toggleMode = useCallback(() => {
    setIsRegisterMode((mode) => !mode);
    dispatch(clearError());
  }, [dispatch]);

  return (
    <Page narrowWidth>
      <Box paddingBlockStart="300" paddingBlockEnd="600">
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <Text variant="headingXl" as="h1">
            Merchant Portal
          </Text>
          <Text variant="bodyMd" as="p" tone="subdued">
            {isRegisterMode
              ? 'Register your Shopify store and create your admin account'
              : 'Log in to manage your academy, courses, and students'}
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

              {isRegisterMode && (
                <TextField
                  label="Shop Domain"
                  value={shop}
                  onChange={handleShopChange}
                  autoComplete="off"
                  placeholder="quickstart-shop.myshopify.com"
                  helpText="Enter your shopify store domain name."
                  requiredIndicator
                />
              )}

              <TextField
                label="Username"
                value={username}
                onChange={handleUsernameChange}
                autoComplete="username"
                placeholder="e.g. admin"
                requiredIndicator
              />

              <TextField
                label="Password"
                type="password"
                value={password}
                onChange={handlePasswordChange}
                autoComplete="current-password"
                placeholder="••••••••"
                requiredIndicator
              />

              {isRegisterMode && (
                <>
                  <TextField
                    label="Merchant Name"
                    value={name}
                    onChange={handleNameChange}
                    autoComplete="name"
                    placeholder="e.g. Acme Academy"
                  />

                  <TextField
                    label="Email Address"
                    type="email"
                    value={email}
                    onChange={handleEmailChange}
                    autoComplete="email"
                    placeholder="e.g. admin@acme.com"
                  />
                </>
              )}

              <Button submit variant="primary" loading={loading} fullWidth size="large">
                {isRegisterMode ? 'Register Store' : 'Log In'}
              </Button>
            </FormLayout>
          </form>

          <Box paddingBlockStart="400" style={{ textAlign: 'center' }}>
            <Text variant="bodyMd" as="span">
              {isRegisterMode ? 'Already have an account? ' : "New here? "}
              <Link onClick={toggleMode}>
                {isRegisterMode ? 'Sign In' : 'Register your store'}
              </Link>
            </Text>
          </Box>
        </Card>
      </Box>
    </Page>
  );
}
