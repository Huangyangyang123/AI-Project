import React,{useState,useEffect} from 'react'
import TableHeader from '@/components/tableHeader'
import { get, post } from '@/shared/request'
import { SearchOutlined, UploadOutlined, InboxOutlined } from '@ant-design/icons';
import { Table, Modal, Select, Form, message, Upload, TreeSelect } from 'antd';
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

    const [form] = Form.useForm();

    
    const handleCreat = ()=>{
        setIsModalOpen(true)
    }
    

    const handleBlur = (e)=>{
        setInputValue(e.target.value)
        console.log('blur',e.target.value)
    }

    useEffect(()=>{
        initTableDatas()
    },[])

    const initTableDatas = async()=>{
        const res = await get('/v1/documents/list')
        setTableInitList([])
    }

    const columns = [
        {
            title:'文档名',
            dataIndex:'name',
            key:'name'
        },
        {
            title:'文档大小',
            dataIndex:'name',
            key:'name'
        },
        {
            title:'上传者',

        },
        {
            title:'上传时间',
            dataIndex:'created_at'
        }
    ]

    const tableData = []

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
        action: 'https://www.mocky.io/v2/5cc8019d300000980a055e76',
        onChange(info) {
          const { status } = info.file;
          if (status !== 'uploading') {
            console.log(info.file, info.fileList);
          }
          if (status === 'done') {
            message.success(`${info.file.name} file uploaded successfully.`);
          } else if (status === 'error') {
            message.error(`${info.file.name} file upload failed.`);
          }
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
                    </Form.Item>
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
                dataSource={tableData}
            />
            {eleModel()}
        </div>
    )
}