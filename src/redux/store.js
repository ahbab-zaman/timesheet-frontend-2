
import { configureStore } from '@reduxjs/toolkit'
import authReducer from './features/auth/authSlice'
import timesheetApi from './api/timesheetApi'

export const store = configureStore({
  reducer: {
    [timesheetApi.reducerPath]: timesheetApi.reducer,
    auth: authReducer
  },
  middleware: (getDefaultMiddlewares) =>
    getDefaultMiddlewares().concat(timesheetApi.middleware),
})