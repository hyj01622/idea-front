'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function LoginPage() {
  const router = useRouter();

  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [stage, setStage] = useState<'input' | 'otp'>('input');
  const [loading, setLoading] = useState(false);

  const sendOtp = async () => {
    setLoading(true);

    const res = await fetch('/api/send-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone }),
    });

    setLoading(false);

    if (res.ok) {
      alert('OTP sent! (dev mode: 123456)');
      setStage('otp');
    } else {
      alert('Failed to send OTP');
    }
  };

  const verifyOtp = async () => {
    setLoading(true);

    const res = await fetch('/api/verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, code: otp }),
    });

    const data = await res.json();
    setLoading(false);

    if (res.ok) {
      localStorage.setItem('token', data.token);
      router.replace('/select-role');
    } else {
      alert(data.error || 'OTP failed');
    }
  };

  return (
    <div className='p-6 flex flex-col gap-4 max-w-sm mx-auto'>
      <h1 className='font-bold text-xl'>Login</h1>

      {/* 전화번호 단계 */}
      {stage === 'input' && (
        <>
          <input type='text' value={phone} placeholder='Enter phone number' onChange={(e) => setPhone(e.target.value)} className='border p-2 rounded' />

          <button disabled={loading} onClick={sendOtp} className='p-3 bg-blue-600 text-white rounded'>
            {loading ? 'Sending...' : 'Send OTP'}
          </button>
        </>
      )}

      {/* OTP 단계 */}
      {stage === 'otp' && (
        <>
          <div className='text-gray-600 text-sm'>OTP sent to {phone}</div>

          <input value={otp} placeholder='Enter OTP' onChange={(e) => setOtp(e.target.value)} className='border p-2 rounded' />

          <button disabled={loading} onClick={verifyOtp} className='p-3 bg-green-600 text-white rounded'>
            {loading ? 'Verifying...' : 'Verify OTP'}
          </button>

          <button disabled={loading} onClick={() => setStage('input')} className='p-3 bg-gray-300 rounded'>
            Edit Phone Number
          </button>
        </>
      )}
    </div>
  );
}
