import React,{useEffect} from "react";

import { get } from '@/shared/request'

export default function DoMain(){

    useEffect(()=>{
        initdatas()
    },[])

    const initdatas = async()=>{
        const res = await get('/workgroups')
        console.log('res:',res)
    }

    return (
        <div>test page...666</div>
    )
}