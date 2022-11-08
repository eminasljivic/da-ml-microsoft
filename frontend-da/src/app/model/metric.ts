export class Metric{
  constructor(public begin: number, public end: number, public type: type){}
}

export enum type{
  PYTHON_APPROACH,
  FORMRECOGNIZER
}
