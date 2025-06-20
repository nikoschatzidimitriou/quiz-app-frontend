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
  const [timeLeft, setTimeLeft] = useState(0); // in seconds
  const timerRef = useRef(null);

  const containerStyle = {
    maxWidth: '600px',
    margin: '30px auto',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    padding: '20px',
    backgroundColor: '#f9fafb',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
  };

  const titleStyle = {
    fontSize: '2.5rem',
    fontWeight: '700',
    marginBottom: '20px',
    color: '#333',
    textAlign: 'center',
  };

  const buttonStyle = {
    backgroundColor: '#2563eb',
    color: '#fff',
    padding: '12px 24px',
    border: 'none',
    borderRadius: '6px',
    fontSize: '1rem',
    cursor: 'pointer',
    marginTop: '15px',
  };

  const inputStyle = {
    width: '100%',
    padding: '10px',
    fontSize: '1rem',
    borderRadius: '6px',
    border: '1px solid #ccc',
    marginTop: '10px',
  };

  const questionStyle = {
    fontSize: '1.5rem',
    fontWeight: '600',
    marginBottom: '20px',
  };

  const optionButtonStyle = {
    display: 'block',
    width: '100%',
    padding: '12px',
    fontSize: '1rem',
    marginBottom: '12px',
    borderRadius: '6px',
    border: '1px solid #ccc',
    backgroundColor: '#fff',
    cursor: 'pointer',
    textAlign: 'left',
  };

  const reviewQuestionStyle = {
    fontWeight: '700',
    fontSize: '1.25rem',
    marginBottom: '10px',
  };

  const listItemStyle = (selected, correct) => ({
    backgroundColor: correct
      ? '#d1fae5' // light green
      : selected
      ? '#fee2e2' // light red
      : 'transparent',
    padding: '8px',
    borderRadius: '6px',
    marginBottom: '8px',
    textDecoration: selected ? 'underline' : 'none',
    color: correct ? '#065f46' : selected ? '#991b1b' : '#000',
  });

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

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
            setCurrentStep(shuffled.slice(0, quizSize).length); // end quiz
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
    <div style={containerStyle}>
      <h1 style={titleStyle}>Quiz App</h1>

      {questions.length === 0 && (
        <div>
          <input
            type="file"
            onChange={handleFileChange}
            style={inputStyle}
          />
          <button onClick={handleUpload} style={buttonStyle}>
            Upload Document
          </button>
        </div>
      )}

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
            style={inputStyle}
          />
          <label>Time limit (min):</label>
          <input
            type="number"
            value={timeLimit}
            min="0"
            onChange={e => setTimeLimit(Number(e.target.value))}
            style={inputStyle}
          />
          <button onClick={startQuiz} style={buttonStyle}>
            Start Quiz
          </button>
        </div>
      )}

      {currentQuiz.length > 0 && currentStep < currentQuiz.length && (
        <div style={{ marginTop: '30px' }}>
          {timeLimit > 0 && (
            <div style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '20px', color: '#d9534f' }}>
              Time Left: {formatTime(timeLeft)}
            </div>
          )}
          {/* Question counter */}
          <p>Question {currentStep + 1} of {currentQuiz.length}</p>

          <div style={questionStyle}>{currentQuiz[currentStep].question}</div>
          <div>
            {currentQuiz[currentStep].options.map((opt, idx) => (
              <button
                key={idx}
                onClick={() => handleAnswer(opt)}
                style={optionButtonStyle}
              >
                {opt.text}
              </button>
            ))}
          </div>
        </div>
      )}

      {currentQuiz.length > 0 && currentStep === currentQuiz.length && (
        <div style={{ marginTop: '30px' }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '10px' }}>Quiz Complete!</h2>
          <p style={{ fontSize: '1.2rem' }}>Your score: {score} / {quizSize}</p>
          <h3 style={{ margin: '20px 0 10px' }}>Review your answers:</h3>
          {currentQuiz.map((q, qi) => {
            const userAnswer = userAnswers[qi];
            return (
              <div key={qi} style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ccc', borderRadius: '8px', backgroundColor: '#fff' }}>
                <div style={reviewQuestionStyle}>{q.question}</div>
                <ul style={{ paddingLeft: '20px' }}>
                  {q.options.map((opt, oi) => {
                    const selected = userAnswer && userAnswer.text === opt.text;
                    const correct = opt.is_correct;
                    return (
                      <li key={oi} style={listItemStyle(selected, correct)}>
                        {opt.text}
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
          <button onClick={() => window.location.reload()} style={buttonStyle}>
            Restart
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
