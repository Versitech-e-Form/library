import BarcodeFormat from '../BarcodeFormat';
import EncodeHintType from '../EncodeHintType';
// import Writer from '../Writer';
// import { Writer } from '@zxing/library';
import Writer from '../Writer';
// import {WriterException} from "@zxing/library";
import BitMatrix from '../common/BitMatrix';
import Compaction from './encoder/Compaction';
import Dimensions from './encoder/Dimensions';
import { byte } from '../../customTypings';
import PDF417 from './encoder/PDF417';


export default class PDF417Writer implements Writer {

    private static WHITE_SPACE = 30;

    private static DEFAULT_ERROR_CORRECTION_LEVEL = 2;


    public encode(contents: string,
                  format: BarcodeFormat,
                  width: number,
                  height: number,
                  hints: Map<EncodeHintType, any> = null): BitMatrix {
        if (format !== BarcodeFormat.PDF_417) {
            throw new Error('IllegalArgumentException(\"Can only encode PDF_417, but got \" + format);');
        }

        let encoder: PDF417 = new PDF417();
        let margin = PDF417Writer.WHITE_SPACE;
        let errorCorrectionLevel = PDF417Writer.DEFAULT_ERROR_CORRECTION_LEVEL;

        if (hints != null) {
            if (hints.has(EncodeHintType.PDF417_COMPACT)) {
                encoder.setCompact(String(hints.get(EncodeHintType.PDF417_COMPACT)) === 'true');
            }
            if (hints.has(EncodeHintType.PDF417_COMPACTION)) {
                encoder.setCompaction(<Compaction>hints.get(EncodeHintType.PDF417_COMPACTION));
            }
            if (hints.has(EncodeHintType.PDF417_DIMENSIONS)) {
                let dimensions: Dimensions = <Dimensions>hints.get(EncodeHintType.PDF417_DIMENSIONS);
                encoder.setDimensions(dimensions.getMaxCols(),
                    dimensions.getMinCols(),
                    dimensions.getMaxRows(),
                    dimensions.getMinRows());
            }
            if (hints.has(EncodeHintType.MARGIN)) {
                margin = parseInt(hints.get(EncodeHintType.MARGIN).toString());
            }
            if (hints.has(EncodeHintType.ERROR_CORRECTION)) {
                errorCorrectionLevel = parseInt(hints.get(EncodeHintType.ERROR_CORRECTION).toString());
            }
            if (hints.has(EncodeHintType.CHARACTER_SET)) {
                let encoding: string = hints.get(EncodeHintType.CHARACTER_SET).toString();
                encoder.setEncoding(encoding);
            }
        }

        return PDF417Writer.bitMatrixFromEncoder(encoder, contents, errorCorrectionLevel, width, height, margin);
    }

    private static bitMatrixFromEncoder(encoder: PDF417,
                                        contents: string,
                                        errorCorrectionLevel: number,
                                        width: number,
                                        height: number,
                                        margin: number): BitMatrix {
        encoder.generateBarcodeLogic(contents, errorCorrectionLevel);

        let aspectRatio = 4;
        let originalScale: number[][] = encoder.getBarcodeMatrix().getScaledMatrix(1, aspectRatio);
        let rotated = false;
        if ((height > width) !== (originalScale[0].length < originalScale.length)) {
            originalScale = PDF417Writer.rotateArray(originalScale);
            rotated = true;
        }

        let scaleX = Math.floor(width / originalScale[0].length);
        let scaleY = Math.floor(height / originalScale.length);
        let scale = Math.min(scaleX, scaleY);

        if (scale > 1) {
            let scaledMatrix: number[][] =
                encoder.getBarcodeMatrix().getScaledMatrix(scale, scale * aspectRatio);
            if (rotated) {
                scaledMatrix = PDF417Writer.rotateArray(scaledMatrix);
            }
            return PDF417Writer.bitMatrixFromBitArray(scaledMatrix, margin);
        }
        return PDF417Writer.bitMatrixFromBitArray(originalScale, margin);
    }

    private static bitMatrixFromBitArray(input: number[][], margin: number): BitMatrix {
        // Creates the bit matrix with extra space for whitespace
        let output: BitMatrix = new BitMatrix(input[0].length + 2 * margin, input.length + 2 * margin);
        output.clear();
        for (let y = 0, yOutput = output.getHeight() - margin - 1; y < input.length; y++, yOutput--) {
            let inputY: Array<byte> = input[y];
            for (let x = 0; x < input[0].length; x++) {
                // Zero is white in the byte matrix
                if (inputY[x] === 1) {
                    output.set(x + margin, yOutput);
                }
            }
        }
        return output;
    }


    private static rotateArray(bitarray: number[][]): number[][] {
        let temp: number[][] = Array[bitarray[0].length][bitarray.length];
        for (let ii = 0; ii < bitarray.length; ii++) {
            // This makes the direction consistent on screen when rotating the
            // screen;
            let inverseii = bitarray.length - ii - 1;
            for (let jj = 0; jj < bitarray[0].length; jj++) {
                temp[jj][inverseii] = bitarray[ii][jj];
            }
        }
        return temp;
    }


}
