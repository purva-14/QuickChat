import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import { HiOutlineChatBubbleLeftRight } from "react-icons/hi2";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ emailOrUsername: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.emailOrUsername, form.password);
      toast.success("Welcome back!");
      navigate("/");
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed");
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
          <p className="text-gray-400 text-sm mt-1">Sign in to keep chatting</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Username or Email</label>
            <input
              type="text"
              required
              className="input w-full bg-base-800 border-base-700 focus:border-neon focus:outline-none text-gray-100"
              value={form.emailOrUsername}
              onChange={(e) => setForm({ ...form, emailOrUsername: e.target.value })}
              placeholder="john.johnson"
            />
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Password</label>
            <input
              type="password"
              required
              className="input w-full bg-base-800 border-base-700 focus:border-neon focus:outline-none text-gray-100"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn w-full bg-neon hover:bg-neon-soft text-black font-semibold border-none shadow-neon"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-400 mt-6">
          New here?{" "}
          <Link to="/register" className="text-neon hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
