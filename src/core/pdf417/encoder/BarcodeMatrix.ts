import { int } from '../../../customTypings';
import BarcodeRow from './BarcodeRow';

export default class BarcodeMatrix {

  private matrix: Array<BarcodeRow>;
  private currentRow: number;
  private height: number;
  private width: number;

  constructor(height: number, width: number) {
    this.matrix = new Array<BarcodeRow>(height); // BarcodeRow array
    for (let i = 0, matrixLength = this.matrix.length; i < matrixLength; i++) {
      this.matrix[i] = new BarcodeRow((width + 4) * 17 + 1);
    }
    this.width = width * 17;
    this.height = height;
    this.currentRow = -1;
  }

  set(x: number, y: number, value: number): void {
    this.matrix[y].set(x, value);
  }

  startRow(): void {
    ++this.currentRow;
  }

  getCurrentRow(): BarcodeRow {
    return this.matrix[this.currentRow];
  }

  getMatrix(): number[][] {
    return this.getScaledMatrix(1, 1);
  }

  getScaledMatrix(xScale: number, yScale: number): number[][] {
    xScale = Math.floor(xScale);
    yScale = Math.floor(yScale);
    let matrixOut = new Array(this.height * yScale);
    matrixOut.fill(new Array(this.width * xScale));
    let yMax = this.height * yScale;
    for (let i = 0; i < yMax; i++) {
      matrixOut[yMax - i - 1] = this.matrix[Math.floor(i / yScale)].getScaledRow(xScale);
    }
    return matrixOut;
  }

}
