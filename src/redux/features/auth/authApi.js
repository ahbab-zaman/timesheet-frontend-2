import timesheetApi from "../../api/timesheetApi";

const authApi = timesheetApi.injectEndpoints({
  tagTypes: ["User"], // For cache invalidation (refetch users after mutations)
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (credentials) => ({
        url: "auth/login",
        method: "POST",
        body: credentials,
      }),
      invalidatesTags: ["User"], // Optional: refetch users after login if needed
    }),
    register: builder.mutation({
      query: (userData) => ({
        url: "auth/register",
        method: "POST",
        body: userData,
      }),
      invalidatesTags: ["User", "Manager"], // Refetch users after registration
    }),
    getManagers: builder.query({
      query: () => "auth/managers",
      providesTags: ["Manager"],
    }),
    // FIXED: Forgot password - Destructure { email } in query fn to avoid nested body
    forgetPassword: builder.mutation({
      query: ({ email }) => ({
        // <-- Changed: ({ email }) instead of (email)
        url: "auth/forgot-password",
        method: "POST",
        body: { email }, // Now body: { email: 'string' } correctly
      }),
      // No invalidation needed for this
    }),
    // Reset password (already correct)
    resetPassword: builder.mutation({
      query: ({ email, token, newPassword }) => ({
        url: "auth/reset-password",
        method: "POST",
        body: { email, token, newPassword },
      }),
      invalidatesTags: ["User"], // Optional: refetch if needed after reset
    }),
    // NEW: Get all users (admin-only)
    getUsers: builder.query({
      query: () => "auth/users", // GET /api/v1/auth/users
      providesTags: ["User"], // Tags this query for invalidation
    }),
    // NEW: Update user by ID
    updateUser: builder.mutation({
      query: ({ id, updates }) => ({
        // Changed to destructure 'updates' explicitly
        url: `auth/users/${id}`, // PATCH /api/v1/auth/users/:id
        method: "PATCH",
        body: updates,
      }),
      invalidatesTags: ["User"], // Refetch users after update
    }),
    // NEW: Delete user by ID
    deleteUser: builder.mutation({
      query: (id) => ({
        url: `auth/users/${id}`, // DELETE /api/v1/auth/users/:id
        method: "DELETE",
      }),
      invalidatesTags: ["User"], // Refetch users after delete
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useForgetPasswordMutation, // NEW
  useResetPasswordMutation, // NEW
  useGetUsersQuery, // NEW
  useUpdateUserMutation, // NEW
  useDeleteUserMutation, // NEW
  useGetManagersQuery,
} = authApi;
export default authApi;
