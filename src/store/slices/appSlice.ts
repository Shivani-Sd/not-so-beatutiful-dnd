import { PayloadAction, createSlice } from "@reduxjs/toolkit";

import {
  ContainerInterface,
  DraggedCardInterface,
} from "../../types";

interface AppSliceInterface {
  containers: ContainerInterface[];
  draggedCard: DraggedCardInterface | null;
}

const initialState: AppSliceInterface = {
  containers: [
    { id: 1, name: "To-Do" },
    { id: 2, name: "In-Progress" },
  ],
  draggedCard: null,
};

const appSlice = createSlice({
  name: "app",
  initialState,
  reducers: {
    setDraggedCard: (
      state,
      action: PayloadAction<DraggedCardInterface | null>
    ) => ({
      ...state,
      draggedCard: action.payload,
    }),
  },
});

export const { setDraggedCard } = appSlice.actions;

export default appSlice.reducer;
