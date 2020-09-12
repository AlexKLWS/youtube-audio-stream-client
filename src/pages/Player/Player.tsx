import React, { useRef, useEffect, useState } from 'react'
import { useRouteMatch } from 'react-router-dom'
import Hls from 'hls.js'

const Player: React.FC = () => {
  const player = useRef<HTMLAudioElement | null>(null)

  const match = useRouteMatch<{ id: string }>()

  const [isMuted, setIsMuted] = useState(false)
  const [isReady, setIsReady] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)

  const prepare = (audio: HTMLAudioElement) => {
    audio.onplay = () => {
      setIsPlaying(true)
    }
    audio.onpause = () => {
      setIsPlaying(false)
    }
    setIsMuted(audio.muted)
    setIsReady(true)
  }

  useEffect(() => {
    const audio = player.current
    const audioSrc = `${window.location.origin}/output/${match.params.id}/out.m3u8`

    if (Hls.isSupported()) {
      const hls = new Hls()
      hls.loadSource(audioSrc)
      hls.attachMedia(audio as HTMLMediaElement)
      hls.on(Hls.Events.MANIFEST_PARSED, function () {
        if (audio) {
          prepare(audio)
        }
      })
    }
    // hls.js is not supported on platforms that do not have Media Source
    // Extensions (MSE) enabled.
    //
    // When the browser has built-in HLS support (check using `canPlayType`),
    // we can provide an HLS manifest (i.e. .m3u8 URL) directly to the video
    // element through the `src` property. This is using the built-in support
    // of the plain video element, without using hls.js.
    //
    // Note: it would be more normal to wait on the 'canplay' event below however
    // on Safari (where you are most likely to find built-in HLS support) the
    // video.src URL must be on the user-driven white-list before a 'canplay'
    // event will be emitted; the last video event that can be reliably
    // listened-for when the URL is not on the white-list is 'loadedmetadata'.
    // @ts-expect-error
    else if (audio.canPlayType('application/vnd.apple.mpegurl')) {
      if (!audio) {
        return
      }
      audio.src = audioSrc
      audio.addEventListener('loadedmetadata', function () {
        if (audio) {
          prepare(audio)
        }
      })
    }
  }, [])

  return (
    <div style={{ backgroundColor: 'rgb(0, 0, 0)', position: 'absolute', width: '100%', height: '360px' }}>
      <audio className='videoCanvas' ref={player} autoPlay={true} />
      {isReady && (
        <>
          <div style={{ padding: '10px' }}>
            <button
              style={{ padding: '10px' }}
              onClick={() => {
                if (player.current) {
                  if (isPlaying) {
                    player.current.pause()
                  } else {
                    player.current.play()
                  }
                }
              }}
            >
              {isPlaying ? '=PAUSE=' : '=PLAY='}
            </button>
          </div>
          <div style={{ padding: '10px' }}>
            <button
              style={{ padding: '10px' }}
              onClick={() => {
                if (player.current) {
                  player.current.muted = !player.current.muted
                  setIsMuted(player.current.muted)
                }
              }}
            >
              {isMuted ? '=UNMUTE=' : '=MUTE='}
            </button>
          </div>
        </>
      )}
    </div>
  )
}

export default Player
