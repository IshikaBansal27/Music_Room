import { useEffect, useRef, useImperativeHandle, forwardRef } from "react";

const YoutubePlayer = forwardRef(({ videoId, onReady }, ref) => {
  const playerRef = useRef(null);
  const containerRef = useRef(null);
  const onReadyRef = useRef(onReady);

  useEffect(() => {
    onReadyRef.current = onReady;
  }, [onReady]);

  useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      document.body.appendChild(tag);
    }

    const createPlayer = () => {
      console.log("videoId");
      playerRef.current = new window.YT.Player(containerRef.current, {
        height: "100%",
        width: "100%",
        videoId: videoId || "",
        playerVars: { autoplay: 0, controls: 1, rel: 0, modestbranding: 1 },
        events: {
          onReady: () => {
            console.log("YouTube player ready");
            onReadyRef.current && onReadyRef.current();
          },
          onStateChange: (event) => {
            // YT.PlayerState.ENDED = 0
            if (event.data === 0) {
              console.log("Song ended");
            }
          },
        },
      });
    };

    if (window.YT && window.YT.Player) {
      createPlayer();
    } else {
      if (!document.querySelector('script[src*="youtube.com/iframe_api"]')) {
        const tag = document.createElement("script");
        tag.src = "https://www.youtube.com/iframe_api";
        document.body.appendChild(tag);
      }
      window.onYouTubeIframeAPIReady = createPlayer;
    }

    return () => {
      if (playerRef.current && playerRef.current.destroy) {
        playerRef.current.destroy();
        playerRef.current = null;
      }
    };
  }, []);

  //load a new video when vedioId changes
  useEffect(() => {
    if (playerRef.current && playerRef.current.loadVideoById && videoId) {
      playerRef.current.loadVideoById(videoId);
    }
  }, [videoId]);

  //Expose controls to parent component via ref
  useImperativeHandle(ref, () => ({
    play: () => {
      try {
        playerRef.current?.playVideo();
      } catch (e) {
        console.warn("play error", e);
      }
    },
    pause: () => {
      try {
        playerRef.current?.pauseVideo();
      } catch (e) {
        console.warn("pause error", e);
      }
    },
    seekTo: (seconds) => {
      try {
        playerRef.current?.seekTo(seconds, true);
      } catch (e) {
        console.warn("seek error", e);
      }
    },
    getCurrentTime: () => {
      try {
        return playerRef.current?.getCurrentTime() || 0;
      } catch (e) {
        return 0;
      }
    },
  }));

  return <div ref={containerRef} className="h-full w-full" />;
});

export default YoutubePlayer;
