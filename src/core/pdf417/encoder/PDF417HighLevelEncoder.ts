import Charset from '../../util/Charset';
import Compaction from './Compaction';
import { byte, char } from '../../../customTypings';
import StandardCharsets from '../../util/StandardCharsets';
import StringBuilder from '../../util/StringBuilder';

export default class PDF417HighLevelEncoder {
  /**
   * code for Text compaction
   */
  private static TEXT_COMPACTION = 0;

  /**
   * code for Byte compaction
   */
  private static BYTE_COMPACTION = 1;

  /**
   * code for Numeric compaction
   */
  private static NUMERIC_COMPACTION = 2;

  /**
   * Text compaction submode Alpha
   */
  private static SUBMODE_ALPHA = 0;

  /**
   * Text compaction submode Lower
   */
  private static SUBMODE_LOWER = 1;

  /**
   * Text compaction submode Mixed
   */
  private static SUBMODE_MIXED = 2;

  /**
   * Text compaction submode Punctuation
   */
  private static SUBMODE_PUNCTUATION = 3;

  /**
   * mode latch to Text Compaction mode
   */
  private static LATCH_TO_TEXT = 900;

  /**
   * mode latch to Byte Compaction mode (number of characters NOT a multiple of 6)
   */
  private static LATCH_TO_BYTE_PADDED = 901;

  /**
   * mode latch to Numeric Compaction mode
   */
  private static LATCH_TO_NUMERIC = 902;

  /**
   * mode shift to Byte Compaction mode
   */
  private static SHIFT_TO_BYTE = 913;

  /**
   * mode latch to Byte Compaction mode (number of characters a multiple of 6)
   */
  private static LATCH_TO_BYTE = 924;

  /**
   * identifier for a user defined Extended Channel Interpretation (ECI)
   */
  private static ECI_USER_DEFINED = 925;

  /**
   * identifier for a general purpose ECO format
   */
  private static ECI_GENERAL_PURPOSE = 926;

  /**
   * identifier for an ECI of a character set of code page
   */
  private static ECI_CHARSET = 927;

  private static TEXT_MIXED_RAW = [
    48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 38, 13, 9, 44, 58,
    35, 45, 46, 36, 47, 43, 37, 42, 61, 94, 0, 32, 0, 0, 0];

  private static TEXT_PUNCTUATION_RAW = [
    59, 60, 62, 64, 91, 92, 93, 95, 96, 126, 33, 13, 9, 44, 58,
    10, 45, 46, 36, 47, 34, 124, 42, 40, 41, 63, 123, 125, 39, 0];

  private static MIXED = [-1, -1, -1, -1, -1, -1, -1, -1, -1, 12, -1, -1, -1, 11, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 26, -1, -1, 15, 18, 21, 10, -1, -1, -1, 22, 20, 13, 16, 17, 19, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 14, -1, -1, 23, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 24, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1];
  private static PUNCTUATION = [-1, -1, -1, -1, -1, -1, -1, -1, -1, 12, 15, -1, -1, 11, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 10, 20, -1, 18, -1, -1, 28, 23, 24, 22, -1, 13, 16, 17, 19, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 14, 0, 1, -1, 2, 25, 3, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 4, 5, 6, -1, 7, 8, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 26, 21, 27, 9, -1];

  private static DEFAULT_ENCODING: string = 'iso-8859-1';


