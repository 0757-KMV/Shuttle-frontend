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
            alert(`Ride booked successfully! Fare: ₹${data.fare}`);
            setWalletBalance(data.new_balance);
        } catch (error: any) {
            alert(error.response?.data?.detail || "Error booking ride.");
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
    --primary-color: #57B4BA;  /* Vibrant Cyan */
    --secondary-color: #8AB2A6; /* Soft Green */
    --background-light: #f4f7f9; /* Light Gray */
    --background-dark: #e8ecef; /* Slightly Darker Gray */
    --text-color: #333; /* Dark Gray */
    --highlight-color: #57B4BA; /* Primary Theme Color */
    --button-hover: #4699A0; /* Slightly Darker Cyan */
    --danger-color: #d9534f; /* Professional Red */
}

.routes-container {
    width: 100%;
    font-family: 'Inter', sans-serif;
    color: var(--text-color);
    background: var(--background-light);
    min-height: 100vh;
    padding-bottom: 50px;
}

/* 📌 Header */
.routes-header {
    text-align: center;
    padding: 20px;
    background: #A5B68D;
    color: white;
    border-bottom: 4px solid var(--secondary-color);
}

.routes-header-title {
    font-size: 2.2rem;
    font-weight: 600;
    margin: 0;
}

.routes-header-subtitle {
    font-size: 1.1rem;
    opacity: 0.8;
}

/* 📌 Navbar */
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
    transition: color 0.3s ease-in-out;
}

.routes-nav ul li a:hover {
    color: var(--highlight-color);
}

/* 📌 Page Title */
.routes-title {
    text-align: center;
    font-size: 1.8rem;
    margin-top: 30px;
    color: black;
}

/* 📌 Form */
.routes-form {
    display: flex;
    flex-direction: column;
    max-width: 500px;
    margin: 30px auto;
    gap: 15px;
    background: white;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0px 4px 15px rgba(0, 0, 0, 0.08);
}

.routes-input,
.routes-select {
    padding: 12px;
    border: 1px solid var(--background-dark);
    border-radius: 6px;
    font-size: 1rem;
}

/* 📌 Buttons */
.routes-button {
    background: var(--highlight-color);
    color: white;
    border: none;
    padding: 12px;
    cursor: pointer;
    border-radius: 6px;
    font-size: 1rem;
    font-weight: 500;
    transition: background 0.3s ease-in-out;
}

.routes-button:hover {
    background: var(--button-hover);
}

.routes-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 20px;
    padding: 20px;
    list-style: none;
    justify-content: center;
    align-items: stretch;
}

.routes-card {
    background: linear-gradient(135deg, #f9f9f9, #e6e6e6);
    border-radius: 12px;
    padding: 20px;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
    transition: transform 0.2s ease-in-out, box-shadow 0.3s ease-in-out;
    border-left: 5px solid #57B4BA;
}

.routes-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 15px rgba(0, 0, 0, 0.15);
}

.routes-card-title {
    font-size: 1.2rem;
    font-weight: 600;
    color: #333;
    margin-bottom: 8px;
}

.routes-card-text {
    font-size: 0.95rem;
    color: #555;
    margin-bottom: 5px;
}

.routes-book-button,
.routes-delete-button {
    display: block;
    width: 100%;
    padding: 10px;
    border: none;
    border-radius: 8px;
    font-size: 1rem;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.3s ease-in-out, transform 0.2s ease-in-out;
}

.routes-book-button {
    background:  #A5B68D;
    color: white;
}

.routes-book-button:hover {
    background:  #A5B68D;
    transform: scale(1.05);
}

.routes-delete-button {
    background: #dc3545;
    color: white;
}

.routes-delete-button:hover {
    background: #c82333;
    transform: scale(1.05);
}


/* 📌 Profile Menu */
.profile-menu {
    position: relative;
    cursor: pointer;
    color: white;
    font-size: 1rem;
}

.dropdown {
    position: absolute;
    background: white;
    color: var(--text-color);
    padding: 12px;
    border-radius: 6px;
    box-shadow: 0 0 12px rgba(0, 0, 0, 0.15);
    top: 40px;
    right: 0;
    min-width: 150px;
    z-index:1000;
}

/* 📌 Logout Button */
.logout-button {
    background: #A5B68D;
    color: black;
    border: none;
    padding: 8px 12px;
    cursor: pointer;
    border-radius: 4px;
    font-size: 0.9rem;
    transition: background 0.3s ease-in-out;
}

.logout-button:hover {
    background:  #4699A0;
}

/* 📌 Responsive Design */
@media (max-width: 768px) {
    .routes-nav ul {
        flex-direction: column;
        align-items: center;
        gap: 15px;
    }

    .routes-form {
        width: 90%;
    }

    .routes-list {
        width: 90%;
    }
}

`}</style>

        </div>
    );
}
