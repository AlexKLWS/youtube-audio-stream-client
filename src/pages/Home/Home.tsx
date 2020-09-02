import React, { useRef, useState } from 'react'

import { ProgressUpdate, ProgressUpdateType } from '../../types/progressUpdate'

const Home: React.FC = () => {
  const webSocket = useRef<WebSocket>()
  const [inputURL, setInputURL] = useState('')
  const [outputURL, setOutputURL] = useState<string | null>(null)
  const [streamIsReady, setStreamIsReady] = useState(false)
  const [downloadPercentage, setDownloadPercentage] = useState(0)
  const [processStatus, setProcessStatus] = useState<string | null>(null)

  const onSocketMessageReceive = (event: MessageEvent) => {
    if (!event.data) {
      return
    }
    const progress = JSON.parse(event.data) as ProgressUpdate
    switch (progress.type) {
      case ProgressUpdateType.DOWNLOAD_BEGUN:
        setOutputURL(progress.outputURL)
        setStreamIsReady(false)
        setProcessStatus('Downloading...')
        break
      case ProgressUpdateType.DOWNLOAD_IN_PROGRESS:
        setDownloadPercentage(progress.downloadPercentage)
        break
      case ProgressUpdateType.TRANSMUXING_BEGUN:
        setProcessStatus('Processing...')
        break
      case ProgressUpdateType.TRANSMUXING_FINISHED:
        setStreamIsReady(true)
        setProcessStatus('Done!')
        break
      case ProgressUpdateType.AUDIO_IS_ALREADY_AVAILABLE:
        setOutputURL(progress.outputURL)
        setStreamIsReady(true)
        break
      default:
        break
    }
  }

  const onSubmit = () => {
    // let loc = window.location
    // let uri = 'ws:'

    // if (loc.protocol === 'https:') {
    //   uri = 'wss:'
    // }
    // uri += '//' + loc.host
    // uri += loc.pathname + 'api/videos'

    if (!inputURL) {
      return
    }

    setDownloadPercentage(0)
    setOutputURL(null)
    setStreamIsReady(false)
    setProcessStatus(null)

    let uri = 'ws://localhost:1323/api/videos'

    webSocket.current = new WebSocket(uri)

    webSocket.current.onopen = () => {
      if (webSocket.current) {
        webSocket.current.send(inputURL)
      }
    }

    webSocket.current.onmessage = onSocketMessageReceive
    webSocket.current.onerror = (ev: Event) => {
      console.log('ERROR-EVENT: ', ev)
    }
  }

  return (
    <div className='App'>
      <div>
        <input
          placeholder='Enter youtube url'
          value={inputURL || ''}
          onChange={(event) => {
            setInputURL(event.target.value)
          }}
        />
        <button onClick={onSubmit}>SEND</button>
      </div>
      {!!outputURL && (
        <div>
          <p>
            {streamIsReady
              ? `Audio stream is available ${(<a href={outputURL}>here</a>)}`
              : `Once video will be downloaded and processed, audio stream will be available ${(
                  <a href={outputURL}>here</a>
                )}`}
          </p>
        </div>
      )}
      {!!downloadPercentage && (
        <div style={{ padding: '10px' }}>
          <div
            style={{
              height: '20px',
              position: 'relative',
              background: '#48A',
              width: `${downloadPercentage}%`,
              transition: 'all 0.3s ease-in-out',
            }}
          >
            <p style={{ color: '#FFF' }}>{processStatus}</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default Home