  static encodeHighLevel(msg: string, compaction: Compaction, encoding: string): string {

    //  the codewords 0..928 are encoded as Unicode characters
    let sb: StringBuilder = new StringBuilder();

    if (encoding === null) {
      encoding = PDF417HighLevelEncoder.DEFAULT_ENCODING;
    } else if (PDF417HighLevelEncoder.DEFAULT_ENCODING !== encoding) {
      //  let eci: CharacterSetECI = CharacterSetECI.getCharacterSetECI(encoding);
      //  if (eci !===== null) {
      //      this.encodingECI(eci.getValue(), sb);
      //  }
      if (encoding !== null) {
        this.encodingECI(encoding.charCodeAt(0), sb);
      }
    }

    let len = msg.length;
    let p = 0;
    let textSubMode = PDF417HighLevelEncoder.SUBMODE_ALPHA;

//  User selected encoding mode
    switch (compaction) {
      case Compaction.TEXT:
        PDF417HighLevelEncoder.encodeText(msg, p, len, sb, textSubMode);
        break;
      case Compaction.BYTE:
        let msgBytes: Array<byte>;
        if ( typeof msg === 'string' ) {
          let x = new TextEncoder();
          msgBytes = Array.from(x.encode(msg));
        } else {
          msgBytes = Array.from(msg);
        }
        PDF417HighLevelEncoder.encodeBinary(msgBytes, p, msgBytes.length, PDF417HighLevelEncoder.BYTE_COMPACTION, sb);
        break;
      case Compaction.NUMERIC:
        sb.append(String.fromCharCode(<char>PDF417HighLevelEncoder.LATCH_TO_NUMERIC));
        PDF417HighLevelEncoder.encodeNumeric(msg, p, len, sb);
        break;
      default:
        let encodingMode = PDF417HighLevelEncoder.TEXT_COMPACTION; //  Default mode, see 4.4.2.1
        while (p < len) {
          let n = PDF417HighLevelEncoder.determineConsecutiveDigitCount(msg, p);
          if (n >= 13) {
            sb.append(String.fromCharCode(PDF417HighLevelEncoder.LATCH_TO_NUMERIC));
            encodingMode = PDF417HighLevelEncoder.NUMERIC_COMPACTION;
            textSubMode = PDF417HighLevelEncoder.SUBMODE_ALPHA; //  Reset after latch
            PDF417HighLevelEncoder.encodeNumeric(msg, p, n, sb);
            p += n;
          } else {
            let t = PDF417HighLevelEncoder.determineConsecutiveTextCount(msg, p);
            if (t >= 5 || n === len) {
              if (encodingMode !== PDF417HighLevelEncoder.TEXT_COMPACTION) {
                sb.append(String.fromCharCode(<char>PDF417HighLevelEncoder.LATCH_TO_TEXT));
                encodingMode = PDF417HighLevelEncoder.TEXT_COMPACTION;
                textSubMode = PDF417HighLevelEncoder.SUBMODE_ALPHA; //  start with submode alpha after latch
              }
              textSubMode = PDF417HighLevelEncoder.encodeText(msg, p, t, sb, textSubMode);
              p += t;
            } else {
              let b = PDF417HighLevelEncoder.determineConsecutiveBinaryCount(msg, p, encoding);
              if (b === 0) {
                b = 1;
              }
              //  let bytes = msg.substring(p, p + b).getBytes(encoding);
              let x = new TextEncoder();
              let bytes: Array<byte> = Array.from(x.encode(msg.substring(p, p + b)));
              if (bytes.length === 1 && encodingMode === PDF417HighLevelEncoder.TEXT_COMPACTION) {
                //  Switch for one byte (instead of latch)
                PDF417HighLevelEncoder.encodeBinary(bytes, 0, 1, PDF417HighLevelEncoder.TEXT_COMPACTION, sb);
              } else {
                //  Mode latch performed by encodeBinary()
                PDF417HighLevelEncoder.encodeBinary(bytes, 0, bytes.length, encodingMode, sb);
                encodingMode = PDF417HighLevelEncoder.BYTE_COMPACTION;
                textSubMode = PDF417HighLevelEncoder.SUBMODE_ALPHA; //  Reset after latch
              }
              p += b;
            }
          }
        }
        break;
    }

    return sb.toString();
  }

