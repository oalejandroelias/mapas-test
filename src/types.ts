export interface Layer {
  id: number;
  name: string;
  title: string;
  visible: boolean;
  opacity: number;
  zIndex: number;
  extent: number[] | null;
}