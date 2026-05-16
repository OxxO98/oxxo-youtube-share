export interface SharedTimeline {
    id : string;
    startTime : number;
    endTime : number;
    jaText : Array<TextData>;
    koText : string;
}

export interface SharedData {
    videoId : string;
    timeline : SharedTimeline[];
}