  private static encodeText(msg: string, startpos: number,
                            count: number,
                            sb: StringBuilder,
                            initialSubmode: number): number {
    let tmp: string = '';
    let submode = initialSubmode;
    let idx = 0;
    while (true) {
      let ch = msg.charAt(startpos + idx);
      let chCode = msg.charCodeAt(startpos + idx);
      switch (submode) {
        case PDF417HighLevelEncoder.SUBMODE_ALPHA:
          if (PDF417HighLevelEncoder.isAlphaUpper(chCode)) {
            if (ch === ' ') {
              tmp += String.fromCharCode(<char>26); //  space
            } else {
              tmp += String.fromCharCode(<char>(chCode - 65));
            }
          } else {
            if (PDF417HighLevelEncoder.isAlphaLower(chCode)) {
              submode = PDF417HighLevelEncoder.SUBMODE_LOWER;
              tmp += String.fromCharCode(<char>27); //  ll
              continue;
            } else if (PDF417HighLevelEncoder.isMixed(chCode)) {
              submode = PDF417HighLevelEncoder.SUBMODE_MIXED;
              tmp += String.fromCharCode(<char>28); //  ml
              continue;
            } else {
              tmp += String.fromCharCode(<char>29); //  ps
              tmp += String.fromCharCode(<char>PDF417HighLevelEncoder.PUNCTUATION[chCode]);
              break;
            }
          }
          break;
        case PDF417HighLevelEncoder.SUBMODE_LOWER:
          if (PDF417HighLevelEncoder.isAlphaLower(chCode)) {
            if (ch === ' ') {
              tmp += String.fromCharCode(<char>26); // space
            } else {
              tmp += String.fromCharCode(<char>(chCode - 97));
            }
          } else {
            if (PDF417HighLevelEncoder.isAlphaUpper(chCode)) {
              tmp += String.fromCharCode(<char>27); // as
              tmp += String.fromCharCode(<char>(chCode - 65));
              // space cannot happen here, it is also in "Lower"
              break;
            } else if (PDF417HighLevelEncoder.isMixed(chCode)) {
              submode = PDF417HighLevelEncoder.SUBMODE_MIXED;
              tmp += String.fromCharCode(<char>28); // ml
              continue;
            } else {
              tmp += String.fromCharCode(<char>29); // ps
              tmp += String.fromCharCode(<char>PDF417HighLevelEncoder.PUNCTUATION[chCode]);
              break;
            }
          }
          break;
        case PDF417HighLevelEncoder.SUBMODE_MIXED:
          if (PDF417HighLevelEncoder.isMixed(chCode)) {
            tmp += String.fromCharCode(<char>PDF417HighLevelEncoder.MIXED[chCode]);
          } else {
            if (PDF417HighLevelEncoder.isAlphaUpper(chCode)) {
              submode = PDF417HighLevelEncoder.SUBMODE_ALPHA;
              tmp += String.fromCharCode(<char>28); // al
              continue;
            } else if (PDF417HighLevelEncoder.isAlphaLower(chCode)) {
              submode = PDF417HighLevelEncoder.SUBMODE_LOWER;
              tmp += String.fromCharCode(<char>27); // ll
              continue;
            } else {
              if (startpos + idx + 1 < count) {
                let next = msg.charAt(startpos + idx + 1);
                let nextCode = msg.charCodeAt(startpos + idx + 1);
                if (PDF417HighLevelEncoder.isPunctuation(nextCode)) {
                  submode = PDF417HighLevelEncoder.SUBMODE_PUNCTUATION;
                  tmp += String.fromCharCode(<char>25); // pl
                  continue;
                }
              }
              tmp += String.fromCharCode(<char>29); // ps
              tmp += String.fromCharCode(<char>PDF417HighLevelEncoder.PUNCTUATION[chCode]);
            }
          }
          break;
        default: // SUBMODE_PUNCTUATION
          if (PDF417HighLevelEncoder.isPunctuation(chCode)) {
            tmp += String.fromCharCode(<char>PDF417HighLevelEncoder.PUNCTUATION[chCode]);
          } else {
            submode = PDF417HighLevelEncoder.SUBMODE_ALPHA;
            tmp += String.fromCharCode(<char>29); // al
            continue;
          }
      }
      idx++;
      if (idx >= count) {
        break;
      }
    }
    let h: char = 0;
    let len: number = tmp.length;
    for (let i = 0; i < len; i++) {
      let odd = (i % 2) !== 0;
      if (odd) {
        h = (<char>((h * 30) + tmp.charCodeAt(i)));
        sb.append(String.fromCharCode(h));
      } else {
        h = tmp.charCodeAt(i);
      }
    }
    if ((len % 2) !== 0) {
      sb.append(String.fromCharCode(<char>((h * 30) + 29))); // ps
    }
    return submode;
  }

  private static encodeBinary(bytes: Array<byte>,
                              startpos: number,
                              count: number,
                              startmode: number,
                              sb: StringBuilder): void {
    if (count === 1 && startmode === PDF417HighLevelEncoder.TEXT_COMPACTION) {
      sb.append(String.fromCharCode(PDF417HighLevelEncoder.SHIFT_TO_BYTE));
    } else {
      if ((count % 6) === 0) {
        sb.append(String.fromCharCode(PDF417HighLevelEncoder.LATCH_TO_BYTE));
      } else {
        sb.append(String.fromCharCode(PDF417HighLevelEncoder.LATCH_TO_BYTE_PADDED));
      }
    }

    let idx = startpos;

    if (count >= 6) {
      let chars = new Array<char>(5);
      while ((startpos + count - idx) >= 6) {
        let t: bigint = BigInt(0);
        for (let i = 0; i < 6; i++) {
          t <<= BigInt(8);
          t += BigInt(bytes[idx + i] & 0xff);
        }
        for (let i = 0; i < 5; i++) {
          chars[i] = <char>Number(((t) % BigInt(900)));
          t = BigInt(Math.floor(Number(t / BigInt(900))));
        }
        for (let i = chars.length - 1; i >= 0; i--) {
          sb.append(String.fromCharCode(chars[i]));
        }
        idx += 6;
      }
    }
    // Encode rest (remaining n<5 bytes if any)
    for (let i = idx; i < startpos + count; i++) {
      let ch = bytes[i] & 0xff;
      sb.append(String.fromCharCode(ch));
    }
  }

