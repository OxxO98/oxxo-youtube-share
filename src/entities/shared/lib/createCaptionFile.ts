import { saveAs } from 'file-saver';

import type { SharedData } from 'entities/shared/model/types';

export const createCaptionText = (
    sharedData : SharedData,
    timeToTS : ( time : number ) => string,
    opt : 'ko' | 'ja' = 'ja'
) => {
    const captionData = sharedData.timeline.map( (v) => {
        return {
            startTime : timeToTS(v.startTime),
            endTime : timeToTS(v.endTime),
            jaText : v.jaText.map( (j) => j.data ).join(''),
            koText : v.koText ?? ''
        }
    })

    return captionData.map( (v, i) => {
        return `${i}\n${v.startTime} --> ${v.endTime}\n${ opt === 'ko' ? v.koText : v.jaText }\n`
    }).join('\n')
}

export const saveCaptionFile = (
    sharedData : SharedData,
    timeToTS : ( time : number ) => string,
    opt : 'ko' | 'ja' = 'ja'
) => {
    const filename = `CAPTION_${sharedData.videoId}`;
    const captionText = createCaptionText(sharedData, timeToTS, opt);
    const blob = new Blob([captionText], {type: "text/plain;charset=utf-8"});

    saveAs(blob, `${filename}.srt`);
}

