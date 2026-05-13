import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useMediaQuery } from 'react-responsive';

import { Flex, Splitter } from 'antd';
import { CaretLeftOutlined, CaretRightOutlined } from '@ant-design/icons'

import { MediaQueryContext } from 'contexts/MediaQueryContext';
import { VideoContext } from 'contexts/VideoContext';
import { useReactPlayerHook } from 'hooks/ReactPlayerHook';
import { useHandleSelection } from 'hooks/SelectionHook';

import type { SharedViewerProps } from 'widgets/shared-viewer/model/types';
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
    splitterCollapseIconStyle
} from 'widgets/shared-viewer/config/styles';
import {
    clampDictionaryPanelSize,
    clampSharedSidePanelSize
} from 'widgets/shared-viewer/lib/panelSize';
import { SharedDictionary } from './SharedDictionary';
import { SharedTimelineCarousel } from './SharedTimelineCarousel';
import { SharedTimelineList } from './SharedTimelineList';

export const SharedViewer = ({ sharedData, isCollapsed } : SharedViewerProps ) => {
    const { videoId } = useContext(VideoContext);
    const isMobile = useMediaQuery({
        query : useContext<MediaQueryContextInterface>(MediaQueryContext).mobile
    });

    const splitterBoxRef = useRef<HTMLDivElement>(null);

    const { state, setPlayerRef, playerHandles } = useReactPlayerHook(videoId);

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
                        <SharedTimelineCarousel timeline={sharedData.timeline} state={state} playerHandles={playerHandles} setPlayerRef={setPlayerRef} isCollapsed={isCollapsed}/>
                    </Flex>
                    {
                    !isCollapsed &&
                    <div style={{ flex : '1 1 auto', minHeight : 0, width : '100%' }}>
                        <SharedTimelineList timeline={sharedData.timeline} state={state} playerHandles={playerHandles}/>
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
                    className='shared-splitter'
                    style={{ height: '100%', width : '100%', background : '#090909' }}
                    onResize={handleSplitterResize}
                    onResizeEnd={handleSplitterResize}
                    
                    lazy
                >
                    <Splitter.Panel min={isCollapsed ? 0 : MIN_MAIN_PANEL_SIZE}>
                        <Flex vertical className={mainPanelClassName} align='center' justify='space-between' style={{ position : 'relative', height : '100%', width : '100%', minWidth : 0, background : '#060606', overflow : 'hidden'}}>
                            <SharedTimelineCarousel timeline={sharedData.timeline} state={state} playerHandles={playerHandles} setPlayerRef={setPlayerRef} isCollapsed={isCollapsed}/>
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
                            className='shared-splitter'
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
                                <div style={{ width : '100%', height : '100%', overflow : 'hidden' }}>
                                    <SharedDictionary />
                                </div>
                            </Splitter.Panel>
                            <Splitter.Panel min={260}>
                                <div style={{ width : '100%', height : '100%', minWidth : 0 }}>
                                    <SharedTimelineList timeline={sharedData.timeline} state={state} playerHandles={playerHandles}/>
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
