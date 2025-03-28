import React, { useEffect, useState } from "react";
import { Form, Input, Table, Button, Tabs } from 'antd';
import { StarOutlined, CaretRightOutlined } from '@ant-design/icons'
import { get, post } from '@/shared/request'
import './index.less'

const { TextArea } = Input;

const IconSvg = ()=>(
    <svg t="1743133616761" className="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="1858" id="mx_n_1743133616761" width="16" height="16"><path d="M512 151.703704c-177.758815 0-322.37037 144.611556-322.37037 322.37037a321.611852 321.611852 0 0 0 208.592592 301.511111V948.148148a18.962963 18.962963 0 0 0 18.962963 18.962963h18.962963v37.925926a18.962963 18.962963 0 0 0 18.962963 18.962963h113.777778a18.962963 18.962963 0 0 0 18.962963-18.962963v-37.925926h18.962963a18.962963 18.962963 0 0 0 18.962963-18.962963v-172.562963A321.611852 321.611852 0 0 0 834.37037 474.074074c0-177.758815-144.611556-322.37037-322.37037-322.37037z m56.888889 777.481481a18.962963 18.962963 0 0 0-18.962963 18.962963v37.925926h-75.851852v-37.925926a18.962963 18.962963 0 0 0-18.962963-18.962963h-18.962963v-94.814815h151.703704v94.814815h-18.962963z m32.009481-185.040592a18.962963 18.962963 0 0 0-13.046518 18.014814V796.444444h-151.703704v-34.285037a18.962963 18.962963 0 0 0-13.046518-18.014814A283.799704 283.799704 0 0 1 227.555556 474.074074c0-156.842667 127.601778-284.444444 284.444444-284.444444s284.444444 127.601778 284.444444 284.444444c0 123.06963-78.601481 231.61363-195.546074 270.070519zM512 113.777778a18.962963 18.962963 0 0 0 18.962963-18.962963V18.962963a18.962963 18.962963 0 1 0-37.925926 0v75.851852a18.962963 18.962963 0 0 0 18.962963 18.962963zM967.111111 455.111111h-75.851852a18.962963 18.962963 0 1 0 0 37.925926h75.851852a18.962963 18.962963 0 1 0 0-37.925926zM132.740741 455.111111H56.888889a18.962963 18.962963 0 1 0 0 37.925926h75.851852a18.962963 18.962963 0 1 0 0-37.925926zM820.41363 138.846815l-53.62726 53.627259a18.944 18.944 0 1 0 26.81363 26.81363l53.627259-53.62726a18.944 18.944 0 1 0-26.813629-26.813629zM230.4 728.860444l-53.627259 53.62726a18.944 18.944 0 1 0 26.813629 26.813629l53.62726-53.627259a18.944 18.944 0 1 0-26.81363-26.81363zM793.6 728.860444a18.944 18.944 0 1 0-26.81363 26.81363l53.62726 53.627259a18.906074 18.906074 0 0 0 26.813629 0 18.944 18.944 0 0 0 0-26.813629l-53.627259-53.62726zM230.4 219.287704a18.906074 18.906074 0 0 0 26.81363 0 18.944 18.944 0 0 0 0-26.81363l-53.62726-53.627259a18.944 18.944 0 1 0-26.813629 26.813629l53.627259 53.62726z" fill="#444ce7" p-id="1859"></path><path d="M512 246.518519c-125.477926 0-227.555556 102.07763-227.555556 227.555555a18.962963 18.962963 0 1 0 37.925926 0c0-104.561778 85.067852-189.62963 189.62963-189.62963a18.962963 18.962963 0 1 0 0-37.925925z" fill="#444ce7" p-id="1860"></path></svg>
)

const items = [
    {
      key: 'Run Once',
      label: 'Run Once',
    },
    {
      key: 'Run Batch',
      label: 'Run Batch',
    },
];

