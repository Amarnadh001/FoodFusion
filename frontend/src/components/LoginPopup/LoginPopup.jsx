import axios from "axios";
import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { assets } from "../../assets/assets";
import { StoreContext } from "../../context/StoreContext";
import "./LoginPopup.css";

const LoginPopup = ({ setShowLogin }) => {
    const { url, setToken } = useContext(StoreContext);
    const navigate = useNavigate();

    const [currState, setCurrState] = useState("Login");
    const [step, setStep] = useState("inputDetails");
    const [data, setData] = useState({
        name: "",
        email: "",
        phone: "",
        password: "",
        otp: "",
    });
    const [isLoading, setIsLoading] = useState(false);

    const onChangeHandler = (event) => {
        const { name, value } = event.target;
        setData((prevData) => ({ ...prevData, [name]: value }));
    };

    const sendOtp = async () => {
        if (isLoading) return;
        setIsLoading(true);

        // Validate input fields
        if (!data.name?.trim()) {
            alert("❌ Please enter your full name.");
            setIsLoading(false);
            return;
        }

        if (!data.email || !data.email.includes("@")) {
            alert("❌ Please enter a valid email address.");
            setIsLoading(false);
            return;
        }

        if (!/^\d{10}$/.test(data.phone.replace(/\D/g, ""))) {
            alert("❌ Please enter a valid 10-digit phone number.");
            setIsLoading(false);
            return;
        }

        try {
            const payload = {
                name: data.name.trim(),
                email: data.email.toLowerCase(),
                phone: data.phone.replace(/\D/g, ""), // Clean phone number
            };

            console.log("Sending OTP Payload:", payload); // Debugging

            const response = await axios.post(`${url}/api/auth/send-otp`, payload);

            if (response.data.success) {
                setStep("otpVerification");
                alert("✅ OTP sent successfully to your email.");
            } else {
                alert(response.data.message);
            }
        } catch (error) {
            console.error("OTP error:", error.response?.data);
            alert(
                `❌ Failed to send OTP: ${error.response?.data?.message || "Please check your details"}`
            );
        } finally {
            setIsLoading(false);
        }
    };

    const verifyOtp = async () => {
        if (isLoading) return;
        setIsLoading(true);

        if (!data.otp || data.otp.length !== 6) {
            alert("❌ Please enter a 6-digit OTP.");
            setIsLoading(false);
            return;
        }

        try {
            const response = await axios.post(`${url}/api/auth/verify-otp`, {
                email: data.email,
                otp: data.otp,
            });

            if (response.data.success) {
                setStep("passwordEntry");
            } else {
                alert("❌ OTP verification failed");
            }
        } catch (error) {
            console.error("OTP verify error:", error);
            alert(
                `❌ OTP verification failed: ${error.response?.data?.message || "Server error"}`
            );
        } finally {
            setIsLoading(false);
        }
    };

    const createPassword = async () => {
        if (isLoading) return;
        setIsLoading(true);

        if (!data.name?.trim()) {
            alert("❌ Please enter your full name.");
            setIsLoading(false);
            return;
        }

        if (!data.password || data.password.length < 6) {
            alert("❌ Password must be at least 6 characters.");
            setIsLoading(false);
            return;
        }

        try {
            const payload = {
                name: data.name.trim(),
                email: data.email.toLowerCase(),
                password: data.password,
                phone: data.phone.replace(/\D/g, ""), // Clean phone number
            };

            const response = await axios.post(`${url}/api/auth/register`, payload);

            if (response.data.success) {
                // ✅ Save token to context and local storage
                setToken(response.data.token);
                localStorage.setItem("token", response.data.token);

                // ✅ Close login popup and redirect
                setShowLogin(false);
                navigate("/");

                // ✅ Show success message
                alert("✅ Registration successful! You are now logged in.");
            } else {
                alert(response.data.message);
            }
        } catch (error) {
            console.error("Registration error:", error.response?.data);
            alert(
                `❌ Registration failed: ${error.response?.data?.message || "Please check your details"}`
            );
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogin = async (event) => {
        event.preventDefault();
        if (isLoading) return;
        setIsLoading(true);

        try {
            const response = await axios.post(`${url}/api/user/login`, {
                email: data.email,
                password: data.password,
            });

            if (response.data.success) {
                setToken(response.data.token);
                localStorage.setItem("token", response.data.token);
                setShowLogin(false);
                navigate("/");
            }
        } catch (error) {
            console.error("Login error:", error.response?.data);
            alert("❌ Login failed: " + (error.response?.data?.message || "Invalid credentials"));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="login-popup">
            <form onSubmit={currState === "Login" ? handleLogin : (e) => e.preventDefault()}
                className="login-popup-container">
                <div className="login-popup-title">
                    <h2>{currState}</h2>
                    <img onClick={() => setShowLogin(false)} src={assets.cross_icon} alt="Close" />
                </div>

                {currState === "Sign Up" && (
                    <>
                        {step === "inputDetails" && (
                            <>
                                <input name="name" onChange={onChangeHandler} value={data.name}
                                    type="text" placeholder="Full Name" required />
                                <input name="email" onChange={onChangeHandler} value={data.email}
                                    type="email" placeholder="Email" required />
                                <input name="phone" onChange={onChangeHandler} value={data.phone}
                                    type="tel" placeholder="Phone Number" required />
                                <button type="button" onClick={sendOtp} disabled={isLoading}>
                                    {isLoading ? "Sending..." : "Send OTP"}
                                </button>
                            </>
                        )}

                        {step === "otpVerification" && (
                            <>
                                <input name="otp" onChange={onChangeHandler} value={data.otp}
                                    type="number" placeholder="Enter 6-digit OTP" required />
                                <button type="button" onClick={verifyOtp} disabled={isLoading}>
                                    {isLoading ? "Verifying..." : "Verify OTP"}
                                </button>
                            </>
                        )}

                        {step === "passwordEntry" && (
                            <>
                                <input name="password" onChange={onChangeHandler} value={data.password}
                                    type="password" placeholder="Create Password (min 6 chars)" required />
                                <button type="button" onClick={createPassword} disabled={isLoading}>
                                    {isLoading ? "Creating..." : "Create Account"}
                                </button>
                            </>
                        )}
                    </>
                )}

                {currState === "Login" && (
                    <>
                        <input name="email" onChange={onChangeHandler} value={data.email}
                            type="email" placeholder="Email" required />
                        <input name="password" onChange={onChangeHandler} value={data.password}
                            type="password" placeholder="Password" required />
                        <button type="submit" disabled={isLoading}>
                            {isLoading ? "Logging in..." : "Login"}
                        </button>
                    </>
                )}

                <div className="login-popup-condition">
                    <input type="checkbox" required />
                    <p>By continuing, I agree to the Terms of Use & Privacy Policy.</p>
                </div>

                {currState === "Login" ? (
                    <p>Create a new account? <span onClick={() => {
                        setCurrState("Sign Up");
                        setStep("inputDetails");
                        setData({ name: "", email: "", phone: "", password: "", otp: "" });
                    }}>Sign Up</span></p>
                ) : (
                    <p>Already have an account? <span onClick={() => {
                        setCurrState("Login");
                        setData({ name: "", email: "", phone: "", password: "", otp: "" });
                    }}>Login</span></p>
                )}
            </form>
        </div>
    );
};

export default LoginPopup;