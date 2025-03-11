import { useEffect } from "react";
import { startProgress, stopProgress } from '../shared'

const Progress = ()=>{
    useEffect(()=>{
        startProgress({delay:500})
        return ()=> stopProgress()
    },[])
    return null
}

export default Progress