import { useState } from 'react';

export default function Home() {
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/broadcast', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message }),
    });

    const data = await res.json();
    console.log(data);
    setMessage(''); // フォームをリセット
  };

  return (
    <div>
      <h1>LINE ブロードキャストメッセージ送信</h1>
      <form onSubmit={handleSubmit}>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={4}
          cols={50}
          placeholder="メッセージを入力"
          required
        />
        <br />
        <button type="submit">送信</button>
      </form>
    </div>
  );
}
