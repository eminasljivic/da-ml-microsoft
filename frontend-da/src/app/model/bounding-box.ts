import {Field} from "./field";

export class BoundingBox {

  constructor(
    public box: number[],
    public text: string,
    public htmlElement: any = null,
    public field: Field | any = null) {
  }
}
