import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import { HiOutlineChatBubbleLeftRight } from "react-icons/hi2";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ fullName: "", username: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(form);
      toast.success("Account created!");
      navigate("/");
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-950 px-4">
      <div className="w-full max-w-md glass-panel rounded-2xl shadow-neon p-8">
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-neon/10 border border-neon/40 flex items-center justify-center mb-3 shadow-neon-sm">
            <HiOutlineChatBubbleLeftRight className="text-neon text-3xl" />
          </div>
          <h1 className="text-2xl font-display font-bold neon-text">QuickChat</h1>
          <p className="text-gray-400 text-sm mt-1">Create your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="text"
            required
            className="input w-full bg-base-800 border-base-700 focus:border-neon focus:outline-none text-gray-100"
            placeholder="Full name"
            value={form.fullName}
            onChange={(e) => setForm({ ...form, fullName: e.target.value })}
          />
          <input
            type="text"
            required
            className="input w-full bg-base-800 border-base-700 focus:border-neon focus:outline-none text-gray-100"
            placeholder="Username"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value.toLowerCase() })}
          />
          <input
            type="email"
            required
            className="input w-full bg-base-800 border-base-700 focus:border-neon focus:outline-none text-gray-100"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <input
            type="password"
            required
            minLength={6}
            className="input w-full bg-base-800 border-base-700 focus:border-neon focus:outline-none text-gray-100"
            placeholder="Password (min 6 chars)"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />

          <button
            type="submit"
            disabled={loading}
            className="btn w-full bg-neon hover:bg-neon-soft text-black font-semibold border-none shadow-neon mt-2"
          >
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-400 mt-6">
          Already have an account?{" "}
          <Link to="/login" className="text-neon hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
