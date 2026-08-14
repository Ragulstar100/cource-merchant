import { Page, Card, Text, Box } from '@shopify/polaris';

export default function Login() {
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
}
