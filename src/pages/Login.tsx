import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { FlaskConical } from 'lucide-react';
import authService from '../services/authService';

export const Login: React.FC = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await authService.login({ username, password });
            navigate('/dashboard');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Invalid username or password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-600 to-primary-800 flex items-center justify-center p-4">
            <Card className="w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="flex justify-center mb-4">
                        <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
                            <FlaskConical size={32} className="text-primary-600" />
                        </div>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-800">LIMS</h1>
                    <p className="text-gray-600 mt-2">Laboratory Information Management System</p>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin}>
                    <Input
                        label="Username"
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Enter your username"
                        required
                    />

                    <Input
                        label="Password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        required
                    />

                    <Button type="submit" className="w-full mt-6" disabled={loading}>
                        {loading ? 'Logging in...' : 'Login'}
                    </Button>
                </form>

                <div className="mt-6 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm font-semibold text-blue-900 mb-2">Demo Credentials:</p>
                    <p className="text-xs text-blue-700">Username: <strong>admin</strong> / Password: <strong>password123</strong></p>
                    <p className="text-xs text-blue-700">Username: <strong>chemist1</strong> / Password: <strong>password123</strong></p>
                </div>
            </Card>
        </div>
    );
};
