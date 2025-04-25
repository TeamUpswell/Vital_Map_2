import React, { useState, useEffect } from 'react';

const SurveyForm = () => {
  const [formData, setFormData] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);
  const [isClient, setIsClient] = useState(false);
  const [showSurvey, setShowSurvey] = useState(true);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const submitSurvey = async (formData) => {
    try {
      // Remove any ID field from the client-side submission
      const { id, ...dataWithoutId } = formData;

      const response = await fetch('/api/survey', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataWithoutId),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to submit survey');
      }

      // Handle successful submission
      setSubmitted(true);
      // ...other success handling code...
    } catch (error) {
      console.error('Error submitting survey:', error);
      // Handle error state
      setError(error.message);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    submitSurvey(formData);
  };

  return (
    <>
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          backgroundColor: 'red',
          padding: '5px',
          zIndex: 1000,
        }}
      >
        Survey Debug: {isClient ? 'Client Ready' : 'Not Client'}, Show:{' '}
        {showSurvey ? 'Yes' : 'No'}
      </div>

      {isClient && showSurvey && (
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="name"
            placeholder="Your Name"
            onChange={handleChange}
          />
          <input
            type="email"
            name="email"
            placeholder="Your Email"
            onChange={handleChange}
          />
          <button type="submit">Submit</button>
          {submitted && <p>Survey submitted successfully!</p>}
          {error && <p>Error: {error}</p>}
        </form>
      )}
    </>
  );
};

export default SurveyForm;
