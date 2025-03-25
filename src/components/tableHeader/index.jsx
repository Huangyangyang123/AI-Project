import React from 'react';
import { Button, Input} from 'antd';
import './index.less'

export default function TableHeader(props){
    console.log('props:',props)
    const { Icon, SearchOutlined, handleCreat, handleBlur, inputValue, placeholder, btnText } = props || {}
    return (
        <div className="table-header">
            <Button icon={<Icon />} type="primary" onClick={({})=>handleCreat({name:'',description:''})}>{btnText}</Button>
            <Input 
                className="search-input"
                allowClear 
                placeholder={placeholder}
                onBlur={handleBlur} 
                value={inputValue}
                suffix={<SearchOutlined />}
            />
        </div>
    )
}