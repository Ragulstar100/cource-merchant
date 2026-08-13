import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';

const API_URL = 'http://localhost:1000';

export interface Course {
  id: string;
  courseTitle: string;
  description: string;
  instructorName: string;
  category: string;
  duration: string;
  courseStatus: 'Active' | 'Inactive';
  shopifyProductId: string | null;
  shop: string;
  createdDate: string;
}

export interface CourseState {
  courses: Course[];
  loading: boolean;
  error: string | null;
}

const initialState: CourseState = {
  courses: [],
  loading: false,
  error: null,
};

interface HeadersInit {
  [key: string]: string;
}

// Fetch all courses for the shop
export const fetchCourses = createAsyncThunk(
  'courses/fetchCourses',
  async (shop: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}/courses?shop=${encodeURIComponent(shop)}`);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch courses');
      }
      return data as Course[];
    } catch (err: any) {
      return rejectWithValue(err.message || 'Server error fetching courses');
    }
  }
);

// Add a new course
export const addCourse = createAsyncThunk(
  'courses/addCourse',
  async (
    payload: {
      course: Omit<Course, 'id' | 'shop' | 'createdDate'>;
      token: string;
      shop: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await fetch(`${API_URL}/courses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${payload.token}`,
          'X-Shop-Domain': payload.shop,
        } as HeadersInit,
        body: JSON.stringify(payload.course),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || data.details || 'Failed to create course');
      }
      return data.course as Course;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Server error creating course');
    }
  }
);

// Update an existing course
export const editCourse = createAsyncThunk(
  'courses/editCourse',
  async (
    payload: {
      id: string;
      course: Partial<Omit<Course, 'id' | 'shop' | 'createdDate'>>;
      token: string;
      shop: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await fetch(`${API_URL}/courses/${payload.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${payload.token}`,
          'X-Shop-Domain': payload.shop,
        } as HeadersInit,
        body: JSON.stringify(payload.course),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || data.details || 'Failed to update course');
      }
      return data.course as Course;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Server error updating course');
    }
  }
);

// Delete a course
export const deleteCourse = createAsyncThunk(
  'courses/deleteCourse',
  async (
    payload: {
      id: string;
      token: string;
      shop: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await fetch(`${API_URL}/courses/${payload.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${payload.token}`,
          'X-Shop-Domain': payload.shop,
        } as HeadersInit,
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete course');
      }
      return payload.id;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Server error deleting course');
    }
  }
);

const courseSlice = createSlice({
  name: 'courses',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch Courses
      .addCase(fetchCourses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCourses.fulfilled, (state, action: PayloadAction<Course[]>) => {
        state.loading = false;
        state.courses = action.payload;
      })
      .addCase(fetchCourses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Add Course
      .addCase(addCourse.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addCourse.fulfilled, (state, action: PayloadAction<Course>) => {
        state.loading = false;
        state.courses.unshift(action.payload);
      })
      .addCase(addCourse.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Edit Course
      .addCase(editCourse.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(editCourse.fulfilled, (state, action: PayloadAction<Course>) => {
        state.loading = false;
        const index = state.courses.findIndex((c) => c.id === action.payload.id);
        if (index !== -1) {
          state.courses[index] = action.payload;
        }
      })
      .addCase(editCourse.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Delete Course
      .addCase(deleteCourse.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteCourse.fulfilled, (state, action: PayloadAction<string>) => {
        state.loading = false;
        state.courses = state.courses.filter((c) => c.id !== action.payload);
      })
      .addCase(deleteCourse.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default courseSlice.reducer;
