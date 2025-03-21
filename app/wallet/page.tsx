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
                .wallet-container {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    height: 100vh;
                    background: #f4f4f4;
                }

                .wallet-card {
                    background: white;
                    padding: 30px;
                    border-radius: 12px;
                    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
                    text-align: center;
                    width: 400px;
                }

                h1 {
                    font-size: 24px;
                    color: #333;
                    margin-bottom: 10px;
                }

                .balance {
                    font-size: 18px;
                    color: #666;
                    margin-bottom: 5px;
                }

                .amount {
                    font-size: 28px;
                    font-weight: bold;
                    color: #007bff;
                    margin-bottom: 20px;
                }

                .recharge-section {
                    display: flex;
                    gap: 10px;
                    justify-content: center;
                    margin-bottom: 20px;
                }

                input {
                    padding: 10px;
                    width: 60%;
                    border: 1px solid #ccc;
                    border-radius: 8px;
                    font-size: 16px;
                }

                button {
                    padding: 10px 15px;
                    background: #007bff;
                    color: white;
                    border: none;
                    cursor: pointer;
                    border-radius: 8px;
                    font-size: 16px;
                    transition: background 0.3s;
                }

                button:hover {
                    background: #0056b3;
                }

                .back-button {
                    background: #6c757d;
                    width: 100%;
                }

                .back-button:hover {
                    background: #495057;
                }

                @media (max-width: 450px) {
                    .wallet-card {
                        width: 90%;
                        padding: 20px;
                    }

                    .recharge-section {
                        flex-direction: column;
                        gap: 10px;
                    }

                    input {
                        width: 100%;
                    }
                }
            `}</style>
        </div>
    );
}
