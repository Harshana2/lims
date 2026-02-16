import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { FlaskConical } from 'lucide-react';

export const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        // Mock login - no validation
        navigate('/dashboard');
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

                <form onSubmit={handleLogin}>
                    <Input
                        label="Email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email"
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

                    <Button type="submit" className="w-full mt-6">
                        Login
                    </Button>
                </form>

                <p className="text-center text-sm text-gray-500 mt-6">
                    Demo System - Customer Sample Workflow
                </p>
            </Card>
        </div>
    );
};
