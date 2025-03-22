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
    
        const response = await fetch(`http://localhost:8000${url}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
            mode: "cors",  // ✅ Ensure CORS mode is enabled
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
                :root {
    --primary-color: #57B4BA; /* Vibrant Cyan */
    --secondary-color: #8AB2A6; /* Soft Green */
    --background-light: #f4f7f9; /* Light Gray */
    --background-dark: #e8ecef; /* Slightly Darker Gray */
    --text-color: #333; /* Dark Gray */
    --highlight-color: #57B4BA; /* Primary Theme Color */
    --button-hover: #4699A0; /* Slightly Darker Cyan */
    --danger-color: #d9534f; /* Professional Red */
}

/* 📌 Page Container */
.login-container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    background: var(--background-light);
    font-family: 'Inter', sans-serif;
    color: var(--text-color);
}

/* 📌 Login/Register Box */
.login-box {
    background: white;
    padding: 30px;
    border-radius: 12px;
    box-shadow: 0 6px 15px rgba(0, 0, 0, 0.1);
    text-align: center;
    width: 400px;
    border-left: 5px solid  #A5B68D;;
    transition: transform 0.2s ease-in-out, box-shadow 0.3s ease-in-out;
}

.login-box:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 18px rgba(0, 0, 0, 0.15);
}

/* 📌 Title */
.login-title {
    font-size: 2rem;
    font-weight: 600;
    margin-bottom: 10px;
}

/* 📌 Input Fields */
.login-input {
    width: 100%;
    padding: 12px;
    margin-bottom: 12px;
    border: 2px solid var(--secondary-color);
    border-radius: 8px;
    font-size: 1rem;
    transition: border-color 0.3s;
}

.login-input:focus {
    border-color: var(--primary-color);
    outline: none;
}

/* 📌 Buttons */
.login-button {
    width: 100%;
    padding: 12px;
    background:  #A5B68D;;
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 1rem;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.3s ease-in-out, transform 0.1s ease-in-out;
}

.login-button:hover {
    background:  #A5B68D;;
    transform: scale(1.05);
}

/* 📌 Toggle (Switch between Login/Register) */
.toggle {
    margin-top: 15px;
    color:  #A5B68D;;
    font-weight: 500;
    cursor: pointer;
    transition: color 0.3s ease-in-out;
}

.toggle:hover {
    color: var(--button-hover);
    text-decoration: underline;
}

/* 📌 Authentication Message */
.login-message {
    margin-top: 12px;
    font-weight: 500;
    color: var(--danger-color);
}

/* 📌 Wallet Balance Display */
.wallet {
    margin-top: 12px;
    font-weight: bold;
    color: var(--primary-color);
}

/* 📌 Responsive Design */
@media (max-width: 450px) {
    .login-box {
        width: 90%;
        padding: 20px;
    }
}

            `}</style>
        </div>
    );
}
