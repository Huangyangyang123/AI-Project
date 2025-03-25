import React,{useEffect,useState} from "react";
import { get, post } from '@/shared/request'
import { PlusOutlined, SearchOutlined, InfoCircleOutlined, DownOutlined } from '@ant-design/icons';
import { Button, Input, Table, Modal, Radio, Checkbox, Col, Form, Row, Select } from 'antd';
import TableHeader from '@/components/tableHeader'
import './index.less'
import dayjs from "dayjs";

const { Option } = Select;

const formItemLayout = {
    labelCol: {
      xs: {
        span: 24,
      },
      sm: {
        span: 8,
      },
    },
    wrapperCol: {
      xs: {
        span: 24,
      },
      sm: {
        span: 16,
      },
    },
};

export default function DoMain(){

    useEffect(()=>{
        initdatas()
    },[])

    const [inputValue,setInputValue] = useState('')
    const [tableData,setTabledate] = useState([])
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [modalTitle, setModalTitle] = useState('新建')
    const [form] = Form.useForm();
    const [value, setValue] = useState(0);
    const [isDelModalOpen,setIsDelModalOpen] = useState(false)
    const [selectRow,setSelectRow] = useState({})
    const [delRow,setDelRow] = useState({})

    const [tableChildren,setTableChildren] = useState([])


    const handleCreat = (obj)=>{
        setSelectRow(obj)
        setModalTitle('新建')
        const data = {
            ...obj,
            group_id:selectRow?.group_id || 0
        }
        console.log('obj--',data)
        showModal()
        form.setFieldsValue({...data})
    }

    const handleBlur = (e)=>{
        setInputValue(e.target.value)
        console.log('blur',e.target.value)
    }

    const initdatas = async()=>{
        const res = await get('/v1/workgroups/list')
        const tableChildrenDatas = await get('/v1/workspaces/list')
        
        const expendDatas = [...res].filter((item)=>{
            item.arr = [...tableChildrenDatas].filter((arr)=>{
                return arr.id == item.id
            })
            if(item.arr.length == 0){
                delete item.arr
            }
            return item
        })

        setTabledate(expendDatas)
        console.log('res:',res,tableChildren)
    }

    const showModal = ()=>{
        setIsModalOpen(true)
    }
    const submit = async(val)=>{
        await form.validateFields()
        setIsModalOpen(false)
        onFinish(form.getFieldsValue(true),val)
    }
    const handleCancel = ()=>{
        setIsModalOpen(false)
    }

    const handleOnChange = (e)=>{
        console.log('radio checked', e.target.value);
        setValue(e.target.value)
    }

    const onFinish = async(values)=>{
        console.log('Received values of form: ', values);
        // 提交数据
        let url
        let data
        if(modalTitle == '新建'){
            if(values.group_id == 1){
                data = {
                    name: values.name,
                    description: values.description
                }
                url = '/v1/workgroups/create'
            }else{
                data = {
                    ...values,
                    group_id:values.id
                }
                url = '/v1/workspaces/create'
            }
        }else{
            if(values.group_id == 1){
                data = {
                    name: values.name,
                    description: values.description,
                    group_id: selectRow.id
                }
                url = '/v1/workgroups/update'
            }else{
                data = {
                    ...values,
                    group_id: selectRow.id
                }
                url = '/v1/workspaces/update'
            }
        }


        await post(url,data)
        initdatas()
    }

    const elementModel = ()=>{
        return (
            <Modal 
                title={modalTitle} 
                open={isModalOpen} 
                onOk={submit.bind(this,true)} 
                onCancel={handleCancel}
                maskClosable={false}
            >
                {/* initialValues 表单默认值，只有初始化以及重置时生效 object */}
                <Form
                    {...formItemLayout}
                    form={form}
                    name="register"
                    onFinish={onFinish}
                    // initialValues={selectRow}
                    scrollToFirstError
                >
                     <Form.Item
                        name="group_id"
                        label="对象"
                        rules={[{
                            required: true,
                            message: '请选择对象',
                        }]}
                    >
                        <Radio.Group onChange={handleOnChange} value={value}>
                            <Radio value={0}>工作组</Radio>
                            <Radio value={1}>工作空间</Radio>
                        </Radio.Group>
                    </Form.Item>
                    <Form.Item
                        name="name"
                        label="名称"
                        placeholder="请输入名称"
                        rules={[
                        {
                            required: true,
                            message: '名称必填',
                        },
                        ]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="description"
                        label="描述"
                        placeholder="请输入..."
                    >
                        <Input.TextArea />
                    </Form.Item>
                </Form>
            </Modal>
        )
    }

    const handleEdit = (row)=>{
        setSelectRow({...row})
        setModalTitle('编辑工作组')
        form.setFieldsValue({...row,group_id:row?.group_id || 1})
        showModal()
    }

    const handleDelOk = async()=>{
        let url
        let params
        if(delRow.group_id == 1){
            url = `/v1/workspaces/delete?workspace_id=${delRow.id}`
        }else{  
            url = `/v1/workgroups/delete?group_id=${delRow.id}`
        }
        await post(url)
        setIsDelModalOpen(false)
        initdatas()
    }
    
    const handleDelCancel = ()=>{
        setIsDelModalOpen(false)
    }

    const delModel = (row)=>{
        setIsDelModalOpen(true)
        setDelRow(row)
    }

    const delModelTitle = ()=>(
        <span>
            <InfoCircleOutlined style={{color:'red',marginRight:'10px'}} />
            删除工作组
        </span>
    )

    const delModelEle = ()=>{
        return (
            <Modal title={delModelTitle()} open={isDelModalOpen} onOk={handleDelOk} onCancel={handleDelCancel}>
                <p>您确定要删除工作组【{delRow.name}】吗？一旦您按下删除按钮，工作组及工作组下的工作空间将立即被删除。您无法撤销次操作。</p>
            </Modal>    
        )
    }

    const columns = [
        {
            title: '工作组名称',
            dataIndex: 'name',
            key: 'name',
        },
        {
        title: '描述',
        dataIndex: 'description',
        key: 'description',
        },
        {
            title: '创建时间',
            // dataIndex: 'created_at',
            key: 'id',
            render:(row) =>{
                return row['created_at'] ? dayjs(row['created_at']).format('YYYY-MM-DD HH:mm:ss') : ''
            }
        },
        {
            title: '操作',
            dataIndex: '',
            key: 'x',
            render: (row)=>(
                <>
                    <a className="opration_edit" onClick={()=>handleEdit(row)}>编辑</a>
                    <a onClick={()=>delModel(row)}>删除</a>
                </>
            )
        },
    ]

    const expandedRowRender = (row) => {

        const columns = [
            {
                title:'工作空间名称',
                dataIndex:'name',
                key:'name'
            },
            {
                title:'描述',
                dataIndex:'description',
                key:'description'
            },
            {
                title:'文档数量',
                dataIndex:'document_count',
                key:'document_count'
            },
            {
                title:'创建时间',
                dataIndex:'created_at',
                key:'created_at',
                render:(row) =>{
                    return row['created_at'] ? dayjs(row['created_at']).format('YYYY-MM-DD HH:mm:ss') : ''
                }
            },
            {
                title:'编辑时间',
                dataIndex:'updated_at',
                key:'updated_at',
                render:(row) =>{
                    return row['updated_at'] ? dayjs(row['updated_at']).format('YYYY-MM-DD HH:mm:ss') : ''
                }
            }
        ]

        if(row.arr && row.arr.length > 0){
            return <Table rowKey='id' columns={columns} dataSource={row.arr} pagination={false} />
        }
    }

    const tableHeaderParams = {
        handleCreat:handleCreat,
        handleBlur:handleBlur,
        inputValue:inputValue,
        Icon:PlusOutlined,
        SearchOutlined:SearchOutlined,
        placeholder:'请输入名称或描述',
        btnText:'新建'
    }


    return (
        <div className="workgroups-page">
            {TableHeader(tableHeaderParams)}
            {/* 嵌套table */}
            <Table
                columns={columns}
                expandable={{
                    rowExpandable: (row) => {
                        return row.arr && row.arr.length > 0 || false
                    },
                    expandedRowRender,
                    defaultExpandedRowKeys: ['0'],
                }}
                rowKey='id'
                dataSource={tableData}
            />
            {elementModel()}
            {delModelEle()}
        </div>
    )
}