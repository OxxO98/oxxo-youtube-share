import {
    MAX_DICTIONARY_PANEL_SIZE,
    MAX_SIDE_PANEL_SIZE,
    MIN_DICTIONARY_PANEL_SIZE,
    MIN_MAIN_PANEL_SIZE,
    MIN_SIDE_PANEL_SIZE
} from 'widgets/shared-viewer/config/constants';

const clamp = ( value : number, min : number, max : number ) => {
    return Math.min(Math.max(value, min), max);
}

export const clampSharedSidePanelSize = ( side : number, containerWidth : number ) => {
    if(containerWidth <= 0){
        return side;
    }

    if(side <= 0){
        return 0;
    }

    const availableSideWidth = Math.max(0, containerWidth - MIN_MAIN_PANEL_SIZE);
    const maxSideSize = Math.min(MAX_SIDE_PANEL_SIZE, availableSideWidth);

    return Math.round(clamp(side, Math.min(MIN_SIDE_PANEL_SIZE, maxSideSize), maxSideSize));
}

export const clampDictionaryPanelSize = ( dictionarySize : number ) => {
    if(dictionarySize <= 0){
        return 0;
    }

    return Math.round(clamp(dictionarySize, MIN_DICTIONARY_PANEL_SIZE, MAX_DICTIONARY_PANEL_SIZE));
}

