import { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { useTranslation } from 'react-i18next';
import { useMediaQuery } from 'react-responsive';
import VirtualList, { ListRef } from 'rc-virtual-list';

import { Flex, List, Typography } from 'antd';

import { MediaQueryContext } from 'contexts/MediaQueryContext';

import { useTimeStamp, useVideoPlayHook } from 'hooks/VideoPlayHook';

import type { SharedTimelineListProps } from 'widgets/shared-viewer/model/types';
import { SharedBun } from './SharedBun';

const panelOuterStyle: CSSProperties = {
    height: '100%',
    width: '100%',
    padding: 18,
    boxSizing: 'border-box',
    minHeight: 0,
}

const panelStyle : CSSProperties = {
    height : '100%',
    width : '100%',
    background : 'linear-gradient(180deg, #141414, #0d0d0d)',
    border : '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius : 8,
    overflow : 'hidden',
}

const headerStyle : CSSProperties = {
    flex : '0 0 auto',
    padding : '18px 20px 12px',
}

const titleStyle : CSSProperties = {
    color : '#f5f5f5',
    fontSize : 18,
    fontWeight : 800,
}

const countBadgeStyle : CSSProperties = {
    height : 26,
    display : 'inline-flex',
    alignItems : 'center',
    padding : '0 10px',
    borderRadius : 999,
    background : 'rgba(255, 255, 255, 0.06)',
    border : '1px solid rgba(255, 255, 255, 0.12)',
    color : 'rgba(255, 255, 255, 0.72)',
    fontSize : 13,
    fontWeight : 700,
}

const listStyle : CSSProperties = {
    background : 'transparent',
    padding : '0 12px 14px',
}

const timeColumnStyle : CSSProperties = {
    flex : '0 0 106px',
    color : 'rgba(255, 255, 255, 0.76)',
    fontSize : 14,
    fontVariantNumeric : 'tabular-nums',
    lineHeight : 1.8,
}

const verticalDividerStyle : CSSProperties = {
    alignSelf : 'stretch',
    width : 1,
    margin : '0 18px 0 0',
    background : 'rgba(255, 255, 255, 0.08)',
}

const jaTextStyle : CSSProperties = {
    color : '#ffc928',
    fontSize : 17,
    fontWeight : 500,
    lineHeight : 1.45,
}

const koTextStyle : CSSProperties = {
    color : '#f5f5f5',
    fontSize : 17,
    fontWeight : 600,
    lineHeight : 1.45,
    marginTop : 4,
}

const activeMarkerStyle : CSSProperties = {
    position : 'absolute',
    left : -14,
    top : '50%',
    transform : 'translateY(-50%)',
    width : 26,
    height : 52,
    display : 'inline-flex',
    alignItems : 'center',
    justifyContent : 'center',
    borderRadius : '0 999px 999px 0',
    background : 'linear-gradient(180deg, #ff3046, #d7000b)',
    color : '#ffffff',
    fontSize : 12,
    boxShadow : '0 10px 24px rgba(215, 0, 11, 0.32)',
}

export const SharedTimelineList = ({ timeline, state, playerHandles } : SharedTimelineListProps ) => {
    const { t } = useTranslation('SharedTimelineList');
    const isMobile = useMediaQuery({
        query : useContext<MediaQueryContextInterface>(MediaQueryContext).mobile
    });
    const isShort = useMediaQuery({
        query : useContext<MediaQueryContextInterface>(MediaQueryContext).short
    });
    const isResponsive = isMobile || isShort;
    const divBox = useRef<HTMLDivElement>(null);
    const [divBoxHeight, setDivBoxHeight] = useState<number>(800);
    const virtualRef = useRef(null);

    const { playing, playedSeconds } = state;
    const { handlePlay, handleSeek } = playerHandles;

    const { gotoTime } = useVideoPlayHook( playing, handlePlay, state, handleSeek );
    const { timeToTS } = useTimeStamp();

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

    const currentBunId = useMemo( () => { return moveTimeLine() }, [moveTimeLine])
    
    const activeMarkerStyleMobile : CSSProperties = {
        ...activeMarkerStyle,
        width : 20,
        height : '70%'
    }

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

            return () => {
                observer.disconnect();
            }
        }
    }, [])

    return(
        <>
            <Flex vertical style={{ ...panelOuterStyle, paddingTop : isResponsive ? 0 : 18, paddingBottom : isResponsive ? 0 : 18 }}>
                <Flex vertical className="shared-page-scrollless" style={panelStyle}>
                    <Flex align='center' gap={10} style={headerStyle}>
                        <Typography.Text style={titleStyle}>{t('HEADER.TITLE')}</Typography.Text>
                        <span style={countBadgeStyle}>{timeline.length}{t('HEADER.LENGTH')}</span>
                    </Flex>
                    <div className="shared-page-scrollless" style={{ width : "100%", flex : '1 1 auto', minHeight : 0, overflow : "hidden"}} ref={divBox}>
                    {
                        timeline !== null &&
                        <List
                            className="shared-page-scrollless"
                            bordered={false}
                            style={listStyle}
                        >
                            <VirtualList
                                data={timeline}
                                height={divBoxHeight}
                                itemHeight={104}
                                itemKey="id"
                                ref={virtualRef}
                            >
                            {
                                (v, i) => {
                                    const isActive = currentBunId !== undefined && currentBunId === i;

                                    return (
                                    <List.Item
                                        style={{
                                            position : 'relative',
                                            margin : '0 0 8px',
                                            padding : isResponsive ? '8px 16px' : '14px 16px',
                                            border : `1px solid ${isActive ? '#d7000b' : 'rgba(255, 255, 255, 0.08)'}`,
                                            borderRadius : 8,
                                            background : isActive ? 'linear-gradient(180deg, rgba(215, 0, 11, 0.14), rgba(255, 255, 255, 0.035))' : 'linear-gradient(180deg, rgba(255, 255, 255, 0.055), rgba(255, 255, 255, 0.035))',
                                            boxShadow : isActive ? '0 0 0 1px rgba(215, 0, 11, 0.24)' : 'none',
                                            cursor : 'pointer',
                                            transition : 'background 160ms ease, border-color 160ms ease'
                                        }}
                                    >
                                        <div style={{ width : "100%" }} onClick={() => goToTimeLine(i)}>
                                            {
                                                isActive &&
                                                <span style={isResponsive ? activeMarkerStyleMobile : activeMarkerStyle }></span>
                                            }
                                            <Flex align='center' style={{ width : '100%' }}>
                                                {
                                                    !isResponsive &&
                                                    <>
                                                        <Flex vertical justify='center' style={timeColumnStyle}>
                                                            <span>{timeToTS(v.startTime)}</span>
                                                            <span>{timeToTS(v.endTime)}</span>
                                                        </Flex>
                                                        <span style={verticalDividerStyle} />
                                                    </>
                                                }
                                                <Flex vertical justify='center' style={{ flex : '1 1 auto', minWidth : 0 }}>
                                                    <Typography.Text className='default_jaText' style={{ ...jaTextStyle, lineHeight : isResponsive ? 1 : 1.45 }}>
                                                        <SharedBun textData={timeline[i].jaText}/>
                                                    </Typography.Text>
                                                    <Typography.Text style={{ ...koTextStyle, lineHeight : isResponsive ? 1.2 : 1.45 }}>
                                                        {timeline[i].koText}
                                                    </Typography.Text>
                                                </Flex>
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
            </Flex>
        </>
    )
}
