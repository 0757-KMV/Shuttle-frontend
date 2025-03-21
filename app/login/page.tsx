"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AuthPage() {
    const [isRegister, setIsRegister] = useState(false);
    const [email, setEmail] = useState("");
    const [name, setName] = useState("");
    const [password, setPassword] = useState("");
    const [walletBalance, setWalletBalance] = useState(null);
    const [message, setMessage] = useState("");
    const [userName, setUserName] = useState(null);

    const router = useRouter();

    const handleAuth = async () => {
        if (!email || !password || (isRegister && !name)) {
            setMessage("Please fill in all required fields.");
            return;
        }
    
        const url = isRegister ? "/api/register" : "/api/login";
        const body = isRegister ? { email, name, password } : { email, password };
        console.log("Sending body:", body);
    
        const response = await fetch(`http://127.0.0.1:8000${url}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        });
    
        const data = await response.json();
        console.log("Response data:", data);
        if (response.ok) {
            setMessage(data.message);
            if (!isRegister) {
                setWalletBalance(data.wallet_balance);
                setUserName(data.name);
                localStorage.setItem("userName", data.name);
                localStorage.setItem("email", data.email);
                router.push("/");
            }
        } else {
            setMessage(data.detail || "An error occurred.");
        }
    };
    

    return (
        <div className="login-container">
            <div className="login-box">
                <h2 className="login-title">{isRegister ? "Register" : "Login"}</h2>
                <input
                    className="login-input"
                    type="email"
                    placeholder="University Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                {isRegister && (
                    <input
                        className="login-input"
                        type="text"
                        placeholder="Full Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                )}
                <input
                    className="login-input"
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <button className="login-button" onClick={handleAuth}>
                    {isRegister ? "Register" : "Login"}
                </button>
                <p className="toggle" onClick={() => setIsRegister(!isRegister)}>
                    {isRegister ? "Already have an account? Login" : "New user? Register"}
                </p>
                {message && <p className="login-message">{message}</p>}
                {walletBalance !== null && (
                    <p className="wallet">Wallet Balance: ₹{walletBalance}</p>
                )}
            </div>

            <style jsx>{`
                .login-container {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    height: 100vh;
                    background: linear-gradient(to right, #f0f2f5, #d9e4f5);
                }

                .login-box {
                    background: white;
                    padding: 2rem;
                    border-radius: 10px;
                    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
                    width: 350px;
                    text-align: center;
                }

                .login-title {
                    font-size: 1.8rem;
                    color: #333;
                    margin-bottom: 1rem;
                }

                .login-input {
                    width: 100%;
                    padding: 10px;
                    margin-bottom: 1rem;
                    border: 1px solid #ccc;
                    border-radius: 5px;
                    font-size: 1rem;
                }

                .login-button {
                    width: 100%;
                    padding: 10px;
                    background: #007bff;
                    color: white;
                    border: none;
                    border-radius: 5px;
                    font-size: 1rem;
                    cursor: pointer;
                    transition: 0.3s;
                }

                .login-button:hover {
                    background: #0056b3;
                }

                .toggle {
                    margin-top: 10px;
                    color: #007bff;
                    cursor: pointer;
                }

                .toggle:hover {
                    text-decoration: underline;
                }

                .login-message {
                    margin-top: 10px;
                    color: green;
                }

                .wallet {
                    margin-top: 10px;
                    font-weight: bold;
                }
            `}</style>
        </div>
    );
}
