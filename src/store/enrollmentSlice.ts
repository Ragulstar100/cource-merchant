import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';

const API_URL = 'https://course-api-veiu.onrender.com';

export interface EnrollmentDetails {
  id: string;
  studentId: string;
  courseId: string;
  enrollmentDate: string;
  enrollmentStatus: 'In Progress' | 'Completed';
  shop: string;
  studentName: string;
  studentEmail: string;
  courseTitle: string;
  category: string;
  duration: string;
}

export interface DashboardStats {
  totalCourses: number;
  totalStudents: number;
  totalEnrollments: number;
  completedEnrollments: number;
  activeEnrollments: number;
}

export interface Student {
  id: string;
  studentName: string;
  email: string;
  studentStatus: 'Active' | 'Inactive';
  phone?: string;
  course?: string;
  bio?: string;
}

export interface EnrollmentState {
  enrollments: EnrollmentDetails[];
  students: Student[];
  dashboardStats: DashboardStats | null;
  recentEnrollments: EnrollmentDetails[];
  loading: boolean;
  error: string | null;
}

const initialState: EnrollmentState = {
  enrollments: [],
  students: [],
  dashboardStats: null,
  recentEnrollments: [],
  loading: false,
  error: null,
};

interface HeadersInit {
  [key: string]: string;
}

// Fetch dashboard stats & recent enrollments
export const fetchDashboardStats = createAsyncThunk(
  'enrollments/fetchDashboardStats',
  async (payload: { token: string; shop: string }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}/student/admin-dashboard/stats`, {
        headers: {
          'Authorization': `Bearer ${payload.token}`,
          'X-Shop-Domain': payload.shop,
        } as HeadersInit,
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch dashboard stats');
      }
      return data; // returns { stats: DashboardStats, recentEnrollments: EnrollmentDetails[] }
    } catch (err: any) {
      return rejectWithValue(err.message || 'Server error fetching stats');
    }
  }
);

// Fetch all enrollments
export const fetchEnrollments = createAsyncThunk(
  'enrollments/fetchEnrollments',
  async (payload: { token: string; shop: string }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}/student/admin-enrollments`, {
        headers: {
          'Authorization': `Bearer ${payload.token}`,
          'X-Shop-Domain': payload.shop,
        } as HeadersInit,
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch enrollments');
      }
      return data as EnrollmentDetails[];
    } catch (err: any) {
      return rejectWithValue(err.message || 'Server error fetching enrollments');
    }
  }
);

// Fetch all registered students
export const fetchStudents = createAsyncThunk(
  'enrollments/fetchStudents',
  async (payload: { token: string; shop: string }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}/student`, {
        headers: {
          'Authorization': `Bearer ${payload.token}`,
          'X-Shop-Domain': payload.shop,
        } as HeadersInit,
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch students');
      }
      return data as Student[];
    } catch (err: any) {
      return rejectWithValue(err.message || 'Server error fetching students');
    }
  }
);

// Update enrollment status ('In Progress' / 'Completed')
export const updateEnrollmentStatus = createAsyncThunk(
  'enrollments/updateEnrollmentStatus',
  async (
    payload: {
      id: string;
      enrollmentStatus: 'In Progress' | 'Completed';
      token: string;
      shop: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await fetch(`${API_URL}/student/enrollments/${payload.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${payload.token}`,
          'X-Shop-Domain': payload.shop,
        } as HeadersInit,
        body: JSON.stringify({ enrollmentStatus: payload.enrollmentStatus }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update enrollment status');
      }
      return { id: payload.id, enrollmentStatus: payload.enrollmentStatus };
    } catch (err: any) {
      return rejectWithValue(err.message || 'Server error updating enrollment');
    }
  }
);

// Delete enrollment (Unenroll student)
export const deleteEnrollment = createAsyncThunk(
  'enrollments/deleteEnrollment',
  async (
    payload: {
      id: string;
      token: string;
      shop: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await fetch(`${API_URL}/student/enrollments/${payload.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${payload.token}`,
          'X-Shop-Domain': payload.shop,
        } as HeadersInit,
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to unenroll student');
      }
      return payload.id;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Server error deleting enrollment');
    }
  }
);

// Enroll student in a course (for Admin creation)
export const adminEnrollStudent = createAsyncThunk(
  'enrollments/adminEnrollStudent',
  async (
    payload: {
      studentId: string;
      courseId: string;
      token: string;
      shop: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await fetch(`${API_URL}/student/admin-enroll`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${payload.token}`,
          'X-Shop-Domain': payload.shop,
        } as HeadersInit,
        body: JSON.stringify({
          studentId: payload.studentId,
          courseId: payload.courseId,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || data.details || 'Enrollment failed');
      }
      return data.enrollment; // returns enrollment object
    } catch (err: any) {
      return rejectWithValue(err.message || 'Server error enrolling student');
    }
  }
);

const enrollmentSlice = createSlice({
  name: 'enrollments',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch Stats
      .addCase(fetchDashboardStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.loading = false;
        state.dashboardStats = action.payload.stats;
        state.recentEnrollments = action.payload.recentEnrollments;
      })
      .addCase(fetchDashboardStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch Enrollments
      .addCase(fetchEnrollments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEnrollments.fulfilled, (state, action: PayloadAction<EnrollmentDetails[]>) => {
        state.loading = false;
        state.enrollments = action.payload;
      })
      .addCase(fetchEnrollments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch Students
      .addCase(fetchStudents.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStudents.fulfilled, (state, action: PayloadAction<Student[]>) => {
        state.loading = false;
        state.students = action.payload;
      })
      .addCase(fetchStudents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update status
      .addCase(updateEnrollmentStatus.fulfilled, (state, action) => {
        const item = state.enrollments.find((e) => e.id === action.payload.id);
        if (item) {
          item.enrollmentStatus = action.payload.enrollmentStatus;
        }
        const recentItem = state.recentEnrollments.find((e) => e.id === action.payload.id);
        if (recentItem) {
          recentItem.enrollmentStatus = action.payload.enrollmentStatus;
        }
      })
      // Delete enrollment
      .addCase(deleteEnrollment.fulfilled, (state, action: PayloadAction<string>) => {
        state.enrollments = state.enrollments.filter((e) => e.id !== action.payload);
        state.recentEnrollments = state.recentEnrollments.filter((e) => e.id !== action.payload);
      });
  },
});

export default enrollmentSlice.reducer;
