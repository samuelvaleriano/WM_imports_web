import React, { useRef, useEffect } from 'react';
import styles from './TeamsCarousel.module.css';

export default function TeamsCarousel({ times = [] }) {
  const trackRef = useRef(null);
  const isHoveredRef = useRef(false);

  const timesDuplicados = [...times, ...times];

  useEffect(() => {
    const track = trackRef.current;
    if (!track || times.length === 0) return;

    let animationId;
    let position = 0;
    const speed = 0.5;

    const animate = () => {
      if (!isHoveredRef.current) {
        position -= speed;

        if (Math.abs(position) >= track.scrollWidth / 2) {
          position = 0;
        }

        track.style.transform = `translateX(${position}px)`;
      }

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => cancelAnimationFrame(animationId);
  }, [times]);

  return (
    <div className={styles.carouselContainer}>
      <div 
        className={styles.carouselTrack} 
        ref={trackRef}
        onMouseEnter={() => (isHoveredRef.current = true)}
        onMouseLeave={() => (isHoveredRef.current = false)}
      >
        {timesDuplicados.map((time, index) => (
          <div className={styles.teamCard} key={`${time.id}-${index}`}>
            <div className={styles.imageWrapper}>
              <img src={time.escudoUrl} alt={time.nome} loading="lazy" />
            </div>
            <span className={styles.teamName}>{time.nome}</span>
          </div>
        ))}
      </div>
    </div>
  );
}