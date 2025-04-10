import React, { useEffect, useState } from "react";
import { Input, Switch, Select, message, Dropdown, Space } from 'antd';
import { get, post } from '@/shared/request'
import { SendOutlined, CustomerServiceOutlined, CopyOutlined, EditOutlined, FileSearchOutlined, CloseOutlined, DownOutlined } from '@ant-design/icons'
import TextDocumentViewer from '@/components/PDFViewer';
import './index.less'

const { TextArea } = Input;

let initContent = []
let initRightContent = []

let contentNum = []
const items = [
    {
        label: '引用',
        key: '0',
    },
]

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

    const [sourcesList,setSourcesList] = useState(false)

    // 获取对话详情
    const getConversationDetail = async (conversationId) => {
        try {
            const response = await get(`/api/v1/conversations/${conversationId}`);
            if (response.data) {
                const { messages, documents } = response.data;
                
                // 更新消息列表
                setMessageList(messages.map(msg => ({
                    ...msg,
                    citations: msg.citations || []
                })));
                
                // 缓存文档信息
                if (documents && documents.length > 0) {
                    const docMap = new Map();
                    documents.forEach(doc => {
                        docMap.set(doc.id, doc);
                    });
                    setDocumentCache(docMap);
                }
            }
        } catch (error) {
            console.error('获取对话详情失败:', error);
            message.error('获取对话详情失败');
        }
    };

    // 添加文档缓存状态
    const [documentCache, setDocumentCache] = useState(new Map());

    // 修改处理引用点击的函数
    const handleCitationClick = (citations) => {
        if (!citations || citations.length === 0) {
            console.warn('No citations provided');
            return;
        }
        
        console.log('Handling citations:', citations);
        
        // 使用缓存的文档信息
        const citationDocuments = citations.map(citation => {
            // 在当前文档列表中查找匹配的文档
            const doc = documents.find(d => d.id === citation.document_id || d.document_id === citation.document_id);
            if (!doc) {
                console.warn('Document not found for citation:', citation);
                return null;
            }
            return {
                ...doc,
                citation: citation,
                document_id: doc.id || doc.document_id,  // 确保有 document_id
                name: doc.name || doc.document_name || '未命名文档',
                active: ind == 0 ? true : false
            };
        }).filter(Boolean);

        console.log('Setting PDF documents:', citationDocuments);
        
        if (citationDocuments.length > 0) {
            setRightContent('pdf');
            setDocuments(citationDocuments);
        } else {
            message.warning('未找到相关文档');
        }
    };

    useEffect(()=>{
        initList()
    },[])

    const initList = async(type = 'init')=>{
        const list = await get('/v1/chat/conversations/list')
        console.log('list==',list)

        if(list[0]?.id){
            await dailogContent(list[0]?.id,type)
            const listData = list?.map((item,index)=>{
                return {
                    ...item,
                    active:index == 0 ? true : false
                }
            })
    
            setLeftDatas(listData)
        }

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
        try {
            console.log('Fetching dialog content for id:', id);
            const dailog = await get(`/v1/chat/conversations/messages/${id}`)
            console.log('Dialog response:', dailog)

            if(['click','init'].includes(type)){
                initContent = []
                initRightContent = []
                contentNum = []
            }
            
            // 处理对话内容
            dailog?.map(item=>{
                if(item.role == 'user'){
                    contentNum.push(item.id)
                    initRightContent.push(item.content)
                }else{
                    initContent.push(item.content)
                }
            })

            setNums(contentNum)
            setRightContent(initRightContent)
            setContent(initContent)

            // 收集引用信息
            const citations = []
            dailog.map(item=>{
                if(item.role == 'assistant' && item.citations?.length){
                    console.log('Found citations in message:', item.citations);
                    citations.push(...item.citations)
                }
            })

            console.log('Total collected citations:', citations.length);
            setCitations(citations)

            if (citations.length === 0) {
                setDocuments([]);
                return;
            }

            // 获取文档列表
            console.log('Fetching document list');
            try {
                const response = await get('/v1/documents/list');
                console.log('Raw documents response:', response);
                
                // 处理文档列表
                const documentList = Array.isArray(response) ? response : [];
                console.log('Document list:', documentList);

                const documents = citations.map((citation,ind) => {
                    const doc = documentList.find(d => d.id === citation.document_id);
                    if (!doc) {
                        console.warn('Document not found for citation:', citation);
                        return null;
                    }
                    return {
                        ...doc,
                        active: ind == 0 ? true : false,
                        citation: citation,
                        document_id: doc.id,  // 确保有 document_id
                        name: doc.name || doc.document_name || '未命名文档'
                    };
                }).filter(Boolean);  // 移除 null 值
                setDocuments(documents);

            } catch (error) {
                console.error('Error fetching documents:', error);
                message.error('获取文档列表失败');
            }

        } catch (error) {
            console.error('Error in dailogContent:', error);
            message.error('获取对话内容失败');
        }
    };

    const handleExpendSources = ()=>{
        setSourcesList(true)
    }

    const handleSelectSource = (doc,ind)=>{
        const list = documents?.map((item,index)=>{
            return {
                ...item,
                active:index == ind ? true : false,
                // active:item.document_id == doc.document_id ? true : false
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
        console.log('Selected conversation:', rowItem);
        
        try {
            if(rowItem?.id){
                await dailogContent(rowItem?.id,'click');
                
                const list = leftDatas?.map(item=>({
                    ...item,
                    active: item.id === rowItem.id
                }));
                setLeftDatas(list);
            }
            
        } catch (error) {
            console.error('Error selecting conversation:', error);
            message.error('加载对话失败');
        }
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

        initRightContent.push(value)
        setRightContent(initRightContent)

        const res = await post('/v1/chat/conversations/create', obj)
        const list = await post(`/v1/chat/conversations/send-message?conversation_id=${res.workspace_id}`, params)

        initContent.push(list.content)
        contentNum.push(value)

        console.log('content:', initContent, initRightContent)

        setNums(contentNum)
        setContent(initContent)
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

    const handleMenuClick = (e)=>{
        console.log('val000')
        e.preventDefault()
    }

    return (
        <div className="chat-page">
             <div className="chat-row">

                {/* <Dropdown menu={{items}} trigger={['click']} onClick={handleMenuClick}>
                    <a onClick={(e) => e.preventDefault()}>
                        <Space>
                            Click me
                            <DownOutlined />
                        </Space>
                    </a>
                </Dropdown> */}


                <div className={citations.length ? 'left1':'left1 width80'}>
                    {
                        leftDatas?.length && !sourcesList &&
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

                                        <div className="left-align" onClick={e => e.preventDefault()}>
                                                {
                                                    content[ind] && 
                                                    <div className="avtar">
                                                        <CustomerServiceOutlined style={{ fontSize: '22px', color: '#c30d23', width:'40px', height:'40px', lineHeight:'40px' }} />
                                                    </div>
                                                }
                                                
                                                {
                                                    content[ind] && 
                                                    <div className="dailog-content">
                                                    <div className="dailog-title">assistant</div> 
                                                    
                                                    <div className="dailog-text" dangerouslySetInnerHTML={{__html:content[ind]}} />
                                                    {
                                                        citations.length > 0 && documents.length > 0 &&
                                                        <div className="icon">
                                                            <CopyOutlined />
                                                            <FileSearchOutlined onClick={handleExpendSources} />
                                                        </div> || null
                                                    }
                                                    
                                                    </div>
                                                }
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
                    sourcesList &&
                    <div className="citations">
                        <TextDocumentViewer
                            handleSelectSource={handleSelectSource}
                            documents={documents.map(doc => ({
                                ...doc,
                                id: doc.id || doc.document_id,  // 确保有 id
                                document_id: doc.id || doc.document_id,  // 确保有 document_id
                                name: doc.name || doc.document_name || '未命名文档',
                                citation: doc.citation || null
                            }))} 
                            onClose={() => {
                                setCitations([]);
                                setDocuments([]);
                                setRightContent(initRightContent);
                                setSourcesList(false)
                            }} 
                        />
                    </div> || null
                }
            </div>
        </div>
    )
}