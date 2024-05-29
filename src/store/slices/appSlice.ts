import { PayloadAction, createSlice } from "@reduxjs/toolkit";

import {
  ContainerInterface,
  DraggedCardInterface,
  DraggedContainerInterface,
} from "../../types";

interface AppSliceInterface {
  containers: ContainerInterface[];
  draggedCard: DraggedCardInterface | null;
  draggedContainer: DraggedContainerInterface | null;
}

const initialState: AppSliceInterface = {
  containers: [
    { id: 1, name: "To-Do", left: 0 },
    { id: 2, name: "In-Progress", left: 0 },
    { id: 3, name: "In QA", left: 0 },
    { id: 4, name: "Done", left: 0 },
  ],
  draggedCard: null,
  draggedContainer: null,
};

const appSlice = createSlice({
  name: "app",
  initialState,
  reducers: {
    setContainers: (
      state,
      action: PayloadAction<ContainerInterface[]>
    ) => ({ ...state, containers: action.payload }),
    setDraggedCard: (
      state,
      action: PayloadAction<DraggedCardInterface | null>
    ) => ({
      ...state,
      draggedCard: action.payload,
    }),
    setDraggedContainer: (
      state,
      action: PayloadAction<DraggedContainerInterface | null>
    ) => ({
      ...state,
      draggedContainer: action.payload,
    }),
  },
});

export const { setContainers, setDraggedCard, setDraggedContainer } = appSlice.actions;

export default appSlice.reducer;
