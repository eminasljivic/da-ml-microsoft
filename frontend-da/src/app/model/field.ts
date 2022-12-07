import {BoundingBox} from './bounding-box';

export class Field {
  constructor(
    public boundingBoxes: BoundingBox[],
    public fieldContent: string,
    public fieldName: string = '') {
  }
}