export default function TemplateChat(){
    const [form] = Form.useForm();
    const [value,setValue] = useState('')
    const [tableInitList,setTableInitList] = useState([])

    const [formDatas,setFormDatas] = useState([])

    const [contentObj,setontentObj] = useState({})

    const [generatedContent,setGeneratedContent] = useState(null)

    const [templateList,setTemplateList] = useState(true)

    const [formList,setFormList] = useState(items)

    const [names,setNames] = useState([])    

    const [contentRes,setContentRes] = useState('')

    const [templateForm,setTemplateForm] = useState([])

    const [templateId,setTemplateId] = useState(1)

    useEffect(async()=>{
        await getTemplateList()
    },[])
    
    const getTemplateList = async()=>{
        const res = await get('/v1/templates/list')
        console.log('res==',res)

        const names = res.map((item,ind)=>{
            return {
                name:item.name,
                id:item.id,
                active:ind == 0 ? true : false
            }
        })

        setTemplateForm(res[0]?.variables)
        setNames(names)

        console.log(res[0]?.variables,'variables')
    }

    const handleActive = async(data)=>{
        const datas = names?.map(item=>{
            if(item.id == data.id){
                item.active = true
            }else{
                item.active = false
            }
            return item
        })

        console.log('data000',datas)

        setTemplateId(data.id)
        setNames(datas)

        const detailsRes = await get(`/v1/templates/detail/${data.id}`)
        console.log('detailsRes',detailsRes)

        setTemplateForm(detailsRes?.variables)

    }

    const handleAddTepmlate = ()=>{
        setTemplateList(false)
    }

    const onTabChange = ()=>{
        console.log('onTabChange')
    }

    const handleOnChange = (e)=>[
        setValue(e.target.value)
    ]

    const handleGenration = async()=>{
        const params = {
            description:value
        }
        const res = await post('/v1/templates/create',params)
        console.log('res==',res)

        setontentObj(res)

        setValue(res.content)
        console.log('variables',res.variables)

        setTableInitList(res.variables)

        setFormDatas(res.variables)
        
    }

    const columns = [
        {
            title:'变量key',
            dataIndex:'name',
            key:'name',
            render:()=>('name')
        },
        {
            title:'字段名称',
            dataIndex:'name',
            key:'name',
            render:(row)=>{
                return row
            }
        }
    ]

    const onFinish = async(values)=>{
        console.log('Received values:',values)

        const variable_values = {...values}

        const res = await post(`/v1/templates/generate?template_id=${contentObj?.id}`,{variable_values})
        console.log('res000',res)

        setGeneratedContent(res.generated_content)
    }

    const onFinishTemplate = async(values)=>{
        console.log('Received values:444',values)

        const res = await post(`/v1/templates/generate?template_id=${templateId}`,{variable_values:values})
        setContentRes(res?.generated_content)
    }

    const handleGenrator = async(val)=>{
        await form.validateFields()
        onFinish(form.getFieldsValue(true),val)
    }

    const handleNewTepmlateGenrator = async(val)=>{
        await form.validateFields()
        onFinishTemplate(form.getFieldsValue(true),val)
    }

    return (
        <div className="template-chat-page">

            {
                !templateList ? 
                <div className="new-add-template">
                    <div className="page-left">
                        <div className="header">
                            <div className="title">
                                <div>前缀提示</div>
                                <div onClick={handleGenration}>
                                    <StarOutlined />
                                    <span className="text">生成</span>
                                </div>
                            </div>
                            <div className="input-box">
                                <TextArea 
                                    bordered={false}
                                    placeholder="请输入..." 
                                    value={value}
                                    onChange={handleOnChange}
                                    >
                                </TextArea>
                            </div>
                        </div>
                        <div className="content">
                            <Table 
                                columns={columns}
                                rowKey='name'
                                dataSource={tableInitList}
                            />
                        </div>
                        <div className="bottom">
                        </div>
                    </div>
                    <div className="page-right">
                        <div className="preview">调试与预览</div>
                        <div className="input-text">用户输入</div>
                        <div className="tips">填入变量的值，改值将在每次提交时自动替换到提示词中</div>
                        <Form
                            className="form-template"
                            form={form}
                            name="templateForm"
                            scrollToFirstError
                            onFinish={onFinish}
                        >
                            {
                                formDatas?.map((item,ind)=>(
                                    <Form.Item 
                                        key={ind}
                                        name={item.name}
                                        label={item.description}
                                    >
                                        <Input />
                                    </Form.Item>
                                ))
                            }
                        </Form>

                        <div className="bottom">
                            <Button shape="round">清空</Button>
                            <Button shape="round" onClick={handleGenrator.bind(this,true)} type="primary" icon={<CaretRightOutlined style={{color:'#fff'}} />}>运行</Button>
                        </div>

                        <div className="result">
                            结果
                            <div className="text" dangerouslySetInnerHTML={{__html:generatedContent}}></div>
                        </div>
                    </div>
                </div> : 
                <div className="template-list">
                    <div className="left1">
                        <div className="left">
                            <div className="head">HSBC</div>
                            <div className="list">
                                <div className="title">
                                    <div className="text">常用模版</div>
                                    <div className="nums">{names?.length}</div>
                                </div>

                                {
                                    names?.map(item=>(
                                        <div onClick={()=>handleActive(item)} className={`item ${item.active ? 'active' : ''}`} key={item.id}>
                                            {item.name}
                                        </div>
                                    ))
                                }
                            </div>

                            <div className="bottom">
                                <Button onClick={handleAddTepmlate} className="btn" type="primary">新增模版</Button>
                            </div>
                        </div>
                        <div className="right">
                            <div className="head">
                                <div className="box"></div>
                                <div className="text">模版生成</div>
                            </div>

                           <Tabs defaultActiveKey="1" items={formList} onChange={onTabChange} />

                           <Form
                                form={form}
                                name="newTemplateForm"
                                scrollToFirstError
                                onFinish={onFinishTemplate}
                                className="form-template"
                            >
                                {
                                    templateForm?.map((item,ind)=>(
                                        <Form.Item 
                                            key={ind}
                                            name={item.name}
                                            label={item.description}
                                        >
                                            <Input />
                                        </Form.Item>
                                    ))
                                }
                            </Form> 

                            <div className="center-btn">
                                <Button shape="round">clear</Button>
                                <Button shape="round" onClick={handleNewTepmlateGenrator.bind(this,false)} type="primary" icon={<CaretRightOutlined style={{color:'#fff'}} />}>execute</Button>   
                            </div>

                        </div>
                    </div>
                    <div className="right">
                        <div className="header">
                            <IconSvg />
                            AI Completion
                        </div>
                        <div className="content" dangerouslySetInnerHTML={{__html:contentRes}}></div>
                    </div>
                </div>
            }

        </div>
    )
}