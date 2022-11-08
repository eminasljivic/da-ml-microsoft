export class BoundingBox {

  constructor(
    public box: number[][],
    public text: string,
    public state: BoundingBoxState = BoundingBoxState.NO_ACTION) {
  }
}

export enum BoundingBoxState {
  NO_ACTION,
  HOVER,
  SELECTED
}
