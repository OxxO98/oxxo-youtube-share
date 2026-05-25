export interface SharedFontPreset {
    value : number;
    jaFontFamily : string;
    koFontFamily : string;
}

export const DEFAULT_SHARED_FONT_PRESET = 0;

export const SHARED_FONT_PRESETS : SharedFontPreset[] = [
    { value : 0, jaFontFamily : 'Noto Sans JP', koFontFamily : 'Aggravo' },
    { value : 1, jaFontFamily : 'BIZ UDPGothic', koFontFamily : 'nanumgothic' },
    { value : 2, jaFontFamily : 'Mochiy Pop One', koFontFamily : 'OneStoreMobilePop' },
    { value : 3, jaFontFamily : 'Zen Kurenaido', koFontFamily : 'KyoboHandwriting2019' },
    { value : 4, jaFontFamily : 'Zen Kurenaido', koFontFamily : 'InkLiquid' },
    { value : 5, jaFontFamily : 'DotGothic16', koFontFamily : 'RoundedFixedsys' },
    { value : 6, jaFontFamily : 'DotGothic16', koFontFamily : 'DnfBitbeatV2' },
];

export const getSharedFontPreset = ( value : number ) => {
    return SHARED_FONT_PRESETS.find( preset => preset.value === value );
}

export const isSharedFontPresetValue = ( value : unknown ) : value is number => {
    return typeof value === 'number' && getSharedFontPreset(value) !== undefined;
}
