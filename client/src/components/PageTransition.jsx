import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

const PageTransition = ({ children }) => {
  const location = useLocation();
  const [displayChildren, setDisplayChildren] = useState(children);
  const [transitionStage, setTransitionStage] = useState('idle'); // idle, cover, reveal
  const prevPathRef = useRef(location.pathname);

  useEffect(() => {
    if (location.pathname !== prevPathRef.current) {
      // Yeni sayfaya geçiş başlat
      setTransitionStage('cover');

      const revealTimer = setTimeout(() => {
        setDisplayChildren(children);
        setTransitionStage('reveal');
        window.scrollTo(0, 0);
      }, 500);

      const idleTimer = setTimeout(() => {
        setTransitionStage('idle');
      }, 1000);

      prevPathRef.current = location.pathname;

      return () => {
        clearTimeout(revealTimer);
        clearTimeout(idleTimer);
      };
    } else {
      setDisplayChildren(children);
    }
  }, [location.pathname, children]);

  return (
    <div className="relative">
      {/* Page Content */}
      <div
        className={`transition-opacity duration-300 ${
          transitionStage === 'cover' ? 'opacity-50' : 'opacity-100'
        }`}
      >
        {displayChildren}
      </div>

      {/* Transition Overlay - Logo ile kapatma efekti */}
      <div
        className={`fixed inset-0 z-[9998] flex items-center justify-center pointer-events-none ${
          transitionStage === 'cover'
            ? 'page-transition-enter'
            : transitionStage === 'reveal'
            ? 'page-transition-exit'
            : 'page-transition-idle'
        }`}
      >
        <div className="bg-black w-full h-full absolute inset-0" />
        <div className="relative z-10 flex flex-col items-center">
          <div className="w-[400px] h-[400px] md:w-[500px] md:h-[500px] rounded-full overflow-hidden relative">
            <img
              src="/logo.png"
              alt="PAPUÇGNC"
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[16000px] h-[16000px] object-contain"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PageTransition;

