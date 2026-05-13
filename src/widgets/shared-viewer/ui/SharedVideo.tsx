import React from 'react';
import ReactPlayer from 'react-player';

import type { SharedVideoProps } from 'widgets/shared-viewer/model/types';

const areSharedVideoPropsEqual = ( prev : SharedVideoProps, next : SharedVideoProps ) => {
    return (
        prev.setPlayerRef === next.setPlayerRef &&
        prev.state.src === next.state.src &&
        prev.state.pip === next.state.pip &&
        prev.state.playing === next.state.playing &&
        prev.state.volume === next.state.volume &&
        prev.state.muted === next.state.muted
    );
}

export const SharedVideo = React.memo(({ setPlayerRef, state, playerHandles } : SharedVideoProps) => {
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
}, areSharedVideoPropsEqual)

