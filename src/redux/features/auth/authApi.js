import timesheetApi from '../../api/timesheetApi';


const authApi = timesheetApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (credentials) => ({
        url: 'auth/login',
        method: 'POST',
        body: credentials,
      }),
    }),
  }),
});




export const { useLoginMutation } = authApi;