"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Booking = {
    route_name: string;
    fare: number;
    stops: string[];
};

export default function Bookings() {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [userName, setUserName] = useState<string | null>(null);
    const [walletBalance, setWalletBalance] = useState<number | null>(null);
    const [showDropdown, setShowDropdown] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const storedName = localStorage.getItem("userName");
        if (storedName) setUserName(storedName);
        fetchWalletBalance();
        fetchBookings();
    }, []);

    const fetchWalletBalance = async () => {
        try {
            const email = localStorage.getItem("email");
            if (!email) return;
            const { data } = await axios.get(`https://shuttle-backend.vercel.app/api/wallet/${email}`);
            setWalletBalance(data.wallet_balance);
        } catch (error) {
            console.error("Error fetching wallet balance:", error);
        }
    };

    const fetchBookings = async () => {
        try {
            const email = localStorage.getItem("email");
            if (!email) return;
            const { data } = await axios.get<Booking[]>(`https://shuttle-backend.vercel.app/api/bookings/${email}`);
            setBookings(data);
        } catch (error) {
            console.error("Error fetching bookings:", error);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("userName");
        localStorage.removeItem("email");
        router.push("/login");
    };

    return (
        <div className="bookings-container">
            <header className="bookings-header">
                <h1 className="bookings-title">Your Booked Rides</h1>
                <nav className="bookings-nav">
                    <ul>
                        <li><Link href="/">Home</Link></li>
                        <li><Link href="/routes">Routes</Link></li>
                        <li><Link href="/bookings">Bookings</Link></li>
                        <li><Link href="/wallet">Wallet</Link></li>
                        <li className="profile-menu" onClick={() => setShowDropdown(!showDropdown)}>
                            {userName || "Profile"}
                            {showDropdown && (
                                <div className="dropdown">
                                    <p>Wallet Balance: ₹{walletBalance ?? "Loading..."}</p>
                                    <button onClick={handleLogout} className="logout-button">Logout</button>
                                </div>
                            )}
                        </li>
                    </ul>
                </nav>
            </header>

            <ul className="bookings-list">
                {bookings.length === 0 ? (
                    <p>No rides booked yet.</p>
                ) : (
                    bookings.map((booking, index) => (
                        <li key={index} className="bookings-card">
                            <strong className="bookings-route-name">{booking.route_name}</strong>
                            <p className="bookings-fare">Fare: ₹{booking.fare}</p>
                            <p className="bookings-stops">
                                Stops: {booking.stops.length > 0 ? booking.stops.join(", ") : "Not available"}
                            </p>
                        </li>
                    ))
                )}
            </ul>

            <style jsx>{`
                .bookings-container {
                    padding: 20px;
                    max-width: 800px;
                    margin: 0 auto;
                    font-family: 'Inter', sans-serif;
                    color: #333;
                }

                .bookings-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 15px 20px;
                    background-color: #f8f9fa;
                    border-bottom: 1px solid #dee2e6;
                }

                .bookings-title {
                    font-size: 1.8rem;
                    font-weight: 600;
                    color: #212529;
                }

                .bookings-nav ul {
                    display: flex;
                    list-style: none;
                    padding: 0;
                    gap: 20px;
                    margin: 0;
                }

                .bookings-nav ul li {
                    position: relative;
                    font-size: 1rem;
                    font-weight: 500;
                    cursor: pointer;
                    transition: color 0.3s;
                }

                .bookings-nav ul li a {
                    text-decoration: none;
                    color: #495057;
                    transition: color 0.3s;
                }

                .bookings-nav ul li a:hover {
                    color: #007bff;
                }

                .profile-menu {
                    cursor: pointer;
                    position: relative;
                }

                .dropdown {
                    position: absolute;
                    background: white;
                    color: black;
                    padding: 10px;
                    border-radius: 5px;
                    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
                    top: 30px;
                    right: 0;
                    width: 180px;
                }

                .logout-button {
                    background: #dc3545;
                    color: white;
                    border: none;
                    padding: 7px 12px;
                    cursor: pointer;
                    border-radius: 3px;
                    width: 100%;
                    margin-top: 5px;
                    text-align: center;
                    font-size: 0.9rem;
                }

                .logout-button:hover {
                    background: #c82333;
                }

                .bookings-list {
                    list-style: none;
                    padding: 0;
                    margin-top: 20px;
                }

                .bookings-card {
                    padding: 15px;
                    border: 1px solid #dee2e6;
                    border-radius: 5px;
                    margin-bottom: 10px;
                    background: #fff;
                    box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.05);
                }

                .bookings-route-name {
                    font-size: 1.2rem;
                    font-weight: 600;
                    color: #343a40;
                }

                .bookings-fare,
                .bookings-stops {
                    font-size: 0.95rem;
                    color: #495057;
                    margin-top: 5px;
                }

                @media (max-width: 768px) {
                    .bookings-header {
                        flex-direction: column;
                        text-align: center;
                    }

                    .bookings-nav ul {
                        flex-direction: column;
                        align-items: center;
                    }
                }
            `}</style>
        </div>
    );
}
