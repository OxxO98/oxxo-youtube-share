import { useCallback, useContext, useEffect, useState } from 'react';
import type { CSSProperties } from 'react';
import { useTranslation } from 'react-i18next';
import { useMediaQuery } from 'react-responsive';
import { useSelector } from 'react-redux';

import { Button, Flex, FloatButton, Select, Slider, Typography } from 'antd';
import { StepBackwardOutlined, ControlOutlined, StepForwardOutlined, PauseOutlined, CaretRightOutlined } from '@ant-design/icons';

import { MediaQueryContext } from 'contexts/MediaQueryContext';
import { useHandleKeyboard, useTimeStamp, useVideoPlayHook } from 'hooks/VideoPlayHook';
import { RootState } from 'reducers/store';

import type { SharedTimelineCarouselProps } from 'widgets/shared-viewer/model/types';
import { timelineControlStyle } from 'widgets/shared-viewer/config/styles';
import { SharedBun } from './SharedBun';
import { SharedBunSettingModal } from './SharedBunSettingModal';
import { SharedVideo } from './SharedVideo';

export const SharedTimelineCarousel = ({ timeline, state, playerHandles, setPlayerRef, isCollapsed } : SharedTimelineCarouselProps ) => {
    const { t } = useTranslation('SharedTimelineCarouselComp');
    const { t : tSetting } = useTranslation('SharedBunSettingModalComp');

    const isMobile = useMediaQuery({
        query : useContext<MediaQueryContextInterface>(MediaQueryContext).mobile
    });

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
        transform : `translateX(-50%)`,
        bottom : isMobile ? '7%' : '8%',
        left : `50%`,
        width : isMobile ? '88%' : 'min(72%, 760px)',
        padding : isMobile ? '10px 14px' : '12px 22px',
        borderRadius : 16,
        backdropFilter : 'blur(8px)',
        paddingBottom : `${ isMobile ? 'calc(10px + 2dvw)' : '12px' }`,
        zIndex : 2,
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

    const [currentBunId, setCurrentBunId] = useState(0);

    const { playing, playedSeconds, duration } = state;
    const { handlePausePlay, handleSeek } = playerHandles;

    const [bunSelect, setBunSelect] = useState({ ja : true, ko : true });
    const [floatButtonOpen, setFloatButtonOpen] = useState(false);

    const { gotoTime, keyboard } = useVideoPlayHook( playing, handlePausePlay, state, handleSeek );
    const { timeToTS } = useTimeStamp();

    const sliderMax = Math.max(duration || 0, playedSeconds || 0, 0);
    const sliderValue = Math.min(playedSeconds || 0, sliderMax);

    const controlPanelStyle : CSSProperties = {
        ...timelineControlStyle,
        height : 'auto',
        padding : isMobile ? '10px 12px 14px' : '12px 20px 18px',
        background : 'linear-gradient(rgb(20, 20, 20), rgb(13, 13, 13))',
        boxShadow : '0 -12px 34px rgba(0, 0, 0, 0.36)',
        border : '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius : 8,
        width : '100%',
        flex : '0 0 auto',
    }

    const progressStyle : CSSProperties = {
        width : '100%',
        maxWidth : 920,
        margin : '0 auto 10px',
    }

    const controlGroupStyle : CSSProperties = {
        width : '100%',
        maxWidth : 820,
        margin : '0 auto',
    }

    const controlItemStyle : CSSProperties = {
        flex : '0 0 2',
        minWidth : isMobile ? 48 : 104,
        textAlign : 'center',
    }

    const controlButtonStyle : CSSProperties = {
        width : isMobile ? 44 : 94,
        height : isMobile ? 32 : 54,
        borderRadius : 6,
        background : 'rgba(255, 255, 255, 0.045)',
        border : '1px solid rgba(255, 255, 255, 0.12)',
        color : '#f5f5f5',
        fontSize : isMobile ? 18 : 22,
        boxShadow : 'inset 0 1px 0 rgba(255, 255, 255, 0.04)',
    }

    const playButtonStyle : CSSProperties = {
        width : isMobile ? 46 : 68,
        height : isMobile ? 46 : 68,
        borderRadius : '50%',
        background : 'linear-gradient(180deg, #ff3046, #d7000b)',
        border : '1px solid rgba(255, 90, 110, 0.55)',
        color : '#ffffff',
        fontSize : isMobile ? 24 : 30,
        boxShadow : '0 10px 28px rgba(215, 0, 11, 0.42)',
    }

    const dividerStyle : CSSProperties = {
        width : 1,
        height : isMobile ? 38 : 74,
        background : 'rgba(255, 255, 255, 0.10)',
    }

    const controlSelectStyle : CSSProperties = {
        ...controlButtonStyle,
        fontSize : isMobile ? 12 : 16,
        width : isMobile ? 94 : 144,
    }

    const handleProgressChange = ( value : number | number[] ) => {
        if(Array.isArray(value)){
            return;
        }

        handleSeek(value);
    }

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
            <Flex vertical style={{ width : '100%', height : '100%', minHeight : 0 }}>
                <SharedVideo setPlayerRef={setPlayerRef} state={state} playerHandles={playerHandles}>
                    <Flex vertical justify='center' align='center' style={{ ...TimelineBunStyle, ...BoxStyle }}>
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
                </SharedVideo>
                <Flex style={{ padding : 18, paddingTop : isMobile ? 0 : 18 }}>
                {
                    isCollapsed === false &&
                    <div style={controlPanelStyle}>
                        <div style={progressStyle}>
                            <Slider
                                min={0}
                                max={sliderMax}
                                value={sliderValue}
                                onChange={handleProgressChange}
                                disabled={sliderMax <= 0}
                                tooltip={{ formatter : null }}
                                style={{ margin : '0 0 2px' }}
                            />
                            <Flex justify='space-between' align='center'>
                                <Typography.Text style={{ color : 'rgba(255, 255, 255, 0.68)', fontSize : 12, fontVariantNumeric : 'tabular-nums' }}>
                                    {timeToTS(playedSeconds || 0)}
                                </Typography.Text>
                                <Typography.Text style={{ color : 'rgba(255, 255, 255, 0.68)', fontSize : 12, fontVariantNumeric : 'tabular-nums' }}>
                                    {timeToTS(duration || 0)}
                                </Typography.Text>
                            </Flex>
                        </div>
                        <Flex justify='center' align='center' gap={isMobile ? 10 : 20} wrap style={controlGroupStyle}>
                            <Flex vertical align='center' style={controlItemStyle}>
                                <Button style={controlButtonStyle} onClick={prevTimeLine} icon={<StepBackwardOutlined />} />
                            </Flex>
                            <span style={dividerStyle} />
                            <Flex vertical align='center' style={controlItemStyle}>
                                <Button style={playButtonStyle} onClick={playTimeline} icon={ playing ? <PauseOutlined /> : <CaretRightOutlined/> } />
                            </Flex>
                            <span style={dividerStyle} />
                            <Flex vertical align='center' style={controlItemStyle}>
                                <Button style={controlButtonStyle} onClick={nextTimeLine} icon={<StepForwardOutlined />} />
                            </Flex>
                            <span style={dividerStyle} />
                            <Flex vertical align='center' style={controlItemStyle}>
                                <Select
                                    defaultValue="both"
                                    variant='borderless'
                                    style={controlSelectStyle}
                                    onChange={handelSelectChange}
                                    options={[
                                        { value: 'jaOnly', label: t('SELECT.JATEXT_ONLY') },
                                        { value: 'koOnly', label: t('SELECT.KOTEXT_ONLY') },
                                        { value: 'both', label: t('SELECT.BOTH') },
                                ]}/>
                            </Flex>
                            <span style={dividerStyle} />
                            <Flex vertical align='center' style={controlItemStyle}>
                                <SharedBunSettingModal triggerStyle={controlButtonStyle}>
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
                                </SharedBunSettingModal>
                            </Flex>
                        </Flex>
                    </div>
                }
                </Flex>
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
                        <FloatButton onClick={prevTimeLine} icon={<StepBackwardOutlined />}/>
                        <FloatButton type='primary' onClick={playTimeline} icon={ playing ? <PauseOutlined /> : <CaretRightOutlined/> }/>
                        <FloatButton onClick={nextTimeLine} icon={<StepForwardOutlined />}/>
                        <SharedBunSettingModal triggerStyle={{ width : '40px', height : '40px', borderRadius : '50%'}} >
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
                        </SharedBunSettingModal>
                    </FloatButton.Group>
                }
            </Flex>
        </>
    )
}
