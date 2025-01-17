import { BitArray } from '@zxing/library';
import { assertEquals } from '../../../util/AssertUtils';
import BinaryUtil from './BinaryUtil';

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

// import org.junit.Assert;
// import org.junit.Test;

// import java.util.regex.Pattern;

/**
 * @author Pablo Orduña, University of Deusto (pablo.orduna@deusto.es)
 */
it('BinaryUtilTest', () => {

  it('testBuildBitArrayFromString', () => {

    let data = ' ..X..X.. ..XXX... XXXXXXXX ........';
    check(data);

    data = ' XXX..X..';
    check(data);

    data = ' XX';
    check(data);

    data = ' ....XX.. ..XX';
    check(data);

    data = ' ....XX.. ..XX..XX ....X.X. ........';
    check(data);
  });

  it('testBuildBitArrayFromStringWithoutSpaces', () => {
    let data = ' ..X..X.. ..XXX... XXXXXXXX ........';
    checkWithoutSpaces(data);

    data = ' XXX..X..';
    checkWithoutSpaces(data);

    data = ' XX';
    checkWithoutSpaces(data);

    data = ' ....XX.. ..XX';
    checkWithoutSpaces(data);

    data = ' ....XX.. ..XX..XX ....X.X. ........';
    checkWithoutSpaces(data);
  });
});

const SPACE: RegExp = /\s/;

function check(data: string): void {
  const binary: BitArray = BinaryUtil.buildBitArrayFromString(data);
  console.assert(data, binary.toString());
}

function checkWithoutSpaces(data: string): void {
  const dataWithoutSpaces: string = data.replace(SPACE, '');
  const binary: BitArray = BinaryUtil.buildBitArrayFromStringWithoutSpaces(dataWithoutSpaces);
  console.assert(data, binary.toString());
}
