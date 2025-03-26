import React, { useState } from "react";
import { Form, Input, Table, Button } from 'antd';
import { StarOutlined, CaretRightOutlined } from '@ant-design/icons'
import { get, post } from '@/shared/request'
import './index.less'

// const formItemLayout = {
//     labelCol: {
//       xs: {
//         span: 24,
//       },
//       sm: {
//         span: 8,
//       },
//     },
//     wrapperCol: {
//       xs: {
//         span: 24,
//       },
//       sm: {
//         span: 16,
//       },
//     },
// };

const { TextArea } = Input;

export default function TemplateChat(){
    const [form] = Form.useForm();
    const [value,setValue] = useState('')
    const [tableInitList,setTableInitList] = useState([])

    const [formDatas,setFormDatas] = useState([])

    const [contentObj,setontentObj] = useState({})

    const [generatedContent,setGeneratedContent] = useState(null)

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

    const handleGenrator = async(val)=>{
        await form.validateFields()
        onFinish(form.getFieldsValue(true),val)
    }

    return (
        <div className="template-chat-page">
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
        </div>
    )
}