import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { useTranslation } from 'react-i18next';
import ReactPlayer from 'react-player';
import VirtualList, { ListRef } from 'rc-virtual-list';
import { useMediaQuery } from 'react-responsive';
import { useSelector } from 'react-redux';

import { ComplexText } from 'components/Bun';
import { MediaQueryContext } from 'contexts/MediaQueryContext';
import { VideoContext } from 'contexts/VideoContext';
import { useJaText } from 'hooks/JaTextHook';
import { useReactPlayerHook } from 'hooks/ReactPlayerHook';
import { useHandleSelection } from 'hooks/SelectionHook';
import { useHandleKeyboard, useTimeStamp, useVideoPlayHook } from 'hooks/VideoPlayHook';
import { RootState, store } from 'reducers/store';
import { sharedActions } from 'reducers/sharedReducer';

import type { SharedData, SharedTimeline } from 'entities/shared/model/types';
import {
    DEFAULT_DICTIONARY_PANEL_SIZE,
    DEFAULT_SIDE_PANEL_SIZE,
    INITIAL_DICTIONARY_PANEL_SIZE,
    MAX_DICTIONARY_PANEL_SIZE,
    MAX_SIDE_PANEL_SIZE,
    MIN_MAIN_PANEL_SIZE,
    MIN_SIDE_PANEL_SIZE
} from 'widgets/shared-viewer/config/constants';
import {
    panelBackdropStyle,
    splitterCollapseIconStyle,
    timelineControlStyle
} from 'widgets/shared-viewer/config/styles';
import {
    clampDictionaryPanelSize,
    clampSharedSidePanelSize
} from 'widgets/shared-viewer/lib/panelSize';

import { Layout, Splitter, Flex, Row, Col, Button, List, theme, Select, Modal, Slider, Switch, ColorPicker, Divider, Empty, Typography, InputNumber, FloatButton } from 'antd';
import { SettingOutlined, PlayCircleOutlined, PauseCircleOutlined, BackwardOutlined, ForwardOutlined, ControlOutlined, CaretRightOutlined, CaretLeftOutlined } from '@ant-design/icons'
import type { ColorPickerProps, GetProp } from 'antd';

type Color = GetProp<ColorPickerProps, 'value'>;

const { useToken } = theme;

const { setBackgroundColor, setJaTextColor, setKoTextColor, setJaFontSize, setKoFontSize, setSortFont, setJaFontFamily, setKoFontFamily, toggleFontShadow } = sharedActions;

interface SharedViewerProps {
    sharedData : SharedData;
    isCollapsed : boolean;
}

interface SharedVideoCompProps {
    setPlayerRef : ( player : HTMLVideoElement ) => void;
    state : ReactPlayerState;
    playerHandles : PlayerHandles;
}

interface SharedTimelineCarouselCompProps {
    timeline : SharedTimeline[];
    state : ReactPlayerState;
    playerHandles : PlayerHandles;
    isCollapsed : boolean;
}

interface SharedTimelineCompProps {
    timeline : SharedTimeline[];
    state : ReactPlayerState;
    playerHandles : PlayerHandles;
};

interface SharedBunProps {
    textData : TextData[];
}

interface SharedBunSettingModalCompProps {
    children : React.ReactNode;
}

