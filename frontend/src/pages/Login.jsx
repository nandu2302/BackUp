
import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login() {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleLogin = (event) => {
        event.preventDefault();

        // UI-only login: navigate without authentication
        navigate("/dashboard");
    };

    return (
        <div className="login-page">
            <div className="login-card">
                <div className="login-logo">PH</div>

                <h1>Welcome Back</h1>
                <p className="login-subtitle">
                    Sign in to ProjectHindsight
                </p>

                <form onSubmit={handleLogin}>
                    <div className="login-field">
                        <label htmlFor="email">Email Address</label>
                        <input
                            id="email"
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(event) =>
                                setEmail(event.target.value)
                            }
                            required
                        />
                    </div>

                    <div className="login-field">
                        <label htmlFor="password">Password</label>
                        <input
                            id="password"
                            type="password"
                            placeholder="Enter your password"
                            value={password}
                            onChange={(event) =>
                                setPassword(event.target.value)
                            }
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="login-button"
                    >
                        Login
                    </button>
                </form>

                <p className="login-footer">
                    Project Experience Memory
                </p>
            </div>
        </div>
    );
}

export default Login;
