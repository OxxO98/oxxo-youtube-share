import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';

import { Button, Col, ColorPicker, Divider, InputNumber, Modal, Row, Select, Slider, Switch } from 'antd';
import { SettingOutlined } from '@ant-design/icons';
import type { ColorPickerProps, GetProp } from 'antd';

import { RootState, store } from 'reducers/store';
import { sharedActions } from 'reducers/sharedReducer';

import type { SharedBunSettingModalProps } from 'widgets/shared-viewer/model/types';

type Color = GetProp<ColorPickerProps, 'value'>;

const { setBackgroundColor, setJaTextColor, setKoTextColor, setJaFontSize, setKoFontSize, setSortFont, setJaFontFamily, setKoFontFamily, toggleFontShadow } = sharedActions;

export const SharedBunSettingModal = ({ children } : SharedBunSettingModalProps ) => {
    const { t } = useTranslation('SharedBunSettingModalComp');

    const [isModalOpen, setIsModalOpen] = useState(false);

    const { backgroundColor, jaTextColor, koTextColor, jaTextFontSize, koTextFontSize, sortFont, fontShadow, jaFonts, koFonts, jaFontFamily, koFontFamily } = useSelector( (_state : RootState ) => _state.shared );

    const presets = [
        { value : 0, label : t('FONTS_PRESETS.0'), ja : jaFonts[0].value, ko : koFonts[0].value },
        { value : 1, label : t('FONTS_PRESETS.1'), ja : jaFonts[4].value, ko : koFonts[2].value },
        { value : 2, label : t('FONTS_PRESETS.2'), ja : jaFonts[1].value, ko : koFonts[3].value },
        { value : 3, label : t('FONTS_PRESETS.3'), ja : jaFonts[7].value, ko : koFonts[5].value },
        { value : 4, label : t('FONTS_PRESETS.4'), ja : jaFonts[7].value, ko : koFonts[6].value },
        { value : 5, label : t('FONTS_PRESETS.5'), ja : jaFonts[6].value, ko : koFonts[4].value },
        { value : 6, label : t('FONTS_PRESETS.6'), ja : jaFonts[6].value, ko : koFonts[7].value },
    ]

    const showModal = () => {
        setIsModalOpen(true);
    };

    const handleOk = () => {
        setIsModalOpen(false);
    };

    const handleCancel = () => {
        setIsModalOpen(false);
    };

    const handelJaFontSelectChange = (value : string) => {
        store.dispatch( setJaFontFamily(value) );
    }

    const handelKoFontSelectChange = (value : string) => {
        store.dispatch( setKoFontFamily(value) );
    }

    const handelPresetChange = (value : number) => {
        store.dispatch( setJaFontFamily(presets[value].ja ) )
        store.dispatch( setKoFontFamily(presets[value].ko ) )
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

    return(
        <>
            <Button onClick={showModal}>
                <SettingOutlined />
            </Button>

            <Modal
                title={t('TITLE')}
                closable={{ 'aria-label': 'Custom Close Button' }}
                open={isModalOpen}
                onCancel={handleCancel}
                width={'min(860px, 92vw)'}
                footer={[
                    <Button onClick={handleCancel}>{t('BUTTON.CANCLE')}</Button>,
                    <Button type='primary' onClick={handleOk}>{t('BUTTON.DONE')}</Button>
                ]}
            >
                {children}
                <Row align='middle' gutter={[12, 12]}>
                    <Col span={4}>
                        {t('CONTENTS.0')}
                    </Col>
                    <Col span={4}>
                        <Switch value={sortFont} onChange={onSortChange}/>
                    </Col>
                </Row>
                <Divider />
                <Row align='middle' gutter={[12, 12]}>
                    <Col span={4}>
                        {t('CONTENTS.1')}
                    </Col>
                    <Col span={4}>
                        <Select
                            defaultValue={presets[0].value}
                            style={{ minWidth : 120 }}
                            onChange={handelPresetChange}
                            options={presets}/>
                    </Col>
                </Row>
                <Divider />
                <Row align='middle' gutter={[12, 12]}>
                    <Col span={4}>
                        {t('CONTENTS.2')}
                    </Col>
                    <Col span={8}>
                        <Slider
                            min={10}
                            max={60}
                            onChange={onJaFontSizeChange}
                            value={jaTextFontSize}
                        />
                    </Col>
                    <Col span={4}>
                        <InputNumber
                            min={10}
                            max={60}
                            style={{ margin: '0 16px' }}
                            value={jaTextFontSize}
                            onChange={onJaFontSizeChange}
                        />
                    </Col>
                    <Col span={4}>
                        <ColorPicker value={jaTextColor} onChange={onJaTextColorChange}/>
                    </Col>
                </Row>
                <Row align='middle' gutter={[12, 12]}>
                    <Col offset={4}>
                        <Select
                            defaultValue={jaFonts[0].value}
                            value={jaFontFamily}
                            style={{ minWidth : 120 }}
                            onChange={handelJaFontSelectChange}
                            options={jaFonts}/>
                    </Col>
                </Row>
                <Divider />
                <Row align='middle' gutter={[12, 12]}>
                    <Col span={4}>
                        {t('CONTENTS.3')}
                    </Col>
                    <Col span={8}>
                        <Slider
                            min={10}
                            max={60}
                            onChange={onKoFontSizeChange}
                            value={koTextFontSize}
                        />
                    </Col>
                    <Col span={4}>
                        <InputNumber
                            min={10}
                            max={60}
                            style={{ margin: '0 16px' }}
                            value={koTextFontSize}
                            onChange={onKoFontSizeChange}
                        />
                    </Col>
                    <Col span={4}>
                        <ColorPicker value={koTextColor} onChange={onKoTextColorChange}/>
                    </Col>
                </Row>
                <Row align='middle' gutter={[12, 12]}>
                    <Col offset={4}>
                        <Select
                            defaultValue={koFonts[0].value}
                            value={koFontFamily}
                            style={{ minWidth : 120 }}
                            onChange={handelKoFontSelectChange}
                            options={koFonts}/>
                    </Col>
                </Row>
                <Divider />
                <Row align='middle' gutter={[12, 12]}>
                    <Col span={4}>
                        {t('CONTENTS.4')}
                    </Col>
                    <Col span={4}>
                        <ColorPicker value={backgroundColor} onChange={onBackgroundColorChange}/>
                    </Col>
                </Row>
                <Divider />
                <Row>
                    <Col span={4}>
                        {t('CONTENTS.5')}
                    </Col>
                    <Col span={4}>
                        <Switch value={fontShadow} onChange={onChange}/>
                    </Col>
                </Row>
            </Modal>
        </>
    )
}

