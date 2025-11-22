"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function EmployerDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  // 상태 데이터
  const [sitters, setSitters] = useState<any[]>([]); // 고용한 시터 리스트
  const [matchingRequests, setMatchingRequests] = useState<any[]>([]); // 매칭 진행중 요청
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  useEffect(() => {
    if (!token) {
      router.push("/login");
      return;
    }

    const load = async () => {
      const res = await fetch("/api/employer/dashboard", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        router.push("/login");
        return;
      }

      const data = await res.json();
      setSitters(data.sitters || []);
      setMatchingRequests(data.matchingRequests || []);
      setLoading(false);
    };

    load();
  }, [token, router]);

  if (loading) return <div className="p-5">Loading...</div>;

  const hasSitters = sitters.length > 0;
  const isMatching = matchingRequests.length > 0;

  return (
    <div className="p-5 max-w-xl mx-auto flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p className="text-gray-600">Manage your home and sitter activity</p>

      {/* ================================
          CASE A — 완전 초기 상태
         ================================ */}
      {!hasSitters && !isMatching && (
        <div className="border p-4 rounded-lg shadow-sm flex flex-col gap-4">
          <h2 className="font-semibold text-lg">Welcome 👋</h2>
          <p className="text-gray-600">You don’t have any sitters registered yet.</p>

          <button onClick={() => router.push("/search")} className="p-3 bg-blue-600 text-white rounded-lg">
            Find a Sitter
          </button>

          <button onClick={() => router.push("/employer/manage/register")} className="p-3 bg-gray-200 rounded-lg">
            Register Existing Sitter
          </button>

          <div className="text-xs text-gray-500 mt-2">Once you hire a sitter, you can manage salary, visa, contracts, and schedules here.</div>
        </div>
      )}

      {/* ================================
          CASE B — 시터는 없지만 매칭 요청 진행중
         ================================ */}
      {!hasSitters && isMatching && (
        <div className="border p-4 rounded-lg shadow-sm">
          <h2 className="font-semibold mb-3 text-lg">Matching Status</h2>

          {matchingRequests.map((req, i) => (
            <div key={i} className="border p-3 rounded mb-2 bg-gray-50">
              <p className="font-medium">Request #{req.id}</p>
              <p>Status: {req.status}</p>
            </div>
          ))}

          <button onClick={() => router.push("/search")} className="mt-3 p-3 bg-blue-600 text-white rounded-lg">
            Continue Searching
          </button>
        </div>
      )}

      {/* ================================
          CASE C, D — 시터가 1명 이상 있음 → 고용관리 대시보드
         ================================ */}
      {hasSitters && (
        <div className="border p-4 rounded-lg shadow-sm flex flex-col gap-4">
          <h2 className="font-semibold text-lg">Your Sitters</h2>

          {sitters.map((sitter) => (
            <div key={sitter.id} className="border p-3 rounded-lg bg-gray-50 flex flex-col gap-1">
              <p className="font-semibold">{sitter.name}</p>
              <p className="text-sm text-gray-600">Contract ends: {sitter.contractEnd}</p>
              <p className="text-sm text-gray-600">Visa expires: {sitter.visaExpire}</p>
            </div>
          ))}

          <button onClick={() => router.push("/employer/manage")} className="p-3 bg-blue-600 text-white rounded-lg">
            Manage Sitters
          </button>

          <button onClick={() => router.push("/search")} className="p-3 bg-gray-100 rounded-lg">
            Find Another Sitter
          </button>
        </div>
      )}

      {/* Optional: Matching 진행 중인 상태도 함께 표시 가능 */}
      {hasSitters && isMatching && (
        <div className="border p-4 rounded-lg shadow-sm">
          <h2 className="font-semibold mb-3 text-lg">Matching in Progress</h2>
          {matchingRequests.map((req) => (
            <div key={req.id} className="border p-3 rounded-lg mb-2 bg-gray-50">
              <p className="font-medium">{req.sitterName}</p>
              <p>Status: {req.status}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
