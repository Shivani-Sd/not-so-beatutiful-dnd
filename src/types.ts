export interface ContainerInterface {
  id: number;
  name: string;
}

export interface CardInterface {
  id: number;
  name: string;
  top: number | null;
}

export interface DraggedCardInterface extends CardInterface {
  containerIndex: number;
}
