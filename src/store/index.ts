import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice.ts';
import courseReducer from './courseSlice.ts';
import enrollmentReducer from './enrollmentSlice.ts';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    courses: courseReducer,
    enrollments: enrollmentReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
