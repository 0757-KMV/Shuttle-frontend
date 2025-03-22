"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function WalletPage() {
    const [walletBalance, setWalletBalance] = useState<number | null>(null);
    const [rechargeAmount, setRechargeAmount] = useState<string>("");
    const [userEmail, setUserEmail] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        const email = localStorage.getItem("email");
        if (email) {
            setUserEmail(email);
            fetchWalletBalance(email);
        }
    }, []);

    const fetchWalletBalance = async (email: string) => {
        try {
            const { data } = await axios.get(`http://localhost:8000/api/wallet/${email}`);
            setWalletBalance(data.wallet_balance);
        } catch (error) {
            console.error("Error fetching wallet balance:", error);
        }
    };

    const handleRecharge = async () => {
        if (!userEmail || !rechargeAmount) return;

        try {
            const amount = parseFloat(rechargeAmount);
            if (amount <= 0) {
                alert("Please enter a valid amount.");
                return;
            }

            const { data } = await axios.put(`http://localhost:8000/api/wallet/recharge/${userEmail}`, { amount });
            setWalletBalance(data.new_balance);
            setRechargeAmount("");
            alert("Wallet recharged successfully!");
        } catch (error) {
            console.error("Error recharging wallet:", error);
        }
    };

    return (
        <div className="wallet-container">
            <div className="wallet-card">
                <h1>Wallet</h1>
                <p className="balance">Your current balance:</p>
                <p className="amount">₹{walletBalance !== null ? walletBalance : "Loading..."}</p>

                <div className="recharge-section">
                    <input 
                        type="number" 
                        placeholder="Enter amount" 
                        value={rechargeAmount} 
                        onChange={(e) => setRechargeAmount(e.target.value)}
                    />
                    <button onClick={handleRecharge}>Recharge Wallet</button>
                </div>

                <button className="back-button" onClick={() => router.push("/")}>Back to Home</button>
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
.wallet-container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    background: var(--background-light);
    font-family: 'Inter', sans-serif;
    color: var(--text-color);
}

/* 📌 Wallet Card */
.wallet-card {
    background: white;
    padding: 30px;
    border-radius: 12px;
    box-shadow: 0 6px 15px rgba(0, 0, 0, 0.1);
    text-align: center;
    width: 400px;
    border-left: 5px solid #A5B68D;;
    transition: transform 0.2s ease-in-out, box-shadow 0.3s ease-in-out;
}

.wallet-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 18px rgba(0, 0, 0, 0.15);
}

/* 📌 Wallet Title */
.wallet-card h1 {
    font-size: 2rem;
    font-weight: 600;
    margin-bottom: 10px;
}

/* 📌 Wallet Balance */
.balance {
    font-size: 1.2rem;
    color: #555;
    margin-bottom: 5px;
}

.amount {
    font-size: 2rem;
    font-weight: bold;
    color: #A5B68D;
    margin-bottom: 20px;
}

/* 📌 Recharge Section */
.recharge-section {
    display: flex;
    gap: 10px;
    justify-content: center;
    margin-bottom: 20px;
}

.recharge-section input {
    padding: 12px;
    width: 60%;
    border: 2px solid var(--secondary-color);
    border-radius: 8px;
    font-size: 1rem;
    transition: border-color 0.3s;
}

.recharge-section input:focus {
    border-color: var(--primary-color);
    outline: none;
}

/* 📌 Buttons */
button {
    padding: 12px 16px;
    background: #A5B68D;
    color: white;
    border: none;
    cursor: pointer;
    border-radius: 8px;
    font-size: 1rem;
    font-weight: 500;
    transition: background 0.3s ease-in-out, transform 0.1s ease-in-out;
}

button:hover {
    background: #A5B68D;
    transform: scale(1.05);
}

/* 📌 Back Button */
.back-button {
    background: #6c757d;
    width: 100%;
    margin-top: 10px;
}

.back-button:hover {
    background: #495057;
}

/* 📌 Responsive Design */
@media (max-width: 450px) {
    .wallet-card {
        width: 90%;
        padding: 20px;
    }

    .recharge-section {
        flex-direction: column;
        gap: 10px;
    }

    .recharge-section input {
        width: 100%;
    }
}

            `}</style>
        </div>
    );
}
