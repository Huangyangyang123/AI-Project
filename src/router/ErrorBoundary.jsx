import React,{ Component } from "react";

export default class ErrorBoundary extends Component{
    constructor(props){
        super(props)
        this.state = { hasError:false }
    }

    static getDerivedStateFromError(){
        // 更新 state 使下一次渲染能够显示降级后的UI
        return { hasError:true }
    }

    componentDidCatch(error,errorInfo){
        console.log(error,errorInfo)
    }

    render(){
        if(this.state.hasError){
            // 你可以自定义降级后的 UI 并渲染
            return (
                <a>
                    Oh no! Smothing went wrong. click this line to refresh.
                </a>
            ) 
        }

        return this.props.children
    }
}