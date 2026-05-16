import { ComplexText } from 'components/Bun';

import type { SharedBunProps } from 'widgets/shared-viewer/model/types';

export const SharedBun = ({ textData } : SharedBunProps ) => {
    const _bId = 'bId'.concat( textData.map( (v) => v.offset ).join('') )

    return(
        <>
        {
            textData.map( (v, i) =>
                <ComplexText key={`${_bId}-${i}`} bId={_bId} offset={v.offset} data={v.data} ruby={v.ruby}/>
            )
        }
        </>
    )
}

