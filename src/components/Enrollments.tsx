import { useEffect, useState, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../store';
import {
  fetchEnrollments,
  fetchStudents,
  updateEnrollmentStatus,
  deleteEnrollment,
  adminEnrollStudent,
} from '../store/enrollmentSlice';
import { fetchCourses } from '../store/courseSlice';
import {
  Card,
  Text,
  IndexTable,
  Button,
  InlineStack,
  Badge,
  Spinner,
  Box,
  Select,
  BlockStack,
  Modal,
  FormLayout,
  Banner,
} from '@shopify/polaris';

export default function Enrollments() {
  const dispatch = useDispatch<AppDispatch>();
  const { token, shop } = useSelector((state: RootState) => state.auth);
  const { enrollments, students, loading } = useSelector((state: RootState) => state.enrollments);
  const { courses } = useSelector((state: RootState) => state.courses);

  const [selectedCourseFilter, setSelectedCourseFilter] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    if (token && shop) {
      dispatch(fetchEnrollments({ token, shop }));
      dispatch(fetchStudents({ token, shop }));
      dispatch(fetchCourses(shop));
    }
  }, [dispatch, token, shop]);

  const handleToggleStatus = useCallback((id: string, currentStatus: 'In Progress' | 'Completed') => {
    if (!token || !shop) return;
    const newStatus = currentStatus === 'In Progress' ? 'Completed' : 'In Progress';
    dispatch(updateEnrollmentStatus({ id, enrollmentStatus: newStatus, token, shop }));
  }, [token, shop, dispatch]);

  const handleDelete = useCallback((id: string) => {
    if (window.confirm('Are you sure you want to unenroll this student?') && token && shop) {
      dispatch(deleteEnrollment({ id, token, shop }));
    }
  }, [token, shop, dispatch]);

  // Course filter options
  const courseFilterOptions = useMemo(() => {
    const options = [{ label: 'All Courses', value: 'all' }];
    courses.forEach((c) => {
      options.push({ label: c.courseTitle, value: c.id });
    });
    return options;
  }, [courses]);

  // Student options for enrollment modal
  const studentOptions = useMemo(() => {
    const options = [{ label: 'Select Student', value: '' }];
    students.forEach((s) => {
      options.push({ label: `${s.studentName} (${s.email})`, value: s.id });
    });
    return options;
  }, [students]);

  // Course options for enrollment modal
  const courseOptions = useMemo(() => {
    const options = [{ label: 'Select Course', value: '' }];
    courses.forEach((c) => {
      options.push({ label: c.courseTitle, value: c.id });
    });
    return options;
  }, [courses]);

  const filteredEnrollments = useMemo(() => {
    if (selectedCourseFilter === 'all') return enrollments;
    return enrollments.filter((e) => e.courseId === selectedCourseFilter);
  }, [enrollments, selectedCourseFilter]);

  const openEnrollModal = useCallback(() => {
    setSelectedStudent('');
    setSelectedCourse('');
    setLocalError(null);
    setModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setModalOpen(false);
  }, []);

  const handleEnrollSubmit = useCallback(() => {
    if (!token || !shop || !selectedStudent || !selectedCourse) return;

    dispatch(
      adminEnrollStudent({
        studentId: selectedStudent,
        courseId: selectedCourse,
        token,
        shop,
      })
    )
      .unwrap()
      .then(() => {
        dispatch(fetchEnrollments({ token, shop }));
        setModalOpen(false);
      })
      .catch((err) => {
        setLocalError(err || 'Failed to enroll student');
      });
  }, [selectedStudent, selectedCourse, token, shop, dispatch]);

  const resourceName = {
    singular: 'enrollment',
    plural: 'enrollments',
  };

  return (
    <BlockStack gap="500">
      <InlineStack align="space-between" blockAlign="center">
        <Text variant="headingLg" as="h2">
          Course Enrollments
        </Text>
        <Button variant="primary" onClick={openEnrollModal}>
          Enroll Student
        </Button>
      </InlineStack>

      <Card>
        <BlockStack gap="400">
          <InlineStack align="start" blockAlign="center" gap="300">
            <div style={{ minWidth: '240px' }}>
              <Select
                label="Filter by Course"
                labelHidden
                options={courseFilterOptions}
                onChange={(val) => setSelectedCourseFilter(val)}
                value={selectedCourseFilter}
              />
            </div>
            <Text variant="bodyMd" as="span" tone="subdued">
              Showing {filteredEnrollments.length} enrollment(s)
            </Text>
          </InlineStack>

          {loading && enrollments.length === 0 ? (
            <Box padding="1200">
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <Spinner accessibilityLabel="Loading enrollments" size="large" />
              </div>
            </Box>
          ) : filteredEnrollments.length === 0 ? (
            <Box padding="1200">
              <div style={{ textAlign: 'center' }}>
                <Text variant="bodyLg" as="p" tone="subdued">
                  No enrollments found for this selection.
                </Text>
              </div>
            </Box>
          ) : (
            <IndexTable
              resourceName={resourceName}
              itemCount={filteredEnrollments.length}
              selectable={false}
              headings={[
                { title: 'Student' },
                { title: 'Course' },
                { title: 'Enrollment Date' },
                { title: 'Status' },
                { title: 'Actions' },
              ]}
            >
              {filteredEnrollments.map((enrollment, index) => {
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
                      <Badge size="small">
                        {enrollment.category}
                      </Badge>
                    </IndexTable.Cell>
                    <IndexTable.Cell>{dateString}</IndexTable.Cell>
                    <IndexTable.Cell>
                      <Badge tone={enrollment.enrollmentStatus === 'Completed' ? 'success' : 'attention'}>
                        {enrollment.enrollmentStatus}
                      </Badge>
                    </IndexTable.Cell>
                    <IndexTable.Cell>
                      <InlineStack gap="200">
                        <Button
                          size="slim"
                          onClick={() => handleToggleStatus(enrollment.id, enrollment.enrollmentStatus)}
                        >
                          Mark as {enrollment.enrollmentStatus === 'In Progress' ? 'Completed' : 'In Progress'}
                        </Button>
                        <Button
                          size="slim"
                          tone="critical"
                          onClick={() => handleDelete(enrollment.id)}
                        >
                          Unenroll
                        </Button>
                      </InlineStack>
                    </IndexTable.Cell>
                  </IndexTable.Row>
                );
              })}
            </IndexTable>
          )}
        </BlockStack>
      </Card>

      {/* Manual Enroll Modal */}
      <Modal
        open={modalOpen}
        onClose={handleCloseModal}
        title="Enroll Student in Course"
        primaryAction={{
          content: 'Enroll',
          onAction: handleEnrollSubmit,
          disabled: !selectedStudent || !selectedCourse,
        }}
        secondaryActions={[
          {
            content: 'Cancel',
            onAction: handleCloseModal,
          },
        ]}
      >
        <Modal.Section>
          <FormLayout>
            {localError && (
              <Banner tone="critical" onDismiss={() => setLocalError(null)}>
                <p>{localError}</p>
              </Banner>
            )}

            <Select
              label="Select Student"
              options={studentOptions}
              onChange={(val) => setSelectedStudent(val)}
              value={selectedStudent}
              requiredIndicator
            />

            <Select
              label="Select Course"
              options={courseOptions}
              onChange={(val) => setSelectedCourse(val)}
              value={selectedCourse}
              requiredIndicator
            />
          </FormLayout>
        </Modal.Section>
      </Modal>
    </BlockStack>
  );
}
