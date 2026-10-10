
import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login() {
    const navigate = useNavigate();

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const handleLogin = (event) => {
        event.preventDefault();

        const cleanUsername = username.trim();

        if (!cleanUsername) return;

        localStorage.setItem(
            "projectHindsightUsername",
            cleanUsername
        );

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
                        <label htmlFor="username">
                            Username
                        </label>
                        <input
                            id="username"
                            type="text"
                            placeholder="Enter your username"
                            value={username}
                            onChange={(event) =>
                                setUsername(event.target.value)
                            }
                            autoComplete="username"
                            required
                        />
                    </div>

                    <div className="login-field">
                        <label htmlFor="password">
                            Password
                        </label>
                        <input
                            id="password"
                            type="password"
                            placeholder="Enter your password"
                            value={password}
                            onChange={(event) =>
                                setPassword(event.target.value)
                            }
                            autoComplete="current-password"
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
