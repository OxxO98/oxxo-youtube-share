import { useContext } from 'react';
import type { CSSProperties } from 'react';
import { useTranslation } from 'react-i18next';
import { useMediaQuery } from 'react-responsive';

import { Button, Flex, Layout } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';

import { SelectLocaleComp } from 'components/SelectLocaleComp';
import { MediaQueryContext } from 'contexts/MediaQueryContext';

import { sharedHeaderStyle } from './styles';

const { Header } = Layout;

const headerInnerStyle : CSSProperties = {
    height : '100%',
    margin : '0 12px',
}

const captionButtonStyle : CSSProperties = {
    height : 42,
    padding : '0 18px',
    borderRadius : 6,
    background : '#0b0b0c',
    border : '1px solid rgba(255, 255, 255, 0.18)',
    color : '#f5f5f5',
    fontSize : 16,
    fontWeight : 400,
    boxShadow : 'none',
}

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
            <Flex align='center' gap={12} justify='right' style={headerInnerStyle}>
                {
                    !isMobile &&
                    <>
                        <Button style={captionButtonStyle} icon={<DownloadOutlined />} onClick={() => onSaveCaption()}>{t('BUTTON.SAVE_CAPTION_JA')}</Button>
                        <Button style={captionButtonStyle} icon={<DownloadOutlined />} onClick={() => onSaveCaption('ko')}>{t('BUTTON.SAVE_CAPTION_KO')}</Button>
                    </>
                }
                <SelectLocaleComp/>
            </Flex>
        </Header>
    )
}
