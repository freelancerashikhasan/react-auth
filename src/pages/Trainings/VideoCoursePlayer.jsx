// src/pages/Courses/VideoCoursePlayer.jsx
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { 
    Play, 
    Pause,
    ChevronLeft, 
    ChevronRight,
    Clock,
    Volume1, 
    CheckCircle,
    Home,
    Film,
    Bookmark,
    BookmarkCheck,
    SkipForward,
    SkipBack,
    Volume2,
    VolumeX,
    Zap,
    ZapOff,
    Award,
    Timer,
    Maximize, Minimize
} from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import DashboardLayout from '../../Layout/DashboardLayout';
import { useAPI } from '../../services/apiService';
import '../../css/VideoPlayer.css';

const VideoCoursePlayer = () => {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const api = useAPI();
    const [isFullscreen, setIsFullscreen] = useState(false);

    // States
    const [loading, setLoading] = useState(true);
    const [course, setCourse] = useState(null);
    const [groupedVideos, setGroupedVideos] = useState({});
    const [allVideos, setAllVideos] = useState([]);
    const [currentVideo, setCurrentVideo] = useState(null);
    const [volume, setVolume] = useState(50);

    const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
    const isDraggingVolumeRef = useRef(false);
    const [sliderVolume, setSliderVolume] = useState(volume);
const [playerVolume, setPlayerVolume] = useState(50); // Store for UI display

    // Player states
    const [completedVideos, setCompletedVideos] = useState(new Set());
    const [bookmarkedVideos, setBookmarkedVideos] = useState(new Set());
    const [videoError, setVideoError] = useState(false);
    const [isPlaying, setIsPlaying] = useState(true);
    const [autoPlay, setAutoPlay] = useState(true);
    const [playbackRate, setPlaybackRate] = useState(1);
    const [isMuted, setIsMuted] = useState(false);
    const [showControls, setShowControls] = useState(true);
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [showCompletionToast, setShowCompletionToast] = useState(false);
    const [vimeoPlayer, setVimeoPlayer] = useState(null);
    const [volumeEnabled, setVolumeEnabled] = useState(false);
        // Add this state to track active player instance
    const [activeVimeoInstance, setActiveVimeoInstance] = useState(null);
    const volumeEnabledRef = useRef(false);
    // Refs
    const mainVideoContainerRef = useRef(null);
    const mainVideoPosterRef = useRef(null);
    const vimeoContainerRef = useRef(null);
    const controlsTimerRef = useRef(null);
    const progressUpdateRef = useRef(null);
     const getCookie = useCallback((name) => {
        const cookies = document.cookie.split(';');
        for (let cookie of cookies) {
            const [cookieName, cookieValue] = cookie.trim().split('=');
            if (cookieName === name) {
                return decodeURIComponent(cookieValue);
            }
        }
        return null;
    }, []);

    const setCookie = useCallback((name, value, days = 365) => {
        const date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        const expires = `expires=${date.toUTCString()}`;
        document.cookie = `${name}=${encodeURIComponent(value)};${expires};path=/;SameSite=Strict`;
    }, []);

    const getWatchedVideosCookieName = useCallback(() => `watched_videos_${courseId}`, [courseId]);
    const getBookmarksCookieName = useCallback(() => `bookmarks_${courseId}`, [courseId]);
const toggleFullscreen = useCallback(() => {
    const element = mainVideoContainerRef.current;
    if (!element) return;

    if (!document.fullscreenElement) {
        element.requestFullscreen?.()
            || element.webkitRequestFullscreen?.()
            || element.mozRequestFullScreen?.()
            || element.msRequestFullscreen?.();
    } else {
        document.exitFullscreen?.()
            || document.webkitExitFullscreen?.()
            || document.mozCancelFullScreen?.()
            || document.msExitFullscreen?.();
    }
}, []);
useEffect(() => {
    const handleFullscreenChange = () => {
        setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);

    return () => {
        document.removeEventListener('fullscreenchange', handleFullscreenChange);
        document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
    };
}, []);

const updatePlayerVolume = useCallback(async () => {
    if (!vimeoPlayer) return;
    
    try {
        const vol = await vimeoPlayer.getVolume();
        setPlayerVolume(Math.round(vol * 100));
        setIsMuted(vol === 0);
    } catch (error) {
        console.log('Could not get player volume:', error.message);
    }
}, [vimeoPlayer]);
 const saveWatchedVideos = useCallback((watchedSet) => {
        const cookieName = getWatchedVideosCookieName();
        const watchedArray = Array.from(watchedSet);
        setCookie(cookieName, JSON.stringify(watchedArray));
    }, [setCookie, getWatchedVideosCookieName]);
     const addWatchedVideo = useCallback((videoId) => {
        const updatedSet = new Set([...completedVideos, videoId]);
        setCompletedVideos(updatedSet);
        saveWatchedVideos(updatedSet);
        
       
    }, [completedVideos, saveWatchedVideos, courseId]);
 // Add this function for handling slider input (immediate feedback)


    // Add this function to handle volume slider start
const handleVolumeSliderStart = useCallback((e) => {
    e.stopPropagation();
    e.preventDefault();
    
    // Force enable volume control on first interaction
    
}, [vimeoPlayer]);
useEffect(() => {
    setSliderVolume(volume);
}, [volume]);
   const selectVideo = useCallback((video, index, groupName) => {
    // Reset volume enabled state when changing videos
    volumeEnabledRef.current = false;
    setVolumeEnabled(false);
    
    const globalIndex = allVideos.findIndex(v => v.id === video.id);
    
    // Reset states
    setIsPlaying(true);
    setProgress(0);
    setCurrentTime(0);
    
    // Update current video
    setCurrentVideo(video);
    setCurrentVideoIndex(globalIndex);
    
   
    
    // Show poster initially
    if (mainVideoPosterRef.current) {
        mainVideoPosterRef.current.style.display = 'flex';
        mainVideoPosterRef.current.classList.remove('fade-out');
    }
    
    // Mark video as watched after 30 seconds
    setTimeout(() => {
        if (!completedVideos.has(video.id)) {
            addWatchedVideo(video.id);
        }
    }, 30000);
    
    setVideoError(false);
    setShowControls(true);
    
    // Remove active class from all cards
    document.querySelectorAll('.video-card').forEach(card => {
        card.classList.remove('active');
    });
    
    // Add active class to clicked card
    const clickedCard = document.querySelector(`[data-video-id="${video.id}"]`);
    if (clickedCard) {
        clickedCard.classList.add('active');
    }
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Reset controls timer
    if (controlsTimerRef.current) {
        clearTimeout(controlsTimerRef.current);
    }
    controlsTimerRef.current = setTimeout(() => setShowControls(false), 3000);
}, [allVideos, completedVideos, addWatchedVideo]);
    
const handleNextVideo = useCallback(async () => {
    if (currentVideoIndex < allVideos.length - 1) {
        const nextVideo = allVideos[currentVideoIndex + 1];
        const nextIndex = currentVideoIndex + 1;
        
        let nextGroup = '';
        for (const [groupName, videos] of Object.entries(groupedVideos)) {
            if (videos.some(v => v.id === nextVideo.id)) {
                nextGroup = groupName;
                break;
            }
        }
        
        // Call selectVideo to switch to next video
        selectVideo(nextVideo, nextIndex, nextGroup);
        
        // Log for debugging
        console.log('Auto-play setting:', autoPlay);
        
    } else {
        setShowCompletionToast(true);
        setTimeout(() => setShowCompletionToast(false), 3000);
        toast.success('🎉 Course completed! Congratulations!');
    }
}, [allVideos, currentVideoIndex, groupedVideos, selectVideo, autoPlay]);  

    const loadWatchedVideos = useCallback(() => {
        const cookieName = getWatchedVideosCookieName();
        const watchedVideosCookie = getCookie(cookieName);
        
        if (watchedVideosCookie) {
            try {
                return new Set(JSON.parse(watchedVideosCookie));
            } catch (error) {
                console.error('Error parsing watched videos cookie:', error);
                return new Set();
            }
        }
        return new Set();
    }, [getCookie, getWatchedVideosCookieName]);

    const loadBookmarks = useCallback(() => {
        const cookieName = getBookmarksCookieName();
        const bookmarksCookie = getCookie(cookieName);
        
        if (bookmarksCookie) {
            try {
                return new Set(JSON.parse(bookmarksCookie));
            } catch (error) {
                console.error('Error parsing bookmarks cookie:', error);
                return new Set();
            }
        }
        return new Set();
    }, [getCookie, getBookmarksCookieName]);

   

    const saveBookmarks = useCallback((bookmarkSet) => {
        const cookieName = getBookmarksCookieName();
        const bookmarkArray = Array.from(bookmarkSet);
        setCookie(cookieName, JSON.stringify(bookmarkArray));
    }, [setCookie, getBookmarksCookieName]);

   

    const toggleBookmark = useCallback((videoId) => {
        const updatedSet = new Set(bookmarkedVideos);
        if (updatedSet.has(videoId)) {
            updatedSet.delete(videoId);
            toast.success('Bookmark removed');
        } else {
            updatedSet.add(videoId);
            toast.success('Bookmark added');
        }
        setBookmarkedVideos(updatedSet);
        saveBookmarks(updatedSet);
    }, [bookmarkedVideos, saveBookmarks]);

    // Format time (seconds to MM:SS)
    const formatTime = useCallback((seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }, []);

    // Extract Vimeo video ID
    const extractVimeoId = useCallback((url) => {
        const regExp = /(?:vimeo\.com\/(?:video\/)?)(\d+)/;
        const match = url.match(regExp);
        return match ? match[1] : null;
    }, []);

    // Initialize Vimeo player
    const initializeVimeoPlayer = useCallback(() => {
        if (!currentVideo || !currentVideo.video_url) return;
        
        const vimeoId = extractVimeoId(currentVideo.video_url);
        if (!vimeoId) {
            setVideoError(true);
            return;
        }

        // Load Vimeo Player API if not already loaded
        if (!window.Vimeo) {
            const script = document.createElement('script');
            script.src = 'https://player.vimeo.com/api/player.js';
            script.onload = () => setupVimeoPlayer(vimeoId);
            document.body.appendChild(script);
        } else {
            setupVimeoPlayer(vimeoId);
        }
    }, [currentVideo, extractVimeoId]);

    const setupVimeoPlayer = useCallback((vimeoId) => {
    if (vimeoPlayer) {
        vimeoPlayer.destroy();
    }
    const options = {
        id: vimeoId,
        width: 640,
        height: 360,
        autoplay: true,
        muted: false,
        playsinline: false,
        controls: false,
        title: false,
        byline: false,
        portrait: false,
        responsive: true,
        quality: 'auto'
    };

    const player = new window.Vimeo.Player(vimeoContainerRef.current, options);
    
    // Store the player instance
    setVimeoPlayer(player);
    setActiveVimeoInstance(player);
    volumeEnabledRef.current = false; // Reset for new instance

    // Event listeners
    player.on('play', () => {
        setIsPlaying(true);
        
        // Hide poster
        if (mainVideoPosterRef.current) {
            mainVideoPosterRef.current.classList.add('fade-out');
            setTimeout(() => {
                if (mainVideoPosterRef.current) {
                    mainVideoPosterRef.current.style.display = 'none';
                }
            }, 500);
        }
    });
  // In setupVimeoPlayer function, update the event listeners:
player.on('play', async () => {
    setIsPlaying(true);
    
    // Update volume display
    await updatePlayerVolume();
    
    // Hide poster
    if (mainVideoPosterRef.current) {
        mainVideoPosterRef.current.classList.add('fade-out');
        setTimeout(() => {
            if (mainVideoPosterRef.current) {
                mainVideoPosterRef.current.style.display = 'none';
            }
        }, 500);
    }
});

player.on('volumechange', async (data) => {
    // Update UI when player volume changes
    await updatePlayerVolume();
});

player.on('loaded', async () => {
    console.log('Vimeo player loaded');
    
    // Try to get initial volume
    await updatePlayerVolume();
    
    // Start progress updates
    if (progressUpdateRef.current) {
        clearInterval(progressUpdateRef.current);
    }
    progressUpdateRef.current = setInterval(() => {
        player.getCurrentTime().then(time => {
            setCurrentTime(time);
        }).catch(console.error);
    }, 1000);
});


    player.on('pause', () => {
        setIsPlaying(false);
    });

   player.on('ended', async () => {
        console.log('Video ended, autoPlay:', autoPlay);
        
        // Mark video as completed
        if (currentVideo && !completedVideos.has(currentVideo.id)) {
            addWatchedVideo(currentVideo.id);
        }
        
        if (autoPlay) {
            // Show toast before moving to next video
            toast.success('Moving to next video...', { duration: 1500 });
            
            // Small delay before switching
            setTimeout(() => {
                handleNextVideo();
            }, 1500);
        } else {
            // Show completion toast without auto-playing
            setShowCompletionToast(true);
            setTimeout(() => setShowCompletionToast(false), 3000);
            toast.success('Video completed! Click "Next Video" to continue.');
        }
    });

    player.on('timeupdate', (data) => {
        setCurrentTime(data.seconds);
        
        player.getDuration().then(dur => {
            setDuration(dur);
            setProgress((data.seconds / dur) * 100);
            
            if (data.seconds / dur > 0.9 && currentVideo && !completedVideos.has(currentVideo.id)) {
                addWatchedVideo(currentVideo.id);
            }
        }).catch(console.error);
    });

    player.on('error', (error) => {
        console.error('Vimeo player error:', error);
        setVideoError(true);
        toast.error('Failed to play video');
    });

    player.on('loaded', () => {
        console.log('Vimeo player loaded');
        
        // Start progress updates
        if (progressUpdateRef.current) {
            clearInterval(progressUpdateRef.current);
        }
        progressUpdateRef.current = setInterval(() => {
            player.getCurrentTime().then(time => {
                setCurrentTime(time);
            }).catch(console.error);
        }, 1000);
    });

    // Try to enable volume control when player is ready
    player.ready().then(() => {
        console.log('Vimeo player ready');
        
        // Check if we can control volume
        enableVolumeControl(player);
    }).catch(console.error);

    // Cleanup function
    return () => {
        if (player) {
            player.destroy();
        }
    };
    }, [volume, isMuted, autoPlay, currentVideo, completedVideos, addWatchedVideo, handleNextVideo]);
const triggerAutoplay = useCallback(async () => {
    if (!vimeoPlayer || !autoPlay) return;
    
    try {
        const isPaused = await vimeoPlayer.getPaused();
        if (isPaused) {
            await vimeoPlayer.play();
            console.log('Manually triggered autoplay');
            toast.success('Auto-play started', { duration: 1000 });
        }
    } catch (error) {
        console.error('Failed to trigger autoplay:', error);
        toast.error('Autoplay blocked. Click play button to start.');
    }
}, [vimeoPlayer, autoPlay]);

// Add a button to manually trigger autoplay if needed
  const enableVolumeControl = useCallback(async (player = vimeoPlayer) => {
    if (!player) return;
    
    try {
        // First try to get current volume
        const currentVol = await player.getVolume();
        console.log('Current volume from player:', currentVol);
        
        // If we can get volume, we can control it
        if (currentVol !== undefined) {
            setVolumeEnabled(true);
            volumeEnabledRef.current = true;
            
            // Set initial volume
            if (isMuted) {
                await player.setVolume(0);
            } else {
                await player.setVolume(volume / 100);
            }
            console.log('Volume control enabled for this instance');
        } else {
            console.log('Volume control not available yet');
            setVolumeEnabled(false);
            volumeEnabledRef.current = false;
        }
    } catch (error) {
        console.log('Volume control not yet available:', error.message);
        setVolumeEnabled(false);
        volumeEnabledRef.current = false;
    }
}, [vimeoPlayer, volume, isMuted]);


   useEffect(() => {
  return () => {
    if (vimeoPlayer) {
      vimeoPlayer.unload().catch(() => {});
      setVimeoPlayer(null);
    }
  };
}, [currentVideo?.id]);


    // Fetch course data
    useEffect(() => {
        if (!courseId) return;
        
        let isMounted = true;
        const controller = new AbortController();
        
        const fetchData = async () => {
            try {
                setLoading(true);
                setVideoError(false);
                
                const response = await api.getVideoCourseDetails(courseId, { 
                    signal: controller.signal 
                });
                const responseData = response.data;
                
                if (!isMounted) return;
                
                if (responseData?.success && responseData?.data) {
                    const courseData = responseData.data;
                    setCourse(courseData.course);
                    
                    if (courseData.videos && Object.keys(courseData.videos).length > 0) {
                        const processedGroups = {};
                        const allVideosList = [];
                        
                        Object.entries(courseData.videos).forEach(([groupName, videos]) => {
                            const processedVideos = videos.map(video => ({
                                ...video,
                                id: video.id,
                                title: video.title || 'Untitled Video',
                                video_url: video.video_url,
                                durationFormatted: video.duration || '00:00',
                                poster: video.poster || 'https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=400&auto=format&fit=crop',
                                durationSeconds: video.duration ? 
                                    video.duration.split(':').reduce((acc, time) => (60 * acc) + +time, 0) : 0
                            }));
                            
                            processedGroups[groupName] = processedVideos;
                            allVideosList.push(...processedVideos);
                        });
                        
                        setGroupedVideos(processedGroups);
                        setAllVideos(allVideosList);
                        
                        if (allVideosList.length > 0) {
                            const watchedVideos = loadWatchedVideos();
                            
                            let initialVideo = allVideosList[0];
                            let initialIndex = 0;
                            
                            for (let i = 0; i < allVideosList.length; i++) {
                                if (!watchedVideos.has(allVideosList[i].id.toString())) {
                                    initialVideo = allVideosList[i];
                                    initialIndex = i;
                                    break;
                                }
                            }
                            
                            setCurrentVideo(initialVideo);
                            setCurrentVideoIndex(initialIndex);
                        }
                    }
                }
            } catch (error) {
                if (!isMounted || error.name === 'AbortError') return;
                
                console.error('Error fetching course data:', error);
                toast.error('Failed to load course data');
                setVideoError(true);
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };
        
        fetchData();
        
        return () => {
            isMounted = false;
            controller.abort();
        };
    }, [courseId]);

    // Load watched videos and bookmarks
    useEffect(() => {
        if (courseId && !loading) {
            setCompletedVideos(loadWatchedVideos());
            setBookmarkedVideos(loadBookmarks());
            
            // Load auto-play preference
            const autoPlayPref = localStorage.getItem(`autoplay_${courseId}`);
            if (autoPlayPref !== null) {
                setAutoPlay(JSON.parse(autoPlayPref));
            }
            
            // Load volume preference
            const volumePref = localStorage.getItem(`volume_${courseId}`);
            if (volumePref !== null) {
                try {
                    const savedVolume = parseInt(JSON.parse(volumePref));
                    if (!isNaN(savedVolume) && savedVolume >= 0 && savedVolume <= 100) {
                        setVolume(savedVolume);
                        
                        // Update mute state based on saved volume
                        if (savedVolume === 0) {
                            setIsMuted(true);
                        }
                    }
                } catch (error) {
                    console.error('Error loading volume preference:', error);
                }
            }
        }
    }, [courseId, loading, loadWatchedVideos, loadBookmarks]);

    // Initialize Vimeo player when current video changes
    useEffect(() => {
        if (currentVideo && currentVideo.video_url && currentVideo.video_url.includes('vimeo.com')) {
            initializeVimeoPlayer();
        }
        
        // Cleanup on unmount
        return () => {
            if (progressUpdateRef.current) {
                clearInterval(progressUpdateRef.current);
            }
            if (vimeoPlayer) {
                vimeoPlayer.destroy();
            }
        };
    }, [currentVideo, initializeVimeoPlayer]);

    // Auto-play toggle handler
   const toggleAutoPlay = useCallback(() => {
    const newValue = !autoPlay;
    setAutoPlay(newValue);
    localStorage.setItem(`autoplay_${courseId}`, JSON.stringify(newValue));
    
    toast.success(newValue ? 'Auto-play enabled' : 'Auto-play disabled', {
        icon: newValue ? '▶️' : '⏸️',
        duration: 2000,
    });
    
    // Log for debugging
    console.log('Auto-play toggled:', newValue);
}, [autoPlay, courseId]);

    // Play/pause handler
    const togglePlayPause = useCallback(() => {
        if (vimeoPlayer) {
            if (isPlaying) {
                vimeoPlayer.pause();
            } else {
                vimeoPlayer.play();
            }
            setIsPlaying(!isPlaying);
        }
    }, [isPlaying, vimeoPlayer]);

    // Skip forward/backward
    const skip = useCallback((seconds) => {
        if (vimeoPlayer) {
            vimeoPlayer.getCurrentTime().then(currentTime => {
                vimeoPlayer.setCurrentTime(currentTime + seconds);
            }).catch(console.error);
        }
    }, [vimeoPlayer]);

    // Change playback rate
    const changePlaybackRate = useCallback((rate) => {
        setPlaybackRate(rate);
        if (vimeoPlayer) {
            vimeoPlayer.setPlaybackRate(rate).catch(console.error);
        }
    }, [vimeoPlayer]);

    // Toggle mute
   const toggleMute = useCallback(async () => {
    const player = vimeoPlayer;
    if (!player) {
        toast.info('Video player not ready');
        return;
    }
    
    try {
       
        
        if (isMuted) {
            // Unmute - set to current volume
            await player.setVolume(volume / 100);
            setIsMuted(false);
            toast.success(`Volume: ${volume}%`, { 
                duration: 1000,
                icon: volume > 50 ? '🔊' : '🔉'
            });
        } else {
            // Mute - set to 0
            await player.setVolume(0);
            setIsMuted(true);
            toast.success('Muted', { duration: 1000, icon: '🔇' });
        }
    } catch (error) {
        console.error('Error toggling mute:', error);
        toast.error('Could not toggle mute. Try clicking the video first.');
    }
}, [vimeoPlayer, isMuted, volume]);

const handleVolumeInput = useCallback((e) => {
    const newVolume = parseInt(e.target.value);
    
    // Update slider value immediately for visual feedback
    setSliderVolume(newVolume);
    
    // Update volume state and apply to player
    setVolume(newVolume);
    
    // Save to localStorage
    if (courseId && newVolume !== undefined) {
        localStorage.setItem(`volume_${courseId}`, JSON.stringify(newVolume));
    }
    
    // Update mute state
    if (newVolume === 0 && !isMuted) {
        setIsMuted(true);
    } else if (newVolume > 0 && isMuted) {
        setIsMuted(false);
    }
    
    // Apply to Vimeo player if enabled
    const player = vimeoPlayer;
    if (player && volumeEnabledRef.current) {
        try {
            player.setVolume(newVolume / 100);
        } catch (error) {
            console.error('Error setting volume:', error);
        }
    }
}, [courseId, isMuted, vimeoPlayer]);

const handleVolumeChange = useCallback(async (e) => {
    const newVolume = parseInt(e.target.value);
    
    // Update UI immediately
    setPlayerVolume(newVolume);
    
    // Save to localStorage
    if (courseId && newVolume !== undefined) {
        localStorage.setItem(`volume_${courseId}`, JSON.stringify(newVolume));
    }
    
    // Apply to Vimeo player
    const player = vimeoPlayer;
    if (player) {
        try {
            await player.setVolume(newVolume / 100);
            setIsMuted(newVolume === 0);
        } catch (error) {
            console.log('Could not set player volume:', error.message);
            
            // Try to enable volume control and retry
            if (!volumeEnabledRef.current) {
                try {
                    // Some Vimeo players need user interaction first
                    await player.play();
                    await player.setVolume(newVolume / 100);
                    volumeEnabledRef.current = true;
                    setVolumeEnabled(true);
                    setIsMuted(newVolume === 0);
                } catch (retryError) {
                    console.error('Volume control still not available:', retryError);
                }
            }
        }
    }
}, [vimeoPlayer, courseId]);
    // Handle progress bar click
    const handleProgressClick = useCallback((e) => {
        if (!vimeoPlayer) return;
        
        const rect = e.currentTarget.getBoundingClientRect();
        const percent = (e.clientX - rect.left) / rect.width;
        const newTime = percent * duration;
        
        vimeoPlayer.setCurrentTime(newTime).catch(console.error);
        setCurrentTime(newTime);
        setProgress(percent * 100);
    }, [duration, vimeoPlayer]);

    const handlePreviousVideo = useCallback(() => {
        if (currentVideoIndex > 0) {
            const prevVideo = allVideos[currentVideoIndex - 1];
            const prevIndex = currentVideoIndex - 1;
            
            let prevGroup = '';
            for (const [groupName, videos] of Object.entries(groupedVideos)) {
                if (videos.some(v => v.id === prevVideo.id)) {
                    prevGroup = groupName;
                    break;
                }
            }
            
            selectVideo(prevVideo, prevIndex, prevGroup);
        }
    }, [allVideos, currentVideoIndex, groupedVideos, selectVideo]);
const handleVideoClick = useCallback(() => {
    if (isDraggingVolumeRef.current) return;

    setShowControls(true);

    if (controlsTimerRef.current) {
        clearTimeout(controlsTimerRef.current);
    }

    controlsTimerRef.current = setTimeout(() => {
        if (isPlaying) setShowControls(false);
    }, 3000);

   
}, [isPlaying, vimeoPlayer]);


    const calculateProgress = useMemo(() => {
        const totalVideos = allVideos.length;
        if (totalVideos === 0) return 0;
        
        const completedCount = completedVideos.size;
        return Math.round((completedCount / totalVideos) * 100);
    }, [allVideos.length, completedVideos.size]);

    // Mouse movement handler for controls
    useEffect(() => {
        const handleMouseMove = () => {
            setShowControls(true);
            if (controlsTimerRef.current) {
                clearTimeout(controlsTimerRef.current);
            }
            controlsTimerRef.current = setTimeout(() => setShowControls(false), 3000);
        };
        
        const container = mainVideoContainerRef.current;
        if (container) {
            container.addEventListener('mousemove', handleMouseMove);
        }
        
        return () => {
            if (container) {
                container.removeEventListener('mousemove', handleMouseMove);
            }
            if (controlsTimerRef.current) {
                clearTimeout(controlsTimerRef.current);
            }
        };
    }, []);

    // Sync mute state with volume
    useEffect(() => {
        if (volume === 0 && !isMuted) {
            setIsMuted(true);
        } else if (volume > 0 && isMuted) {
            setIsMuted(false);
        }
    }, [volume, isMuted]);

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (!vimeoPlayer) return;
            
            switch (e.key) {
                case ' ':
                    e.preventDefault();
                    togglePlayPause();
                    break;
                case 'ArrowLeft':
                    e.preventDefault();
                    skip(-10);
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    skip(10);
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    handleVolumeChange({ target: { value: Math.min(100, volume + 10) } });
                    break;
                case 'ArrowDown':
                    e.preventDefault();
                    handleVolumeChange({ target: { value: Math.max(0, volume - 10) } });
                    break;
                case 'm':
                case 'M':
                    e.preventDefault();
                    toggleMute();
                    break;
                case 'f':
                case 'F':
                    e.preventDefault();
                    if (document.fullscreenElement) {
                        document.exitFullscreen();
                    } else {
                        mainVideoContainerRef.current?.requestFullscreen();
                    }
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [vimeoPlayer, volume, handleVolumeChange, toggleMute, togglePlayPause, skip]);

    // Loading state
    if (loading) {
        return (
            <DashboardLayout>
                <div className="online-course-section">
                    <div className="container">
                        <div className="video-player-loading">
                            <div className="loading-spinner"></div>
                            <p className="loading-text">Loading course content...</p>
                        </div>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    if (!course || Object.keys(groupedVideos).length === 0) {
        return (
            <DashboardLayout>
                <div className="online-course-section">
                    <div className="container">
                        <div className="video-player-empty">
                            <div className="empty-icon"></div>
                            <h2>No Course Found</h2>
                            <p className="text-muted">The requested video course could not be loaded.</p>
                            <button
                                onClick={() => navigate('/video-courses')}
                                className="btn-back mt-3"
                            >
                                <Home size={20} />
                                <span>Back to Courses</span>
                            </button>
                        </div>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="video-player-container">
                {/* Completion Toast */}
                {showCompletionToast && (
                    <div className="completion-toast show">
                        <div className="completion-icon">
                            <Award size={24} />
                        </div>
                        <div className="completion-content">
                            <h4>Video Completed!</h4>
                            <p>{autoPlay ? 'Next video playing...' : 'Ready for next video'}</p>
                        </div>
                    </div>
                )}

                <div className="container">
                    {/* Main Video Container */}
                    <div 
                        ref={mainVideoContainerRef}
                        className="main-video-container"
                        id="mainVideoContainer"
                        onClick={handleVideoClick}
                        onMouseEnter={() => setShowControls(true)}
                        onMouseLeave={() => {
                            if (isPlaying) {
                                controlsTimerRef.current = setTimeout(() => setShowControls(false), 1000);
                            }
                        }}
                    >
                        {/* Video Poster */}
                        <div 
                            ref={mainVideoPosterRef}
                            className="video-poster" 
                            id="mainVideoPoster"
                        >
                            {currentVideo && (
                                <img 
                                    src={currentVideo.poster} 
                                    alt="Video poster"
                                    onError={(e) => {
                                        e.target.src = 'https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=1200';
                                    }}
                                />
                            )}
                        </div>

                        {/* Vimeo Player */}
                        <div className="main-video" id="mainVideo">
                            <div 
                                ref={vimeoContainerRef} 
                                id="vimeo-player"
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    backgroundColor: '#000'
                                }}
                            >
                                {videoError && (
                                    <div className="video-unavailable">
                                        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎥</div>
                                        <h3>Video Not Available</h3>
                                        <p>This video content is currently unavailable.</p>
                                        <button
                                            onClick={() => window.location.reload()}
                                            className="btn-back mt-3"
                                        >
                                            <span>Try Again</span>
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Video Overlay Controls */}
                        {showControls && (
                            <div className="video-overlay">
                                {/* Progress Bar */}
                                <div className="video-progress-container">
                                    <div 
                                        className="video-progress"
                                        onClick={handleProgressClick}
                                    >
                                        <div 
                                            className="video-progress-bar"
                                            style={{ width: `${progress}%` }}
                                        ></div>
                                    </div>
                                    <div className="video-time">
                                        <span>{formatTime(currentTime)}</span>
                                        <span>{formatTime(duration)}</span>
                                    </div>
                                </div>

                                {/* Playback Controls */}
                                <div className="playback-controls">
                                    <button 
                                        className="control-button"
                                        onClick={() => skip(-10)}
                                        title="Skip Back 10s"
                                        disabled={!vimeoPlayer}
                                    >
                                        <SkipBack size={20} />
                                    </button>
                                    
                                    <button 
                                        className="control-button play-pause-btn"
                                        onClick={togglePlayPause}
                                        title={isPlaying ? 'Pause' : 'Play'}
                                        disabled={!vimeoPlayer}
                                    >
                                        {isPlaying ? <Pause size={24} /> : <Play size={24} />}
                                    </button>
                                    
                                    <button 
                                        className="control-button"
                                        onClick={() => skip(10)}
                                        title="Skip Forward 10s"
                                        disabled={!vimeoPlayer}
                                    >
                                        <SkipForward size={20} />
                                    </button>
                                    
                                    <div className="playback-speed">
                                        <button className="control-button" title="Playback Speed">
                                            <Timer size={20} />
                                            <span style={{ marginLeft: '4px', fontSize: '12px' }}>
                                                {playbackRate}x
                                            </span>
                                        </button>
                                        <div className="speed-dropdown">
                                            {[0.5, 0.75, 1, 1.25, 1.5, 1.75, 2].map((rate) => (
                                                <div
                                                    key={rate}
                                                    className={`speed-option ${playbackRate === rate ? 'active' : ''}`}
                                                    onClick={() => changePlaybackRate(rate)}
                                                >
                                                    {rate}x
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <button
                                        className="control-button"
                                        onClick={toggleFullscreen}
                                        title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
                                    >
                                        {isFullscreen ? (
                                            <Minimize size={20} />
                                        ) : (
                                            <Maximize size={20} />
                                        )}
                                    </button>

                                    
                                   
                                  
                                </div>
                            </div>
                        )}

                        {/* Video Info */}
                        <div className="video-info">
                            <h3 className="main-video__title">
                                {currentVideo?.title || 'Video Course'}
                            </h3>
                            <div className="video-meta">
                                <div className="video-meta-item">
                                    <Film size={14} />
                                    <span>Video {currentVideoIndex + 1} of {allVideos.length}</span>
                                </div>
                                <div className="video-meta-item">
                                    <Clock size={14} />
                                    <span>{currentVideo?.durationFormatted || '00:00'}</span>
                                </div>
                                <button
                                    className="control-button"
                                    onClick={() => currentVideo && toggleBookmark(currentVideo.id)}
                                    title="Bookmark this video"
                                >
                                    {currentVideo && bookmarkedVideos.has(currentVideo.id) ? (
                                        <BookmarkCheck size={16} fill="#FFC371" />
                                    ) : (
                                        <Bookmark size={16} />
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Navigation Buttons */}
                        
                    </div>

                    {/* Video List Container */}
                    <div className="video-list-container pb-5 pt-3">
                        {/* Course Progress */}
                         <div className="video-navigation">
                            <button 
                                className="nav-button prev-button" 
                                onClick={handlePreviousVideo}
                                disabled={currentVideoIndex === 0}
                            >
                                <ChevronLeft size={20} />
                                Previous Video
                            </button>
                            <button 
                                className="nav-button next-button" 
                                onClick={handleNextVideo}
                                disabled={currentVideoIndex === allVideos.length - 1}
                            >
                                Next Video
                                <ChevronRight size={20} />
                            </button>
                        </div>
                      <div className="progress-section">
                            <div className="progress-header">
                                <h6>Course Progress</h6>
                                <div className="volume-control-section">
                                    {/* Volume Control */}
                                    <div className="volume-control-wrapper">
                                        <button 
                                            onClick={toggleMute} 
                                            title={isMuted ? `Unmute (${playerVolume}%)` : `Mute (${playerVolume}%)`}
                                            disabled={!vimeoPlayer}
                                            className="volume-toggle-btn"
                                        >
                                            {isMuted ? <VolumeX size={18} /> : 
                                            playerVolume > 50 ? <Volume2 size={18} /> : 
                                            playerVolume > 0 ? <Volume1 size={18} /> : 
                                            <VolumeX size={18} />}
                                        </button>
                                        
                                        <div className="volume-slider-container">
                                            <input
                                                type="range"
                                                min="0"
                                                max="100"
                                                value={playerVolume}
                                                onChange={handleVolumeChange}
                                                onMouseDown={(e) => {
                                                    isDraggingVolumeRef.current = true;
                                                    e.stopPropagation();
                                                }}
                                                onMouseUp={() => {
                                                    isDraggingVolumeRef.current = false;
                                                }}
                                                onTouchStart={(e) => {
                                                    isDraggingVolumeRef.current = true;
                                                    e.stopPropagation();
                                                }}
                                                onTouchEnd={() => {
                                                    isDraggingVolumeRef.current = false;
                                                }}
                                                className="volume-slider"
                                                disabled={!vimeoPlayer}
                                                title={`Volume: ${playerVolume}%`}
                                            />
                                            <div className="volume-percentage">
                                                <span className="volume-value">{playerVolume}%</span>
                                            </div>
                                        </div>
                                        
                                        {!volumeEnabledRef.current && (
                                            <div className="volume-hint">
                                                <span className="hint-text">Click video to enable</span>
                                            </div>
                                        )}
                                          
                                     <div className="autoplay-control-section">
                                        <button 
                                            className="autoplay-toggle-btn"
                                            onClick={toggleAutoPlay}
                                            title={autoPlay ? 'Disable auto-play' : 'Enable auto-play'}
                                        >
                                            <div className={`autoplay-toggle ${autoPlay ? 'active' : ''}`}>
                                                <div className="toggle-switch"></div>
                                            </div>
                                            <span className="autoplay-label">
                                                {autoPlay ? <Zap size={16} /> : <ZapOff size={16} />}
                                                <span className="autoplay-text">
                                                    {autoPlay ? 'Auto-play ON' : 'Auto-play OFF'}
                                                </span>
                                            </span>
                                        </button>
                                    </div>
                                    </div>
                                </div>
                            </div>
                                   
                            
                            {/* Progress Bar */}
                            <div className="progress">
                                <div 
                                    className="progress-bar"
                                    style={{ width: `${calculateProgress}%` }}
                                ></div>
                            </div>
                            
                            <div className="progress-stats">
                                <div className="progress-stat-item">
                                    <div className="stat-icon">
                                        <CheckCircle size={14} />
                                    </div>
                                    <small>
                                        {completedVideos.size} of {allVideos.length} videos completed
                                    </small>
                                </div>
                                <div className="progress-stat-item">
                                    <div className="stat-icon">
                                        <Award size={14} />
                                    </div>
                                    <small>{calculateProgress}% Complete</small>
                                </div>
                            </div>
                        </div>

                        {/* Grouped Videos */}
                        {Object.entries(groupedVideos).map(([groupName, videos]) => (
                            <div key={groupName} className="video-group">
                                <h2 className="group-title">{groupName}</h2>
                                <div className="video-grid">
                                    {videos.map((video) => {
                                        const globalIndex = allVideos.findIndex(v => v.id === video.id);
                                        const isActive = currentVideo?.id === video.id;
                                        const isWatched = completedVideos.has(video.id);
                                        const isBookmarked = bookmarkedVideos.has(video.id);
                                        
                                        return (
                                            <div
                                                key={video.id}
                                                data-video-id={video.id}
                                                className={`video-card ${isActive ? 'active' : ''} ${isWatched ? 'watched' : ''}`}
                                                onClick={() => selectVideo(video, globalIndex, groupName)}
                                            >
                                                {isWatched && (
                                                    <div className="watched-indicator">
                                                        <CheckCircle size={16} />
                                                    </div>
                                                )}

                                                {isBookmarked && (
                                                    <div className="bookmark-indicator">
                                                        <BookmarkCheck size={16} />
                                                    </div>
                                                )}

                                                <div className="video-thumbnail-container">
                                                    <img 
                                                        src={video.poster} 
                                                        alt={video.title}
                                                        className="video-thumbnail"
                                                        onError={(e) => {
                                                            e.target.src = 'https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=400';
                                                        }}
                                                    />
                                                    <div className="video-play-icon">
                                                        <Play size={16} fill="white" />
                                                    </div>
                                                </div>
                                                
                                                <div className="video-card-content">
                                                    <h4 className="video-card-title">{video.title}</h4>
                                                    <div className="video-card-duration">
                                                        <Clock size={12} />
                                                        {video.durationFormatted}
                                                    </div>
                                                    
                                                    <div className="video-card-progress">
                                                        <div 
                                                            className="video-card-progress-bar"
                                                            style={{ width: isWatched ? '100%' : '0%' }}
                                                        ></div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default VideoCoursePlayer;