export const SharedViewer = ({ sharedData, isCollapsed } : SharedViewerProps ) => {
    //Context
    const { videoId } = useContext(VideoContext);
    const isMobile = useMediaQuery({
        query : useContext<MediaQueryContextInterface>(MediaQueryContext).mobile
    });

    //Ref
    const splitterBoxRef = useRef<HTMLDivElement>(null);

    //Hook
    const { state, setPlayerRef, playerHandles } = useReactPlayerHook(videoId);

    //State
    const [splitterWidth, setSplitterWidth] = useState(0);
    const [sidePanelSize, setSidePanelSize] = useState(DEFAULT_SIDE_PANEL_SIZE);
    const [dictionaryPanelSize, setDictionaryPanelSize] = useState(INITIAL_DICTIONARY_PANEL_SIZE);

    useHandleSelection(document, 'activeRange');

    const applySidePanelSize = useCallback( ( size : number ) => {
        setSidePanelSize(clampSharedSidePanelSize(size, splitterWidth));
    }, [splitterWidth])

    const handleSplitterResize = ( sizes : number[] ) => {
        if(isCollapsed){
            return;
        }

        applySidePanelSize(sizes[1] ?? 0);
    }

    const applyDictionaryPanelSize = useCallback( ( size : number ) => {
        setDictionaryPanelSize(clampDictionaryPanelSize(size));
    }, [])

    const handleDictionarySplitterResize = ( sizes : number[] ) => {
        applyDictionaryPanelSize(sizes[0] ?? 0);
    }

    const handleDictionarySplitterCollapse = ( _collapsed : boolean[], sizes : number[] ) => {
        const nextDictionarySize = (dictionaryPanelSize === 0 && (sizes[0] ?? 0) > 0) ? DEFAULT_DICTIONARY_PANEL_SIZE : sizes[0] ?? 0;
        applyDictionaryPanelSize(nextDictionarySize);
    }

    useEffect( () => {
        if(isCollapsed){
            return;
        }

        if(splitterBoxRef.current === null){
            return;
        }

        const observer = new ResizeObserver(entries => {
            for (let entry of entries) {
                setSplitterWidth(entry.contentRect.width);
            }
        });

        observer.observe(splitterBoxRef.current);

        return () => {
            observer.disconnect();
        }
    }, [isCollapsed])

    useEffect( () => {
        setSidePanelSize(prev => clampSharedSidePanelSize(prev, splitterWidth));
    }, [splitterWidth])

    const mainPanelClassName = `shared-page-scrollless shared-main-panel${isCollapsed ? ' shared-main-collapsed' : ''}`;

    if(isMobile){
        return(
            <>
                <Flex vertical className="shared-page-scrollless" style={{ height : '100%', width : '100%', minWidth : 0, background : '#060606', overflow : 'hidden' }}>
                    <Flex vertical className={mainPanelClassName} align='center' justify='space-between' style={{ position : 'relative', width : '100%', flex : '0 0 auto', minWidth : 0, background : '#060606' }}>
                        <SharedVideoComp setPlayerRef={setPlayerRef} state={state} playerHandles={playerHandles}/>
                        <SharedTimelineCarouselComp timeline={sharedData.timeline} state={state} playerHandles={playerHandles} isCollapsed={isCollapsed}/>
                    </Flex>
                    {
                    !isCollapsed &&
                    <div style={{ flex : '1 1 auto', minHeight : 0, width : '100%', background : '#101010', borderTop : '1px solid rgba(255, 255, 255, 0.08)' }}>
                        <SharedTimelineComp timeline={sharedData.timeline} state={state} playerHandles={playerHandles}/>
                    </div>
                    }
                </Flex>
            </>
        )
    }

    return (
        <>
            <div ref={splitterBoxRef} style={{ height : '100%', width : '100%', minWidth : 0 }}>
                <Splitter
                    style={{ height: '100%', width : '100%', background : '#090909' }}
                    onResize={handleSplitterResize}
                    onResizeEnd={handleSplitterResize}
                    lazy
                >
                    <Splitter.Panel min={isCollapsed ? 0 : MIN_MAIN_PANEL_SIZE}>
                        <Flex vertical className={mainPanelClassName} align='center' justify='space-between' style={{ position : 'relative', height : '100%', width : '100%', minWidth : 0, background : '#060606', overflow : 'hidden'}}>
                            <SharedVideoComp setPlayerRef={setPlayerRef} state={state} playerHandles={playerHandles}/>
                            <SharedTimelineCarouselComp timeline={sharedData.timeline} state={state} playerHandles={playerHandles} isCollapsed={isCollapsed}/>
                        </Flex>
                    </Splitter.Panel>
                    <Splitter.Panel
                        size={isCollapsed ? 0 : sidePanelSize}
                        min={isCollapsed ? 0 : MIN_SIDE_PANEL_SIZE}
                        max={isCollapsed ? 0 : MAX_SIDE_PANEL_SIZE}
                    >
                        {
                        !isCollapsed &&
                        <Splitter
                            style={{ ...panelBackdropStyle, minWidth : 0, overflow : 'hidden'  }}
                            collapsibleIcon={{
                                start : <span style={splitterCollapseIconStyle}><CaretLeftOutlined /></span>,
                                end : <span style={splitterCollapseIconStyle}><CaretRightOutlined /></span>
                            }}
                            onResize={handleDictionarySplitterResize}
                            onResizeEnd={handleDictionarySplitterResize}
                            onCollapse={handleDictionarySplitterCollapse}
                            lazy
                        >
                            <Splitter.Panel
                                collapsible={{ start : false, end : true, showCollapsibleIcon : true }}
                                resizable={false}
                                size={dictionaryPanelSize}
                                min={0}
                                max={MAX_DICTIONARY_PANEL_SIZE}
                            >
                                <div style={{ width : '100%', height : '100%', borderRight : '1px solid rgba(255, 255, 255, 0.08)', overflow : 'hidden' }}>
                                    <SharedDictionaryComp />
                                </div>
                            </Splitter.Panel>
                            <Splitter.Panel min={260}>
                                <div style={{ width : '100%', height : '100%', minWidth : 0 }}>
                                    <SharedTimelineComp timeline={sharedData.timeline} state={state} playerHandles={playerHandles}/>
                                </div>
                            </Splitter.Panel>
                        </Splitter>
                        }
                    </Splitter.Panel>
                </Splitter>
            </div>
        </>
    )
}

