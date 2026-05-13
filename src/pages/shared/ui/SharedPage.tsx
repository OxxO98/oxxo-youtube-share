import { useState } from 'react';

import { Layout, FloatButton } from 'antd';
import { FullscreenExitOutlined, FullscreenOutlined } from '@ant-design/icons';

import { saveCaptionFile } from 'entities/shared/lib/createCaptionFile';
import { VideoContext } from 'contexts/VideoContext';
import { useTimeStamp } from 'hooks/VideoPlayHook';
import { SharedViewer } from 'widgets/shared-viewer/ui/SharedViewer';

import { useSharedData } from '../model/useSharedData';
import { SharedHeader } from './SharedHeader';
import { sharedShellStyle } from './styles';

const { Content } = Layout;

const SharedPage = () => {
    const sharedData = useSharedData();
    const [isCollapsed, setIsCollapsed] = useState<boolean>(false);

    const { timeToTS } = useTimeStamp()

    const handleSaveByCaption = ( opt : 'ko' | 'ja' = 'ja' ) => {
        if(sharedData === null ){ return }

        saveCaptionFile(sharedData, timeToTS, opt);
    }

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
                    <FloatButton
                        type="primary"
                        icon={isCollapsed ? <FullscreenExitOutlined /> : <FullscreenOutlined />}
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        style={{ boxShadow : '0 10px 28px rgba(215, 0, 11, 0.34)' }}
                    />
                    </Content>
                </Layout>
            </VideoContext.Provider>
        </>
    )
}

export { SharedPage };

