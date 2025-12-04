import React, { useState } from 'react';
import { createUser } from '../services/LoginService';
import { Link, useNavigate } from 'react-router-dom';
import { showToast } from '../utils/Alert';

const Signup = () => {
  const [form, setForm] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
  });

  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  // Handle input field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' })); // Clear error for this field
  };

  // Validate form fields before submission
  const validate = () => {
    const newErrors = {};

    if (!form.name.trim()) newErrors.name = 'Full name is required';
    if (!form.username.trim()) newErrors.username = 'Username is required';

    if (!form.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!form.password) {
      newErrors.password = 'Password is required';
    } else if (form.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      await createUser(form);

      await showToast({
        icon: 'success',
        title: '🎉 Account created!',
      });

      navigate('/'); // Redirect to login or homepage
    } catch (error) {
      console.error('Signup error:', error);
      await showToast({
        icon: 'error',
        title: '❌ Signup failed. Please try again.',
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-100 to-purple-200 px-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">Sign Up</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {[
            { name: 'name', type: 'text', placeholder: 'Full Name' },
            { name: 'username', type: 'text', placeholder: 'Username' },
            { name: 'email', type: 'email', placeholder: 'Email' },
            { name: 'password', type: 'password', placeholder: 'Password' },
          ].map(({ name, type, placeholder }) => (
            <div key={name}>
              <input
                name={name}
                type={type}
                placeholder={placeholder}
                value={form[name]}
                onChange={handleChange}
                className={`w-full px-4 py-3 border ${
                  errors[name] ? 'border-red-500' : 'border-gray-300'
                } rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500`}
              />
              {errors[name] && (
                <p className="text-sm text-red-500 mt-1">{errors[name]}</p>
              )}
            </div>
          ))}

          <button
            type="submit"
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-lg transition duration-300"
          >
            Register
          </button>
        </form>

        <div className="mt-5 text-sm text-center text-gray-600">
          Already have an account?{' '}
          <Link to="/" className="text-purple-600 font-medium hover:underline">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Signup;
