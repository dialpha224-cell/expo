import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

// Hair strand component
const HairStrand = ({ delay, x, rotation }) => (
  <motion.div
    initial={{ y: -20, x: x, rotate: rotation, opacity: 0 }}
    animate={{ 
      y: [0, 100, 300, 500],
      x: [x, x + 20, x - 10, x + 30],
      rotate: [rotation, rotation + 45, rotation - 30, rotation + 60],
      opacity: [0, 1, 1, 0]
    }}
    transition={{ 
      duration: 1.5, 
      delay: delay,
      ease: "easeIn"
    }}
    className="absolute w-1 h-8 rounded-full"
    style={{
      background: `linear-gradient(to bottom, #1a1a1a, #333)`,
      top: '40%'
    }}
  />
);

// Scissors component
const ScissorsAnimation = ({ isClosing }) => {
  return (
    <motion.div 
      className="relative"
      initial={{ scale: 0, rotate: -45 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Left blade */}
      <motion.div
        animate={isClosing ? { rotate: [0, 15, 0] } : { rotate: 0 }}
        transition={{ duration: 0.3, repeat: isClosing ? 2 : 0 }}
        style={{ transformOrigin: 'center right' }}
        className="absolute"
      >
        <svg width="80" height="40" viewBox="0 0 80 40">
          <path
            d="M0 20 L60 5 L65 20 L60 35 Z"
            fill="#FFD700"
            stroke="#B8860B"
            strokeWidth="1"
          />
          <circle cx="65" cy="20" r="8" fill="#333" stroke="#FFD700" strokeWidth="2" />
        </svg>
      </motion.div>
      
      {/* Right blade */}
      <motion.div
        animate={isClosing ? { rotate: [0, -15, 0] } : { rotate: 0 }}
        transition={{ duration: 0.3, repeat: isClosing ? 2 : 0 }}
        style={{ transformOrigin: 'center right' }}
        className="absolute"
      >
        <svg width="80" height="40" viewBox="0 0 80 40" style={{ transform: 'scaleY(-1)' }}>
          <path
            d="M0 20 L60 5 L65 20 L60 35 Z"
            fill="#FFD700"
            stroke="#B8860B"
            strokeWidth="1"
          />
          <circle cx="65" cy="20" r="8" fill="#333" stroke="#FFD700" strokeWidth="2" />
        </svg>
      </motion.div>
    </motion.div>
  );
};

const PageTransition = ({ children }) => {
  const location = useLocation();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showContent, setShowContent] = useState(true);
  const [prevLocation, setPrevLocation] = useState(location.pathname);

  useEffect(() => {
    if (location.pathname !== prevLocation) {
      // Start transition
      setIsTransitioning(true);
      setShowContent(false);
      
      // Show content after transition
      const timer = setTimeout(() => {
        setShowContent(true);
        setIsTransitioning(false);
        setPrevLocation(location.pathname);
      }, 1200);
      
      return () => clearTimeout(timer);
    }
  }, [location.pathname, prevLocation]);

  // Generate random hair positions
  const hairStrands = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    x: Math.random() * 100 - 50,
    delay: Math.random() * 0.5,
    rotation: Math.random() * 90 - 45
  }));

  return (
    <>
      {/* Transition Overlay */}
      <AnimatePresence>
        {isTransitioning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[9999] bg-slate-900 flex items-center justify-center overflow-hidden"
          >
            {/* Scissors in center */}
            <div className="relative">
              <ScissorsAnimation isClosing={true} />
              
              {/* Hair falling */}
              <div className="absolute left-1/2 top-0 -translate-x-1/2">
                {hairStrands.map((strand) => (
                  <HairStrand
                    key={strand.id}
                    delay={strand.delay}
                    x={strand.x}
                    rotation={strand.rotation}
                  />
                ))}
              </div>
            </div>
            
            {/* Brand text */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="absolute bottom-20 text-center"
            >
              <span className="text-[#FFD700] font-heading text-2xl font-bold">AfroCrown</span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Page Content */}
      <AnimatePresence mode="wait">
        {showContent && (
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default PageTransition;
