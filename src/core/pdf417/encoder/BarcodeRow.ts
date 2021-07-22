import { byte } from '../../../customTypings';

export default class BarcodeRow {

  private row: Array<byte>;
  // A tacker for position in the bar
  private currentLocation: number;

  constructor(width: number) {
    this.row = new Array<byte>(width); // byte array
    this.currentLocation = 0;
  }

  set(x: number, value: byte): void;
  set(x: number, black: boolean): void;

  set(x: number, arg1: any): void {
    if (typeof arg1 === 'number') {
      this.row[x] = arg1;
    } else if (typeof arg1 === 'boolean') {
      this.row[x] = (arg1 ? 1 : 0);
    }
  }

  addBar(black: boolean, width: number): void {
    for (let ii = 0; ii < width; ii++) {
      this.set(this.currentLocation++, black);
    }
  }

  getScaledRow(scale: number): Array<byte> {
    scale = Math.floor(scale);
    let output = new Array<byte>(this.row.length * scale);
    for (let i = 0; i < output.length; i++) {
      output[i] = this.row[Math.floor(i / scale)];
    }
    return output;
  }


}
