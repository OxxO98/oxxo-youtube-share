import { useEffect, useState } from "react";

import { useAxiosGet } from "hooks/AxiosHook";
import { useTranslation } from "react-i18next"

interface videosData {
    videoId : string;
    shortURL : string;
}

const MainPage = () => {
    const { t } = useTranslation('MainPage');

    const [videos, setVideos] = useState<videosData[] | null>(null);

    const { response } = useAxiosGet<RES_GET_VIDEOS, null>('/videos', false, null);

    useEffect( () => {
        let res = response;
        if( res !== null ){
            console.log(res);
            setVideos(res.data.map( (v) => {
                return {
                    videoId : v['VIDEOID'],
                    shortURL : v['SHORTURL']
                }
            }) );
        }
    }, [response])

    return (
        <>
        test
        {
            videos !== null && videos.map( (v) => {
                <div>
                    {v.shortURL}
                    {v.videoId}
                </div>
            })
        }
        </>
    )
}

export { MainPage }