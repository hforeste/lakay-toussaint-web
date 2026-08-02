"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

type CommunityVideoMomentProps = {
  fullMp4Src?: string;
  posterSrc: string;
  previewMp4Src: string;
  previewWebmSrc: string;
};

export function CommunityVideoMoment({
  fullMp4Src,
  posterSrc,
  previewMp4Src,
  previewWebmSrc,
}: CommunityVideoMomentProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const modalVideoRef = useRef<HTMLVideoElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const video = videoRef.current;

    if (!video) {
      return;
    }

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (prefersReducedMotion || !("IntersectionObserver" in window)) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsLoaded(true);
          void video.play().catch(() => undefined);
        } else {
          video.pause();
        }
      },
      {
        rootMargin: "-18% 0px -18% 0px",
        threshold: 0.55,
      },
    );

    observer.observe(video);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isModalOpen) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsModalOpen(false);
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isModalOpen]);

  useEffect(() => {
    if (!isModalOpen) {
      return;
    }

    const modalVideo = modalVideoRef.current;

    if (!modalVideo) {
      return;
    }

    modalVideo.currentTime = 0;
    void modalVideo.play().catch(() => undefined);
  }, [isModalOpen]);

  return (
    <>
      <div className="communityVideoLayout">
        <button
          aria-label="Open full community video"
          className="communityVideoButton"
          type="button"
          onClick={() => setIsModalOpen(true)}
        >
          <video
            ref={videoRef}
            className="communityVideo"
            loop
            muted
            playsInline
            poster={posterSrc}
            preload="none"
          >
            {isLoaded ? (
              <>
                <source src={previewWebmSrc} type="video/webm" />
                <source src={previewMp4Src} type="video/mp4" />
              </>
            ) : null}
          </video>
          <span className="videoScrim" aria-hidden="true" />
        </button>

        <div className="communityVideoCopy">
          <span className="label">Lakay an mouvman</span>
          <h2>Community in motion</h2>
          <div className="goldRule" />
          <p className="lead">
            A glimpse of the music, faces, and shared joy that bring our Haitian
            community together in Seattle.
          </p>
          <div className="actions">
            <Link className="button primaryAction" href="/events">
              See upcoming events
            </Link>
          </div>
        </div>
      </div>

      {isModalOpen ? (
        <div
          aria-labelledby="community-video-title"
          aria-modal="true"
          className="videoModal"
          role="dialog"
        >
          <button
            aria-label="Close full community video"
            className="videoModalBackdrop"
            type="button"
            onClick={() => setIsModalOpen(false)}
          />
          <div className="videoModalPanel">
            <div className="videoModalHeader">
              <h2 id="community-video-title">Community in motion</h2>
              <button
                aria-label="Close full community video"
                className="iconButton"
                type="button"
                onClick={() => setIsModalOpen(false)}
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <video
              ref={modalVideoRef}
              autoPlay
              className="modalVideo"
              controls
              poster={posterSrc}
              preload="metadata"
            >
              <source src={fullMp4Src || previewMp4Src} type="video/mp4" />
            </video>
          </div>
        </div>
      ) : null}
    </>
  );
}
