import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { showToast } from '../utils/Alert';

const MySwal = withReactContent(Swal);

const ForgotUsernamePage = () => {
    const [email, setEmail] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await axios.post('/api/users/forgot-username', null, {
                params: { email },
            });

            await showToast({
                icon: 'success',
                title: 'Username sent to your email!',
            });

            navigate('/');
        } catch (error) {
            await showToast({
                icon: 'error',
                title: 'Could not send username!',
            });

        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-yellow-100 to-yellow-300">
            <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
                <h2 className="text-2xl font-semibold text-center text-gray-800 mb-6">
                    Forgot Username
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <input
                        type="email"
                        placeholder="Enter your registered email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    />

                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full bg-yellow-600 hover:bg-yellow-700 text-white font-semibold py-3 rounded-lg transition-colors duration-300"
                    >
                        {submitting ? 'Sending...' : 'Send Username'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ForgotUsernamePage;
