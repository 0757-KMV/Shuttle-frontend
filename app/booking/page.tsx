"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import QRCode from "qrcode"; 

type Booking = {
    route_name: string;
    fare: number;
    stops: string[];
};

export default function Bookings() {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [qrCodes, setQrCodes] = useState<{ [key: number]: string }>({});
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
            const { data } = await axios.get(`http://localhost:8000/api/wallet/${email}`);
            setWalletBalance(data.wallet_balance);
        } catch (error) {
            console.error("Error fetching wallet balance:", error);
        }
    };

    const fetchBookings = async () => {
        try {
            const email = localStorage.getItem("email");
            if (!email) return;
            const { data } = await axios.get<Booking[]>(`http://localhost:8000/api/bookings/${email}`);
            setBookings(data);
            generateQRCodes(data);
        } catch (error) {
            console.error("Error fetching bookings:", error);
        }
    };

    // ✅ Generate QR codes for each booking
    const generateQRCodes = async (bookings: Booking[]) => {
        const qrMap: { [key: number]: string } = {};
        for (let i = 0; i < bookings.length; i++) {
            const qrData = `Route: ${bookings[i].route_name}, Fare: ₹${bookings[i].fare}`;
            qrMap[i] = await QRCode.toDataURL(qrData);
        }
        setQrCodes(qrMap);
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
                <nav className="routes-nav">
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
                            <div className="bookings-info">
                                <strong className="bookings-route-name">{booking.route_name}</strong>
                                <p className="bookings-fare">Fare: ₹{booking.fare}</p>
                                <p className="bookings-stops">
                                    Stops: {booking.stops.length > 0 ? booking.stops.join(", ") : "Not available"}
                                </p>
                            </div>
                            <div className="qr-container">
                                {qrCodes[index] && <img src={qrCodes[index]} alt="QR Code" className="qr-code" />}
                            </div>
                        </li>
                    ))
                )}
            </ul>

            <style jsx>{`
                .bookings-container {
                    width: 100%;
                    font-family: 'Inter', sans-serif;
                    color: #333;
                    background: #f4f7f9;
                    min-height: 100vh;
                    padding-bottom: 50px;
                }

                .bookings-header {
                    text-align: center;
                    padding: 20px;
                    background: #A5B68D;
                    color: white;
                    border-bottom: 4px solid #8AB2A6;
                }

                .bookings-title {
                    font-size: 2.2rem;
                    font-weight: 600;
                    margin: 0;
                }

                .routes-nav ul {
                    display: flex;
                    justify-content: center;
                    gap: 30px;
                    list-style: none;
                    padding: 0;
                    margin: 0;
                }

                .routes-nav ul li a {
                    text-decoration: none;
                    color: white;
                    font-weight: 500;
                    font-size: 1rem;
                    transition: color 0.3s ease-in-out;
                }

                .routes-nav ul li a:hover {
                    color: #57B4BA;
                }

                .bookings-list {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
                    gap: 20px;
                    padding: 20px;
                    justify-content: center;
                }

                .bookings-card {
                    background: linear-gradient(135deg, #f9f9f9, #e6e6e6);
                    border-radius: 12px;
                    padding: 20px;
                    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
                    transition: transform 0.2s ease-in-out, box-shadow 0.3s ease-in-out;
                    border-left: 5px solid #57B4BA;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .bookings-card:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 8px 15px rgba(0, 0, 0, 0.15);
                }

                .bookings-route-name {
                    font-size: 1.2rem;
                    font-weight: 600;
                    color: #333;
                    margin-bottom: 8px;
                }

                .bookings-fare {
                    font-size: 1rem;
                    font-weight: 500;
                    color: #57B4BA;
                    margin-bottom: 8px;
                }

                .bookings-stops {
                    font-size: 0.95rem;
                    color: #555;
                }

                .qr-container {
                    width: 80px;
                    height: 80px;
                }

                .qr-code {
                    width: 100%;
                    height: 100%;
                }

                @media (max-width: 768px) {
                    .bookings-card {
                        flex-direction: column;
                        align-items: center;
                        text-align: center;
                    }
                }
            `}</style>
        </div>
    );
}
