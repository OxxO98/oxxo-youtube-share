import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';

import { Empty, Typography } from 'antd';

import { useJaText } from 'hooks/JaTextHook';
import { RootState } from 'reducers/store';

const dictionaryStyle = {
    border: 'none',
    width: 'calc(100% + 16px)',
    height: '100%',
    marginRight: '-16px',
}

export const SharedDictionary = () => {
    const { t } = useTranslation('SharedDictionaryComp');

    const { selection } = useSelector( (_state : RootState) => _state.selection );

    const { checkKatachi } = useJaText();

    return(
        <>
        {
            selection && selection !== '??' && selection !== ' ' && selection.length < 10 && checkKatachi(selection) !== null ?
            <div style={{ width : '100%', height : '100%', overflow : 'hidden' }}>
                <iframe title='dictionary_naver' src={'https://ja.dict.naver.com/?m=mobile#/search?range=all&query=' + selection} style={dictionaryStyle}></iframe>
            </div>
            :
            <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={
                    <Typography.Text>
                        {t('MESSAGE.ERROR')}
                    </Typography.Text>
                }
            />
        }
        </>
    )
}

