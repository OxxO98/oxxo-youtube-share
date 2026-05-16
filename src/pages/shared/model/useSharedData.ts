import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from "react-router-dom";

import { decodeSharedData } from 'entities/shared/lib/decodeSharedData';
import type { SharedData } from 'entities/shared/model/types';
import { useAxiosGet } from 'hooks/AxiosHook';

export const useSharedData = () => {
    const [sharedData, setSharedData] = useState<SharedData | null>(null);

    const location = useLocation();
    const navigate = useNavigate();

    const { response, setParams } = useAxiosGet<RES_GET_LONGURL, REQ_GET_LONGURL>('/longUrl', true, null);

    useEffect( () => {
        const params = new URLSearchParams(location.search);
        const encode = params.get('a');

        if(encode !== null){
            const data = decodeSharedData(encode);

            setSharedData(data);
        }
        else{
            const shortURL = params.get('l');
            if( shortURL !== null ){
                setParams({ shortURL : shortURL });
            }
            else{
                navigate('/notFound');
            }
        }
    }, [location, navigate, setParams])

    useEffect( () => {
        const res = response;
        if(res !== null ){
            if( res.message === 'success'){
                const data = decodeSharedData(res.data);

                setSharedData(data);
            }
            else{
                navigate('/notFound');
            }
        }
    }, [response, navigate])

    return sharedData;
}

