import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  sortBy: null,
  sortOrder: null,
  page: 1,
  limit: 3,
};

const postSlice = createSlice({
  name: "posts",
  initialState,
  reducers: {
    setSort(state, action) {
      const { sortBy, sortOrder } = action.payload;

      state.sortBy = sortBy;
      state.sortOrder = sortOrder;

      // 정렬 기준이 바뀌면 첫 페이지로 이동
      state.page = 1;
    },

    setPage(state, action) {
      state.page = action.payload;
    },
  },
});

export const { setSort, setPage } = postSlice.actions;
export default postSlice.reducer;
