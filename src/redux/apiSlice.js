import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:5000",
  }),
  endpoints: (builder) => ({
    createUser: builder.mutation({
      query: (payload) => ({
        url: "/api/auth/register",
        method: "POST",
        body: payload,
      }),
    }),
    loginUser: builder.mutation({
      query: (payload) => ({
        url: "/api/auth/login",
        method: "POST",
        body: payload,
      }),
    }),
    updatePassword: builder.mutation({
      query: (payload) => {
        const token = localStorage.getItem("token");
        return {
          url: "/api/auth/update/password",
          method: "POST",
          body: payload,
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        };
      },
    }),
    createStore: builder.mutation({
      query: (payload) => {
        const token = localStorage.getItem("token");
        return {
          url: "/api/stores/add",
          method: "POST",
          body: payload,
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        };
      },
      invalidatesTags: ["Events"],
    }),
    getStores: builder.query({
      query: (payload) => {
        const token = localStorage.getItem("token");
        return {
          url: "/api/stores/list",
          method: "POST",
          body: payload,
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        };
      },
      invalidatesTags: ["UpdateRanking", "CreateRanking", "Events", "Stores"],
    }),
    getStoreById: builder.query({
      query: (payload) => {
        const token = localStorage.getItem("token");
        return {
          url: `/api/stores/get`,
          method: "POST",
          body: payload,
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        };
      },
    }),
    updateRanking: builder.mutation({
      query: (payload) => {
        const token = localStorage.getItem("token");
        return {
          url: "/api/ratings/update",
          method: "POST",
          body: payload,
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        };
      },
      providesTags: ["UpdateRanking"],
    }),
    createRanking: builder.mutation({
      query: (payload) => {
        const token = localStorage.getItem("token");
        return {
          url: "/api/ratings/create",
          method: "POST",
          body: payload,
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        };
      },
      providesTags: ["CreateRanking"],
    }),
    getUsers: builder.query({
      query: (payload) => {
        const token = localStorage.getItem("token");
        return {
          url: "/api/users",
          method: "GET",
          body: payload,
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        };
      },
    }),
  }),
});

export const {
  useCreateUserMutation,
  useLoginUserMutation,
  useUpdatePasswordMutation,
  useCreateStoreMutation,
  useGetStoresQuery,
  useUpdateRankingMutation,
  useCreateRankingMutation,
  useGetStoreByIdQuery,
  useGetUsersQuery,
} = apiSlice;
