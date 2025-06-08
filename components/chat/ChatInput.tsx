'use client';
import { useState } from 'react';

export default function ChatInput() {
  const [message, setMessage] = useState('');
  return (
    <input
      value={message}
      onChange={(e) => setMessage(e.target.value)}
      className="border rounded p-2 w-full"
      placeholder="Type a message"
    />
  );
}
