import React, { useRef, useState, useEffect } from 'react';
import { Play, Pause, Maximize2, Volume2, VolumeX, RotateCcw } from 'lucide-react';

interface VideoPlayerProps {
  src: string;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ src }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState('0:00');
  const [duration, setDuration] = useState('0:00');
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [hasEnded, setHasEnded] = useState(false);
  const controlsTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const formatTime = (time: number) => {
      const minutes = Math.floor(time / 60);
      const seconds = Math.floor(time % 60);
      return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    };

    const handleTimeUpdate = () => {
      const current = video.currentTime;
      const dur = video.duration || 0;
      const progressPercent = dur > 0 ? (current / dur) * 100 : 0;
      
      setProgress(progressPercent);
      setCurrentTime(formatTime(current));
      setDuration(formatTime(dur));
      
      if (dur > 0 && current >= dur) {
        setIsPlaying(false);
        setHasEnded(true);
        setShowControls(true);
      }
    };

    const handleLoadedMetadata = () => {
        setDuration(formatTime(video.duration));
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
    };
  }, []);

  const togglePlay = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    const video = videoRef.current;
    if (!video) return;

    if (hasEnded) {
        video.currentTime = 0;
        setHasEnded(false);
    }

    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
    setIsPlaying(!isPlaying);
    resetControlsTimeout();
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    const video = videoRef.current;
    if (!video) return;
    
    video.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const toggleFullscreen = (e: React.MouseEvent) => {
    e.stopPropagation();
    const container = containerRef.current;
    if (!container) return;

    if (!document.fullscreenElement) {
      container.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;
    
    const seekTime = (parseFloat(e.target.value) / 100) * video.duration;
    video.currentTime = seekTime;
    setProgress(parseFloat(e.target.value));
  };

  const handleMouseMove = () => {
    setShowControls(true);
    resetControlsTimeout();
  };

  const resetControlsTimeout = () => {
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    if (isPlaying) {
      controlsTimeoutRef.current = window.setTimeout(() => {
        setShowControls(false);
      }, 2500);
    }
  };

  const handleContainerClick = () => {
    if (!showControls) {
        setShowControls(true);
        resetControlsTimeout();
    } else {
        togglePlay();
    }
  }

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-full bg-black group overflow-hidden select-none"
      onMouseMove={handleMouseMove}
      onClick={handleContainerClick}
    >
      <video
        ref={videoRef}
        src={src}
        className="w-full h-full object-contain"
        playsInline
        loop={false}
      />

      {/* Main Center Play Button Overlay */}
      <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 pointer-events-none ${!isPlaying || showControls ? 'opacity-100' : 'opacity-0'}`}>
        {hasEnded ? (
             <div className="bg-white/20 backdrop-blur-md p-4 rounded-full shadow-lg">
                <RotateCcw className="text-white fill-white" size={32} />
             </div>
        ) : !isPlaying ? (
            <div className="bg-white/20 backdrop-blur-md p-5 rounded-full shadow-lg transform transition-transform active:scale-95">
                <Play className="text-white fill-white ml-1" size={32} />
            </div>
        ) : null}
      </div>

      {/* Bottom Controls Bar */}
      <div 
        className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent px-4 pb-4 pt-12 transition-all duration-300 ease-in-out ${showControls ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}`}
        onClick={(e) => e.stopPropagation()} 
      >
        <div className="flex flex-col space-y-2">
            {/* Scrubber */}
            <input 
                type="range" 
                min="0" 
                max="100" 
                value={progress} 
                onChange={handleSeek}
                className="w-full video-slider h-1 mb-2"
                style={{
                    background: `linear-gradient(to right, #ffffff ${progress}%, rgba(255,255,255,0.2) ${progress}%)`
                }}
            />

            {/* Buttons Row */}
            <div className="flex items-center justify-between text-white">
                <div className="flex items-center space-x-4">
                    <button onClick={togglePlay} className="hover:text-ios-blue transition-colors">
                        {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}
                    </button>
                    <button onClick={toggleMute} className="hover:text-white/80 transition-colors">
                        {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                    </button>
                    <span className="text-xs font-medium font-mono text-white/80 tracking-wide">
                        {currentTime} <span className="text-white/40">/</span> {duration}
                    </span>
                </div>
                
                <button onClick={toggleFullscreen} className="hover:text-white/80 transition-colors">
                    <Maximize2 size={18} />
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
