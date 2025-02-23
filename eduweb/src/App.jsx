import { useState, useEffect, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import "./App.css";
import backgroundImage from "./assets/background.webp"; // Adjust path if needed
import axios from "axios";
import ReactMarkdown from "react-markdown"; // Optional: For formatted responses

function App() {
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [speech, setSpeech] = useState(null);
  const [aiQuestion, setAiQuestion] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [quote, setQuote] = useState("Education is the key to unlock your dreams! 🔑");
  const [currentTip, setCurrentTip] = useState(0);
  const [isLoading, setIsLoading] = useState(false); // Add loading state
  const [error, setError] = useState(null); // Add error state for better feedback

  const quotes = useMemo(() => [
    "Education is the key to unlock your dreams! 🔑",
    "Learn today, lead tomorrow! 🌟",
    "Knowledge is power! 💪",
    "Every step forward counts! 🚶‍♂️",
  ], []);

  const learningTips = useMemo(() => [
    "Break study sessions into 25-minute chunks with 5-minute breaks! ⏱️",
    "Use flashcards to memorize key concepts! 📌",
    "Collaborate with peers for better understanding! 👥",
    "Practice active recall to retain information! 🧠",
  ], []);

  // Voice Assistant Setup with Cleanup and Optimized Dependencies
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const synth = window.speechSynthesis;

    if (!SpeechRecognition || !synth) {
      console.warn("Speech features are not supported in this browser.");
      setError("Speech features are not supported in this browser.");
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
      setError(`Speech recognition error: ${event.error}`);
    };

    setSpeech({ recognition, synth });

    return () => {
      recognition.stop(); // Cleanup to prevent memory leaks
      if (speech?.synth?.pending) speech.synth.cancel(); // Cancel any pending speech
    };
  }, []); // No dependencies needed here

  // Throttled Voice Command Handler with Native JavaScript (200ms delay for finer control)
  const handleVoiceCommand = useCallback((command, synth) => {
    if (handleVoiceCommand.lastCall && Date.now() - handleVoiceCommand.lastCall < 200) return;
    handleVoiceCommand.lastCall = Date.now();

    let utterance;
    const subjects = ['maths', 'science', 'history']; // Hardcoded subjects for navigation
    if (command.includes("home")) {
      utterance = new SpeechSynthesisUtterance("You are on the home page.");
      document.querySelector('#header')?.scrollIntoView({ behavior: "smooth", block: "start" });
    } else if (command.includes("courses")) {
      utterance = new SpeechSynthesisUtterance("Navigating to courses section.");
      document.querySelector('#courses')?.scrollIntoView({ behavior: "smooth", block: "start" });
    } else if (command.includes("ai")) {
      utterance = new SpeechSynthesisUtterance("Opening AI assistant.");
      document.querySelector('#ai-assistant')?.scrollIntoView({ behavior: "smooth", block: "start" });
    } else if (command.includes("fun fact")) {
      utterance = new SpeechSynthesisUtterance("Showing fun fact section.");
      document.querySelector('#fun-fact')?.scrollIntoView({ behavior: "smooth", block: "start" });
    } else if (command.includes("quote")) {
      utterance = new SpeechSynthesisUtterance("Showing a motivational quote.");
      document.querySelector('#quote-section')?.scrollIntoView({ behavior: "smooth", block: "start" });
    } else if (command.includes("tips")) {
      utterance = new SpeechSynthesisUtterance("Showing learning tips.");
      document.querySelector('#learning-tips')?.scrollIntoView({ behavior: "smooth", block: "start" });
    } else if (command.includes("maths")) {
      utterance = new SpeechSynthesisUtterance("Navigating to Maths notes and question papers.");
      window.open("http://localhost:8000/api/subject/maths/", "_blank");
    } else if (command.includes("science")) {
      utterance = new SpeechSynthesisUtterance("Navigating to Science notes and question papers.");
      window.open("http://localhost:8000/api/subject/science/", "_blank");
    } else if (command.includes("history")) {
      utterance = new SpeechSynthesisUtterance("Navigating to History notes and question papers.");
      window.open("http://localhost:8000/api/subject/history/", "_blank");
    } else {
      utterance = new SpeechSynthesisUtterance(
        "Command not recognized. Say home, courses, AI, fun fact, quote, tips, maths, science, or history."
      );
    }
    synth.speak(utterance);
  }, [speech]); // Added `speech` as a dependency

  const toggleVoiceAssistant = useCallback(() => {
    if (!speech) {
      alert("Voice features are not supported in this browser.");
      return;
    }
    if (isVoiceActive) {
      speech.recognition.stop();
      speech.synth.cancel();
      document.querySelector('.voice-btn').textContent = "Enable Voice 🎙️";
    } else {
      speech.recognition.start();
      const welcome = new SpeechSynthesisUtterance(
        "Voice assistant activated. Say home, courses, AI, fun fact, quote, tips, maths, science, or history to navigate."
      );
      speech.synth.speak(welcome);
      document.querySelector('.voice-btn').textContent = "Disable Voice 🎙️";
    }
    setIsVoiceActive(!isVoiceActive);
  }, [isVoiceActive, speech]); // Added `speech` as a dependency

  // Optimized AI Submit Handler with Loading State and Throttling
  const handleAiSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (!aiQuestion.trim()) return;

    if (handleAiSubmit.lastCall && Date.now() - handleAiSubmit.lastCall < 200) return;
    handleAiSubmit.lastCall = Date.now();

    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.post("http://localhost:8000/api/ai/", {
        question: aiQuestion,
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 5000, // 5-second timeout
      });

      const text = response.data.answer || "No answer provided.";
      console.log("Backend Response:", text);
      setAiResponse(text);
      if (speech) {
        const utterance = new SpeechSynthesisUtterance(text);
        speech.synth.speak(utterance);
      }
    } catch (error) {
      const errorMessage = error.message || "Unknown error";
      setError(`Error connecting to AI backend: ${errorMessage}`);
      console.error("Backend API Error:", error);
      setAiResponse(`Error: ${errorMessage}. Please try again later.`);
    } finally {
      setIsLoading(false);
    }
  }, [aiQuestion, speech]); // Added `speech` as a dependency

  const generateQuote = useCallback(() => {
    if (generateQuote.lastCall && Date.now() - generateQuote.lastCall < 200) return;
    generateQuote.lastCall = Date.now();

    const randomIndex = Math.floor(Math.random() * quotes.length);
    setQuote(quotes[randomIndex]);
    if (speech) {
      const utterance = new SpeechSynthesisUtterance(quotes[randomIndex]);
      speech.synth.speak(utterance);
    }
  }, [quotes, speech]); // Added `speech` as a dependency

  const nextTip = useCallback(() => {
    if (nextTip.lastCall && Date.now() - nextTip.lastCall < 200) return;
    nextTip.lastCall = Date.now();

    setCurrentTip((prev) => (prev + 1) % learningTips.length);
    if (speech) {
      const utterance = new SpeechSynthesisUtterance(learningTips[currentTip]);
      speech.synth.speak(utterance);
    }
  }, [currentTip, learningTips, speech]); // Added `speech` as a dependency

  // Optimized Subject Resources Fetcher with Loading State and Throttling
  const fetchSubjectResources = useCallback(async (subject) => {
    if (fetchSubjectResources.lastCall && Date.now() - fetchSubjectResources.lastCall < 200) return { notes: [], question_papers: [], message: `Throttled: Try again in ${200 - (Date.now() - fetchSubjectResources.lastCall)}ms.` };
    fetchSubjectResources.lastCall = Date.now();

    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get(`http://localhost:8000/api/subject/${subject}/`, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 5000, // 5-second timeout
      });
      console.log(`Resources for ${subject}:`, response.data);
      return response.data;
    } catch (error) {
      console.error(`Error fetching ${subject} resources:`, error);
      setError(`Error loading ${subject} resources: ${error.message}`);
      return { notes: [], question_papers: [], message: `Error loading ${subject} resources.` };
    } finally {
      setIsLoading(false);
    }
  }, [speech]); // Added `speech` as a dependency

  const courseVariants = useMemo(() => ({
    hidden: { opacity: 0, scale: 0.8, y: 20, transform: "translateZ(0)" },
    visible: { opacity: 1, scale: 1, y: 0, transform: "translateZ(0)" },
  }), []);

  const resourceVariants = useMemo(() => ({
    hidden: { opacity: 0, y: 20, transform: "translateZ(0)" },
    visible: { opacity: 1, y: 0, transform: "translateZ(0)" },
  }), []);

  return (
    <div
      className="App"
      style={{
        backgroundImage: `url(${backgroundImage || "https://via.placeholder.com/1920x1080.png?text=Educational+Background"})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        minHeight: "100vh",
        willChange: "background-image, opacity", // Optimize background and rendering
        transformStyle: "preserve-3d", // Prevent layout shifts
        transform: "translateZ(0)", // Boost GPU acceleration
      }}
    >
      {error && (
        <motion.div
          className="error-message"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          style={{ color: 'red', textAlign: 'center', margin: '1rem', willChange: 'opacity' }}
        >
          {error}
        </motion.div>
      )}
      {/* Header (Arcade-Inspired with Optimized Animations) */}
      <motion.header
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { y: -100, opacity: 0, transform: "translateZ(0)" },
          visible: { y: 0, opacity: 1, transform: "translateZ(0)" },
        }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="header"
        id="header"
      >
        <div className="header-content">
          <h1 className="arcade-title">EduLearn 🤖</h1>
          <nav className="header-nav">
            <a href="#home" className="nav-link">Play Now 🚀</a>
            {['maths', 'science', 'history'].map((subject) => (
              <a
                key={subject}
                href={`http://localhost:8000/api/subject/${subject}/`}
                target="_blank"
                rel="noopener noreferrer"
                className="nav-link"
              >
                {subject.charAt(0).toUpperCase() + subject.slice(1)} 📖
              </a>
            ))}
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
          initial={{ scale: 0, opacity: 0, transform: "translateZ(0)" }}
          animate={{ scale: 1, opacity: 1, transform: "translateZ(0)" }}
          transition={{ duration: 1, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
        >
          <span role="img" aria-label="robot" className="anim-robot">🤖</span>
          <span role="img" aria-label="rocket" className="anim-rocket">🚀</span>
          <span role="img" aria-label="planet" className="anim-planet">🌍</span>
        </motion.div>
      </motion.header>

      {/* Main Content (Vertical Stack) */}
      <div className="main-stack">
        {/* Loading Indicator */}
        {isLoading && (
          <motion.div
            className="loading-overlay"
            initial={{ opacity: 0, transform: "translateZ(0)" }}
            animate={{ opacity: 1, transform: "translateZ(0)" }}
            exit={{ opacity: 0, transform: "translateZ(0)" }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            style={{ textAlign: 'center', padding: '1rem', color: '#2c3e50', willChange: 'opacity, transform' }}
          >
            Loading... ⏳
          </motion.div>
        )}

        {/* Hero Section */}
        <motion.section
          initial={{ opacity: 0, transform: "translateZ(0)" }}
          animate={{ opacity: 1, transform: "translateZ(0)" }}
          transition={{ duration: 1, ease: "easeIn" }}
          className="hero anim-fade-in"
        >
          <h2>Welcome to Your Learning Journey 📚</h2>
          <p>Accessible education for everyone! ✏️</p>
        </motion.section>

        {/* Courses Section */}
        <section id="courses" className="courses">
          <h2>Our Courses 🎓</h2>
          <motion.div
            className="course-list"
            initial="hidden"
            whileInView="visible"
            variants={{
              hidden: { scale: 0.8, opacity: 0, transform: "translateZ(0)" },
              visible: { scale: 1, opacity: 1, transform: "translateZ(0)" },
            }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            {['maths', 'science', 'history'].map((subject) => (
              <motion.div
                key={subject}
                className="course-card"
                variants={{
                  hidden: { opacity: 0, scale: 0.8, y: 20, transform: "translateZ(0)" },
                  visible: { opacity: 1, scale: 1, y: 0, transform: "translateZ(0)" },
                }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              >
                <a
                  href={`http://localhost:8000/api/subject/${subject}/`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <img
                    src={`http://localhost:8000/static/images/${subject}.png`}
                    alt={`${subject.charAt(0).toUpperCase() + subject.slice(1)} Basics`}
                    className="course-image"
                    onError={(e) => { e.target.src = `https://via.placeholder.com/100x40.png?text=${subject.charAt(0).toUpperCase() + subject.slice(1)}`; }}
                    loading="lazy"
                    decoding="async"
                  />
                  {subject.charAt(0).toUpperCase() + subject.slice(1)} Basics
                  {subject === 'maths' && <span className="emoji anim-spin">➕✨</span>}
                  {subject === 'science' && <span className="emoji anim-spin">🔬⚗️</span>}
                  {subject === 'history' && <span className="emoji anim-spin">🏛️📜</span>}
                </a>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* Learning Tips Carousel */}
        <section id="learning-tips" className="learning-tips">
          <h2>Learning Tips 💡</h2>
          <motion.div
            className="tip-card"
            initial={{ x: -100, opacity: 0, transform: "translateZ(0)" }}
            animate={{ x: 0, opacity: 1, transform: "translateZ(0)" }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <img src="http://localhost:8000/static/images/tip.png" alt="Learning Tip" className="tip-image" onError={(e) => { e.target.src = "https://via.placeholder.com/50x50.png?text=Tip"; }} loading="lazy" decoding="async" />
            <p id="tip-text">{learningTips[currentTip]}</p>
            <button onClick={nextTip} className="tip-btn">
              <img src="http://localhost:8000/static/images/rocket.png" alt="Next Tip" className="button-icon" onError={(e) => { e.target.src = "https://via.placeholder.com/20x20.png?text=🚀"; }} loading="lazy" decoding="async" /> Next Tip 🚀
            </button>
          </motion.div>
        </section>

        {/* Fun Fact Section */}
        <section id="fun-fact" className="fun-fact">
          <h2>Did You Know? 🤓</h2>
          <motion.p
            initial={{ opacity: 0, y: 20, transform: "translateZ(0)" }}
            whileInView={{ opacity: 1, y: 0, transform: "translateZ(0)" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="anim-bounce"
          >
            The shortest war in history lasted 38 minutes! ⏳
          </motion.p>
          <motion.span
            className="emoji anim-float"
            animate={{ y: [0, -10, 0], transform: "translateZ(0)" }}
            transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
          >
            🌟
          </motion.span>
        </section>

        {/* Motivational Quote Section */}
        <section id="quote-section" className="quote-section">
          <h2>Motivational Quote 💡</h2>
          <motion.p
            key={quote}
            initial={{ opacity: 0, transform: "translateZ(0)" }}
            animate={{ opacity: 1, transform: "translateZ(0)" }}
            transition={{ duration: 0.8, ease: "easeIn" }}
            className="anim-fade-in"
          >
            {quote}
          </motion.p>
          <button onClick={generateQuote} className="quote-btn">
            <img src="http://localhost:8000/static/images/star.png" alt="New Quote" className="button-icon" onError={(e) => { e.target.src = "https://via.placeholder.com/20x20.png?text=★"; }} loading="lazy" decoding="async" /> New Quote ★
          </button>
        </section>

        {/* Subject Resources Section */}
        <section id="subject-resources" className="subject-resources">
          <h2>Subject Resources 📚</h2>
          <motion.div
            className="resources-list"
            initial={{ opacity: 0, transform: "translateZ(0)" }}
            animate={{ opacity: 1, transform: "translateZ(0)" }}
            transition={{ duration: 0.8, ease: "easeIn" }}
          >
            {['maths', 'science', 'history'].map((subject) => (
              <motion.div
                key={subject}
                className="resource-card"
                initial={{ opacity: 0, y: 20, transform: "translateZ(0)" }}
                animate={{ opacity: 1, y: 0, transform: "translateZ(0)" }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              >
                <h3>{subject.charAt(0).toUpperCase() + subject.slice(1)}</h3>
                <button
                  onClick={async () => {
                    if (isLoading) return;
                    setIsLoading(true);
                    try {
                      const resources = await fetchSubjectResources(subject);
                      alert(`Notes and Papers for ${subject}:\nNotes: ${resources.notes.map(note => note.title).join(', ')}\nPapers: ${resources.question_papers.map(paper => paper.title).join(', ')}\n${resources.message || ''}`);
                    } catch (error) {
                      setError(`Error fetching resources: ${error.message}`);
                    } finally {
                      setIsLoading(false);
                    }
                  }}
                  className="resource-btn"
                  disabled={isLoading}
                  aria-label={`View resources for ${subject}`}
                >
                  {isLoading ? 'Loading...' : 'View Resources 📖'}
                </button>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* AI Assistant (Backend-Integrated Google Gemini) */}
        <section id="ai-assistant" className="ai-assistant">
          <h2>AI Learning Assistant 🤖 (Powered by Google Gemini via Backend)</h2>
          <motion.div
            className="chatbox anim-slide-right"
            initial={{ x: 100, opacity: 0, transform: "translateZ(0)" }}
            whileInView={{ x: 0, opacity: 1, transform: "translateZ(0)" }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <form onSubmit={handleAiSubmit}>
              <input
                type="text"
                value={aiQuestion}
                onChange={(e) => setAiQuestion(e.target.value)}
                placeholder="Ask Google Gemini any question... e.g., Solve x^2 + 3x - 4 = 0 or Explain photosynthesis"
                disabled={isLoading}
                aria-label="Ask a question"
              />
              <button type="submit" className="submit-btn" disabled={isLoading} aria-label="Submit question">
                <img src="http://localhost:8000/static/images/send.png" alt="Submit" className="button-icon" onError={(e) => { e.target.src = "https://via.placeholder.com/20x20.png?text=→"; }} loading="lazy" decoding="async" /> {isLoading ? 'Loading...' : 'Submit →'}
              </button>
            </form>
            <div className="ai-response">
              <ReactMarkdown>{aiResponse || "Ask a question to get started with Google Gemini! ✨"}</ReactMarkdown>
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