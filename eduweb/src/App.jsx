import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import "./App.css";
import backgroundImage from "./assets/background.webp"; // Ensure this works or use fallback
import ReactMarkdown from "react-markdown"; // Optional: For formatted responses

function App() {
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [speech, setSpeech] = useState(null);
  const [aiQuestion, setAiQuestion] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [quote, setQuote] = useState("Education is the key to unlock your dreams! 🔑");
  const [currentTip, setCurrentTip] = useState(0);

  const quotes = [
    "Education is the key to unlock your dreams! 🔑",
    "Learn today, lead tomorrow! 🌟",
    "Knowledge is power! 💪",
    "Every step forward counts! 🚶‍♂️",
  ];

  const learningTips = [
    "Break study sessions into 25-minute chunks with 5-minute breaks! ⏱️",
    "Use flashcards to memorize key concepts! 📌",
    "Collaborate with peers for better understanding! 👥",
    "Practice active recall to retain information! 🧠",
  ];

  // Voice Assistant Setup with Error Handling
  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    const synth = window.speechSynthesis;

    if (!SpeechRecognition || !synth) {
      console.warn("Speech features are not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;

    recognition.onresult = (event) => {
      const command = event.results[event.results.length - 1][0].transcript.toLowerCase();
      handleVoiceCommand(command, synth);
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
    };

    setSpeech({ recognition, synth });
  }, []);

  const handleVoiceCommand = (command, synth) => {
    let utterance;
    if (command.includes("home")) {
      utterance = new SpeechSynthesisUtterance("You are on the home page.");
    } else if (command.includes("courses")) {
      utterance = new SpeechSynthesisUtterance("Navigating to courses section.");
      document.getElementById("courses")?.scrollIntoView({ behavior: "smooth" });
    } else if (command.includes("ai")) {
      utterance = new SpeechSynthesisUtterance("Opening AI assistant.");
      document.getElementById("ai-assistant")?.scrollIntoView({ behavior: "smooth" });
    } else if (command.includes("fun fact")) {
      utterance = new SpeechSynthesisUtterance("Showing fun fact section.");
      document.getElementById("fun-fact")?.scrollIntoView({ behavior: "smooth" });
    } else if (command.includes("quote")) {
      utterance = new SpeechSynthesisUtterance("Showing a motivational quote.");
      document.getElementById("quote-section")?.scrollIntoView({ behavior: "smooth" });
    } else if (command.includes("tips")) {
      utterance = new SpeechSynthesisUtterance("Showing learning tips.");
      document.getElementById("learning-tips")?.scrollIntoView({ behavior: "smooth" });
    } else {
      utterance = new SpeechSynthesisUtterance(
        "Command not recognized. Say home, courses, AI, fun fact, quote, or tips."
      );
    }
    synth.speak(utterance);
  };

  const toggleVoiceAssistant = () => {
    if (!speech) {
      alert("Voice features are not supported in this browser.");
      return;
    }
    if (isVoiceActive) {
      speech.recognition.stop();
      speech.synth.cancel();
    } else {
      speech.recognition.start();
      const welcome = new SpeechSynthesisUtterance(
        "Voice assistant activated. Say home, courses, AI, fun fact, quote, or tips to navigate."
      );
      speech.synth.speak(welcome);
    }
    setIsVoiceActive(!isVoiceActive);
  };

  // Placeholder for AI submission (since no public APIs are available, this redirects to tools)
  const handleAiSubmit = (e) => {
    e.preventDefault();
    if (!aiQuestion.trim()) return;
    setAiResponse("Please use the buttons below to solve your question with one of our AI tools.");
    console.log("Redirecting to AI tools for:", aiQuestion);
  };

  const generateQuote = () => {
    const randomIndex = Math.floor(Math.random() * quotes.length);
    setQuote(quotes[randomIndex]);
    if (speech) {
      const utterance = new SpeechSynthesisUtterance(quotes[randomIndex]);
      speech.synth.speak(utterance);
    }
  };

  const nextTip = () => {
    setCurrentTip((prev) => (prev + 1) % learningTips.length);
    if (speech) {
      const utterance = new SpeechSynthesisUtterance(learningTips[currentTip]);
      speech.synth.speak(utterance);
    }
  };

  return (
    <div
      className="App"
      style={{
        backgroundImage: `url(${backgroundImage || "https://via.placeholder.com/1920x1080.png?text=Educational+Background"})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        minHeight: "100vh",
      }}
    >
      {/* Header (Arcade-Inspired, No Emoji) */}
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8 }}
        className="header"
      >
        <div className="header-content">
          <h1 className="arcade-title">EduLearn</h1>
          <nav className="header-nav">
            <a href="#home" className="nav-link">Play Now 🚀</a>
            <a href="#faqs" className="nav-link">FAQs ❓</a>
          </nav>
          <button
            onClick={toggleVoiceAssistant}
            aria-label="Toggle Voice Assistant"
            className="voice-btn"
          >
            {isVoiceActive ? "Disable Voice 🎙️" : "Enable Voice 🎙️"}
          </button>
        </div>
        <motion.div
          className="header-decor"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1, repeat: Infinity, repeatType: "reverse" }}
        >
          <span role="img" aria-label="robot"></span>
          <span role="img" aria-label="rocket"></span>
          <span role="img" aria-label="planet"></span>
        </motion.div>
      </motion.header>

      {/* Main Content (Vertical Stack) */}
      <div className="main-stack">
        {/* Hero Section */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="hero"
        >
          <h2>Welcome to Your Learning Journey 📚</h2>
          <p>Accessible education for everyone! ✏️</p>
        </motion.section>

        {/* Courses Section */}
        <section id="courses" className="courses">
          <h2>Our Courses 🎓</h2>
          <motion.div
            className="course-list"
            initial={{ scale: 0.8 }}
            whileInView={{ scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="course-card">
             
              Math Basics ➕
              <motion.span
                className="emoji"
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                ✨
              </motion.span>
            </div>
            <div className="course-card">
              
              Science 101 🔬
              <motion.span
                className="emoji"
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                ⚗️
              </motion.span>
            </div>
            <div className="course-card">
              
              History Unveiled 🏛️
              <motion.span
                className="emoji"
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                📜
              </motion.span>
            </div>
          </motion.div>
        </section>

        {/* Learning Tips Carousel */}
        <section id="learning-tips" className="learning-tips">
          <h2>Learning Tips 💡</h2>
          <motion.div
            className="tip-card"
            initial={{ x: -100 }}
            animate={{ x: 0 }}
            transition={{ duration: 0.6 }}
          >
            
            <p>{learningTips[currentTip]}</p>
            <button onClick={nextTip} className="tip-btn">
              
            </button>
          </motion.div>
        </section>

        {/* Fun Fact Section */}
        <section id="fun-fact" className="fun-fact">
          <h2>Did You Know? 🤓</h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            The shortest war in history lasted 38 minutes! ⏳
          </motion.p>
          <motion.span
            className="emoji"
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 1, repeat: Infinity }}
          >
            🌟
          </motion.span>
        </section>

        {/* Motivational Quote Section */}
        <section id="quote-section" className="quote-section">
          <h2>Motivational Quote 💡</h2>
          <motion.p
            key={quote}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            {quote}
          </motion.p>
          <button onClick={generateQuote} className="quote-btn">
            
          </button>
        </section>

        {/* AI Assistant (Multiple Tools Integration) */}
        <section id="ai-assistant" className="ai-assistant">
          <h2>AI Learning Assistant 🤖 (Choose Your Tool)</h2>
          <motion.div
            className="chatbox"
            initial={{ x: 100 }}
            whileInView={{ x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <form onSubmit={handleAiSubmit}>
              <input
                type="text"
                value={aiQuestion}
                onChange={(e) => setAiQuestion(e.target.value)}
                placeholder="Ask any question... e.g., Solve x^2 + 3x - 4 = 0 or Explain photosynthesis"
              />
              <button type="submit" className="submit-btn">
                
              </button>
            </form>
            <div className="ai-response">
              <ReactMarkdown>{aiResponse || "Please select an AI tool below to solve your question! ✨"}</ReactMarkdown>
            </div>
            <div className="ai-tools">
              <button
                onClick={() => window.open("https://studyx.ai", "_blank")}
                className="studyx-btn"
              >
                Solve with StudyX AI
              </button>
              <button
                onClick={() => window.open("https://yeschat.ai", "_blank")}
                className="yeschat-btn"
              >
                Solve with YesChat AI
              </button>
              <button
                onClick={() => window.open("https://smodin.io/ai-homework-solver", "_blank")}
                className="smodin-btn"
              >
                Solve with Smodin AI
              </button>
              <button
                onClick={() => window.open("https://aianswer.net", "_blank")}
                className="aianswer-btn"
              >
                Answer with AI Answer Generator
              </button>
              <button
                onClick={() => window.open("https://homeworkify.eu", "_blank")}
                className="homeworkify-btn"
              >
                Solve with Homeworkify AI
              </button>
            </div>
          </motion.div>
        </section>
      </div>

      {/* Footer */}
      <footer>
        <p>© 2025 EduLearn. All rights reserved. 🌈</p>
      </footer>
    </div>
  );
}

export default App;