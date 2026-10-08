function Memory() {
    return (
        <div>
            <div className="topbar">
                <div>
                    <h1>Ask Project Memory</h1>
                    <p>
                        Search what your organization has already learned.
                    </p>
                </div>
            </div>

            <div className="search-card">
                <input
                    type="text"
                    placeholder="Example: Have we faced API integration problems?"
                />

                <button className="primary-btn">
                    Ask Memory
                </button>
            </div>
        </div>
    );
}

export default Memory;