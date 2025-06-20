import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

function App() {
  const [file, setFile] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuiz, setCurrentQuiz] = useState([]);
  const [quizSize, setQuizSize] = useState(5);
  const [timeLimit, setTimeLimit] = useState(0); // in minutes
  const [currentStep, setCurrentStep] = useState(0);
  const [score, setScore] = useState(0);
  const [userAnswers, setUserAnswers] = useState([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const timerRef = useRef(null);

  const styles = {
    container: {
      padding: '40px',
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#f0f4f8',
      minHeight: '100vh',
    },
    title: {
      fontSize: '2.5rem',
      color: '#333',
      marginBottom: '20px',
    },
    input: {
      padding: '8px',
      fontSize: '1rem',
      borderRadius: '4px',
      border: '1px solid #ccc',
      margin: '0 8px',
    },
    button: {
      padding: '12px 20px',
      backgroundColor: '#007bff',
      color: '#fff',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      fontSize: '1rem',
      margin: '0 8px',
    },
    question: {
      fontSize: '1.75rem',
      margin: '25px 0 15px',
      color: '#222',
    },
    optionButton: {
      padding: '12px',
      textAlign: 'left',
      border: '1px solid #ccc',
      borderRadius: '4px',
      background: '#fff',
      fontSize: '1rem',
      cursor: 'pointer',
      width: '100%',
      marginBottom: '10px',
    },
    time: {
      fontSize: '1.2rem',
      fontWeight: 'bold',
      marginBottom: '20px',
      color: '#d9534f',
    },
    reviewCard: {
      marginBottom: '20px',
      padding: '20px',
      border: '1px solid #ddd',
      borderRadius: '8px',
      background: '#fff',
    },
    reviewQuestion: {
      fontWeight: 'bold',
      fontSize: '1.25rem',
      marginBottom: '12px',
    },
  };

  const handleFileChange = (e) => setFile(e.target.files[0]);

  const handleUpload = async () => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await axios.post('https://quiz-backend-ow1w.onrender.com//upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    setQuestions(response.data.questions);
  };

  const startQuiz = () => {
    const shuffled = [...questions].sort(() => 0.5 - Math.random());
    setCurrentQuiz(shuffled.slice(0, quizSize));
    setCurrentStep(0);
    setScore(0);
    setUserAnswers([]);
    if (timeLimit > 0) {
      const total = timeLimit * 60;
      setTimeLeft(total);
      clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            setCurrentStep(shuffled.slice(0, quizSize).length);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
  };

  useEffect(() => () => clearInterval(timerRef.current), []);

  const handleAnswer = (opt) => {
    setUserAnswers(prev => [...prev, opt]);
    if (opt.is_correct) setScore(prev => prev + 1);
    setCurrentStep(prev => prev + 1);
  };

  const formatTime = secs => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Quiz App</h1>

      {/* Upload Stage */}
      {questions.length === 0 && (
        <div>
          <input
            type="file"
            onChange={handleFileChange}
            style={styles.input}
          />
          <button onClick={handleUpload} style={styles.button}>
            Upload Document
          </button>
        </div>
      )}

      {/* Quiz Setup Stage */}
      {questions.length > 0 && currentQuiz.length === 0 && (
        <div style={{ marginTop: '20px' }}>
          <p style={{ fontSize: '1.1rem' }}>{questions.length} questions loaded.</p>
          <label>Number of questions:</label>
          <input
            type="number"
            value={quizSize}
            min="1"
            max={questions.length}
            onChange={e => setQuizSize(Number(e.target.value))}
            style={styles.input}
          />
          <label>Time limit (min):</label>
          <input
            type="number"
            value={timeLimit}
            min="0"
            onChange={e => setTimeLimit(Number(e.target.value))}
            style={styles.input}
          />
          <button onClick={startQuiz} style={styles.button}>
            Start Quiz
          </button>
        </div>
      )}

      {/* Quiz In-Progress Stage */}
      {currentQuiz.length > 0 && currentStep < currentQuiz.length && (
        <div style={{ marginTop: '30px' }}>
          {timeLimit > 0 && (
            <div style={styles.time}>Time Left: {formatTime(timeLeft)}</div>
          )}
          <div style={styles.question}>{currentQuiz[currentStep].question}</div>
          <div>
            {currentQuiz[currentStep].options.map((opt, idx) => (
              <button
                key={idx}
                onClick={() => handleAnswer(opt)}
                style={styles.optionButton}
              >
                {opt.text}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Review Stage */}
      {currentQuiz.length > 0 && currentStep === currentQuiz.length && (
        <div style={{ marginTop: '30px' }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '10px' }}>Quiz Complete!</h2>
          <p style={{ fontSize: '1.2rem' }}>Your score: {score} / {quizSize}</p>
          <h3 style={{ margin: '20px 0 10px' }}>Review your answers:</h3>
          {currentQuiz.map((q, qi) => {
            const userAnswer = userAnswers[qi];
            return (
              <div key={qi} style={styles.reviewCard}>
                <div style={styles.reviewQuestion}>{q.question}</div>
                <ul style={{ paddingLeft: '20px' }}>
                  {q.options.map((opt, oi) => {
                    const selected = userAnswer && userAnswer.text === opt.text;
                    const correct = opt.is_correct;
                    return (
                      <li key={oi} style={{ marginBottom: '5px', fontSize: '1rem' }}>
                        <span style={selected ? { textDecoration: 'underline' } : {}}>{opt.text}</span>
                        {correct && <span style={{ color: '#28a745', marginLeft: '10px' }}>✔️</span>}
                        {selected && !correct && <span style={{ color: '#dc3545', marginLeft: '10px' }}>✖️</span>}
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
          <button onClick={() => window.location.reload()} style={styles.button}>
            Restart
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
