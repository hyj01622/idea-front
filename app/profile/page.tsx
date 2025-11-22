"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<"EMPLOYER" | "SITTER" | null>(null);
  const [profile, setProfile] = useState<any>(null);

  // Employer fields
  const [address, setAddress] = useState("");
  const [children, setChildren] = useState("");
  const [needs, setNeeds] = useState("");

  // Sitter fields
  const [bio, setBio] = useState("");
  const [experience, setExperience] = useState("");
  const [skills, setSkills] = useState("");
  const [availableTime, setAvailableTime] = useState("");

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  // Load profile on mount
  useEffect(() => {
    if (!token) return;

    const loadProfile = async () => {
      const res = await fetch("/api/profile", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        alert("Unauthorized");
        router.replace("/login");
        return;
      }

      setRole(data.role);
      setProfile(data.profile);

      if (data.role === "EMPLOYER" && data.profile) {
        setAddress(data.profile.address || "");
        setChildren(data.profile.children?.toString() || "");
        setNeeds(data.profile.needs || "");
      }

      if (data.role === "SITTER" && data.profile) {
        setBio(data.profile.bio || "");
        setExperience(data.profile.experience?.toString() || "");
        setSkills(data.profile.skills || "");
        setAvailableTime(data.profile.availableTime || "");
      }

      setLoading(false);
    };

    loadProfile();
  }, [token, router]);

  const saveProfile = async () => {
    const body: any = {};

    if (role === "EMPLOYER") {
      body.address = address;
      body.children = Number(children);
      body.needs = needs;
    }

    if (role === "SITTER") {
      body.bio = bio;
      body.experience = Number(experience);
      body.skills = skills;
      body.availableTime = availableTime;
    }

    const method = profile ? "PATCH" : "POST";

    const res = await fetch("/api/profile", {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      alert("Profile saved!");

      if (role === "EMPLOYER") router.replace("/employer/dashboard");
      else router.replace("/sitter/dashboard");
    } else {
      alert("Failed to save profile");
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;
  if (!role) return <div className="p-6">Role not found</div>;

  return (
    <div className="p-6 max-w-lg mx-auto flex flex-col gap-6">
      <h1 className="text-xl font-bold">{role === "EMPLOYER" ? "Employer Profile" : "Sitter Profile"}</h1>

      {role === "EMPLOYER" && (
        <div className="flex flex-col gap-4">
          <input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Address" className="border p-2 rounded" />

          <input value={children} onChange={(e) => setChildren(e.target.value)} placeholder="Number of children" className="border p-2 rounded" />

          <textarea value={needs} onChange={(e) => setNeeds(e.target.value)} placeholder="Describe your needs" className="border p-2 rounded" />
        </div>
      )}

      {role === "SITTER" && (
        <div className="flex flex-col gap-4">
          <textarea value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Introduce yourself" className="border p-2 rounded" />

          <input
            value={experience}
            onChange={(e) => setExperience(e.target.value)}
            placeholder="Years of experience"
            className="border p-2 rounded"
          />

          <input value={skills} onChange={(e) => setSkills(e.target.value)} placeholder="Skills (comma separated)" className="border p-2 rounded" />

          <input
            value={availableTime}
            onChange={(e) => setAvailableTime(e.target.value)}
            placeholder="Available time"
            className="border p-2 rounded"
          />
        </div>
      )}

      <button onClick={saveProfile} className="p-3 bg-blue-600 text-white rounded-lg">
        Save Profile
      </button>
    </div>
  );
}
