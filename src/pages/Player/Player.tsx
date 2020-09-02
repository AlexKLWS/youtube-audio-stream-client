import React, { useRef, useEffect } from 'react'
import { useRouteMatch } from 'react-router-dom'
import Hls from 'hls.js'

const Player: React.FC = () => {
  const player = useRef<HTMLVideoElement | null>(null)

  const match = useRouteMatch<{ id: string }>()

  useEffect(() => {
    const video = player.current
    const videoSrc = `${window.location.origin}/output/${match.params.id}/out.m3u8`

    if (Hls.isSupported()) {
      const hls = new Hls()
      hls.loadSource(videoSrc)
      hls.attachMedia(video as HTMLMediaElement)
      hls.on(Hls.Events.MANIFEST_PARSED, function () {
        if (video) {
          video.play()
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
    else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      if (!video) {
        return
      }
      video.src = videoSrc
      video.addEventListener('loadedmetadata', function () {
        if (video) {
          video.play()
        }
      })
    }
  }, [])

  return (
    <div style={{ backgroundColor: 'rgb(0, 0, 0)', position: 'absolute', width: '100%', height: '360px' }}>
      <audio className='videoCanvas' ref={player} autoPlay={true} />
      <div style={{ padding: '10px' }}>
        <button
          style={{ padding: '10px' }}
          onClick={() => {
            if (player.current) {
              player.current.play()
            }
          }}
        >
          =PLAY=
        </button>
      </div>
      <div style={{ padding: '10px' }}>
        <button
          style={{ padding: '10px' }}
          onClick={() => {
            if (player.current) {
              player.current.pause()
            }
          }}
        >
          =PAUSE=
        </button>
      </div>
    </div>
  )
}

export default Player