const areSharedVideoCompPropsEqual = ( prev : SharedVideoCompProps, next : SharedVideoCompProps ) => {
    return (
        prev.setPlayerRef === next.setPlayerRef &&
        prev.state.src === next.state.src &&
        prev.state.pip === next.state.pip &&
        prev.state.playing === next.state.playing &&
        prev.state.volume === next.state.volume &&
        prev.state.muted === next.state.muted
    );
}

const SharedVideoComp = React.memo(({ setPlayerRef, state, playerHandles } : SharedVideoCompProps) => {

    //State
    const { handlePlay, handlePause, handleDurationChange } = playerHandles;

    const {
        src,
        pip,
        playing,
        volume,
        muted,
    } = state;

    return(
        <>
            <div
                className="shared-video-shell"
            >
                <div
                    className="shared-video-frame"
                >
                <ReactPlayer
                    ref={setPlayerRef}
                    style={{ width: '100%', height: '100%', display : 'block' }}
                    src={src}
                    pip={pip}
                    playing={playing}
                    onPlay={handlePlay}
                    onPause={handlePause}
                    onDurationChange={handleDurationChange}
                    controls={false}
                    loop={true}
                    volume={volume}
                    muted={muted}
                    playsInline={true}
                />
                </div>
            </div>
        </>
    )
}, areSharedVideoCompPropsEqual)

const SharedBun = ({ textData } : SharedBunProps ) => {
    const _bId = 'bId'.concat( textData.map( (v) => v.offset ).join('') )

    return(
        <>
        {
            textData.map( (v, i) =>
                <ComplexText key={`${_bId}-${i}`} bId={_bId} offset={v.offset} data={v.data} ruby={v.ruby}/>
            )
        }
        </>
    )
}

