"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { useForm } from "react-hook-form";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Route = {
    _id?: string;
    name: string;
    stops: string[];
    peak_hours: string;
    demand_level: string;
    active_shuttles: string;
};

export default function RoutesManagement() {
    const { register, handleSubmit, reset } = useForm<Route>();
    const [routes, setRoutes] = useState<Route[]>([]);
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

    useEffect(() => {
        fetchRoutes();
        fetchWalletBalance();
    }, []);

    const fetchRoutes = async () => {
        try {
            const { data } = await axios.get<Route[]>("http://localhost:8000/api/routes");
            setRoutes(data);
        } catch (error) {
            console.error("Error fetching routes:", error);
        }
    };

    const addRoute = async (formData: Route) => {
        const processedData = {
            name: formData.name.trim(),
            stops: formData.stops.toString().split(",").map(stop => stop.trim()),
            peak_hours: formData.peak_hours.toString().split(",").map(hour => hour.trim()),
            demand_level: formData.demand_level.trim(),
            active_shuttles: Number(formData.active_shuttles),
        };

        try {
            await axios.post("http://localhost:8000/api/routes", processedData);
            fetchRoutes();
            reset();
        } catch (error) {
            console.error("Error adding route:", error);
        }
    };

    const deleteRoute = async (id?: string) => {
        if (!id) return;
        try {
            await axios.delete(`http://localhost:8000/api/routes/${id}`);
            fetchRoutes();
        } catch (error) {
            console.error("Error deleting route:", error);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("userName");
        localStorage.removeItem("email");
        router.push("/login");
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
                <p className="routes-header-subtitle">Efficient campus transit management</p>
            </header>

            <nav className="routes-nav">
                <ul>
                    <li><Link href="/">Home</Link></li>
                    <li><Link href="/routes">Routes</Link></li>
                    <li><Link href="/booking">Bookings</Link></li>
                    <li><Link href="/wallet">Wallet</Link></li>
                    <li 
                        className="profile-menu"
                        onClick={() => setShowDropdown(!showDropdown)}
                    >
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

            <h2 className="routes-title">
                {userName === "admin" ? "Manage Shuttle Routes" : "Available Shuttles"}
            </h2>

            {userName === "admin" && (
                <form onSubmit={handleSubmit(addRoute)} className="routes-form">
                    <input {...register("name")} className="routes-input" placeholder="Route Name" required />
                    <input {...register("stops")} className="routes-input" placeholder="Stops (comma-separated)" required />
                    <input {...register("peak_hours")} className="routes-input" placeholder="Peak Hours (e.g. 08:00-10:00)" required />
                    <select {...register("demand_level")} className="routes-select" required>
                        <option value="High">High</option>
                        <option value="Medium">Medium</option>
                        <option value="Low">Low</option>
                    </select>
                    <input type="number" {...register("active_shuttles")} className="routes-input" placeholder="No. of Shuttles" required />
                    <button type="submit" className="routes-button">Add Route</button>
                </form>
            )}

            <ul className="routes-list">
                {routes.map((route) => (
                    <li key={route._id} className="routes-card">
                        <strong className="routes-card-title">{route.name}</strong>
                        <p className="routes-card-text">Stops: {route.stops.join(", ") || "No stops available"}</p>
                        <p className="routes-card-text">Peak Hours: {route.peak_hours || "N/A"}</p>
                        <p className="routes-card-text">Demand: {route.demand_level}</p>
                        <p className="routes-card-text">Shuttles: {route.active_shuttles}</p>

                        {userName === "admin" ? (
                            <button onClick={() => deleteRoute(route._id)} className="routes-delete-button">Delete</button>
                        ) : (
                            <button onClick={() => bookRide(route._id)} className="routes-book-button">Book Ride</button>
                        )}
                    </li>
                ))}
            </ul>

            <style jsx>{`
    :root {
        --primary-color: #2c3e50;  /* Dark Blue */
        --secondary-color: #4a6670; /* Muted Blue-Green */
        --background-light: #f4f7f9; /* Light Gray */
        --background-dark: #e8ecef; /* Slightly Darker Gray */
        --text-color: #333; /* Dark Gray */
        --highlight-color: #007bff; /* Subtle Blue */
        --button-hover: #0056b3; /* Darker Blue */
        --danger-color: #d9534f; /* Professional Red */
    }

    .routes-container {
        padding: 20px;
        font-family: 'Inter', sans-serif;
        color: var(--text-color);
        background: var(--background-light);
        min-height: 100vh;
    }

    .routes-header {
        text-align: center;
        margin-bottom: 20px;
        background: var(--primary-color);
        color: white;
        padding: 20px;
        border-radius: 5px;
    }

    .routes-header-title {
        font-size: 2rem;
        font-weight: 600;
    }

    .routes-nav ul {
        display: flex;
        justify-content: center;
        gap: 20px;
        list-style: none;
        padding: 10px;
        background: var(--secondary-color);
        border-radius: 5px;
    }

    .routes-nav ul li a {
        text-decoration: none;
        color: white;
        font-weight: 500;
        transition: color 0.3s;
    }

    .routes-nav ul li a:hover {
        color: var(--highlight-color);
    }

    .routes-title {
        text-align: center;
        font-size: 1.5rem;
        margin-top: 20px;
        color: var(--primary-color);
    }

    .routes-form {
        display: flex;
        flex-direction: column;
        max-width: 500px;
        margin: 20px auto;
        gap: 10px;
        background: white;
        padding: 15px;
        border-radius: 5px;
        box-shadow: 0px 2px 10px rgba(0, 0, 0, 0.05);
    }

    .routes-input,
    .routes-select {
        padding: 10px;
        border: 1px solid var(--background-dark);
        border-radius: 4px;
        font-size: 1rem;
    }

    .routes-button {
        background: var(--highlight-color);
        color: white;
        border: none;
        padding: 10px;
        cursor: pointer;
        border-radius: 4px;
        font-size: 1rem;
        transition: background 0.3s;
    }

    .routes-button:hover {
        background: var(--button-hover);
    }

    .routes-list {
        list-style: none;
        max-width: 800px;
        margin: auto;
        padding: 0;
    }

    .routes-card {
        padding: 15px;
        border: 1px solid var(--background-dark);
        border-radius: 5px;
        margin-bottom: 15px;
        background: white;
        box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.05);
        display: flex;
        flex-direction: column;
        gap: 5px;
    }

    .routes-card-title {
        font-size: 1.2rem;
        font-weight: 600;
        color: var(--primary-color);
    }

    .routes-card-text {
        font-size: 0.95rem;
        color: var(--text-color);
    }

    .routes-book-button {
        background: var(--highlight-color);
        color: white;
        border: none;
        padding: 8px 12px;
        cursor: pointer;
        border-radius: 4px;
        font-size: 0.9rem;
        transition: background 0.3s;
    }

    .routes-book-button:hover {
        background: var(--button-hover);
    }

    .routes-delete-button {
        background: var(--danger-color);
        color: white;
        border: none;
        padding: 8px 12px;
        cursor: pointer;
        border-radius: 4px;
        font-size: 0.9rem;
        transition: background 0.3s;
    }

    .routes-delete-button:hover {
        background: #c9302c;
    }

    .profile-menu {
        position: relative;
        cursor: pointer;
        color: white;
    }

    .dropdown {
        position: absolute;
        background: white;
        color: var(--text-color);
        padding: 10px;
        border-radius: 5px;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        top: 30px;
        right: 0;
    }

    .logout-button {
        background: var(--danger-color);
        color: white;
        border: none;
        padding: 5px 10px;
        cursor: pointer;
        border-radius: 3px;
        margin-top: 5px;
    }

    .logout-button:hover {
        background: #c9302c;
    }
`}</style>

        </div>
    );
}
