import React,{useState,useEffect} from 'react'
import TableHeader from '@/components/tableHeader'
import { get, post } from '@/shared/request'
import { SearchOutlined, UploadOutlined, InboxOutlined, FilePdfOutlined, SmileOutlined } from '@ant-design/icons';
import { Table, Modal, Select, Form, message, Upload, TreeSelect, Popconfirm } from 'antd';
import dayjs from "dayjs";
import './index.less' 

const { Option } = Select;

const { Dragger } = Upload;
const { SHOW_PARENT } = TreeSelect;

const treeData = [
    {
      title: 'Node1',
      value: '0-0',
      key: '0-0',
      children: [
        {
          title: 'Child Node1',
          value: '0-0-0',
          key: '0-0-0',
        },
      ],
    },
    {
      title: 'Node2',
      value: '0-1',
      key: '0-1',
      children: [
        {
          title: 'Child Node3',
          value: '0-1-0',
          key: '0-1-0',
        },
        {
          title: 'Child Node4',
          value: '0-1-1',
          key: '0-1-1',
        },
        {
          title: 'Child Node5',
          value: '0-1-2',
          key: '0-1-2',
        },
      ],
    },
];

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

export default function DocumentMangement(){

    const [inputValue,setInputValue] = useState('')
    const [tableInitList,setTableInitList] = useState([])

    const [modalTitle,setModalTitle] = useState('上传文档')
    const [isModalOpen,setIsModalOpen] = useState(false)
    const [opration,setOpration] = useState('')

    const [form] = Form.useForm();

    
    const handleCreat = ()=>{
        setIsModalOpen(true)
    }
    

    const handleBlur = (e)=>{
        setInputValue(e.target.value)
        console.log('blur',e.target.value)
    }

    useEffect(async()=>{
        await initTableDatas()
        const datas = await get(`/v1/workgroups-with-workspaces`)
        console.log('datas==',datas)
    },[])

    const initTableDatas = async()=>{
        const res = await get('/v1/documents/list')
        console.log('res:',res)
        setTableInitList(res)
    }

    const columns = [
        {
            title:'文档名',
            dataIndex:'name',
            key:'name',
            render:(row)=>{
                return (
                    <div>
                        <FilePdfOutlined style={{color:'#f54a45',fontSize:'14px'}}  />
                        <span style={{marginLeft:'5px'}}>{row}</span>
                    </div>
                )
            }
        },
        {
            title:'文档大小',
            dataIndex:'size',
            key:'size'
        },
        {
            title:'上传者',
            dataIndex:'creator',
            key:'creator',
            render:(row)=>{
                return (
                    <div style={{display:'flex',alignItems:'center'}}>
                        <SmileOutlined style={{fontSize:'22px'}}  />
                        <span style={{marginLeft:'5px'}}>{row}</span>
                    </div>
                )
            }
        },
        {
            title:'上传时间',
            dataIndex:'created_at',
            key:'created_at',
            render:(row) =>{
                return row ? dayjs(row).format('YYYY-MM-DD HH:mm:ss') : ''
            }
        },
        {
            title:'操作',
            render:(row)=>(
                <>
                    <a className="opration" onClick={()=>handleOprator(row,'link')}>关联</a>
                    <a className="opration del" onClick={()=>handleOprator(row,'download')}>下载</a>
                    <Popconfirm
                        title="确认删除吗？"
                        okText='确认'
                        cancelText='取消'
                        onConfirm={()=>delDocument(row)}
                    > 
                        <a>删除</a>
                    </Popconfirm>
                </>
            )

        }
    ]

    const handleOprator = (row,type)=>{
        console.log('这是啥==',row,type)
        setOpration(type)
        if(type == 'link'){
            setIsModalOpen(true)
        }else{
            get(`/v1/documents/download/?document_id=${row.id}`)
        }
    }

    const delDocument = (row)=>{
        console.log('rowdata',row)
        post(`/v1/documents/delete?document_id=${row.id}`)
        initTableDatas()
    }

    const tableHeaderParams = {
        handleCreat:handleCreat,
        handleBlur:handleBlur,
        inputValue:inputValue,
        Icon:UploadOutlined,
        SearchOutlined:SearchOutlined,
        placeholder:'请输入文档名',
        btnText:'上传'
    }

    const submit = async(val)=>{
        await form.validateFields()
        setIsModalOpen(false)
        onFinish(form.getFieldsValue(true),val)
    }

    const onFinish = (values)=>{
        console.log('Received values of form document: ', values);
    }

    const handleCancel = ()=>{
        setIsModalOpen(false)
    }

    const props = {
        name: 'file',
        multiple: true,
        action:'/v1/documents/upload',
        beforeUpload(file, fileList){
            console.log('file', file)
            const fd = new FormData()
            fd.append('file',file)
            console.log('fd===',fd,file)
            post('/v1/documents/upload',fd)
            message.success('上传成功')
            return false
        },
        onDrop(e) {
          console.log('Dropped files', e.dataTransfer.files);
        },
    };

    const [value, setValue] = useState(['0-0-0']);
    const onChange = (newValue) => {
        console.log('onChange ', value);
        setValue(newValue);
    };

    const tProps = {
        treeData,
        value,
        onChange,
        treeCheckable: true,
        showCheckedStrategy: SHOW_PARENT,
        placeholder: 'Please select',
        style: {
          width: '100%',
        },
    };


    const eleModel = ()=>{
        return (
            <Modal
                title={modalTitle}
                open={isModalOpen} 
                onOk={submit.bind(this,true)} 
                onCancel={handleCancel}
                maskClosable={false}
            >
                <Form
                    {...formItemLayout}
                    form={form}
                    name="documentForm"
                    onFinish={onFinish}
                    scrollToFirstError
                >
                    {
                        opration != 'link' && 
                        <Form.Item 
                            name="file"
                            label="选择文档"
                            rules={[{required: true}
                            ]}
                        >
                            <Dragger {...props}>
                                <p className="ant-upload-drag-icon">
                                <InboxOutlined />
                                </p>
                                <p className="ant-upload-text">Click or drag file to this area to upload</p>
                                <p className="ant-upload-hint">
                                Support for a single or bulk upload. Strictly prohibit from uploading company data or other
                                band files
                                </p>
                            </Dragger>
                        </Form.Item> || null
                    }
                    <Form.Item 
                        name="workspace_ids"
                        label="关联空间"
                    >
                        <TreeSelect {...tProps} />
                    </Form.Item>
                </Form>
            </Modal>
        )
    }


    return (
        <div className='document-mangement-page'>
            {TableHeader(tableHeaderParams)}
            <Table 
                columns={columns}
                rowKey='id'
                dataSource={tableInitList}
            />
            {eleModel()}
        </div>
    )
}