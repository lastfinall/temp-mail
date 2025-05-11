import React, { useEffect, useState } from 'react';

function App() {
  const [email, setEmail] = useState('');
  const [inbox, setInbox] = useState([]);
  const [timeLeft, setTimeLeft] = useState(600);

  useEffect(() => {
    if (email) {
      const interval = setInterval(() => {
        fetch(`${process.env.REACT_APP_API_URL}/api/inbox/${email}`)
          .then(res => res.json())
          .then(data => {
            setInbox(data.messages);
            setTimeLeft(data.timeLeft);
          });
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [email]);

  const generateEmail = () => {
    fetch(`${process.env.REACT_APP_API_URL}/api/new-mailbox`, {
      method: 'POST',
    })
      .then(res => res.json())
      .then(data => {
        setEmail(data.address);
      });
  };

  return (
    <div style={{ padding: '2rem', fontFamily: 'Arial' }}>
      <h1>📬 Temp Mail</h1>
      {!email ? (
        <button onClick={generateEmail}>Generate Temp Email</button>
      ) : (
        <>
          <h2>{email}</h2>
          <p>Expires in: {timeLeft}s</p>
          <ul>
            {inbox.map((msg, i) => (
              <li key={i}>
                <strong>{msg.subject}</strong> - {msg.from}
                <p>{msg.body}</p>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

export default App;
