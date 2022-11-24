import {BoundingBox} from "./bounding-box";
import {Field} from "./field";

export class Invoice{
  constructor(public url: string, public boundingBoxes: BoundingBox[] = [], public factor: number = 1, public fields: Field[] = []) {
  }
}