const SharedTimelineCarouselComp = ({ timeline, state, playerHandles, isCollapsed } : SharedTimelineCarouselCompProps ) => {

    const { t } = useTranslation('SharedTimelineCarouselComp');

    //Context
    const isMobile = useMediaQuery({
        query : useContext<MediaQueryContextInterface>(MediaQueryContext).mobile
    });

    //Redux
    const { backgroundColor, jaTextColor, koTextColor,  jaTextFontSize, koTextFontSize, jaFontFamily, koFontFamily, sortFont, fontShadow, jaFontWeight, koFontWeight } = useSelector( (_state : RootState) => _state.shared );

    const TimelineBunStyle : CSSProperties = {
        width : '100%',
        textAlign : 'center',
        margin : 'auto',
        backgroundColor : backgroundColor,
        boxSizing : 'border-box',
        overflowWrap : 'break-word',
        wordBreak : 'keep-all',
    }

    const BoxStyle : CSSProperties = {
        position : 'absolute',
        transform : `translate(-50%, 0%)`,
        bottom : `${ isCollapsed ? '18px' : '86px' }`,
        left : `50%`,
        width : isMobile ? '92%' : 'min(88%, 980px)',
        padding : isMobile ? '10px 14px' : '12px 22px',
        borderRadius : 8,
        backdropFilter : 'blur(4px)',
        paddingBottom : `${ isMobile ? 'calc(10px + 3dvw)' : '12px' }`
    }

    const textShadow = fontShadow ? '-1px 0px black, 0px 1px black, 1px 0px black, 0px -1px black' : '';

    const JaTextStyle : CSSProperties = {
        fontSize : `min( ${jaTextFontSize/10}dvw, calc( (100dvh${ isCollapsed ? '' : ' - 134px'}) * 16 / 9 / 100 * ${jaTextFontSize/10}) )`,
        color : jaTextColor,
        fontFamily : jaFontFamily,
        fontWeight : jaFontWeight,
        textShadow: textShadow,
        lineHeight : 1.45
    }

    const KoTextStyle : CSSProperties = {
        fontSize : `min( ${koTextFontSize/10}dvw, calc( (100dvh${ isCollapsed ? '' : ' - 134px'}) * 16 / 9 / 100 * ${koTextFontSize/10}) )`,
        color : koTextColor,
        fontFamily : koFontFamily,
        fontWeight : koFontWeight,
        textShadow: textShadow,
        lineHeight : 1.45,
        marginTop : 4
    }

    //State
    const [currentBunId, setCurrentBunId] = useState(0);

    const { playing, playedSeconds } = state;
    const { handlePausePlay, handleSeek } = playerHandles;

    const [bunSelect, setBunSelect] = useState({ ja : true, ko : true });

    const [floatButtonOpen, setFloatButtonOpen] = useState(false);

    const { gotoTime, keyboard } = useVideoPlayHook( playing, handlePausePlay, state, handleSeek );

    const customKeyBoard = [
        { key : 'ArrowRight', action : () => { nextTimeLine() } },
        { key : 'ArrowLeft', action : () => { prevTimeLine() } }
    ]
    const filteredKeyboard = {
        pauseYT : keyboard.pauseYT,
        prevSec : keyboard.prevSec,
        nextSec : keyboard.nextSec,
        prevFrame : keyboard.prevFrame,
        nextFrame : keyboard.nextFrame,
        markerPlay : keyboard.markerPlay,
        markerStop : keyboard.markerStop,
        loop : keyboard.loop
    }
    useHandleKeyboard({ ...filteredKeyboard, custom : customKeyBoard });

    //Handle @timeline
    const prevTimeLine = () => {
        if( timeline === null ){
            return;
        }

        if(currentBunId > 0){
            let curr = timeline[currentBunId-1];
            gotoTime(curr.startTime, true);

            setCurrentBunId(currentBunId-1);
        }
    }

    const nextTimeLine = () => {
        if( timeline === null ){
            return;
        }

        if(currentBunId+1 < timeline.length){
            let curr = timeline[currentBunId+1];
            gotoTime(curr.startTime, true);

            setCurrentBunId(currentBunId+1);
        }
    }

    const playTimeline = () => {
        if( timeline === null ){
            return;
        }

        handlePausePlay(!playing);
    }

    const getCurrentTimeLine = useCallback( () => {
        if( timeline === null ){
            return null;
        }

        let a = timeline.findIndex( (arr) =>
            arr.startTime <= playedSeconds &&
            playedSeconds < arr.endTime
        );
        let b = timeline.findIndex( (arr) =>
            arr.startTime === playedSeconds
        );

        if( a !== -1 ){
            if( b !== -1 ){
                return b;
            }
            else{
                return a;
            }
        }
        return null;
    }, [timeline, playedSeconds])

    const moveCurrentTimeLine = useCallback( () => {
        if(playedSeconds !== null){
            if(timeline !== null){
                let curTL = getCurrentTimeLine();
                if( curTL !== null){
                    setCurrentBunId( curTL );
                }
            }
        }
    }, [playedSeconds, timeline, getCurrentTimeLine])

    const handelSelectChange = ( value : string ) => {
        if( value === 'jaOnly'){ setBunSelect({ ja : true, ko : false }) }
        if( value === 'koOnly'){ setBunSelect({ ja : false, ko : true }) }
        if( value === 'both'){ setBunSelect({ ja : true, ko : true }) }
    }

    useEffect( () => {
        moveCurrentTimeLine();
    }, [moveCurrentTimeLine])

    return(
        <>
            <div>
                <div>
                    {
                        isCollapsed === false &&
                        <div style={timelineControlStyle}>
                            <Flex justify='center' align='center' gap='small' wrap>
                                <Button onClick={prevTimeLine} icon={<BackwardOutlined />}>
                                    {!isMobile && t('BUTTON.PREV')}
                                </Button>
                                <Button type='primary' onClick={playTimeline} icon={ playing ? <PauseCircleOutlined /> : <PlayCircleOutlined/> }>
                                    {!isMobile && t('BUTTON.PLAY')}
                                </Button>
                                <Button onClick={nextTimeLine} icon={<ForwardOutlined />}>
                                    {!isMobile && t('BUTTON.NEXT')}
                                </Button>
                                <Select
                                    defaultValue="both"
                                    style={{ minWidth : 120 }}
                                    onChange={handelSelectChange}
                                    options={[
                                        { value: 'jaOnly', label: t('SELECT.JATEXT_ONLY') },
                                        { value: 'koOnly', label: t('SELECT.KOTEXT_ONLY') },
                                        { value: 'both', label: t('SELECT.BOTH') },
                                ]}/>
                                <SharedBunSettingModalComp>
                                    <Flex vertical justify='center' style={{ ...TimelineBunStyle, marginBottom : '16px', padding : '14px 18px', borderRadius : 8, border : '1px solid rgba(255, 255, 255, 0.1)' }}>
                                    {
                                        sortFont ?
                                        <>
                                        {
                                            bunSelect.ko &&
                                            <div style={KoTextStyle}>
                                                {timeline[currentBunId].koText}
                                            </div>
                                        }
                                        {
                                            bunSelect.ja &&
                                            <div style={JaTextStyle}>
                                                <SharedBun textData={timeline[currentBunId].jaText}/>
                                            </div>
                                        }
                                        </>
                                        :
                                        <>
                                        {
                                            bunSelect.ja &&
                                            <div style={JaTextStyle}>
                                                <SharedBun textData={timeline[currentBunId].jaText}/>
                                            </div>
                                        }
                                        {
                                            bunSelect.ko &&
                                            <div style={KoTextStyle}>
                                                {timeline[currentBunId].koText}
                                            </div>
                                        }
                                        </>
                                    }
                                    </Flex>
                                </SharedBunSettingModalComp>
                            </Flex>
                        </div>
                    }
                    {
                        isCollapsed === true && isMobile &&
                        <FloatButton.Group
                            style={{
                                transform : `translate( 0%, calc(-100% - 16px) )`
                            }}
                            open={floatButtonOpen}
                            trigger='click'
                            icon={<ControlOutlined />}
                            onClick={() => setFloatButtonOpen(!floatButtonOpen)}
                        >
                            <FloatButton onClick={prevTimeLine} icon={<BackwardOutlined />}/>
                            <FloatButton type='primary' onClick={playTimeline} icon={ playing ? <PauseCircleOutlined /> : <PlayCircleOutlined/> }/>
                            <FloatButton onClick={nextTimeLine} icon={<ForwardOutlined />}/>
                        </FloatButton.Group>
                    }
                    <Flex vertical justify='center' style={{ ...TimelineBunStyle, ...BoxStyle }}>
                    {
                    timeline !== null && timeline.length !== 0 &&
                    <>
                    {
                        sortFont ?
                        <>
                        {
                            bunSelect.ko &&
                            <div style={KoTextStyle}>
                                {timeline[currentBunId].koText}
                            </div>
                        }
                        {
                            bunSelect.ja &&
                            <div id="activeRange" style={JaTextStyle}>
                                <SharedBun textData={timeline[currentBunId].jaText}/>
                            </div>
                        }
                        </>
                        :
                        <>
                        {
                            bunSelect.ja &&
                            <div id="activeRange" style={JaTextStyle}>
                                <SharedBun textData={timeline[currentBunId].jaText}/>
                            </div>
                        }
                        {
                            bunSelect.ko &&
                            <div style={KoTextStyle}>
                                {timeline[currentBunId].koText}
                            </div>
                        }
                        </>
                    }
                    </>
                    }
                    </Flex>
                </div>
            </div>
        </>
    )
}

