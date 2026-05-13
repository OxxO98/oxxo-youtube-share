import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import VirtualList, { ListRef } from 'rc-virtual-list';

import { Flex, List, theme, Typography } from 'antd';

import { useTimeStamp, useVideoPlayHook } from 'hooks/VideoPlayHook';

import type { SharedTimelineListProps } from 'widgets/shared-viewer/model/types';
import { SharedBun } from './SharedBun';

const { useToken } = theme;

export const SharedTimelineList = ({ timeline, state, playerHandles } : SharedTimelineListProps ) => {
    const divBox = useRef<HTMLDivElement>(null);
    const [divBoxHeight, setDivBoxHeight] = useState<number>(800);
    const virtualRef = useRef(null);

    const { playing, playedSeconds } = state;
    const { handlePlay, handleSeek } = playerHandles;

    const { gotoTime } = useVideoPlayHook( playing, handlePlay, state, handleSeek );
    const { timeToTS } = useTimeStamp();

    const { token } = useToken();

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

