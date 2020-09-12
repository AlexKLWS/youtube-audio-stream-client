import React, { useRef, useState } from 'react'

import { ProgressUpdate, ProgressUpdateType } from '../../types/progressUpdate'
import { Link } from 'react-router-dom'
import routes from '../../consts/routes'

const Home: React.FC = () => {
  const webSocket = useRef<WebSocket>()
  const [inputURL, setInputURL] = useState('')
  const [id, setID] = useState<string | null>(null)
  const [streamIsReady, setStreamIsReady] = useState(false)
  const [downloadPercentage, setDownloadPercentage] = useState(0)
  const [isError, setIsError] = useState(false)
  const [processStatus, setProcessStatus] = useState<string | null>(null)

  const onSocketMessageReceive = (event: MessageEvent) => {
    if (!event.data) {
      return
    }
    const update = JSON.parse(event.data) as ProgressUpdate
    switch (update.type) {
      case ProgressUpdateType.DOWNLOAD_BEGUN:
        setID(update.videoID)
        setStreamIsReady(false)
        setProcessStatus('Downloading...')
        break
      case ProgressUpdateType.REQUEST_ACCEPTED:
        setID(update.videoID)
        setStreamIsReady(false)
        setProcessStatus('Processing...')
        break
      case ProgressUpdateType.DOWNLOAD_IN_PROGRESS:
        setDownloadPercentage(update.downloadPercentage)
        setProcessStatus('Downloading...')
        setStreamIsReady(false)
        break
      case ProgressUpdateType.TRANSMUXING_BEGUN:
        setDownloadPercentage(100)
        setProcessStatus('Transmuxing...')
        setStreamIsReady(false)
        break
      case ProgressUpdateType.AUDIO_IS_AVAILABLE:
        setID(update.videoID)
        setStreamIsReady(true)
        setProcessStatus('Done!')
        break
      case ProgressUpdateType.ERROR:
        setIsError(true)
        break
      default:
        break
    }
  }

  const onSubmit = () => {
    let loc = window.location
    let uri = 'ws:'

    if (loc.protocol === 'https:') {
      uri = 'wss:'
    }
    // uri += '//' + loc.host + '/api/videos'
    uri += '//' + '192.168.0.2:1323' + '/api/videos'

    if (!inputURL) {
      return
    }

    setDownloadPercentage(0)
    setID(null)
    setStreamIsReady(false)
    setProcessStatus(null)

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
    webSocket.current.onclose = () => {
      console.log('SOCKET-CONNECTION-CLOSED!')
    }
  }

  return (
    <div className='App'>
      <div style={{ padding: '25px 0px' }}>
        <input
          placeholder='Enter youtube url'
          value={inputURL || ''}
          onChange={(event) => {
            setInputURL(event.target.value)
          }}
        />
        <button onClick={onSubmit}>SEND</button>
      </div>
      {isError && (
        <div>
          <span style={{ color: '#D43' }}>{`There was an error processing the video!`}</span>
        </div>
      )}
      {!!id && (
        <div>
          <span>
            {streamIsReady
              ? `Audio stream is available `
              : `Once video will be downloaded and processed, audio stream will be available `}
            <Link to={`${routes.playerBase}/${id}`}>here</Link>
          </span>
        </div>
      )}
      <div style={{ padding: '20px 0px' }}>
        <b>{processStatus}</b>
      </div>
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
            <p style={{ color: '#FFF' }}>{`${downloadPercentage}%`}</p>
          </div>
        </div>
      )}
      <div style={{ padding: '25px 0px' }}>v0.0.3</div>
    </div>
  )
}

export default Home