const SharedBunSettingModalComp = ({ children } : SharedBunSettingModalCompProps ) => {

    const { t } = useTranslation('SharedBunSettingModalComp');

    //State
    const [isModalOpen, setIsModalOpen] = useState(false);

    //Redux
    const { backgroundColor, jaTextColor, koTextColor, jaTextFontSize, koTextFontSize, sortFont, fontShadow, jaFonts, koFonts, jaFontFamily, koFontFamily } = useSelector( (_state : RootState ) => _state.shared );

    const presets = [
        { value : 0, label : t('FONTS_PRESETS.0'), ja : jaFonts[0].value, ko : koFonts[0].value },
        { value : 1, label : t('FONTS_PRESETS.1'), ja : jaFonts[4].value, ko : koFonts[2].value },
        { value : 2, label : t('FONTS_PRESETS.2'), ja : jaFonts[1].value, ko : koFonts[3].value },
        { value : 3, label : t('FONTS_PRESETS.3'), ja : jaFonts[7].value, ko : koFonts[5].value },
        { value : 4, label : t('FONTS_PRESETS.4'), ja : jaFonts[7].value, ko : koFonts[6].value },
        { value : 5, label : t('FONTS_PRESETS.5'), ja : jaFonts[6].value, ko : koFonts[4].value },
        { value : 6, label : t('FONTS_PRESETS.6'), ja : jaFonts[6].value, ko : koFonts[7].value },
    ]

    //Handle
    const showModal = () => {
        setIsModalOpen(true);
    };

    const handleOk = () => {
        setIsModalOpen(false);
    };

    const handleCancel = () => {
        setIsModalOpen(false);
    };

    //handle @setting_font
    const handelJaFontSelectChange = (value : string) => {
        store.dispatch( setJaFontFamily(value) );
    }

    const handelKoFontSelectChange = (value : string) => {
        store.dispatch( setKoFontFamily(value) );
    }

    const handelPresetChange = (value : number) => {
        store.dispatch( setJaFontFamily(presets[value].ja ) )
        store.dispatch( setKoFontFamily(presets[value].ko ) )
    }

    //handle @setting_text
    const onJaFontSizeChange = (value : number | null) => {
        if(value === null){ return }
        store.dispatch( setJaFontSize(value) );
    }

    const onKoFontSizeChange = (value : number | null) => {
        if(value === null){ return }
        store.dispatch( setKoFontSize(value) );
    }

    const onSortChange = ( checked : boolean ) => {
        store.dispatch( setSortFont(checked) );
    }

    //handle @setting_color
    const onBackgroundColorChange = ( color : Color, css : string ) => {
        store.dispatch( setBackgroundColor(css) );
    }
    const onJaTextColorChange = ( color : Color, css : string ) => {
        store.dispatch( setJaTextColor(css) );
    }
    const onKoTextColorChange = ( color : Color, css : string ) => {
        store.dispatch( setKoTextColor(css) );
    }

    //handle @setting_border
    const onChange = (checked : boolean) => {
        store.dispatch( toggleFontShadow() );
    };

    return(
        <>
            <Button onClick={showModal}>
                <SettingOutlined />
            </Button>

            <Modal
                title={t('TITLE')}
                closable={{ 'aria-label': 'Custom Close Button' }}
                open={isModalOpen}
                onCancel={handleCancel}
                width={'min(860px, 92vw)'}
                footer={[
                    <Button onClick={handleCancel}>{t('BUTTON.CANCLE')}</Button>,
                    <Button type='primary' onClick={handleOk}>{t('BUTTON.DONE')}</Button>
                ]}
            >
                {children}
                <Row align='middle' gutter={[12, 12]}>
                    <Col span={4}>
                        {t('CONTENTS.0')}
                    </Col>
                    <Col span={4}>
                        <Switch value={sortFont} onChange={onSortChange}/>
                    </Col>
                </Row>
                <Divider />
                <Row align='middle' gutter={[12, 12]}>
                    <Col span={4}>
                        {t('CONTENTS.1')}
                    </Col>
                    <Col span={4}>
                        <Select
                            defaultValue={presets[0].value}
                            style={{ minWidth : 120 }}
                            onChange={handelPresetChange}
                            options={presets}/>
                    </Col>
                </Row>
                <Divider />
                <Row align='middle' gutter={[12, 12]}>
                    <Col span={4}>
                        {t('CONTENTS.2')}
                    </Col>
                    <Col span={8}>
                        <Slider
                            min={10}
                            max={60}
                            onChange={onJaFontSizeChange}
                            value={jaTextFontSize}
                        />
                    </Col>
                    <Col span={4}>
                        <InputNumber
                            min={10}
                            max={60}
                            style={{ margin: '0 16px' }}
                            value={jaTextFontSize}
                            onChange={onJaFontSizeChange}
                        />
                    </Col>
                    <Col span={4}>
                        <ColorPicker value={jaTextColor} onChange={onJaTextColorChange}/>
                    </Col>
                </Row>
                <Row align='middle' gutter={[12, 12]}>
                    <Col offset={4}>
                        <Select
                            defaultValue={jaFonts[0].value}
                            value={jaFontFamily}
                            style={{ minWidth : 120 }}
                            onChange={handelJaFontSelectChange}
                            options={jaFonts}/>
                    </Col>
                </Row>
                <Divider />
                <Row align='middle' gutter={[12, 12]}>
                    <Col span={4}>
                        {t('CONTENTS.3')}
                    </Col>
                    <Col span={8}>
                        <Slider
                            min={10}
                            max={60}
                            onChange={onKoFontSizeChange}
                            value={koTextFontSize}
                        />
                    </Col>
                    <Col span={4}>
                        <InputNumber
                            min={10}
                            max={60}
                            style={{ margin: '0 16px' }}
                            value={koTextFontSize}
                            onChange={onKoFontSizeChange}
                        />
                    </Col>
                    <Col span={4}>
                        <ColorPicker value={koTextColor} onChange={onKoTextColorChange}/>
                    </Col>
                </Row>
                <Row align='middle' gutter={[12, 12]}>
                    <Col offset={4}>
                        <Select
                            defaultValue={koFonts[0].value}
                            value={koFontFamily}
                            style={{ minWidth : 120 }}
                            onChange={handelKoFontSelectChange}
                            options={koFonts}/>
                    </Col>
                </Row>
                <Divider />
                <Row align='middle' gutter={[12, 12]}>
                    <Col span={4}>
                        {t('CONTENTS.4')}
                    </Col>
                    <Col span={4}>
                        <ColorPicker value={backgroundColor} onChange={onBackgroundColorChange}/>
                    </Col>
                </Row>
                <Divider />
                <Row>
                    <Col span={4}>
                        {t('CONTENTS.5')}
                    </Col>
                    <Col span={4}>
                        <Switch value={fontShadow} onChange={onChange}/>
                    </Col>
                </Row>
            </Modal>
        </>
    )
}

