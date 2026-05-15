import React, { useContext } from 'react';
import ReactPlayer from 'react-player';
import { useMediaQuery } from 'react-responsive';

import { Flex } from 'antd'

import type { SharedVideoProps } from 'widgets/shared-viewer/model/types';

import { MediaQueryContext } from 'contexts/MediaQueryContext';

const areSharedVideoPropsEqual = ( prev : SharedVideoProps, next : SharedVideoProps ) => {
    return (
        prev.setPlayerRef === next.setPlayerRef &&
        prev.state.src === next.state.src &&
        prev.state.pip === next.state.pip &&
        prev.state.playing === next.state.playing &&
        prev.state.volume === next.state.volume &&
        prev.state.muted === next.state.muted &&
        prev.children === next.children
    );
}

export const SharedVideo = React.memo(({ setPlayerRef, state, playerHandles, children } : SharedVideoProps) => {
    const isMobile = useMediaQuery({
        query : useContext<MediaQueryContextInterface>(MediaQueryContext).mobile
    });
    const isShort = useMediaQuery({
        query : useContext<MediaQueryContextInterface>(MediaQueryContext).short
    });
    const isResponsive = isMobile || isShort;

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
            <Flex
                justify='center'
                className="shared-video-shell"
                style={{ padding : isResponsive ? '8px 18px' : '18px' }}
            >
                <div
                    className="shared-video-frame"
                    style={{ position : 'relative' }}
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
                {children}
                </div>
            </Flex>
        </>
    )
}, areSharedVideoPropsEqual)
