import { useEffect } from 'react'
import { debounce } from 'lodash-es'

let timer
const stopTimeout = () => clearTimeout(timer)
/**
 * 
 * @param {Number} duration 
 * @param {Function} onDie 
 */
const resetTimeout = (duration, onDie) => {
  stopTimeout()
  timer = window.setTimeout(() => {
    if (typeof onDie === 'function') onDie()
  }, duration)
}
function AliveMonitor({ duration, onDie }) {
  const mousemoveHandle = () => resetTimeout(duration, onDie)
  const debounced = debounce(mousemoveHandle, 1000, { trailing: true })
  useEffect(() => {
    resetTimeout(duration, onDie)
    document.addEventListener('mousemove', debounced)
    return () => {
      document.removeEventListener('mousemove', debounced.cancel)
      stopTimeout()
    }
  }, [])
  return null
}
export default AliveMonitor