const SharedTimelineComp = ({ timeline, state, playerHandles } : SharedTimelineCompProps ) => {

    const divBox = useRef<HTMLDivElement>(null); //canvas Div Box Size
    const [divBoxHeight, setDivBoxHeight] = useState<number>(800);
    const virtualRef = useRef(null);

    //hook
    const { playing, playedSeconds } = state;
    const { handlePlay, handleSeek } = playerHandles;

    const { gotoTime } = useVideoPlayHook( playing, handlePlay, state, handleSeek );
    const { timeToTS } = useTimeStamp();

    //CSS@antd
    const { token } = useToken();

    //handle @timeline
    const moveTimeLine = useCallback( () => {
        if(playedSeconds !== null){
            if(timeline !== null){
                let a = timeline.findIndex( (v) =>
                    v.startTime < playedSeconds &&
                    playedSeconds < v.endTime
                )
                if( a !== -1 ){
                    return a;
                }
            }
        }
    }, [timeline, playedSeconds]);

    const goToTimeLine = ( i : number ) => {
        let curr = timeline[i];
        gotoTime(curr.startTime, null)
    }

    //Memo
    const currentBunId = useMemo( () => { return moveTimeLine() }, [moveTimeLine])

    useEffect( () => {
        if( virtualRef.current !== null && currentBunId !== undefined ){
            (virtualRef.current as ListRef).scrollTo({ index : currentBunId, align : 'top', offset : divBoxHeight/2 });
        }
    }, [currentBunId, divBoxHeight])

    useEffect( () => {
        if(divBox.current !== null){
            const observer = new ResizeObserver(entries => {
            for (let entry of entries) {
                const { height } = entry.contentRect;
                setDivBoxHeight(height);
            }
            });

            observer.observe(divBox.current);
        }
    }, [])

    return(
        <>
            <Flex vertical className="shared-page-scrollless" style={{ height : '100%', width : "100%" }}>
                <div className="shared-page-scrollless" style={{ width : "100%", height : "100%", overflow : "hidden"}} ref={divBox}>
                {
                    timeline !== null &&
                    <List
                        className="shared-page-scrollless"
                        bordered={false}
                        style={{
                            background : '#101010',
                            padding : '10px 8px'
                        }}
                    >
                        <VirtualList
                            data={timeline}
                            height={divBoxHeight}
                            itemHeight={92}
                            itemKey="id"
                            ref={virtualRef}
                        >
                        {
                            (v, i) => {
                                const isActive = currentBunId !== undefined && currentBunId === i;

                                return (
                                <List.Item
                                    style={{
                                        margin : '0 0 8px',
                                        padding : '12px 14px',
                                        border : `1px solid ${isActive ? token.colorPrimaryBorder : 'rgba(255, 255, 255, 0.08)'}`,
                                        borderRadius : 8,
                                        background : isActive ? 'rgba(215, 0, 11, 0.16)' : 'rgba(255, 255, 255, 0.035)',
                                        boxShadow : isActive ? 'inset 3px 0 0 #d7000b' : 'none',
                                        cursor : 'pointer',
                                        transition : 'background 160ms ease, border-color 160ms ease'
                                    }}
                                >
                                    <div style={{ width : "100%" }} onClick={() => goToTimeLine(i)}>
                                        <Flex justify="space-between" align="center" gap={8} style={{ width : "100%", marginBottom : 6 }}>
                                            <Typography.Text
                                                style={{
                                                    color : isActive ? token.colorPrimary : token.colorTextSecondary,
                                                    fontSize : 12,
                                                    fontVariantNumeric : 'tabular-nums'
                                                }}
                                            >
                                                {timeToTS(v.startTime)}
                                            </Typography.Text>
                                            <Typography.Text type="secondary" style={{ fontSize : 12 }}>
                                                {timeToTS(v.endTime)}
                                            </Typography.Text>
                                        </Flex>
                                        <Flex justify="left" style={{ width : "100%", color : token.colorText, lineHeight : 1.55 }}>
                                            <Typography.Text className='default_jaText' style={{ color : token.colorText, fontSize : 15 }}>
                                                <SharedBun textData={timeline[i].jaText}/>
                                            </Typography.Text>
                                        </Flex>
                                        <Flex justify="space-between" style={{ width : "100%", marginTop : 4 }}>
                                            <Typography.Text type="secondary" style={{ lineHeight : 1.5 }}>
                                                {timeline[i].koText}
                                            </Typography.Text>
                                        </Flex>
                                    </div>
                                </List.Item>
                                )
                            }
                        }
                        </VirtualList>
                    </List>
                }
                </div>
            </Flex>
        </>
    )
}

const DictionaryStyle = {
    border: 'none',
    width: 'calc(100% + 16px)',
    height: '100%',
    marginRight: '-16px',
}

const SharedDictionaryComp = () => {

    const { t } = useTranslation('SharedDictionaryComp');

    //Redux
    const { selection } = useSelector( (_state : RootState) => _state.selection );

    //Hook
    const { checkKatachi } = useJaText();

    return(
        <>
        {
            selection && selection !== '?' && selection !== ' ' && selection.length < 10 && checkKatachi(selection) !== null ?
            <div style={{ width : '100%', height : '100%', overflow : 'hidden' }}>
                <iframe title='dictionary_naver' src={'https://ja.dict.naver.com/?m=mobile#/search?range=all&query=' + selection} style={DictionaryStyle}></iframe>
            </div>
            :
            <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={
                    <Typography.Text>
                        {t('MESSAGE.ERROR')}
                    </Typography.Text>
                }
            />
        }
        </>
    )
}

