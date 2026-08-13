import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../store';
import { fetchDashboardStats, updateEnrollmentStatus } from '../store/enrollmentSlice';
import { Grid, Card, Text, Box, IndexTable, Badge, BlockStack, Spinner, InlineStack, Button } from '@shopify/polaris';

export default function Dashboard() {
  const dispatch = useDispatch<AppDispatch>();
  const { token, shop } = useSelector((state: RootState) => state.auth);
  const { dashboardStats, recentEnrollments, loading } = useSelector(
    (state: RootState) => state.enrollments
  );

  useEffect(() => {
    if (token && shop) {
      dispatch(fetchDashboardStats({ token, shop }));
    }
  }, [dispatch, token, shop]);

  if (loading && !dashboardStats) {
    return (
      <Box padding="1200" style={{ display: 'flex', justifyContent: 'center' }}>
        <Spinner accessibilityLabel="Loading dashboard statistics" size="large" />
      </Box>
    );
  }

  const stats = dashboardStats || {
    totalCourses: 0,
    totalStudents: 0,
    totalEnrollments: 0,
    completedEnrollments: 0,
    activeEnrollments: 0,
  };

  const resourceName = {
    singular: 'enrollment',
    plural: 'enrollments',
  };

  const handleToggleStatus = (id: string, currentStatus: 'In Progress' | 'Completed') => {
    if (!token || !shop) return;
    const newStatus = currentStatus === 'In Progress' ? 'Completed' : 'In Progress';
    dispatch(updateEnrollmentStatus({ id, enrollmentStatus: newStatus, token, shop })).then(() => {
      dispatch(fetchDashboardStats({ token, shop }));
    });
  };

  return (
    <BlockStack gap="500">
      <Text variant="headingLg" as="h2">
        Dashboard Overview
      </Text>

      {/* Metrics Grid */}
      <Grid>
        <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 4, lg: 4, xl: 4 }}>
          <Card>
            <BlockStack gap="200">
              <Text variant="headingXs" as="h3" tone="subdued">
                TOTAL COURSES
              </Text>
              <Text variant="heading2xl" as="p">
                {stats.totalCourses}
              </Text>
            </BlockStack>
          </Card>
        </Grid.Cell>

        <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 4, lg: 4, xl: 4 }}>
          <Card>
            <BlockStack gap="200">
              <Text variant="headingXs" as="h3" tone="subdued">
                TOTAL STUDENTS
              </Text>
              <Text variant="heading2xl" as="p">
                {stats.totalStudents}
              </Text>
            </BlockStack>
          </Card>
        </Grid.Cell>

        <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 4, lg: 4, xl: 4 }}>
          <Card>
            <BlockStack gap="200">
              <Text variant="headingXs" as="h3" tone="subdued">
                TOTAL ENROLLMENTS
              </Text>
              <Text variant="heading2xl" as="p">
                {stats.totalEnrollments}
              </Text>
            </BlockStack>
          </Card>
        </Grid.Cell>

        <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 6, lg: 6, xl: 6 }}>
          <Card>
            <InlineStack align="space-between" blockAlign="center">
              <BlockStack gap="100">
                <Text variant="headingXs" as="h3" tone="subdued">
                  ACTIVE ENROLLMENTS
                </Text>
                <Text variant="headingXl" as="p">
                  {stats.activeEnrollments}
                </Text>
              </BlockStack>
              <Badge tone="attention">In Progress</Badge>
            </InlineStack>
          </Card>
        </Grid.Cell>

        <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 6, lg: 6, xl: 6 }}>
          <Card>
            <InlineStack align="space-between" blockAlign="center">
              <BlockStack gap="100">
                <Text variant="headingXs" as="h3" tone="subdued">
                  COMPLETED COURSES
                </Text>
                <Text variant="headingXl" as="p">
                  {stats.completedEnrollments}
                </Text>
              </BlockStack>
              <Badge tone="success">Completed</Badge>
            </InlineStack>
          </Card>
        </Grid.Cell>
      </Grid>

      {/* Recent Enrollments Table */}
      <Card>
        <BlockStack gap="400">
          <Text variant="headingMd" as="h3">
            Recent Enrollments
          </Text>

          {recentEnrollments.length === 0 ? (
            <Box padding="400">
              <Text variant="bodyMd" as="p" tone="subdued">
                No recent enrollments found.
              </Text>
            </Box>
          ) : (
            <IndexTable
              resourceName={resourceName}
              itemCount={recentEnrollments.length}
              selectable={false}
              headings={[
                { title: 'Student' },
                { title: 'Course' },
                { title: 'Enrollment Date' },
                { title: 'Status' },
                { title: 'Action' },
              ]}
            >
              {recentEnrollments.map((enrollment, index) => {
                const dateString = new Date(enrollment.enrollmentDate).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                });

                return (
                  <IndexTable.Row id={enrollment.id} key={enrollment.id} position={index}>
                    <IndexTable.Cell>
                      <BlockStack gap="050">
                        <Text variant="bodyMd" fontWeight="semibold" as="span">
                          {enrollment.studentName}
                        </Text>
                        <Text variant="bodyXs" tone="subdued" as="span">
                          {enrollment.studentEmail}
                        </Text>
                      </BlockStack>
                    </IndexTable.Cell>
                    <IndexTable.Cell>
                      <Text variant="bodyMd" as="span">
                        {enrollment.courseTitle}
                      </Text>
                    </IndexTable.Cell>
                    <IndexTable.Cell>{dateString}</IndexTable.Cell>
                    <IndexTable.Cell>
                      <Badge tone={enrollment.enrollmentStatus === 'Completed' ? 'success' : 'attention'}>
                        {enrollment.enrollmentStatus}
                      </Badge>
                    </IndexTable.Cell>
                    <IndexTable.Cell>
                      <Button
                        size="slim"
                        onClick={() => handleToggleStatus(enrollment.id, enrollment.enrollmentStatus)}
                      >
                        Mark as {enrollment.enrollmentStatus === 'In Progress' ? 'Completed' : 'In Progress'}
                      </Button>
                    </IndexTable.Cell>
                  </IndexTable.Row>
                );
              })}
            </IndexTable>
          )}
        </BlockStack>
      </Card>
    </BlockStack>
  );
}
