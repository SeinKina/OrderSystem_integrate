import { useState } from 'react';

export default function Home() {
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/broadCast', {
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
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      textAlign: 'center',
    }}>
      <div>
        <h1 style={{ fontWeight: 'bold' }}>LINE ブロードキャストメッセージ送信</h1>
        <form onSubmit={handleSubmit}>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
            cols={50}
            placeholder="メッセージを入力"
            required
            style={{
              border: '1px solid #ccc',
              borderRadius: '5px',
              padding: '10px',
              resize: 'none', // サイズ変更を無効にする
              outline: 'none', // フォーカス時のアウトラインを削除
              boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)', // 軽い影を追加
            }}
          />
          <br />
          <button type="submit" style={{
            backgroundColor: 'green',
            color: 'white',
            fontWeight: 'bold',
            border: 'none',
            borderRadius: '20px', // 丸みを帯びたボタン
            padding: '10px 20px',
            cursor: 'pointer',
            transition: 'background-color 0.3s', // ホバー時のアニメーション
          }}>
            送信
          </button>
        </form>
      </div>
    </div>
  );
}
