
import { useEffect, useState } from "react";
import { Play, Pause } from "lucide-react"; // Lucide-react icons

const BackgroundMusic = () => {
  const [audio] = useState(new Audio("/audio.mp3"));
  const [isPlaying, setIsPlaying] = useState(true); // Start in playing state

  useEffect(() => {
    audio.loop = true; // Music loop hoga
    audio.volume = 1.0; // Full volume
    audio.play().catch((error) => console.log("Autoplay blocked:", error)); // Try autoplay

    return () => {
      audio.pause();
      audio.currentTime = 0;
    };
  }, [audio]);

  const togglePlay = () => {
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play().catch((error) => console.log("Autoplay blocked:", error));
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <div style={styles.container}>
      <button onClick={togglePlay} style={styles.button}>
        {isPlaying ? <Pause size={24} /> : <Play size={24} />}
      </button>
    </div>
  );
};

// ✅ Inline CSS
const styles = {
  container: {
    position: "fixed",
    top: "8px",
    right: "20px",
    zIndex: 2,
  },
  button: {
    background: "linear-gradient(to right, rgb(96, 218, 191), rgb(127, 189, 255))", // Blue gradient
    border: "none",
    color: "white",
    padding: "12px 12px",
    borderRadius: "50%", // Circular button
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
    transition: "all 0.3s ease",
  },
  buttonHover: {
    transform: "scale(1.1)",
  },
};

export default BackgroundMusic;
