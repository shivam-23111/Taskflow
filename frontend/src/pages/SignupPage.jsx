import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import toast from 'react-hot-toast';
import {
  IoEyeOffOutline,
  IoEyeOutline,
  IoLockClosedOutline,
  IoMailOutline,
  IoPersonOutline,
  IoShieldCheckmarkOutline,
} from 'react-icons/io5';

const SignupPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('member');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) {
      toast.error('Please fill in all fields');
      return;
    }
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      await signup(name, email, password, role);
      toast.success('Account created successfully!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold text-dark-50">Create account</h2>
        <p className="mt-1 text-dark-400">Start a TaskFlow workspace session</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-dark-300">
            Full Name
          </label>
          <div className="relative">
            <IoPersonOutline className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-500" size={18} />
            <input
              id="signup-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              className="w-full rounded-lg border border-dark-700 bg-dark-900 py-2.5 pl-10 pr-4 text-dark-100 placeholder-dark-600 transition-all focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/30"
            />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-dark-300">
            Email
          </label>
          <div className="relative">
            <IoMailOutline className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-500" size={18} />
            <input
              id="signup-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-lg border border-dark-700 bg-dark-900 py-2.5 pl-10 pr-4 text-dark-100 placeholder-dark-600 transition-all focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/30"
            />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-dark-300">
            Password
          </label>
          <div className="relative">
            <IoLockClosedOutline className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-500" size={18} />
            <input
              id="signup-password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min 6 characters"
              className="w-full rounded-lg border border-dark-700 bg-dark-900 py-2.5 pl-10 pr-10 text-dark-100 placeholder-dark-600 transition-all focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/30"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-500 transition-colors hover:text-dark-300"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <IoEyeOffOutline size={18} /> : <IoEyeOutline size={18} />}
            </button>
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-dark-300">
            Role
          </label>
          <div className="relative">
            <IoShieldCheckmarkOutline className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-500" size={18} />
            <select
              id="signup-role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full cursor-pointer appearance-none rounded-lg border border-dark-700 bg-dark-900 py-2.5 pl-10 pr-4 text-dark-100 transition-all focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/30"
            >
              <option value="member">Member</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        </div>

        <button
          id="signup-submit"
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-primary-500 py-2.5 font-semibold text-dark-950 transition-colors duration-200 hover:bg-primary-400 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-t-2 border-dark-950" />
              Creating account...
            </span>
          ) : (
            'Create Account'
          )}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-dark-500">
        Already have an account?{' '}
        <Link to="/login" className="font-medium text-primary-400 transition-colors hover:text-primary-300">
          Sign in
        </Link>
      </p>
    </>
  );
};

export default SignupPage;
