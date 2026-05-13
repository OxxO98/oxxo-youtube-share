import { useCallback, useContext, useEffect, useState } from 'react';
import type { CSSProperties } from 'react';
import { useTranslation } from 'react-i18next';
import { useMediaQuery } from 'react-responsive';
import { useSelector } from 'react-redux';

import { Button, Flex, FloatButton, Select } from 'antd';
import { BackwardOutlined, ControlOutlined, ForwardOutlined, PauseCircleOutlined, PlayCircleOutlined } from '@ant-design/icons';

import { MediaQueryContext } from 'contexts/MediaQueryContext';
import { useHandleKeyboard, useVideoPlayHook } from 'hooks/VideoPlayHook';
import { RootState } from 'reducers/store';

import type { SharedTimelineCarouselProps } from 'widgets/shared-viewer/model/types';
import { timelineControlStyle } from 'widgets/shared-viewer/config/styles';
import { SharedBun } from './SharedBun';
import { SharedBunSettingModal } from './SharedBunSettingModal';

export const SharedTimelineCarousel = ({ timeline, state, playerHandles, isCollapsed } : SharedTimelineCarouselProps ) => {
    const { t } = useTranslation('SharedTimelineCarouselComp');

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
                                <SharedBunSettingModal>
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

