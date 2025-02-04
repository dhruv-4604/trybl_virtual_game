import React, { useState, useEffect } from "react";

const GOOGLE_SHEET_URL = "https://script.google.com/a/macros/xtzesports.com/s/AKfycbzXbKufU5zj5aNB_5M05QwW3H5DDkqjEzRpJ-PN6OAtYi1fdEGmrY1Mn3ckVYojErl3/exec"; // Replace with your script URL

const App = () => {
  const [username, setUsername] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    // Extract username from URL
    const pathSegments = window.location.pathname.split("/");
    if (pathSegments.length > 1) {
      setUsername(decodeURIComponent(pathSegments[1].replace("@", ""))); // Remove "@" from username
    }
  }, []);

  const handleSubmit = async () => {
    if (!selectedAnswer) {
      alert("Please select an answer!");
      return;
    }

    try {
      const response = await fetch(GOOGLE_SHEET_URL, {
        method: "POST",
        mode: 'no-cors',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, answer: selectedAnswer })
      });

      setSubmitted(true);
    } catch (error) {
      console.error("Error:", error);
      alert("Submission failed. Check network or script permissions.");
    }
  };

  if (!username) {
    return <h2>Please provide a valid username in the URL.</h2>;
  }

  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <h1>MCQ Question</h1>
      <p>Username: <strong>{username}</strong></p>
      <p>What is the capital of France?</p>

      <label>
        <input type="radio" name="mcq" value="Paris" onChange={(e) => setSelectedAnswer(e.target.value)} />
        Paris
      </label>
      <br />
      <label>
        <input type="radio" name="mcq" value="London" onChange={(e) => setSelectedAnswer(e.target.value)} />
        London
      </label>
      <br />
      <label>
        <input type="radio" name="mcq" value="Berlin" onChange={(e) => setSelectedAnswer(e.target.value)} />
        Berlin
      </label>
      <br /><br />

      {submitted ? (
        <h3>Thank you for your response!</h3>
      ) : (
        <button onClick={handleSubmit}>Submit</button>
      )}
    </div>
  );
};

export default App;
