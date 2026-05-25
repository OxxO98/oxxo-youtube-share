import LZstring from 'lz-string';

import { DEFAULT_SHARED_FONT_PRESET, isSharedFontPresetValue } from 'entities/shared/config/fontPresets';
import type { SharedData } from 'entities/shared/model/types';

export const decodeSharedData = ( encode : string ) : SharedData => {
    const decompressed = LZstring.decompressFromEncodedURIComponent(encode);
    const decodedData : RES_SHARED_DATA = JSON.parse(decompressed as string);

    const setting = decodedData.s !== undefined ?
        {
            setting : {
                preset : isSharedFontPresetValue(decodedData.s.p) ? decodedData.s.p : DEFAULT_SHARED_FONT_PRESET,
            }
        }
        :
        {}

    return {
        videoId : decodedData.v,
        timeline : decodedData.t.map( (v, i) => {
            return {
                startTime : v.s,
                endTime : v.e,
                jaText : v.j === undefined ?
                    [{
                        data : '',
                        ruby : null,
                        offset : 0
                    }]
                    :
                    typeof v.j === 'string' ?
                        [{
                            data : v.j,
                            ruby : null,
                            offset : 0
                        }]
                    :
                        v.j.map( (t) => {
                            return {
                                data : t.d,
                                ruby : t.r,
                                offset : t.o
                            }
                        })
                    ,
                koText : v.k === undefined ?
                    ''
                    :
                    v.k
                ,
                id : i.toString()
            }
        }),
        ...setting
    }
}

