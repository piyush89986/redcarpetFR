import React, { useEffect, useState } from "react";

const App = () => {
  const [showVideo, setShowVideo] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const timer1 = setTimeout(() => {
      setFadeOut(true); // Start fade out
    }, 6000); // after 5 sec start fade

    const timer2 = setTimeout(() => {
      setShowVideo(false); // Hide video after 6 sec total
    }, 7000); // 5 + 1 sec fade time

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  return (
    <div>
      {showVideo ? (
        <div
          style={{
            ...styles.videoContainer,
            opacity: fadeOut ? 0 : 1,
            transition: "opacity 1s ease",
          }}
        >
          <video
            src="/images/abcd.mp4"
            autoPlay
            muted
            style={styles.video}
          />
        </div>
      ) : (
        <div style={styles.mainContent}>
          {/* Tumhara actual content yahan aayega */}
        </div>
      )}
    </div>
  );
};

const styles = {
  videoContainer: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    zIndex: 9999,
    backgroundColor: "black",
  },
  video: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  mainContent: {
    padding: "2rem",
    textAlign: "center",
  },
};

export default App;
