export interface ContainerInterface {
  id: number;
  name: string;
  left: number;
}

export interface CardInterface {
  id: number;
  name: string;
  top: number | null;
}

export interface DraggedCardInterface extends CardInterface {
  containerIndex: number;
}

export interface DraggedContainerInterface extends ContainerInterface {
  containerIndex: number;
}
