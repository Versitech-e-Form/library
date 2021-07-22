import { char, Collection } from '../../customTypings';
import BarcodeFormat from '../BarcodeFormat';
import Collections from '../util/Collections';
import { Code39Reader } from '../../index';
import IllegalArgumentException from '../IllegalArgumentException';
import StringBuilder from '../util/StringBuilder';
import OneDimensionalCodeWriter from './OneDimensionalCodeWriter';
import EncodeHintType from '../EncodeHintType';
import BitMatrix from '../common/BitMatrix';


export default class Code39Writer extends OneDimensionalCodeWriter {
  protected getSupportedWriteFormats(): Collection<BarcodeFormat> {
    return new Array<BarcodeFormat>(1).fill(BarcodeFormat.CODE_39); // return singleton
  }

  public encode(contents: string,
                  format?: BarcodeFormat,
                  width?: number,
                  height?: number,
                  hints?: Map<EncodeHintType, any>): any {

    if (arguments.length > 1) return super.encode(contents, format, width, height, hints);
    let length = contents.length;
    if (length > 80) {
      throw new Error('IllegalArgumentException(\n' + '  \'Requested contents should be less than 80 digits long, but got \' + length)');
    }

    for (let i = 0; i < length; i++) {
      let indexInString = Code39Reader.ALPHABET_STRING.indexOf(contents.charAt(i));
      if (indexInString < 0) {
        contents = Code39Writer.tryToConvertToExtendedMode(contents);
        length = contents.length;
        if (length > 80) {
          throw new IllegalArgumentException('Requested contents should be less than 80 digits long, but got' + length + ' (extended full ASCII mode)');
        }
        break;
      }
    }

    let widths: number[] = new Array(9);
    let codeWidth = 24 + 1 + (13 * length);
    let result: boolean[] = new Array<boolean>(codeWidth);
    Code39Writer.toIntArray(Code39Reader.ASTERISK_ENCODING, widths);
    let pos = Code39Writer.appendPattern(result, 0, widths, true);
    let narrowWhite: number[] = new Array<number>(1);
    narrowWhite.fill(1);
    pos += Code39Writer.appendPattern(result, pos, narrowWhite, false);
// append next character to byte matrix
    for (let i = 0; i < length; i++) {
      let indexInString = Code39Reader.ALPHABET_STRING.indexOf(contents.charAt(i));
      Code39Writer.toIntArray(Code39Reader.CHARACTER_ENCODINGS[indexInString], widths);
      pos += Code39Writer.appendPattern(result, pos, widths, true);
      pos += Code39Writer.appendPattern(result, pos, narrowWhite, false);
    }
    Code39Writer.toIntArray(Code39Reader.ASTERISK_ENCODING, widths);
    Code39Writer.appendPattern(result, pos, widths, true);
    return result;
  }

  private static toIntArray(a: number, toReturn: number[]): void {
    for (let i = 0; i < 9; i++) {
      let temp = a & (1 << (8 - i));
      toReturn[i] = temp === 0 ? 1 : 2;
    }
  }

  private static tryToConvertToExtendedMode(contents: string): string {
    let length = contents.length;
    let extendedContent: StringBuilder = new StringBuilder();
    for (let i = 0; i < length; i++) {
      let character: string = contents.charAt(i);
      switch (character) {
        case '\u0000':
          extendedContent.append('%U');
          break;
        case ' ':
        case '-':
        case '.':
          extendedContent.append(character);
          break;
        case '@':
          extendedContent.append('%V');
          break;
        case '`':
          extendedContent.append('%W');
          break;
        default:
          if (character.charCodeAt(0) <= 26) {
            extendedContent.append('$');
            extendedContent.append(('A' + String.fromCharCode(character.charCodeAt(0) - 1)));
          } else if (character < ' ') {
            extendedContent.append('%');
            extendedContent.append(('A' + String.fromCharCode(character.charCodeAt(0) - 27)));
          } else if (character <= ',' || character === '/' || character === ':') {
            extendedContent.append('/');
            extendedContent.append(('A' + String.fromCharCode(character.charCodeAt(0) - 33)));
          } else if (character <= '9') {
            extendedContent.append(('0' + String.fromCharCode(character.charCodeAt(0) - 48)));
          } else if (character <= '?') {
            extendedContent.append('%');
            extendedContent.append(('F' + String.fromCharCode(character.charCodeAt(0) - 59)));
          } else if (character <= 'Z') {
            extendedContent.append(('A' + String.fromCharCode(character.charCodeAt(0) - 65)));
          } else if (character <= '_') {
            extendedContent.append('%');
            extendedContent.append(('K' + String.fromCharCode(character.charCodeAt(0) - 91)));
          } else if (character <= 'z') {
            extendedContent.append('+');
            extendedContent.append(('A' + String.fromCharCode(character.charCodeAt(0) - 97)));
          } else if (character.charCodeAt(0) <= 127) {
            extendedContent.append('%');
            extendedContent.append(('P' + String.fromCharCode(character.charCodeAt(0) - 123)));
          } else {
            throw new IllegalArgumentException(
              'Requested content contains a non-encodable character: \'' + contents.charAt(i) + '\'');
          }
          break;
      }
    }

    return extendedContent.toString();
  }

}
