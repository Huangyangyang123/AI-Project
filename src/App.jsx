import { useState } from 'react'

import { Button } from 'antd';

import './App.less'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div>
        AI project init...

        <Button type="primary">Button Test</Button>
      </div>
    </>
  )
}

export default App
