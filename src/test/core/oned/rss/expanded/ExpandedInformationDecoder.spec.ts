/*
 * Copyright (C) 2010 ZXing authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/*
 * These authors would like to acknowledge the Spanish Ministry of Industry,
 * Tourism and Trade, for the support in the project TSI020301-2008-2
 * "PIRAmIDE: Personalizable Interactions with Resources on AmI-enabled
 * Mobile Dynamic Environments", led by Treelogic
 * ( http://www.treelogic.com/ ):
 *
 *   http://www.piramidepse.com/
 */

// package com.google.zxing.oned.rss.expanded;

// import com.google.zxing.common.BitArray;
// import com.google.zxing.oned.rss.expanded.decoders.AbstractExpandedDecoder;

// import org.junit.Assert;
// import org.junit.Test;

import { BitArray, AbstractExpandedDecoder, createAbstractExpandedDecoder } from '@zxing/library';
import { assertEquals } from '../../../util/AssertUtils';
import BinaryUtil from './BinaryUtil';

/**
 * @author Pablo Orduña, University of Deusto (pablo.orduna@deusto.es)
 * @author Eduardo Castillejo, University of Deusto (eduardo.castillejo@deusto.es)
 */
it('ExpandedInformationDecoderTest', () => {

  it('testNoAi', () => {
    let information: BitArray = BinaryUtil.buildBitArrayFromString(' .......X ..XX..X. X.X....X .......X ....');

    let decoder: AbstractExpandedDecoder = createAbstractExpandedDecoder(information);
    let decoded: String = decoder.parseInformation();
    console.assert('(10)12A', decoded.toString());
  });

});
