'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function SelectRolePage() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  const chooseRole = async (role: 'EMPLOYER' | 'SITTER') => {
    setLoading(true);

    const token = localStorage.getItem('token');

    const res = await fetch('/api/user/role', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ role }),
    });

    const data = await res.json();

    if (res.ok) {
      localStorage.setItem('token', data.token);
      router.replace('/profile');
    } else {
      alert(data.error || 'Failed to update role');
    }

    setLoading(false);
  };

  return (
    <div className='p-8 flex flex-col gap-6'>
      <h1 className='text-xl font-bold'>Choose your role</h1>

      <button style={{ cursor: 'pointer' }} disabled={loading} onClick={() => chooseRole('EMPLOYER')} className='p-4 bg-blue-500 text-white rounded-lg'>
        I'm an Employer
      </button>

      <button style={{ cursor: 'pointer' }} disabled={loading} onClick={() => chooseRole('SITTER')} className='p-4 bg-green-500 text-white rounded-lg'>
        I'm a Sitter
      </button>
    </div>
  );
}
