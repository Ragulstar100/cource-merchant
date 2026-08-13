import { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../store';
import { fetchCourses, addCourse, editCourse, deleteCourse } from '../store/courseSlice';
import type { Course } from '../store/courseSlice';
import {
  Card,
  Text,
  IndexTable,
  Button,
  InlineStack,
  Badge,
  Spinner,
  Box,
  Modal,
  FormLayout,
  TextField,
  Select,
  BlockStack,
  Banner,
} from '@shopify/polaris';

export default function Courses() {
  const dispatch = useDispatch<AppDispatch>();
  const { token, shop } = useSelector((state: RootState) => state.auth);
  const { courses, loading, error } = useSelector((state: RootState) => state.courses);

  // Form / Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentId, setCurrentId] = useState<string | null>(null);

  // Form Fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [instructor, setInstructor] = useState('');
  const [category, setCategory] = useState('');
  const [duration, setDuration] = useState('');
  const [status, setStatus] = useState<'Active' | 'Inactive'>('Active');
  const [productId, setProductId] = useState('');

  // Fetch courses on load
  useEffect(() => {
    if (shop) {
      dispatch(fetchCourses(shop));
    }
  }, [dispatch, shop]);

  const openAddModal = useCallback(() => {
    setEditMode(false);
    setCurrentId(null);
    setTitle('');
    setDescription('');
    setInstructor('');
    setCategory('');
    setDuration('');
    setStatus('Active');
    setProductId('');
    setModalOpen(true);
  }, []);

  const openEditModal = useCallback((course: Course) => {
    setEditMode(true);
    setCurrentId(course.id);
    setTitle(course.courseTitle);
    setDescription(course.description);
    setInstructor(course.instructorName);
    setCategory(course.category);
    setDuration(course.duration);
    setStatus(course.courseStatus);
    setProductId(course.shopifyProductId || '');
    setModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setModalOpen(false);
  }, []);

  const handleSubmit = useCallback(() => {
    if (!token || !shop || !title || !description || !instructor || !category || !duration) {
      return;
    }

    const coursePayload = {
      courseTitle: title,
      description,
      instructorName: instructor,
      category,
      duration,
      courseStatus: status,
      shopifyProductId: productId || null,
    };

    if (editMode && currentId) {
      dispatch(editCourse({ id: currentId, course: coursePayload, token, shop })).then((res) => {
        if (!res.hasOwnProperty('error')) setModalOpen(false);
      });
    } else {
      dispatch(addCourse({ course: coursePayload, token, shop })).then((res) => {
        if (!res.hasOwnProperty('error')) setModalOpen(false);
      });
    }
  }, [editMode, currentId, title, description, instructor, category, duration, status, productId, token, shop, dispatch]);

  const handleDelete = useCallback((id: string) => {
    if (window.confirm('Are you sure you want to delete this course?') && token && shop) {
      dispatch(deleteCourse({ id, token, shop }));
    }
  }, [token, shop, dispatch]);

  const resourceName = {
    singular: 'course',
    plural: 'courses',
  };

  const statusOptions = [
    { label: 'Active', value: 'Active' },
    { label: 'Inactive', value: 'Inactive' },
  ];

  return (
    <BlockStack gap="500">
      <InlineStack align="space-between" blockAlign="center">
        <Text variant="headingLg" as="h2">
          Academy Courses
        </Text>
        <Button variant="primary" onClick={openAddModal}>
          Add Course
        </Button>
      </InlineStack>

      {error && (
        <Banner tone="critical">
          <p>{error}</p>
        </Banner>
      )}

      <Card>
        {loading && courses.length === 0 ? (
          <Box padding="1200">
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <Spinner accessibilityLabel="Loading courses" size="large" />
            </div>
          </Box>
        ) : courses.length === 0 ? (
          <Box padding="1200">
            <div style={{ textAlign: 'center' }}>
              <Text variant="bodyLg" as="p" tone="subdued">
                No courses found. Click "Add Course" to create your first course.
              </Text>
            </div>
          </Box>
        ) : (
          <IndexTable
            resourceName={resourceName}
            itemCount={courses.length}
            selectable={false}
            headings={[
              { title: 'Title' },
              { title: 'Instructor' },
              { title: 'Category' },
              { title: 'Duration' },
              { title: 'Status' },
              { title: 'Shopify Product ID' },
              { title: 'Actions' },
            ]}
          >
            {courses.map((course, index) => (
              <IndexTable.Row id={course.id} key={course.id} position={index}>
                <IndexTable.Cell>
                  <BlockStack gap="050">
                    <Text variant="bodyMd" fontWeight="semibold" as="span">
                      {course.courseTitle}
                    </Text>
                    <span style={{ maxWidth: '300px', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      <Text variant="bodyXs" tone="subdued" as="span">
                        {course.description}
                      </Text>
                    </span>
                  </BlockStack>
                </IndexTable.Cell>
                <IndexTable.Cell>{course.instructorName}</IndexTable.Cell>
                <IndexTable.Cell>{course.category}</IndexTable.Cell>
                <IndexTable.Cell>{course.duration}</IndexTable.Cell>
                <IndexTable.Cell>
                  <Badge tone={course.courseStatus === 'Active' ? 'success' : 'critical'}>
                    {course.courseStatus}
                  </Badge>
                </IndexTable.Cell>
                <IndexTable.Cell>
                  <Text variant="bodyMd" as="span" tone={course.shopifyProductId ? undefined : 'subdued'}>
                    {course.shopifyProductId || 'None'}
                  </Text>
                </IndexTable.Cell>
                <IndexTable.Cell>
                  <InlineStack gap="200">
                    <Button size="slim" onClick={() => openEditModal(course)}>
                      Edit
                    </Button>
                    <Button size="slim" tone="critical" onClick={() => handleDelete(course.id)}>
                      Delete
                    </Button>
                  </InlineStack>
                </IndexTable.Cell>
              </IndexTable.Row>
            ))}
          </IndexTable>
        )}
      </Card>

      {/* Add / Edit Modal */}
      <Modal
        open={modalOpen}
        onClose={handleCloseModal}
        title={editMode ? 'Edit Course' : 'Add New Course'}
        primaryAction={{
          content: editMode ? 'Save Changes' : 'Create Course',
          onAction: handleSubmit,
          loading: loading,
          disabled: !title || !description || !instructor || !category || !duration,
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
            <TextField
              label="Course Title"
              value={title}
              onChange={(v) => setTitle(v)}
              autoComplete="off"
              placeholder="e.g. Introduction to TypeScript"
              requiredIndicator
            />
            <TextField
              label="Description"
              value={description}
              onChange={(v) => setDescription(v)}
              multiline={3}
              autoComplete="off"
              placeholder="Provide a detailed description of course objectives and content."
              requiredIndicator
            />
            <FormLayout.Group>
              <TextField
                label="Instructor Name"
                value={instructor}
                onChange={(v) => setInstructor(v)}
                autoComplete="name"
                placeholder="e.g. John Doe"
                requiredIndicator
              />
              <TextField
                label="Category"
                value={category}
                onChange={(v) => setCategory(v)}
                autoComplete="off"
                placeholder="e.g. Programming, Business"
                requiredIndicator
              />
            </FormLayout.Group>
            <FormLayout.Group>
              <TextField
                label="Duration"
                value={duration}
                onChange={(v) => setDuration(v)}
                autoComplete="off"
                placeholder="e.g. 6 weeks, 12 hours"
                requiredIndicator
              />
              <Select
                label="Status"
                options={statusOptions}
                onChange={(v) => setStatus(v as 'Active' | 'Inactive')}
                value={status}
              />
            </FormLayout.Group>
            <TextField
              label="Shopify Product ID (Optional)"
              value={productId}
              onChange={(v) => setProductId(v)}
              autoComplete="off"
              placeholder="e.g. gid://shopify/Product/123456789"
              helpText="Link this course to a specific Shopify product for automated purchases."
            />
          </FormLayout>
        </Modal.Section>
      </Modal>
    </BlockStack>
  );
}
