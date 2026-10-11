import { useEffect, useState } from "react";

import { useNavigate } from "react-router-dom";

import { useAxiosGet } from "hooks/AxiosHook";
import { useTranslation } from "react-i18next"

import './main/mainPage.css'

//config
import { GET_IMG_SRC, span } from './main/config/video-grid-config'

//CSS@AntD
import { Card, Row, Col, Image } from "antd";

interface videosData {
    videoId : string;
    shortURL : string;
}

const MainPage = () => {
    const { t } = useTranslation('MainPage');

    //Hook
    const navigate = useNavigate();

    const [videos, setVideos] = useState<videosData[] | null>(null);

    const { response } = useAxiosGet<RES_GET_VIDEOS, null>('/videos', false, null);

    const handleCardClick = (shortURL : string) => {
        navigate(`/?l=${shortURL}`);
    }

    useEffect( () => {
        let res = response;
        if( res !== null ){
            setVideos( res.data.map( (v) => {
                return {
                    videoId : v['VIDEOID'],
                    shortURL : v['SHORTURL']
                }
            }) );
        }
    }, [response])

    return (
        <>
            <nav>
                <div>logo</div>
                <div className="header">
                    <div>동영상</div>
                    <div>동영상</div>
                    <div>동영상</div>
                </div> 
            </nav>
            <div id="main-page">
                <Row gutter={[16, 16]}>
                {
                    videos !== null && videos.map( (v) => 
                        <Col span={span.default} 
                            xxl={span.xxl} 
                            xl={span.xl} 
                            lg={span.lg}  
                            md={span.md} 
                            sm={span.sm}  
                            xs={span.xs}  
                            key={v.videoId}
                        >
                            <Card 
                                title={v.videoId}
                                style={{ height : '100%'}}
                            >
                                <Image width="100%" src={GET_IMG_SRC(v.videoId)} preview={false} onClick={() => handleCardClick(v.shortURL)}/>   
                            </Card>
                        </Col>
                    )
                }
                </Row>
            </div>
        </>
    )
}

export { MainPage }