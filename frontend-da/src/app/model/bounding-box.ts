export class BoundingBox {

  constructor(public box: number[][][], public state: BoundingBoxState = BoundingBoxState.NO_ACTION) {
  }
}

export enum BoundingBoxState {
  NO_ACTION,
  HOVER,
  SELECTED
}
