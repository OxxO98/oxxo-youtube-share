import { useContext } from 'react';
import { useMediaQuery } from 'react-responsive';

import { useTranslation } from 'react-i18next';

import { Button, Flex } from 'antd';
import type { CSSProperties } from 'react';

import { MediaQueryContext } from 'contexts/MediaQueryContext';

const SelectLocaleComp = () => {
    const { i18n } = useTranslation();
    
    const isShort = useMediaQuery({
        query : useContext<MediaQueryContextInterface>(MediaQueryContext).short
    });
    const isMobile = useMediaQuery({
        query : useContext<MediaQueryContextInterface>(MediaQueryContext).mobile
    });

    const handleLocaleChange = ( locale : 'ko' | 'ja' ) => {
        i18n.changeLanguage(locale);
    };

    const localeGroupStyle : CSSProperties = {
        height : isMobile ? 32 : isShort ? 32 : 42,
        display : 'inline-flex',
        overflow : 'hidden',
        border : '1px solid rgba(255, 255, 255, 0.18)',
        borderRadius : 6,
        background : '#080809',
    }

    const localeButtonStyle : CSSProperties = {
        height : isMobile ? 30 : isShort ? 30 : 40,
        minWidth : isMobile ? 32 : 94,
        padding : isMobile ? 0 : '0 24px',
        border : 'none',
        borderRadius : 0,
        background : 'transparent',
        color : '#f5f5f5',
        fontSize : 16,
        fontWeight : 400,
    }

    const activeLocaleButtonStyle : CSSProperties = {
        ...localeButtonStyle,
        background : '#0e0e10',
        color : '#ff3046',
        boxShadow : 'inset 0 0 0 1px #d7000b',
    }

    const currentLocale = i18n.language;

    return(
        <Flex style={localeGroupStyle} align='center'>
            <Button
                style={currentLocale === 'ko' ? activeLocaleButtonStyle : localeButtonStyle}
                onClick={() => handleLocaleChange('ko')}
            >
            {
                isMobile ? '한': '한국어'
            }
            </Button>
            <Button
                style={currentLocale === 'ja' ? activeLocaleButtonStyle : localeButtonStyle}
                onClick={() => handleLocaleChange('ja')}
            >
            {
                isMobile ? 'あ': '日本語'
            }
            </Button>
        </Flex>
    )
}

export { SelectLocaleComp };

