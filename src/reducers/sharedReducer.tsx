import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

import { getSharedFontPreset } from 'entities/shared/config/fontPresets';

//SharedPage 공유 페이지 통합
type fonts = { value : string, label : string, weight : string | number }[];

interface SharedInitial {
    backgroundColor : string;
    jaTextColor : string;
    koTextColor : string;
    
    jaTextFontSize : number;
    jaFontWeight : number | string;
    koTextFontSize : number;
    koFontWeight : number | string;

    jaFontFamily : string;
    koFontFamily : string;

    sortFont : boolean;
    fontShadow : boolean;

    jaFonts : fonts;
    koFonts : fonts;
}

const koFonts : fonts = [
    { value : "Aggravo", label : "Aggravo", weight : 700 },
    { value : "nanumsquare", label : "nanumsquare", weight : 900 },
    { value : "nanumgothic", label : "nanumgothic", weight : 700 },
    { value : "OneStoreMobilePop", label : "OneStoreMobilePop", weight : 'normal' },
    { value : "RoundedFixedsys", label : "RoundedFixedsys", weight : 'normal' },
    { value : "KyoboHandwriting2019", label : "KyoboHandwriting2019", weight : 'normal' },
    { value : "InkLiquid", label : "InkLiquid", weight : 'normal' },
    { value : "DnfBitbeatV2", label : "DnfBitbeatV2", weight : 400 },
    { value : "OngleipWFontList", label : "OngleipWFontList", weight : 'normal' },
]

const jaFonts : fonts = [
    { value : "Noto Sans JP", label : "Noto Sans JP", weight : 800 },
    { value : "Mochiy Pop One", label : "Mochiy Pop One", weight : 'normal' },
    { value : "Dela Gothic One", label : "Dela Gothic One", weight : 400 },
    { value : "Sawarabi Gothic", label : "Sawarabi Gothic", weight : 400 },
    { value : "BIZ UDPGothic", label :  "BIZ UDPGothic", weight : 400 },
    { value : "Rampart One", label : "Rampart One", weight : 400 },
    { value : "DotGothic16", label : "DotGothic16", weight : 400 },
    { value : "Zen Kurenaido", label : "Zen Kurenaido", weight : 400 }
]

const createInitialState = () : SharedInitial => ({
    backgroundColor : '#00000088',
    jaTextColor : '#ffc928',
    koTextColor : '#FFFFFF',

    jaTextFontSize : 20,
    koTextFontSize : 30,

    jaFontFamily : jaFonts[0].value,
    jaFontWeight : jaFonts[0].weight,
    koFontFamily : koFonts[0].value,
    koFontWeight : koFonts[0].weight,

    sortFont : true,
    fontShadow : false,

    jaFonts : jaFonts,
    koFonts : koFonts
})

const initialState : SharedInitial = createInitialState();

export const sharedSlice = createSlice({
    name : 'shared',
    initialState : initialState,
    reducers : {
        setBackgroundColor : (state, action) => {
            state.backgroundColor = action.payload;
        },
        setJaTextColor : (state, action) => {
            state.jaTextColor = action.payload;
        },
        setKoTextColor : (state, action) => {
            state.koTextColor = action.payload;
        },
        setJaFontSize : (state, action) => {
            state.jaTextFontSize = action.payload;
        },
        setKoFontSize : (state, action) => {
            state.koTextFontSize = action.payload;
        },
        setJaFontFamily : (state, action) => {
            const font = state.jaFonts.find(font => font.value === action.payload);

            state.jaFontFamily = action.payload;

            if (font) {
                state.jaFontWeight = font.weight;
            }
        },
        setKoFontFamily : (state, action) => {
            const font = state.koFonts.find(font => font.value === action.payload);

            state.koFontFamily = action.payload;

            if (font) {
                state.koFontWeight = font.weight;
            }
        },
        applyPreset : (state, action : PayloadAction<number>) => {
            const preset = getSharedFontPreset(action.payload);

            if (preset === undefined) {
                return;
            }

            const jaFont = state.jaFonts.find(font => font.value === preset.jaFontFamily);
            const koFont = state.koFonts.find(font => font.value === preset.koFontFamily);

            state.jaFontFamily = preset.jaFontFamily;
            state.koFontFamily = preset.koFontFamily;

            if (jaFont) {
                state.jaFontWeight = jaFont.weight;
            }

            if (koFont) {
                state.koFontWeight = koFont.weight;
            }
        },
        setSortFont : (state, action) => {
            state.sortFont = action.payload;
        },
        toggleFontShadow : (state) => {
            state.fontShadow = !state.fontShadow 
        },
        setDefault : () => {
            return createInitialState();
        },
        setSharedState : (_state, action : PayloadAction<SharedInitial>) => {
            return action.payload;
        }
    }
})

export const sharedActions = sharedSlice.actions // dispatch를 위한 설정 
export default sharedSlice.reducer;
