import { useState, useContext } from 'react';
import { useMediaQuery } from 'react-responsive';
import { useTranslation } from 'react-i18next';
import { useHotkeys } from 'react-hotkeys-hook';

import { Layout, FloatButton } from 'antd';
import { FullscreenExitOutlined, FullscreenOutlined } from '@ant-design/icons';

import { saveCaptionFile } from 'entities/shared/lib/createCaptionFile';
import { VideoContext } from 'contexts/VideoContext';
import { MediaQueryContext } from 'contexts/MediaQueryContext';
import { useTimeStamp } from 'hooks/VideoPlayHook';
import { SharedViewer } from 'widgets/shared-viewer/ui/SharedViewer';

import { useSharedData } from '../model/useSharedData';
import { SharedHeader } from './SharedHeader';
import { sharedShellStyle } from './styles';

const { Content } = Layout;

const SharedPage = () => {
    const { t } = useTranslation('SharedPage');
    
    const isLandscape = useMediaQuery({
        query : useContext<MediaQueryContextInterface>(MediaQueryContext).mobileLandscape
    });

    const sharedData = useSharedData();
    const [isCollapsed, setIsCollapsed] = useState<boolean>(false);

    const { timeToTS } = useTimeStamp()

    const handleSaveByCaption = ( opt : 'ko' | 'ja' = 'ja' ) => {
        if(sharedData === null ){ return }

        saveCaptionFile(sharedData, timeToTS, opt);
    }

    useHotkeys('enter', () => { setIsCollapsed(!isCollapsed) })

    return(
        <>
            <VideoContext.Provider value={{ videoId : sharedData?.videoId!, frameRate : 30 }}>
                <Layout style={sharedShellStyle}>
                    {
                        isCollapsed === false &&
                        <SharedHeader onSaveCaption={handleSaveByCaption}/>
                    }
                    <Content>
                    {
                        sharedData !== null &&
                        <SharedViewer sharedData={sharedData} isCollapsed={isCollapsed}/>
                    }
                    {
                        !isLandscape &&
                        <FloatButton
                            type="primary"
                            tooltip={isCollapsed ? <span>{t('TOOLTIP.FLOAT_COLLAPSED')}</span> : <span>{t('TOOLTIP.FLOAT')}</span>}
                            icon={isCollapsed ? <FullscreenExitOutlined /> : <FullscreenOutlined />}
                            onClick={() => setIsCollapsed(!isCollapsed)}
                            style={{ boxShadow : '0 10px 28px rgba(215, 0, 11, 0.34)' }}
                        />
                    }
                    </Content>
                </Layout>
            </VideoContext.Provider>
        </>
    )
}

export { SharedPage };

