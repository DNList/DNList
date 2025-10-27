import React, { useEffect, useState } from "react";
import "../styles/changelog.css"; // adjust path if needed

const ChangelogPage = () => {
  const [changelog, setChangelog] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch changelog entries (replace with your API or static file)
    const fetchChangelog = async () => {
      try {
        const response = await fetch("/api/changelog"); // example endpoint
        if (!response.ok) throw new Error("Failed to fetch changelog.");
        const data = await response.json();
        setChangelog(data);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchChangelog();
  }, []);

  return (
    <div className="page-changelog-container">
      <div className="page-changelog">
        {error && (
          <div className="error-container">
            <div className="error">{error}</div>
          </div>
        )}

        <div className="changelog-container">
          {changelog.length === 0 && !error && (
            <p>Loading changelog entries...</p>
          )}

          {changelog.map((entry, index) => (
            <div
              key={index}
              className={`changelog-entry ${
                entry.featured ? "featured" : ""
              }`}
            >
              <div className="date">{entry.date}</div>
              <div className="message">{entry.message}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ChangelogPage;
