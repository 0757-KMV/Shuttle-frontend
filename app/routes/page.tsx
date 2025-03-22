"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Route = {
    _id?: string;
    name: string;
    stops: string[];
    peak_hours: string;
    demand_level: string;
    active_shuttles: number;
};

export default function RoutesManagement() {
    const [routes, setRoutes] = useState<Route[]>([]);
    const [filteredRoutes, setFilteredRoutes] = useState<Route[]>([]);
    const [locationInput, setLocationInput] = useState("");
    const [userName, setUserName] = useState<string | null>(null);
    const [walletBalance, setWalletBalance] = useState<number | null>(null);
    const [showDropdown, setShowDropdown] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const storedName = localStorage.getItem("userName");
        if (storedName) {
            setUserName(storedName);
        }
        fetchWalletBalance();
        fetchRoutes();
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

    const fetchRoutes = async () => {
        try {
            const { data } = await axios.get<Route[]>("http://localhost:8000/api/peak");
            setRoutes(data);
        } catch (error) {
            console.error("Error fetching routes:", error);
        }
    };

    const searchRoutes = () => {
        if (!locationInput) {
            setFilteredRoutes([]);
            return;
        }

        const matchedRoutes = routes.filter(route =>
            route.stops.some(stop => stop.toLowerCase().includes(locationInput.toLowerCase()))
        );

        matchedRoutes.sort((a, b) => {
            const demandOrder = { High: 3, Medium: 2, Low: 1 };
            return demandOrder[b.demand_level] - demandOrder[a.demand_level] || b.active_shuttles - a.active_shuttles;
        });

        setFilteredRoutes(matchedRoutes);
    };

    const bookRide = async (routeId?: string) => {
        if (!routeId) return;
        try {
            const email = localStorage.getItem("email");
            if (!email) {
                alert("Please log in to book a ride.");
                return;
            }
            const { data } = await axios.post("http://localhost:8000/api/book-ride", { email, routeId });
            alert(data.message);
        } catch (error) {
            console.error("Error booking ride:", error);
        }
    };

    return (
        <div className="routes-container">
            <header className="routes-header">
                <h1 className="routes-header-title">Shuttle Management System</h1>
            </header>

            <nav className="routes-nav">
                <ul>
                    <li><Link href="/">Home</Link></li>
                    <li><Link href="/routes">Routes</Link></li>
                    <li><Link href="/booking">Bookings</Link></li>
                    <li><Link href="/wallet">Wallet</Link></li>
                    <li className="profile-menu" onClick={() => setShowDropdown(!showDropdown)}>
                        {userName || "Profile"}
                        {showDropdown && (
                            <div className="dropdown">
                                <p>Wallet Balance: ₹{walletBalance ?? "Loading..."}</p>
                                <button onClick={() => router.push("/login")} className="logout-button">Logout</button>
                            </div>
                        )}
                    </li>
                </ul>
            </nav>

            <h2 className="routes-title">Find the Closest Shuttle</h2>

            <div className="search-box">
                <input
                    type="text"
                    placeholder="Enter your location (e.g., A Block)..."
                    value={locationInput}
                    onChange={(e) => setLocationInput(e.target.value)}
                    className="routes-input"
                />
                <button onClick={searchRoutes} className="routes-button">Search</button>
            </div>

            <ul className="routes-list">
                {filteredRoutes.length > 0 ? (
                    filteredRoutes.map(route => (
                        <li key={route._id} className="routes-card">
                            <strong className="routes-card-title">{route.name}</strong>
                            <p className="routes-card-text">Stops: {route.stops.join(", ")}</p>
                            <p className="routes-card-text">Peak Hours: {route.peak_hours}</p>
                            <p className="routes-card-text">Demand: {route.demand_level}</p>
                            <p className="routes-card-text">Shuttles: {route.active_shuttles}</p>
                            <button onClick={() => bookRide(route._id)} className="routes-book-button">Book Ride</button>
                        </li>
                    ))
                ) : (
                    <p className="no-routes">No matching routes found</p>
                )}
            </ul>

            <style jsx>{`
                .routes-container {
                    width: 100%;
                    font-family: 'Inter', sans-serif;
                    background: #f4f7f9;
                    min-height: 100vh;
                    padding-bottom: 50px;
                }

                .routes-header {
                    text-align: center;
                    padding: 20px;
                    background: #A5B68D;
                    color: white;
                }

                .routes-header-title {
                    font-size: 2.2rem;
                    font-weight: 600;
                }

                .routes-nav {
                    background: #A5B68D;
                    padding: 12px 0;
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
                }

                .routes-title {
                    text-align: center;
                    font-size: 1.8rem;
                    margin-top: 30px;
                    color: black;
                }

                .search-box {
                    display: flex;
                    justify-content: center;
                    gap: 10px;
                    margin: 20px;
                }

                .routes-input {
                    padding: 12px;
                    border: 1px solid #e8ecef;
                    border-radius: 6px;
                    font-size: 1rem;
                }

                .routes-button {
                    background: #57B4BA;
                    color: white;
                    padding: 12px;
                    cursor: pointer;
                    border-radius: 6px;
                    font-size: 1rem;
                }

                .routes-list {
                height:680px;
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
                    gap: 20px;
                    padding: 20px;
                    list-style: none;
                }

                .routes-card {
                    background: linear-gradient(135deg, #f9f9f9, #e6e6e6);
                    border-radius: 12px;
                    padding: 20px;
                    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
                    border-left: 5px solid #57B4BA;
                }

                .routes-book-button {
                    background: #A5B68D;
                    color: white;
                    padding: 10px;
                    border-radius: 8px;
                    font-size: 1rem;
                }

                .routes-book-button:hover {
                    background: #8AB2A6;
                }
            `}</style>
        </div>
    );
}
