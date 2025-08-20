import axiosInstance from "@/services/axiosInstance";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const timesheetApi = createApi({
  reducerPath: "timesheetApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${import.meta.env.VITE_API_BASE_URL}/api/v1/`,
    credentials: "include",
  }),
  endpoints: () => ({}),
});

export default timesheetApi;
