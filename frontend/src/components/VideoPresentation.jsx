import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Play, Pause, Volume2, VolumeX } from "lucide-react";

const VideoPresentation = ({ isOpen, onClose }) => {
  const [phase, setPhase] = useState("intro"); // intro, main, credits
  const [isMuted, setIsMuted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const mainVideoRef = useRef(null);
  const outroVideoRef = useRef(null);
  const audioRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setPhase("intro");
      // Start with intro, then main video after 3s
      const introTimer = setTimeout(() => {
        setPhase("main");
      }, 3000);
      return () => clearTimeout(introTimer);
    }
  }, [isOpen]);

  const handleMainVideoEnd = () => {
    setPhase("credits");
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (mainVideoRef.current) mainVideoRef.current.muted = !isMuted;
    if (audioRef.current) audioRef.current.muted = !isMuted;
  };

  const togglePlay = () => {
    if (mainVideoRef.current) {
      if (isPlaying) {
        mainVideoRef.current.pause();
        if (audioRef.current) audioRef.current.pause();
      } else {
        mainVideoRef.current.play();
        if (audioRef.current) audioRef.current.play();
      }
    }
    setIsPlaying(!isPlaying);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-black flex items-center justify-center"
        onClick={onClose}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-50 bg-white/10 hover:bg-white/20 text-white p-3 rounded-full transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Controls */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4">
          <button
            onClick={(e) => { e.stopPropagation(); togglePlay(); }}
            className="bg-white/10 hover:bg-white/20 text-white p-3 rounded-full transition-colors"
          >
            {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); toggleMute(); }}
            className="bg-white/10 hover:bg-white/20 text-white p-3 rounded-full transition-colors"
          >
            {isMuted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
          </button>
        </div>

        {/* PHASE 1: Intro with Logo */}
        <AnimatePresence>
          {phase === "intro" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-[#0F172A] via-[#1E293B] to-black"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Animated Logo */}
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="relative"
              >
                {/* Glow Effect */}
                <div className="absolute inset-0 blur-3xl bg-gradient-to-r from-[#3B82F6] to-[#FFD700] opacity-30 scale-150"></div>
                
                {/* Crown Icon */}
                <motion.div
                  initial={{ y: -20 }}
                  animate={{ y: 0 }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                  className="relative z-10 text-center"
                >
                  <svg className="w-32 h-32 mx-auto mb-4" viewBox="0 0 100 80" fill="none">
                    <path 
                      d="M10 70 L20 30 L35 50 L50 20 L65 50 L80 30 L90 70 Z" 
                      fill="url(#crownGradient)" 
                      stroke="#FFD700" 
                      strokeWidth="2"
                    />
                    <defs>
                      <linearGradient id="crownGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#FFD700" />
                        <stop offset="50%" stopColor="#FFC107" />
                        <stop offset="100%" stopColor="#FFD700" />
                      </linearGradient>
                    </defs>
                  </svg>
                </motion.div>
              </motion.div>

              {/* Brand Name */}
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.5 }}
                className="text-6xl md:text-8xl font-black tracking-wider"
                style={{
                  background: "linear-gradient(135deg, #FFD700 0%, #3B82F6 50%, #60A5FA 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent"
                }}
              >
                AFROCROWN
              </motion.h1>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.8 }}
                className="text-xl md:text-2xl text-slate-400 mt-4 tracking-widest"
              >
                LA RÉFÉRENCE DE LA COIFFURE AFRO
              </motion.p>

              {/* TV Badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 1.2 }}
                className="mt-8 px-6 py-2 bg-[#3B82F6]/20 border border-[#3B82F6] rounded-full"
              >
                <span className="text-[#60A5FA] font-bold tracking-widest">AFROCROWN TV</span>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* PHASE 2: Main Video */}
        <AnimatePresence>
          {phase === "main" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full max-w-5xl aspect-video"
              onClick={(e) => e.stopPropagation()}
            >
              <video
                ref={mainVideoRef}
                className="w-full h-full object-cover rounded-lg"
                src="/afrocrown-demo.mp4"
                autoPlay
                muted={isMuted}
                onEnded={handleMainVideoEnd}
              />
              <audio
                ref={audioRef}
                src="/afrocrown-voiceover.mp3"
                autoPlay
                muted={isMuted}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* PHASE 3: Credits - Movie Style */}
        <AnimatePresence>
          {phase === "credits" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 flex flex-col items-center justify-center overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Background Video */}
              <video
                ref={outroVideoRef}
                className="absolute inset-0 w-full h-full object-cover opacity-40"
                src="/afrocrown-outro.mp4"
                autoPlay
                loop
                muted
              />

              {/* Credits Overlay */}
              <div className="relative z-10 text-center">
                {/* Main Title */}
                <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1 }}
                >
                  <h1 
                    className="text-5xl md:text-7xl font-black mb-4"
                    style={{
                      background: "linear-gradient(135deg, #FFD700 0%, #FFC107 100%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent"
                    }}
                  >
                    AFROCROWN TV
                  </h1>
                  <div className="w-32 h-1 bg-gradient-to-r from-[#3B82F6] to-[#FFD700] mx-auto mb-8"></div>
                </motion.div>

                {/* Founder Section */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1, delay: 0.5 }}
                  className="mb-12"
                >
                  <p className="text-slate-400 text-lg tracking-widest mb-2">FONDÉE PAR</p>
                  <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">KAZALI</h2>
                  <p className="text-xl text-[#60A5FA] italic max-w-md mx-auto">
                    "Un entrepreneur visionnaire qui apporte une nouvelle vision à l'industrie de la coiffure afro"
                  </p>
                </motion.div>

                {/* Credits List */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 1, delay: 1 }}
                  className="space-y-6 text-slate-300"
                >
                  <div>
                    <p className="text-sm tracking-widest text-slate-500 mb-1">DIRECTION CRÉATIVE</p>
                    <p className="text-lg">KAZALI</p>
                  </div>
                  <div>
                    <p className="text-sm tracking-widest text-slate-500 mb-1">CONCEPT & VISION</p>
                    <p className="text-lg">AFROCROWN STUDIOS</p>
                  </div>
                  <div>
                    <p className="text-sm tracking-widest text-slate-500 mb-1">PRODUCTION</p>
                    <p className="text-lg">AFROCROWN TV</p>
                  </div>
                </motion.div>

                {/* Final Logo */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 1, delay: 1.5 }}
                  className="mt-12"
                >
                  <div className="inline-flex items-center gap-3 px-8 py-4 bg-black/50 border border-[#FFD700]/30 rounded-full">
                    <svg className="w-8 h-8" viewBox="0 0 100 80" fill="none">
                      <path 
                        d="M10 70 L20 30 L35 50 L50 20 L65 50 L80 30 L90 70 Z" 
                        fill="#FFD700" 
                      />
                    </svg>
                    <span className="text-2xl font-bold text-white">AFROCROWN</span>
                  </div>
                </motion.div>

                {/* Copyright */}
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 1, delay: 2 }}
                  className="mt-8 text-slate-600 text-sm"
                >
                  © 2024 AFROCROWN TV. Tous droits réservés.
                </motion.p>

                {/* Inspired by */}
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 1, delay: 2.2 }}
                  className="mt-2 text-[#FFD700] text-sm font-medium"
                >
                  Inspired by Kadj'
                </motion.p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
};

export default VideoPresentation;
