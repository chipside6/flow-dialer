
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { CheckCircle, XCircle } from "lucide-react";
import { testEnvironmentReadiness } from "@/services/api/adminService";

interface EnvironmentSetupProps {
    onComplete: () => void;
}

export const EnvironmentSetup: React.FC<EnvironmentSetupProps> = ({ onComplete }) => {
    const [apiUrl, setApiUrl] = useState(import.meta.env.VITE_ASTERISK_API_URL || '');
    const [username, setUsername] = useState(import.meta.env.VITE_ASTERISK_API_USERNAME || '');
    const [password, setPassword] = useState(import.meta.env.VITE_ASTERISK_API_PASSWORD || '');
    const [isReady, setIsReady] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const { toast } = useToast();

    const handleApiUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setApiUrl(e.target.value);
    };

    const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setUsername(e.target.value);
    };

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPassword(e.target.value);
    };

    const handleTestReadiness = async () => {
        setIsLoading(true);
        setSuccessMessage(null);
        setErrorMessage(null);

        try {
            const result = await testEnvironmentReadiness(apiUrl, username, password);

            if (result.success) {
                setIsReady(true);
                setSuccessMessage(result.message || "Environment setup completed successfully");
                toast({
                    title: "Success",
                    description: result.message || "Environment setup completed successfully",
                });
                onComplete();
            } else {
                setIsReady(false);
                setErrorMessage(result.error || 'Failed to validate environment setup.');
                toast({
                    title: "Error",
                    description: result.error || 'Failed to validate environment setup.',
                    variant: "destructive",
                });
            }
        } catch (error: any) {
            setIsReady(false);
            setErrorMessage(error.message || 'An unexpected error occurred.');
            toast({
                title: "Error",
                description: error.message || 'An unexpected error occurred.',
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>Environment Setup</CardTitle>
                <CardDescription>
                    Configure the Asterisk environment settings.
                </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
                <div className="grid gap-2">
                    <Label htmlFor="api-url">API URL</Label>
                    <Input
                        id="api-url"
                        value={apiUrl}
                        onChange={handleApiUrlChange}
                        placeholder="http://localhost:8088/ari"
                    />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                        id="username"
                        value={username}
                        onChange={handleUsernameChange}
                        placeholder="admin"
                    />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                        id="password"
                        type="password"
                        value={password}
                        onChange={handlePasswordChange}
                        placeholder="password"
                    />
                </div>
            </CardContent>
            <div className="flex justify-between p-6">
                <div>
                    {isReady ? (
                        <div className="text-green-500 flex items-center">
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Ready
                        </div>
                    ) : (
                        <div className="text-red-500 flex items-center">
                            <XCircle className="h-4 w-4 mr-2" />
                            Not Ready
                        </div>
                    )}
                    {successMessage && <div className="text-sm text-green-500 mt-1">{successMessage}</div>}
                    {errorMessage && <div className="text-sm text-red-500 mt-1">{errorMessage}</div>}
                </div>
                <Button onClick={handleTestReadiness} disabled={isLoading}>
                    {isLoading ? "Testing..." : "Test Readiness"}
                </Button>
            </div>
        </Card>
    );
};
