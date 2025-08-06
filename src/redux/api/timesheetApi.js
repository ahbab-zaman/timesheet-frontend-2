
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'



const timesheetApi = createApi({
    reducerPath: 'timesheetApi',
    baseQuery: fetchBaseQuery({baseUrl: 'http://localhost:4001/api/v1/', credentials: 'include'}),
    endpoints: () => ({}),

})


export default timesheetApi;



