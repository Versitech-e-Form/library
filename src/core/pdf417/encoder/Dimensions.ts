export default class Dimensions {

  private minCols: number;
  private maxCols: number;
  private minRows: number;
  private maxRows: number;

  constructor(minCols: number, maxCols: number, minRows: number, maxRows: number) {
    this.minCols = minCols;
    this.maxCols = maxCols;
    this.minRows = minRows;
    this.maxRows = maxRows;
  }

  public getMinCols(): number {
    return this.minCols;
  }

  public getMaxCols(): number {
    return this.maxCols;
  }

  public getMinRows(): number {
    return this.minRows;
  }

  public getMaxRows(): number {
    return this.maxRows;
  }
}
