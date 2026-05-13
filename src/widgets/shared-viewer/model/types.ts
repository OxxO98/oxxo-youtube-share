import type { ReactNode } from 'react';

import type { SharedData, SharedTimeline } from 'entities/shared/model/types';

export interface SharedViewerProps {
    sharedData : SharedData;
    isCollapsed : boolean;
}

export interface SharedVideoProps {
    setPlayerRef : ( player : HTMLVideoElement ) => void;
    state : ReactPlayerState;
    playerHandles : PlayerHandles;
}

export interface SharedTimelineCarouselProps {
    timeline : SharedTimeline[];
    state : ReactPlayerState;
    playerHandles : PlayerHandles;
    isCollapsed : boolean;
}

export interface SharedTimelineListProps {
    timeline : SharedTimeline[];
    state : ReactPlayerState;
    playerHandles : PlayerHandles;
}

export interface SharedBunProps {
    textData : TextData[];
}

export interface SharedBunSettingModalProps {
    children : ReactNode;
}

