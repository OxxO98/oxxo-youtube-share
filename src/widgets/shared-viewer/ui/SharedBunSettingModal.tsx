import { useState, useContext, useRef } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useMediaQuery } from 'react-responsive';

import { MediaQueryContext } from 'contexts/MediaQueryContext';
import { SHARED_FONT_PRESETS } from 'entities/shared/config/fontPresets';

import { Button, ColorPicker, Divider, Flex, InputNumber, Modal, Select, Slider, Switch } from 'antd';
import { SettingOutlined } from '@ant-design/icons';
import type { ColorPickerProps, GetProp } from 'antd';

import { RootState, store } from 'reducers/store';
import { sharedActions } from 'reducers/sharedReducer';

import type { SharedBunSettingModalProps } from 'widgets/shared-viewer/model/types';

type Color = GetProp<ColorPickerProps, 'value'>;

const { setBackgroundColor, setJaTextColor, setKoTextColor, setJaFontSize, setKoFontSize, setSortFont, setJaFontFamily, setKoFontFamily, applyPreset, toggleFontShadow, setDefault, setSharedState } = sharedActions;

export const SharedBunSettingModal = ({ children, triggerStyle } : SharedBunSettingModalProps ) => {
    const { t } = useTranslation('SharedBunSettingModalComp');

    const isMobile = useMediaQuery({
        query : useContext<MediaQueryContextInterface>(MediaQueryContext).mobile
    });
    const isShort = useMediaQuery({
        query : useContext<MediaQueryContextInterface>(MediaQueryContext).short
    });
    const isResponsive = isMobile || isShort;

    const [isModalOpen, setIsModalOpen] = useState(false);
    const originalSettingRef = useRef<RootState['shared'] | null>(null);

    const sharedSetting = useSelector( (_state : RootState ) => _state.shared );
    const { backgroundColor, jaTextColor, koTextColor, jaTextFontSize, koTextFontSize, sortFont, fontShadow, jaFonts, koFonts, jaFontFamily, koFontFamily } = sharedSetting;

    const presets = SHARED_FONT_PRESETS.map( preset => ({
        value : preset.value,
        label : t(`FONTS_PRESETS.${preset.value}`),
    }) );
    const selectedPreset = SHARED_FONT_PRESETS.find( preset => (
        preset.jaFontFamily === jaFontFamily &&
        preset.koFontFamily === koFontFamily
    ) )?.value;

    const showModal = () => {
        originalSettingRef.current = sharedSetting;
        setIsModalOpen(true);
    };

    const handleOk = () => {
        originalSettingRef.current = null;
        setIsModalOpen(false);
    };

    const handleCancel = () => {
        if(originalSettingRef.current){
            store.dispatch( setSharedState(originalSettingRef.current) );
            originalSettingRef.current = null;
        }
        setIsModalOpen(false);
    };

    const handleSetDefault = () => {
        store.dispatch( setDefault() );
    }

    const handelJaFontSelectChange = (value : string) => {
        store.dispatch( setJaFontFamily(value) );
    }

    const handelKoFontSelectChange = (value : string) => {
        store.dispatch( setKoFontFamily(value) );
    }

    const handelPresetChange = (value : number) => {
        store.dispatch( applyPreset(value) )
    }

    const onJaFontSizeChange = (value : number | null) => {
        if(value === null){ return }
        store.dispatch( setJaFontSize(value) );
    }

    const onKoFontSizeChange = (value : number | null) => {
        if(value === null){ return }
        store.dispatch( setKoFontSize(value) );
    }

    const onSortChange = ( checked : boolean ) => {
        store.dispatch( setSortFont(checked) );
        store.dispatch( setJaFontSize(koTextFontSize) );
        store.dispatch( setKoFontSize(jaTextFontSize) );
    }

    const onBackgroundColorChange = ( color : Color, css : string ) => {
        store.dispatch( setBackgroundColor(css) );
    }
    const onJaTextColorChange = ( color : Color, css : string ) => {
        store.dispatch( setJaTextColor(css) );
    }
    const onKoTextColorChange = ( color : Color, css : string ) => {
        store.dispatch( setKoTextColor(css) );
    }

    const onChange = (checked : boolean) => {
        store.dispatch( toggleFontShadow() );
    };

    const settingRowStyle : CSSProperties = {
        display : 'flex',
        flexDirection : isResponsive ? 'column' : 'row',
        alignItems : isResponsive ? 'stretch' : 'center',
        gap : isResponsive ? 8 : 18,
    };

    const settingLabelStyle : CSSProperties = {
        flex : isResponsive ? 'none' : '0 0 118px',
        lineHeight : '32px',
        fontWeight : 500,
    };

    const settingControlAreaStyle : CSSProperties = {
        flex : 1,
        minWidth : 0,
    };

    const sliderAreaStyle : CSSProperties = {
        flex : '1 1 220px',
        minWidth : isResponsive ? '100%' : 220,
    };

    const selectStyle : CSSProperties = {
        width : isResponsive ? '100%' : 220,
    };

    const presetSelectStyle : CSSProperties = {
        width : isResponsive ? '100%' : 180,
    };

    const colorControlStyle : CSSProperties = {
        display : 'inline-flex',
        alignItems : 'center',
        minHeight : 32,
    };

    const renderSettingRow = (label : ReactNode, controlArea : ReactNode) => (
        <div style={settingRowStyle}>
            <div style={settingLabelStyle}>
                {label}
            </div>
            <div style={settingControlAreaStyle}>
                {controlArea}
            </div>
        </div>
    );

    const renderTextSetting = ({
        label,
        fontSize,
        textColor,
        fontFamily,
        fontOptions,
        onFontSizeChange,
        onTextColorChange,
        onFontSelectChange,
    } : {
        label : ReactNode;
        fontSize : number;
        textColor : string;
        fontFamily : string;
        fontOptions : { value : string, label : string, weight : string | number }[];
        onFontSizeChange : (value : number | null) => void;
        onTextColorChange : (color : Color, css : string) => void;
        onFontSelectChange : (value : string) => void;
    }) => renderSettingRow(
        label,
        <Flex vertical gap={10}>
            <Flex align='center' gap={12} wrap='wrap'>
                <div style={sliderAreaStyle}>
                    <Slider
                        min={10}
                        max={60}
                        onChange={onFontSizeChange}
                        value={fontSize}
                    />
                </div>
                <InputNumber
                    min={10}
                    max={60}
                    style={{ width : 82 }}
                    value={fontSize}
                    onChange={onFontSizeChange}
                />
                <div style={colorControlStyle}>
                    <ColorPicker value={textColor} onChange={onTextColorChange}/>
                </div>
            </Flex>
            <Select
                defaultValue={fontOptions[0].value}
                value={fontFamily}
                style={selectStyle}
                onChange={onFontSelectChange}
                options={fontOptions}/>
        </Flex>
    );

    return(
        <>
            <Button style={triggerStyle} onClick={showModal}>
                <SettingOutlined />
            </Button>

            <Modal
                style={{ top : 16 }}
                styles={{
                    container : {
                        maxHeight : '90vh',
                        display : 'flex',
                        flexDirection : 'column',
                    },
                    body : {
                        flex : 1,
                        minHeight : 0,
                        overflow : 'hidden',
                        display : 'flex',
                        flexDirection : 'column',
                    },
                }}
                title={t('TITLE')}
                closable={{ 'aria-label': 'Custom Close Button' }}
                open={isModalOpen}
                onCancel={handleCancel}
                width={'min(860px, 92vw)'}
                footer={[
                    <Flex justify='space-between' align='center'>
                        <Button color='primary' variant='outlined' onClick={handleSetDefault}>{t('BUTTON.RESET')}</Button>

                        <Flex gap={8}>
                            <Button onClick={handleCancel}>{t('BUTTON.CANCLE')}</Button>
                            <Button type='primary' onClick={handleOk}>{t('BUTTON.DONE')}</Button>
                        </Flex>
                    </Flex>
                ]}
            >
                {children}
                <Flex vertical
                    gap={isResponsive ? 14 : 16}
                    style={{
                        marginTop : children ? 16 : 0,
                        flex : 1,
                        minHeight : 0,
                        overflowY : 'auto',
                        paddingRight : 4,
                    }}
                >
                    {renderSettingRow(
                        t('CONTENTS.0'),
                        <Switch value={sortFont} onChange={onSortChange}/>
                    )}
                    <Divider style={{ margin : 0 }} />
                    {renderSettingRow(
                        t('CONTENTS.1'),
                        <Select
                            value={selectedPreset}
                            style={presetSelectStyle}
                            onChange={handelPresetChange}
                            options={presets}/>
                    )}
                    <Divider style={{ margin : 0 }} />
                    {renderTextSetting({
                        label : t('CONTENTS.2'),
                        fontSize : jaTextFontSize,
                        textColor : jaTextColor,
                        fontFamily : jaFontFamily,
                        fontOptions : jaFonts,
                        onFontSizeChange : onJaFontSizeChange,
                        onTextColorChange : onJaTextColorChange,
                        onFontSelectChange : handelJaFontSelectChange,
                    })}
                    <Divider style={{ margin : 0 }} />
                    {renderTextSetting({
                        label : t('CONTENTS.3'),
                        fontSize : koTextFontSize,
                        textColor : koTextColor,
                        fontFamily : koFontFamily,
                        fontOptions : koFonts,
                        onFontSizeChange : onKoFontSizeChange,
                        onTextColorChange : onKoTextColorChange,
                        onFontSelectChange : handelKoFontSelectChange,
                    })}
                    <Divider style={{ margin : 0 }} />
                    {renderSettingRow(
                        t('CONTENTS.4'),
                        <div style={colorControlStyle}>
                            <ColorPicker value={backgroundColor} onChange={onBackgroundColorChange}/>
                        </div>
                    )}
                    <Divider style={{ margin : 0 }} />
                    {renderSettingRow(
                        t('CONTENTS.5'),
                        <Switch value={fontShadow} onChange={onChange}/>
                    )}
                    <Divider style={{ marginTop : 0, marginBottom : 16 }} />
                </Flex>
            </Modal>
        </>
    )
}
