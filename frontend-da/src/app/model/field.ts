import {BoundingBox} from './bounding-box';

export class Field {
  constructor(
    public boundingBox: BoundingBox,
    public fieldContent: string,
    public fieldName: string = '') {
  }
}
