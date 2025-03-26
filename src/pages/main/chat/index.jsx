import React, { use, useEffect, useState } from "react";
import { Col, Row, Input } from 'antd';
import { get, post } from '@/shared/request'
import { SendOutlined, CustomerServiceOutlined, CopyOutlined, EditOutlined, CloseCircleOutlined } from '@ant-design/icons'
import './index.less'

const { TextArea } = Input;

const datas = [
    {
        text:'对话总结对话总结',
        id:1,
        active:true
    },
    {
        text:'反洗钱和KYC要求',
        id:2,
        active:false
    }
]


const content = []
const rightContent = []

const contentNum = []

export default function Chat(){

    const [dailogDatas,setDailogDatas] = useState(datas)
    const [value,setValue] = useState('')

    const [content,setContent] = useState([])
    const [rightContent,setRightContent] = useState([])

    const [leftDatas,setLeftDatas] = useState([])

    const [nums,setNums] = useState([])


    useEffect(()=>{
        initList()
    },[])

    const initList = async()=>{
        const list = await get('/v1/chat/conversations/list')
        console.log('list==',list)
    }

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
        setValue(e.target.value)
    }

    const handleSend = async()=>{
        console.log('res:',value)
        const params = {
            message:value,
            use_rag: false
        }
        const obj = {
            name:value,
            workspace_id : 0
        }


        rightContent.push(value)
        setRightContent(rightContent)

        setNums(contentNum)

        const res = await post('/v1/chat/conversations/create',obj)
        const list = await post(`/v1/chat/conversations/send-message?conversation_id=${res.workspace_id}`,params)

        content.push(list.content)
        contentNum.push(value)

        console.log('content:',content,rightContent)

        setContent(content)

        setValue('')
    }

    return (
        <div className="chat-page">
             <Row>

                <Col className="right" span={18} push={6}>
                    <div className="contet">
                        {console.log('rightContent',rightContent)}
                    
                        {
                            (content?.length || rightContent?.length) && 
                                nums.map((item,ind)=>(
                                    <div>
                                        <div className="right-align">
                                            <div className="text">{rightContent[ind]}</div>
                                            <div className="icon">
                                                <CopyOutlined />
                                                <EditOutlined />
                                            </div>
                                        </div> 

                                        <div className="left-align">
                                            <div className="avtar">
                                                <CustomerServiceOutlined style={{ fontSize: '22px', color: '#c30d23', width:'40px', height:'40px', lineHeight:'40px' }} />
                                            </div>
                                            <div className="dailog-content">
                                                <div className="dailog-title">自由聊天</div> 
                                                <div className="dailog-text" >
                                                    {content[ind]}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )) || null
                            
                        }
                        
                    </div>
                    <div className="footer">
                        {/* <div className="text">
                            <div className="title">引用文本</div>
                            <div className="quote-content">反洗钱和了解江河湖海</div>
                            <CloseCircleOutlined  style={{color:'#fff'}}/>
                        </div> */}
                        <TextArea 
                            bordered={false}
                            placeholder="请输入..." 
                            value={value}
                            className="input-box"
                            onChange={handleOnChange}
                            >
                        </TextArea>
                        <SendOutlined onClick={handleSend} className="send" />
                    </div>
                </Col>
                {
                    leftDatas?.length && 
                    <Col className="left" span={6} pull={18}>
                    <div className="history-list">
                        <div className="title height-52">
                            <div className="date">今天</div>
                            <div className="num">2</div>
                        </div>
                        {
                            leftDatas?.map(item=>{
                                return (
                                    <div key={item.id} onClick={()=>handleSelectText(item)} className={`height-52 ${item.active ? 'active' : '' }`}>{item.text}</div>
                                )
                            })
                        }
                    </div>
                </Col> || null
                }
            </Row>
        </div>
    )
}