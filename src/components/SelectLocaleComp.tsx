import { useContext } from 'react';
import { useMediaQuery } from 'react-responsive';

import { useTranslation } from 'react-i18next';

import { Button, Flex } from 'antd';
import type { CSSProperties } from 'react';

import { MediaQueryContext } from 'contexts/MediaQueryContext';

const localeGroupStyle : CSSProperties = {
    height : 42,
    display : 'inline-flex',
    overflow : 'hidden',
    border : '1px solid rgba(255, 255, 255, 0.18)',
    borderRadius : 6,
    background : '#080809',
}

const localeGroupStyleMobile : CSSProperties = {
    ...localeGroupStyle,
    height : 32,
}

const localeButtonStyle : CSSProperties = {
    height : 40,
    minWidth : 94,
    padding : '0 24px',
    border : 'none',
    borderRadius : 0,
    background : 'transparent',
    color : '#f5f5f5',
    fontSize : 16,
    fontWeight : 400,
}

const localeButtonStyleMobile : CSSProperties = {
    ...localeButtonStyle,
    height : 30,
    minWidth : 48,
}

const activeLocaleButtonStyle : CSSProperties = {
    ...localeButtonStyle,
    background : '#0e0e10',
    color : '#ff3046',
    boxShadow : 'inset 0 0 0 1px #d7000b',
}

const activeLocaleButtonStyleMobile : CSSProperties = {
    ...activeLocaleButtonStyle,
    height : 30,
    minWidth : 48,
}

const SelectLocaleComp = () => {
    const { i18n } = useTranslation();
    
    const isMobile = useMediaQuery({
        query : useContext<MediaQueryContextInterface>(MediaQueryContext).mobile
    });

    const handleLocaleChange = ( locale : 'ko' | 'ja' ) => {
        i18n.changeLanguage(locale);
    };

    const currentLocale = i18n.language;

    return(
        <Flex style={ isMobile ? localeGroupStyleMobile : localeGroupStyle} align='center'>
            <Button
                style={currentLocale === 'ko' ? 
                    isMobile ? activeLocaleButtonStyleMobile : activeLocaleButtonStyle : 
                    isMobile ? localeButtonStyleMobile : localeButtonStyle
                }
                onClick={() => handleLocaleChange('ko')}
            >
            {
                isMobile ? '한': '한국어'
            }
            </Button>
            <Button
                style={currentLocale === 'ja' ? 
                    isMobile ? activeLocaleButtonStyleMobile : activeLocaleButtonStyle : 
                    isMobile ? localeButtonStyleMobile : localeButtonStyle
                }
                onClick={() => handleLocaleChange('ja')}
            >
            {
                isMobile ? '日': '日本語'
            }
            </Button>
        </Flex>
    )
}

export { SelectLocaleComp };

