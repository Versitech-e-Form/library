import Writer from '../Writer';
import BitMatrix from '../common/BitMatrix';
import BarcodeFormat from '../BarcodeFormat';
import EncodeHintType from '../EncodeHintType';
import IllegalArgumentException from '../IllegalArgumentException';
import { Collection } from 'src/customTypings';

export default abstract class OneDimensionalCodeWriter implements Writer {
  private static NUMERIC: RegExp = new RegExp('[0-9]+');

  public encode(contents: string,
                format?: BarcodeFormat,
                width?: number,
                height?: number,
                hints?: Map<EncodeHintType, any>): any {
    if (format !== null && width !== null && height !== null) {


      if (contents === '') {
        throw new IllegalArgumentException('Found empty contents');
      }

      if (width < 0 || height < 0) {
        throw new IllegalArgumentException('Negative size is not allowed. Input: '
          + width + 'x' + height);
      }
      let supportedFormats: Collection<BarcodeFormat> = this.getSupportedWriteFormats();
      if (supportedFormats != null && !supportedFormats.includes(format)) {
        throw new IllegalArgumentException('Can only encode ' + supportedFormats +
          ', but got ' + format);
      }

      let sidesMargin: number = this.getDefaultMargin();
      if (hints != null && hints.has(EncodeHintType.MARGIN)) {
        sidesMargin = parseInt(hints.get(EncodeHintType.MARGIN).toString());
      }

      let code: boolean[] = this.encode(contents);
      return OneDimensionalCodeWriter.renderResult(code, width, height, sidesMargin);
    }
  }

  protected getSupportedWriteFormats(): Collection<BarcodeFormat> {
    return [BarcodeFormat.CODE_39];
  }

  private static renderResult(code: boolean[], width: number, height: number, sidesMargin: number): BitMatrix {
    let inputWidth: number = code.length;
    // Add quiet zone on both sides.
    let fullWidth: number = inputWidth + sidesMargin;
    let outputWidth: number = Math.max(width, fullWidth);
    let outputHeight: number = Math.max(1, height);

    let multiple: number = Math.floor(outputWidth / fullWidth);
    let leftPadding: number = Math.floor((outputWidth - (inputWidth * multiple)) / 2);

    let output: BitMatrix = new BitMatrix(outputWidth, outputHeight);
    for (let inputX = 0, outputX = leftPadding; inputX < inputWidth; inputX++, outputX += multiple) {
      if (code[inputX]) {
        output.setRegion(outputX, 0, multiple, outputHeight);
      }
    }
    return output;
  }

  protected static checkNumeric(contents: string): void {
    if (!OneDimensionalCodeWriter.NUMERIC.test(contents)) {
      throw new IllegalArgumentException('Input should only contain digits 0-9');
    }
  }

  protected static appendPattern(target: boolean[], pos: number, pattern: number[], startColor: boolean): number {
    let color: boolean = startColor;
    let numAdded: number = 0;
    for (let len of pattern) {
      for (let j = 0; j < len; j++) {
        target[pos++] = color;
      }
      numAdded += len;
      color = !color; // flip color after each segment
    }
    return numAdded;
  }

  public getDefaultMargin(): number {
    // CodaBar spec requires a side margin to be more than ten times wider than narrow space.
    // This seems like a decent idea for a default for all formats.
    return 10;
  }


}
