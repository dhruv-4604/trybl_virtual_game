import React, { useState, useEffect, useCallback, useMemo } from "react";
import './App.css';

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

const App = () => {
  const [username, setUsername] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [showQuestion, setShowQuestion] = useState(false);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(15);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  const handleTimeUp = useCallback(async () => {
    if (isLoading) return;
    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          answer: 'No Answer',
          timerEnded: true
        })
      });

      await response.json();
      setTimeLeft(0);
      setIsCorrect(false);
      setSelectedAnswer('No Answer');
      setHasSubmitted(false);
    } catch (error) {
      console.error("Error submitting time up:", error);
    } finally {
      setIsLoading(false);
    }
  }, [username, isLoading, API_URL]);

  useEffect(() => {
    let timer;
    if (isTimerRunning && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setIsTimerRunning(false);
            setShowModal(true);
            setTimeout(() => handleTimeUp(), 0);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isTimerRunning, handleTimeUp]);

  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  useEffect(() => {
    const checkSubmission = async () => {
      if (username) {
        try {
          const response = await fetch(`${API_URL}/check/${username}`);
          const data = await response.json();
          if (data.hasSubmitted) {
            setHasSubmitted(true);
            setIsCorrect(data.isCorrect);
            setSelectedAnswer(data.answer);
            setShowModal(true);
          }
        } catch (error) {
          console.error("Error checking submission:", error);
        } finally {
          setIsInitialLoading(false);
        }
      } else {
        setIsInitialLoading(false);
      }
    };

    checkSubmission();
  }, [username]);

  useEffect(() => {
    const pathSegments = window.location.pathname.split("/");
    if (pathSegments.length > 1) {
      const extractedUsername = decodeURIComponent(pathSegments[1].replace("@", ""));
      setUsername(extractedUsername);
    }
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!selectedAnswer || isLoading) {
      setError("Please select an option!");
      return;
    }
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          answer: selectedAnswer
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        setIsCorrect(data.isCorrect);
        setShowModal(true);
      } else {
        setError("Submission failed. Please try again.");
      }
    } catch (error) {
      console.error("Error submitting answer:", error);
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [selectedAnswer, isLoading, username]);

  const handleCloseModal = useCallback(() => {
    // Send message to parent window without closing modal
    window.parent.postMessage({ event: "closeQuestIframe", data: {} }, "*");
  }, []);

  const handleRevealQuestion = useCallback(() => {
    setShowQuestion(true);
    setIsTimerRunning(true);
  }, []);

  const styles = useMemo(() => ({
    mainContainer: {
      minHeight: '100vh',
      background: '#101112',
      backgroundImage: 'url("/bg_lines.svg")',
      backgroundRepeat: 'no-repeat',
      backgroundSize: 'cover',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '20px',
      position: 'relative',
      overflow: 'hidden',
    },
    ellipseBackground: {
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      width: '100%',
      height: 'auto',
      zIndex: 1,
      pointerEvents: 'none',
    },
    title: {
      fontFamily: '"Black Han Sans", -apple-system, BlinkMacSystemFont, sans-serif',
      fontWeight: 'normal',
      color: '#FFFFFF',
      fontSize: '40px',
      textAlign: 'center',
      position: 'relative',
      zIndex: 2,
    },
    card: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#180F68',
      backdropFilter: 'blur(50px)',
      zIndex: 3,
      borderRadius: '15px',
      width: '92%',
      position: 'relative',
      overflow: 'hidden',
      padding: '20px',
    },
    cardGradient: {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      background: 'linear-gradient(180deg, rgba(49, 123, 255, 0.00) 26.51%, #317BFF 70.98%)',
      zIndex: -1,
      pointerEvents: 'none',
    },
    welcomeText: {
      color: 'white',
      fontSize: '1.1rem',
      textAlign: 'center',
      marginBottom: '27px',
      fontFamily: 'SF UI Display, sans-serif',
      fontWeight: 'bold',
    },
    characterContainer: {
      position: 'relative',
      borderRadius: '15px',
      padding: '20px',
      marginTop: '20px',
      marginBottom: '20px',
      zIndex: 1,
    },
    bgText: {
      position: 'absolute',
      top: '-10px',
      left: '7px',
      width: '70%',
      marginBottom: '20px',
      height: 'auto',
      zIndex: 1,
    },
    infoCard: {
      borderRadius: '14px',
      alignItems: 'center',
      alignSelf: 'center',
      border: '0.5px solid rgba(255, 255, 255, 0.34)',
      background: 'rgba(0, 0, 0, 0.24)',
      backdropFilter: 'blur(15px)',
      padding: '20px',
      margin: '-66px 0 0 0',
      width: '92%',
      zIndex: 3,
    },
    infoText: {
      zIndex: 3,
      color: 'rgba(255, 255, 255, 0.80)',
      fontSize: '0.97rem',
      marginBottom: '10px',
      lineHeight: '1.5',
      letterSpacing: '0.02em',
      fontWeight: 'normal',
      fontFamily: 'SF UI Display, sans-serif',
    },
    button: {
      background: 'white',
      color: 'black',
      padding: '15px 30px',
      borderRadius: '25px',
      border: 'none',
      fontSize: '1.2rem',
      width: '90%',
      display: 'block',
      alignSelf: 'center',
      margin: '30px 10px 10px 10px',
      cursor: 'pointer',
      transition: 'transform 0.2s',
      fontFamily: 'SF UI Display, sans-serif',
      fontWeight: 'bold',
    },
    confetti: {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: 'auto',
      pointerEvents: 'none',
      zIndex: 1,
    },
    rectBackground: {
      position: 'absolute',
      top: -20,
      left: '50%',
      transform: 'translateX(-50%)',
      width: '100%',
      height: 'auto',
      pointerEvents: 'none',
      zIndex: 2,
    },
    welcomeBox: {
      position: 'relative',
      padding: '4px 20px 15px',
      borderRadius: '15px 15px 0px 0px',
      background: 'linear-gradient(91deg, #204DFE 2.84%, #3585FF 51.39%, #1C54FC 91.25%)',
      backdropFilter: 'blur(10px)',
      color: 'white',
      fontSize: '1.1rem',
      fontFamily: '"SF UI Display", -apple-system, BlinkMacSystemFont, sans-serif',
      width: '92%',
      height: '45px',
      textAlign: 'center',
      marginBottom: '-14px',
      zIndex: 2,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
    },
    cardWrapper: {
      position: 'relative',
      width: '92%',
      maxWidth: '500px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    },
    questionCard: {
      borderRadius: '10px',
      padding: '14px 0px',
      width: '100%',
      boxSizing: 'border-box',
    },
    questionText: {
      color: 'white',
      fontSize: '18px',
      lineHeight: '1.4',
      textAlign: 'left',
      marginBottom: '20px',
      fontFamily: '"SF UI Display", -apple-system, BlinkMacSystemFont, sans-serif',
      MozUserSelect: 'none',
      msUserSelect: 'none',
      userSelect: 'none',
      WebkitUserSelect: 'none',
    },
    optionButton: {
      userSelect: 'none',
      WebkitUserSelect: 'none',
      MozUserSelect: 'none',
      msUserSelect: 'none',
      width: '100%',
      padding: '11px 20px',
      marginBottom: '15px',
      borderRadius: '50px',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      background: 'transparent',
      color: 'white',
      fontSize: '13px',
      textAlign: 'left',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      fontFamily: '"SF UI Display", -apple-system, BlinkMacSystemFont, sans-serif',
    },
    selectedOption: {
      background: 'linear-gradient(91deg, #204DFE 2.84%, #3585FF 51.39%, #1C54FC 91.25%)',
      border: 'none',
    },
    optionLabel: {
      marginRight: '15px',
      fontSize: '20px',
    },
    submitButton: {
      background: 'white',
      color: 'black',
      padding: '15px 30px',
      borderRadius: '25px',
      border: 'none',
      fontSize: '18px',
      fontWeight: 'bold',
      width: '100%',
      cursor: 'pointer',
      marginTop: '15px',
      fontFamily: '"SF UI Display", -apple-system, BlinkMacSystemFont, sans-serif',
    },
    questionHeader: {
      color: 'rgba(255, 255, 255, 0.5)',
      fontSize: '48px',
      fontFamily: '"SF UI Display", -apple-system, BlinkMacSystemFont, sans-serif',
      textAlign: 'left',
      marginBottom: '20px',
    },
    questionHeaderImage: {
      marginTop: '-10px',
      width: '200px',
      height: 'auto',
  
    },
    modalBackdrop: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.3)', // semi-transparent black
      backdropFilter: 'blur(2px)',
      opacity: 0,
      transition: 'opacity 0.3s ease-in-out',
      visibility: 'hidden',
      zIndex: 999, // just below modal
    },
    modalBackdropVisible: {
      opacity: 1,
      visibility: 'visible',
    },
    modal: {
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      background: '#1E1E1E',
      borderRadius: '20px 20px 0 0',
      padding: '30px 20px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      transform: 'translateY(100%)',
      transition: 'transform 0.3s ease-in-out',
      zIndex: 1000,
    },
    modalVisible: {
      transform: 'translateY(0)',
    },
    modalTitle: {
      color: 'white',
      fontSize: '28px',
      fontFamily: '"Black Han Sans", -apple-system, BlinkMacSystemFont, sans-serif',
      fontWeight: 'normal',
      marginTop: '90px',
      marginBottom: '-10px',
      textAlign: 'center',
      width: '100%',
    },
    modalSubtitle: {
      marginTop: '20px',
      color: '#9B9B9B',
      fontSize: '18px',
      fontFamily: '"SF UI Display", -apple-system, BlinkMacSystemFont, sans-serif',
      marginBottom: '30px',
      textAlign: 'center',
      width: '100%',
    },
    modalButton: {
      background: 'white',
      color: 'black',
      padding: '15px 30px',
      borderRadius: '25px',
      border: 'none',
      fontSize: '18px',
      fontWeight: 'bold',
      width: '100%',
      cursor: 'pointer',
      fontFamily: '"SF UI Display", -apple-system, BlinkMacSystemFont, sans-serif',
    },
    tickIcon: {
      zIndex: -1,
      position: 'absolute',
      marginTop: '30px',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      width: '200px',
      height: '200px',
    },
    loader: {
      position: 'fixed',
      top: '50%',
      left: '40%',
      transform: 'translate(-50%, -50%)',
      width: '40px',
      height: '40px',
      border: '4px solid #f3f3f3',
      borderTop: '4px solid #3498db',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite',
      zIndex: 1000,
      margin: '0 auto',
    },
    submitButtonDisabled: {
      opacity: 0.7,
      cursor: 'not-allowed',
    },
    timerText: {
      color:'white',
      fontWeight: 'bold',
    },
  }), [timeLeft]);

  const renderQuestionCard = useCallback(() => (
    <div style={styles.questionCard}>
      <img 
        src="/question.svg" 
        alt="Question"
        style={styles.questionHeaderImage}
      />
      <h2 style={styles.questionText}>
        Which artist is performing at the halftime show of this year's Super Bowl?
      </h2>
      
      {['Drake', 'Taylor Swift', 'Kendrick Lamar', 'Ye (Kanye West)'].map((option, index) => (
        <button
          key={index}
          style={{
            ...styles.optionButton,
            ...(selectedAnswer === option ? styles.selectedOption : {})
          }}
          onClick={() => {
            setSelectedAnswer(option);
            setError("");
          }}
        >
          <span style={styles.optionLabel}>
            {String.fromCharCode(65 + index)}.
          </span>
          {option}
        </button>
      ))}
      
      {error && <div style={{
        color: '#ff4444',
        fontSize: '14px',
        marginTop: '10px',
        fontFamily: '"SF UI Display", -apple-system, BlinkMacSystemFont, sans-serif',
        textAlign: 'center'
      }}>{error}</div>}
      
      <button 
        style={{
          ...styles.submitButton,
          ...(isLoading ? styles.submitButtonDisabled : {})
        }}
        onClick={handleSubmit}
        disabled={isLoading}
      >
        {isLoading ? "Submitting..." : "Submit Answer"}
      </button>
    </div>
  ), [selectedAnswer, error, isLoading, styles, handleSubmit]);

  const ResultModal = useCallback(() => {
    const getModalContent = () => {
      // Case 1: Fresh timer expiration
      if (!hasSubmitted && timeLeft === 0) {
        return {
          title: "Time's Up!",
          subtitle: "You didn't answer in time. Better luck next time!",
          image: "/times-up.png"
        };
      }

      // Case 2: Revisiting after previous attempts
      if (hasSubmitted) {
        if (selectedAnswer === 'No Answer') {
          return {
            title: "You've Attempted This Before!",
            subtitle: "You didn't answer in time.",
            image: "/times-up.png"
          };
        } else if (isCorrect) {
          return {
            title: "You've Already Answered This!",
            subtitle: "Your previous answer was correct.",
            image: "/tick.png"
          };
        } else {
          return {
            title: "You've Attempted This Before!",
            subtitle: "Your last answer wasn't correct.",
            image: "/wrong-tick.png"
          };
        }
      }
      
      // Case 3: Fresh attempts with answers
      if (isCorrect) {
        return {
          title: "Correct Answer!",
          subtitle: "You got it right! Well done.",
          image: "/tick.png"
        };
      }
      
      return {
        title: "Incorrect Answer!",
        subtitle: "Oops! That wasn't the right answer.",
        image: "/wrong-tick.png"
      };
    };

    const content = getModalContent();

    return (
      <>
        <div 
          style={{
            ...styles.modalBackdrop,
            ...(showModal ? styles.modalBackdropVisible : {})
          }}
        />
        <div style={{
          ...styles.modal,
          ...(showModal ? styles.modalVisible : {})
        }}>
          <img 
            src={content.image}
            alt="Result Icon"
            style={styles.tickIcon}
          />
          <div style={styles.modalTitle}>
            {content.title}
          </div>
          <div style={styles.modalSubtitle}>
            {content.subtitle}
          </div>
          <button 
            style={styles.modalButton}
            onClick={handleCloseModal}
          >
            Done
          </button>
        </div>
      </>
    );
  }, [hasSubmitted, timeLeft, isCorrect, showModal, styles, selectedAnswer, handleCloseModal]);

  const Loader = () => (
    <div style={styles.loader} />
  );

  if (isInitialLoading) {
    return <Loader />;
  }

  if (!username) {
    return <h2 style={{ color: 'white', textAlign: 'center' }}>Please provide a valid username in the URL.</h2>;
  }

  return (
    <div style={styles.mainContainer}>
      <img 
        src="/rect.svg" 
        alt="Rectangle Background" 
        style={styles.rectBackground} 
      />
      <img 
        src="/ellipse1.svg" 
        alt="Background Ellipse" 
        style={styles.ellipseBackground} 
      />
      <img 
        src="/confetti.png" 
        alt="Confetti" 
        style={styles.confetti}
      />
      
      <h1 style={styles.title}>TRYBL<br></br> GAMESHOW</h1>
      
      {!hasSubmitted ? (
        <div style={styles.cardWrapper}>
          <div style={styles.welcomeBox}>
            {!showQuestion ? (
              'Welcome to the qualifiers'
            ) : (
              <>
                <img src="/timer.png" alt="Timer" style={{ width: '27px', height: '27px' }} />
                <span style={styles.timerText}>{timeLeft} SEC</span>
              </>
            )}
          </div>
          
          <div style={styles.card}>
            {!showQuestion ? (
              <>
                <div style={styles.cardGradient}></div>
                <div style={styles.characterContainer}>
                  <img 
                    src="/bg_text.svg" 
                    alt="Background Text"
                    style={styles.bgText}
                  />
                  <img 
                    src="/character_images.png" 
                    alt="Anime Characters"
                    style={{ width: '100%', borderRadius: '10px', position: 'relative', zIndex: 2 }}
                  />
                </div>

                <div style={styles.infoCard}>
                  <div style={styles.infoText}>
                    • <span style={{ color: 'white', fontWeight: 'bold' }}>8 Players</span> Will Be Chosen To Participate In The <span style={{ color: 'white', fontWeight: 'bold' }}>Trybl Gameshow Live Edition.</span>
                  </div>
                  
                  <div style={styles.infoText}>
                    • Answer The Question And Follow Us On Socials For More Updates.
                  </div>
                </div>

                <button 
                  style={styles.button}
                  onClick={handleRevealQuestion}
                >
                  Reveal Question
                </button>
              </>
            ) : (
              renderQuestionCard()
            )}
          </div>
        </div>
      ) : (
        <h2 style={{ color: 'white', textAlign: 'center' }}>You have already attempted this question.</h2>
      )}
      {isLoading && <Loader />}
      <ResultModal />
    </div>
  );
};

export default React.memo(App);
