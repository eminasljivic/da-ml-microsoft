import {BoundingBox} from "./bounding-box";
import {Field} from "./field";

export class Invoice {
  constructor(public url: string,
              public filename: string,
              public boundingBoxes: BoundingBox[] = [],
              public factor: number = 1,
              public fields: Field[] = []) {
  }
}
