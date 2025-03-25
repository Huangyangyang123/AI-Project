import React, { useState } from "react";
import { Col, Row, Input } from 'antd';
import { SendOutlined, CustomerServiceOutlined, CopyOutlined, EditOutlined, CloseCircleOutlined } from '@ant-design/icons'
import './index.less'
import { action } from "mobx";

const { TextArea } = Input;

const datas = [
    {
        text:'对话总结对话总结',
        id:1,
        active:false
    },
    {
        text:'反洗钱和KYC要求',
        id:2,
        active:false
    }
]

export default function Chat(){

    const [dailogDatas,setDailogDatas] = useState(datas)
    const [value,setValue] = useState('')

    const handleSelectText = (rowItem)=>{
        console.log('rowItem:',rowItem,dailogDatas)
        const list = datas?.map(item=>{
            if(item.id == rowItem.id){
                return {
                    ...item,
                    active:true
                }
            }else{
                return {
                    ...item,
                    active:false
                }
            }
        })
        setDailogDatas(list)
    }

    const handleOnChange = (e)=>{
        console.log('e:',e)
        setValue(e.target.value)
    }

    const handleSend = ()=>{
        console.log('res:',value)
    }

    return (
        <div className="chat-page">
             <Row>

                <Col className="right" span={18} push={6}>
                    <div className="contet">
                        <div className="left-align">
                            <div className="avtar">
                                <CustomerServiceOutlined style={{ fontSize: '22px', color: '#c30d23', width:'40px', height:'40px', lineHeight:'40px' }} />
                            </div>
                            <div className="dailog-content">
                                <div className="dailog-title">信用卡业务</div>
                                <div className="dailog-text">
                                    反洗钱和KYC要求巴拉巴拉反洗钱和KYC要求巴拉巴拉反洗钱和KYC要求巴拉巴拉反洗钱和KYC要求巴拉巴拉
                                </div>
                            </div>
                        </div>
                        <div className="right-align">
                            <div className="text">反洗钱和KYC要求</div>
                            <div className="icon">
                                <CopyOutlined />
                                <EditOutlined />
                            </div>
                        </div>
                    </div>
                    <div className="footer">
                        <div className="text">
                            <div className="title">引用文本</div>
                            <div className="quote-content">反洗钱和了解江河湖海</div>
                            <CloseCircleOutlined  style={{color:'#fff'}}/>
                        </div>
                        <TextArea 
                            bordered={false}
                            placeholder="请输入..." 
                            className="input-box"
                            onChange={handleOnChange}
                            >
                        </TextArea>
                        <SendOutlined onClick={handleSend} className="send" />
                    </div>
                </Col>
                <Col className="left" span={6} pull={18}>
                    <div className="history-list">
                        <div className="title height-52">
                            <div className="date">今天</div>
                            <div className="num">2</div>
                        </div>
                        {
                            dailogDatas?.map(item=>{
                                return (
                                    <div key={item.id} onClick={()=>handleSelectText(item)} className={`height-52 ${item.active ? 'active' : '' }`}>{item.text}</div>
                                )
                            })
                        }
                    </div>
                </Col>
            </Row>
        </div>
    )
}