  private static encodeNumeric(msg: string, startpos: number, count: number, sb: StringBuilder): void {
    let idx = 0;
    let tmp: string = '';
    let num900: bigint = BigInt(900);
    let num0: bigint = BigInt(0);
    while (idx < count) {
      //  tmp.setLength(0);
      tmp = '';
      let len = Math.min(44, count - idx);
      let part = '1' + msg.substring(startpos + idx, startpos + idx + len);
      let bigint: bigint = BigInt(part);
      do {
        tmp += String.fromCharCode(Number(bigint % num900));
        bigint = bigint / num900;
      } while (bigint !== num0);

// Reverse temporary string
      for (let i = tmp.length - 1; i >= 0; i--) {
        sb.append(tmp.charAt(i));
      }
      idx += len;
    }
  }

  private static isDigit(ch: char): boolean {
    return ch >= '0'.charCodeAt(0) && ch <= '9'.charCodeAt(0);
  }

  private static isAlphaUpper(ch: char): boolean {
    return ch === ' '.charCodeAt(0) || (ch >= 'A'.charCodeAt(0) && ch <= 'Z'.charCodeAt(0));
  }

  private static isAlphaLower(ch: char) {
    return ch === ' '.charCodeAt(0) || (ch >= 'a'.charCodeAt(0) && ch <= 'z'.charCodeAt(0));
  }

  private static isMixed(ch: char): boolean {
    return PDF417HighLevelEncoder.MIXED[ch] !== -1;
  }

  private static isPunctuation(ch: char): boolean {
    return PDF417HighLevelEncoder.PUNCTUATION[ch] !== -1;
  }

  private static isText(ch: char): boolean {
    return ch === '\t'.charCodeAt(0) || ch === '\n'.charCodeAt(0) || ch === '\r'.charCodeAt(0) || (ch >= 32 && ch <= 126);
  }

  private static determineConsecutiveDigitCount(msg: string, startpos: number): number {
    let count = 0;
    let len = msg.length;
    let idx = startpos;
    if (idx < len) {
      let ch = msg.charAt(idx);
      while (PDF417HighLevelEncoder.isDigit(msg.charCodeAt(idx)) && idx < len) {
        count++;
        idx++;
        if (idx < len) {
          ch = msg.charAt(idx);
        }
      }
    }
    return count;
  }

  private static determineConsecutiveTextCount(msg: string, startpos: number): number {
    let len = msg.length;
    let idx = startpos;
    while (idx < len) {
      let ch = msg.charAt(idx);
      let numericCount = 0;
      while (numericCount < 13 && PDF417HighLevelEncoder.isDigit(msg.charCodeAt(idx)) && idx < len) {
        numericCount++;
        idx++;
        if (idx < len) {
          ch = msg.charAt(idx);
        }
      }
      if (numericCount >= 13) {
        return idx - startpos - numericCount;
      }
      if (numericCount > 0) {
        // Heuristic: All text-encodable chars or digits are binary encodable
        continue;
      }
      ch = msg.charAt(idx);

// Check if character is encodable
      if (!PDF417HighLevelEncoder.isText(msg.charCodeAt(idx))) {
        break;
      }
      idx++;
    }
    return idx - startpos;
  }

  private static determineConsecutiveBinaryCount(msg: string, startpos: number, encoding: string)
    : number {

    let len = msg.length;
    let idx = startpos;
    while (idx < len) {
      let ch = msg.charAt(idx);
      let chCode = msg.charCodeAt(idx);
      let numericCount = 0;

      while (numericCount < 13 && PDF417HighLevelEncoder.isDigit(chCode)) {
        numericCount++;
        // textCount++;
        let i = idx + numericCount;
        if (i >= len) {
          break;
        }
        ch = msg.charAt(i);
      }
      if (numericCount >= 13) {
        return idx - startpos;
      }
      ch = msg.charAt(idx);

      idx++;
    }
    return idx - startpos;
  }

  private static encodingECI(eci: number, sb: StringBuilder): void {
    if (eci >= 0 && eci < 900) {
      sb.append(String.fromCharCode(<char>PDF417HighLevelEncoder.ECI_CHARSET));
      sb.append(String.fromCharCode(<char>eci));
    } else if (eci < 810900) {
      sb.append(String.fromCharCode(<char>PDF417HighLevelEncoder.ECI_GENERAL_PURPOSE));
      sb.append(String.fromCharCode(<char>(eci / 900 - 1)));
      sb.append(String.fromCharCode(<char>(eci % 900)));
    } else if (eci < 811800) {
      sb.append(String.fromCharCode(<char>PDF417HighLevelEncoder.ECI_USER_DEFINED));
      sb.append(String.fromCharCode(<char>(810900 - eci)));
    } else {
      throw new Error('WriterException("ECI number not in valid range from 0..811799, but was " + eci);');
    }
  }

}
