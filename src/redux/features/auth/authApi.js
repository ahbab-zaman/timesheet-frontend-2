// import timesheetApi from '../../api/timesheetApi';

// const authApi = timesheetApi.injectEndpoints({
//   endpoints: (builder) => ({
//     login: builder.mutation({
//       query: (credentials) => ({
//         url: 'auth/login',
//         method: 'POST',
//         body: credentials,
//       }),
//     }),
//   }),
// });

// export const { useLoginMutation } = authApi;

import timesheetApi from "../../api/timesheetApi";

const authApi = timesheetApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (credentials) => ({
        url: "auth/login",
        method: "POST",
        body: credentials,
      }),
    }),
    register: builder.mutation({
      query: (userData) => ({
        url: "auth/register",
        method: "POST",
        body: userData,
      }),
    }),
  }),
});

export const { useLoginMutation, useRegisterMutation } = authApi;
export default authApi;
