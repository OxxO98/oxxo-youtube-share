import { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { useMediaQuery } from 'react-responsive';

import { Button, Flex, Layout } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';

import { SelectLocaleComp } from 'components/SelectLocaleComp';
import { MediaQueryContext } from 'contexts/MediaQueryContext';

import { sharedHeaderStyle } from './styles';

const { Header } = Layout;

interface SharedHeaderProps {
    onSaveCaption : ( opt? : 'ko' | 'ja' ) => void;
}

export const SharedHeader = ({ onSaveCaption } : SharedHeaderProps) => {
    const { t } = useTranslation('SharedPage');

    const isMobile = useMediaQuery({
        query : useContext<MediaQueryContextInterface>(MediaQueryContext).mobile
    });

    return (
        <Header style={sharedHeaderStyle}>
            <Flex align='center' gap={16} justify='right' style={{ height : '100%', margin : '0 16px'}}>
                {
                    !isMobile &&
                    <>
                        <Button icon={<DownloadOutlined />} onClick={() => onSaveCaption()}>{t('BUTTON.SAVE_CAPTION_JA')}</Button>
                        <Button icon={<DownloadOutlined />} onClick={() => onSaveCaption('ko')}>{t('BUTTON.SAVE_CAPTION_KO')}</Button>
                    </>
                }
                <SelectLocaleComp/>
            </Flex>
        </Header>
    )
}

