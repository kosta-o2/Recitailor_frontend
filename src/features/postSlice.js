import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  kind: "user",
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

    // 게시판(user/ai)이 바뀌면 정렬과 페이지를 처음 상태로 돌린다.
    setKind(state, action) {
      if (state.kind === action.payload) return;

      state.kind = action.payload;
      state.sortBy = null;
      state.sortOrder = null;
      state.page = 1;
    },

    setPage(state, action) {
      state.page = action.payload;
    },
  },
});

export const { setSort, setPage, setKind } = postSlice.actions;
export default postSlice.reducer;
