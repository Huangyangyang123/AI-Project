import Nprogress from 'nprogress'

let progressTimeout
const template = `
  <div class="bar" role="bar">
    <div class="peg"></div>
  </div>
  <div class="spinner" role="spinner">
    <div class="spinner-icon"></div>
  </div>
`

function startProgress(props) {
    const { delay = 0, freeze = false } = props
    clearTimeout(progressTimeout)
    Nprogress.configure({
      template: freeze ? `<div class="freezed">${template}</div>` : template,
    })
    if (delay) {
      progressTimeout = window.setTimeout(Nprogress.start, delay)
    } else {
      Nprogress.start()
    }
  }

  function stopProgress() {
    clearTimeout(progressTimeout)
    Nprogress.done()
  }
  export { startProgress, stopProgress }