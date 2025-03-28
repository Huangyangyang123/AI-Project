import React, { useEffect, useState } from "react";
import { Input, Switch, Select } from 'antd';
import { get, post } from '@/shared/request'
import { SendOutlined, CustomerServiceOutlined, CopyOutlined, EditOutlined, MenuUnfoldOutlined, CloseOutlined } from '@ant-design/icons'
import './index.less'

const { TextArea } = Input;

let initContent = []
let initRightContent = []

let contentNum = []

export default function Chat(){

    const [dailogDatas,setDailogDatas] = useState()
    const [value,setValue] = useState('')

    const [content,setContent] = useState(initContent)
    const [rightContent,setRightContent] = useState(initRightContent)

    const [leftDatas,setLeftDatas] = useState([])

    const [nums,setNums] = useState([])

    const [spaceoptions,setSpaceoptions] = useState([])  
    const [defaultValue,setDefaultValue] = useState('')    

    const [useRag,setUseRag] = useState(true)
    const [workspaceId,setWorkspaceId] = useState()

    const [citations,setCitations] = useState([])

    const [documents,setDocuments] = useState([])

    const [sourcesText,setSourcesText] = useState('')


    useEffect(()=>{
        initList()
    },[])

    const initList = async(type = 'init')=>{
        const list = await get('/v1/chat/conversations/list')
        console.log('list==',list)

        await dailogContent(list[0]?.id,type)

        const listData = list?.map((item,index)=>{
            return {
                ...item,
                active:index == 0 ? true : false
            }
        })

        setLeftDatas(listData)

        const resOptions = await get('/v1/workgroups-with-workspaces')
        const options = resOptions?.map(item=>{
            return {
                value:item.id,
                label:item.name,
            }
        })

        setSpaceoptions(options)
        setDefaultValue(options[0]?.value)
        setWorkspaceId(options[0]?.value)
    }

    const dailogContent = async(id,type)=>{
        const dailog = await get(`/v1/chat/conversations/messages/${id}`)
        console.log('dailog:',dailog)

        if(['click','init'].includes(type)){
            initContent = []
            initRightContent = []
            contentNum = []
        }
        
        dailog?.map(item=>{
            if(item.role == 'user'){
                contentNum.push(item.id)
                initRightContent.push(item.content)
            }else{
                initContent.push(item.content)
            }
        })

        console.log('contentNum',contentNum,initRightContent,initContent)

        setNums(contentNum)
        setRightContent(initRightContent)
        setContent(initContent)

        const citations = []
        
        dailog.map(item=>{
            if(item.role == 'assistant' && item.citations.length){
                citations.push(...item.citations)
            }
        })

        setCitations(citations)

        const documents = await get(`/v1/documents/list`)

        const documentInfo = []

        citations.forEach((cit,ind)=>{
            documents.forEach((doc)=>{
                if(cit.document_id == doc.id){
                    documentInfo.push({
                        ...cit,
                        document_name:doc.name,
                        document_id:doc.id,
                        active: ind == 0 ? true : false
                    })
                }
            })
        })

        setDocuments(documentInfo)

        setSourcesText(documentInfo[0].text)

        console.log('documentInfo',citations,documentInfo)
    }

    const handleSelectSource = (doc)=>{
        const list = documents?.map(item=>{
            return {
                ...item,
                active:item.document_id == doc.document_id ? true : false
            }
        })

        setDocuments(list)

        const text = list?.filter(item=>item.active)[0]?.text

        setSourcesText(text)

    }

    const handleCloseSources = ()=>{
        setCitations([])
    }

    const handleSelectText = async(rowItem)=>{

        await dailogContent(rowItem?.id,'click')

        const list = leftDatas?.map(item=>{
            return {
                ...item,
                active:item.id == rowItem.id ? true : false
            }
        })
        setLeftDatas(list)

    }

    const handleOnChange = (e)=>{
        setValue(e.target.value)
    }

    const handleSend = async()=>{
        console.log('res:',value)
        const params = {
            message:value,
            use_rag: useRag
        }
        const obj = {
            name:value,
            workspace_id:workspaceId
        }

        rightContent.push(value)
        setRightContent(rightContent)

        const res = await post('/v1/chat/conversations/create',obj)
        const list = await post(`/v1/chat/conversations/send-message?conversation_id=${res.workspace_id}`,params)

        content.push(list.content)

        contentNum.push(value)

        console.log('content:',content,rightContent)

        setNums(contentNum)

        setContent(content)

        setValue('')
    }

    const handleOnChangeSwich = (val)=>{
        console.log('e00',val)
        setUseRag(val)
    }

    const handleOnChangeSelect = (val)=>{
        console.log('e11',val)
        setWorkspaceId(val)
    }

    return (
        <div className="chat-page">
             <div className="chat-row">
                <div className={citations.length ? 'left1':'left1 width80'}>
                    {
                        leftDatas?.length && !citations.length &&
                        <div className="left">
                            <div className="history-list">
                                {/* <div className="title height-52">
                                    <div className="date">今天</div>
                                    <div className="num">{}</div>
                                </div> */}
                                {
                                    leftDatas?.map(item=>{
                                        return (
                                            <div key={item.id} onClick={()=>handleSelectText(item)} className={`height-52 ${item.active ? 'active' : '' }`}>{item.name}</div>
                                        )
                                    })
                                }
                            </div>
                        </div> || null
                    }
                    <div className="right">
                        <div className="head">
                            <Switch onChange={handleOnChangeSwich} checkedChildren="开启" unCheckedChildren="自由聊天" defaultChecked />
                            <Select 
                                className="select-space"
                                defaultValue="defaultValue"
                                showSearch 
                                placeholder="Select..."
                                options={spaceoptions}
                                onChange={handleOnChangeSelect}
                            />
                        </div>

                        <div className="contet">
                            {
                                (content?.length || rightContent?.length) && 
                                nums?.map((item,ind)=>(
                                    <div key={ind}>
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
                                                <div className="dailog-title">assistant</div> 
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
                    </div>
                </div>
                {
                 citations.length &&
                 <div className="citations">
                    <div className="head">
                        <div className="icon-text">
                            <MenuUnfoldOutlined style={{color:'#694747'}} />
                            <span className="text">Sources</span>
                        </div>
                        <CloseOutlined onClick={handleCloseSources} className="icon" />
                    </div>
                    {
                        <div className="sources-list">
                            {
                                documents?.map(doc=>(
                                    <div className={doc.active ? 'list active' : 'list'} key={doc.document_name} onClick={()=>handleSelectSource(doc)}>  
                                        <div>{doc.document_name}</div>
                                    </div>
                                ))
                            }
                            
                        </div>
                    }
                    <div className="sources-content">
                        {sourcesText}
                    </div>
                 </div> || null
                }
            </div>
        </div>
    )
}