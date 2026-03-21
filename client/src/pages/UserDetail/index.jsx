import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import "./index.css";

const UserDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchUser();
  }, [id]);

  const API_URL = import.meta.env.VITE_SERVER_URL || "http://127.0.0.1:7999";
  console.log("UserDetail API_URL:", API_URL);

  const fetchUser = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/user/${id}`);

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('User not found');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const json = await response.json();

      if (json.success) {
        setUser(json.data);
      } else {
        throw new Error(json.message || 'Failed to fetch user details');
      }
    } catch (err) {
      console.error('Error fetching user:', err);
      setError(err.message);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const getGenderColor = (gender) => {
    switch (gender) {
      case 'MALE':
        return { background: '#dbeafe', color: '#1e40af' };
      case 'FEMALE':
        return { background: '#fce7f3', color: '#be185d' };
      default:
        return { background: '#f3f4f6', color: '#374151' };
    }
  };

  if (loading) {
    return (
      <div className="detail">
        <Link to="/">← Back to User List</Link>
        <div className="loading">Loading user details...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="detail">
        <Link to="/">← Back to User List</Link>
        <div className="error">
          <strong>Error loading user:</strong> {error}
          <br />
          <button onClick={fetchUser} style={{ marginTop: '1rem' }}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="detail">
        <Link to="/">← Back to User List</Link>
        <div className="error">
          User not found. <Link to="/" style={{ color: '#4f46e5' }}>Return to user list</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="detail">
      <Link to="/">← Back to User List</Link>

      <div style={{
        textAlign: 'center',
        marginBottom: '2rem',
        padding: '1rem',
        background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
        borderRadius: '12px',
        border: '1px solid #e2e8f0'
      }}>
        <h2 style={{
          margin: '0 0 0.5rem 0',
          background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          fontSize: '1.8rem'
        }}>
          {user.first_name} {user.last_name}
        </h2>
        <p style={{ color: '#6b7280', margin: '0' }}>
          User #{user.id}
        </p>
      </div>

      <table className="usertable">
        <tbody>
          <tr>
            <td>ID</td>
            <td>#{user.id}</td>
          </tr>
          <tr>
            <td>First Name</td>
            <td>{user.first_name}</td>
          </tr>
          <tr>
            <td>Last Name</td>
            <td>{user.last_name}</td>
          </tr>
          <tr>
            <td>Email</td>
            <td>
              <a
                href={`mailto:${user.email}`}
                style={{
                  color: '#4f46e5',
                  textDecoration: 'none',
                  fontWeight: '500'
                }}
                onMouseEnter={(e) => e.target.style.textDecoration = 'underline'}
                onMouseLeave={(e) => e.target.style.textDecoration = 'none'}
              >
                {user.email}
              </a>
            </td>
          </tr>
          <tr>
            <td>Gender</td>
            <td>
              <span style={{
                ...getGenderColor(user.gender),
                padding: '0.5rem 1rem',
                borderRadius: '20px',
                fontSize: '0.9rem',
                fontWeight: '600',
                display: 'inline-block'
              }}>
                {user.gender}
              </span>
            </td>
          </tr>
          <tr>
            <td>Phone</td>
            <td>
              <a
                href={`tel:${user.phone}`}
                style={{
                  color: '#059669',
                  textDecoration: 'none',
                  fontWeight: '500'
                }}
                onMouseEnter={(e) => e.target.style.textDecoration = 'underline'}
                onMouseLeave={(e) => e.target.style.textDecoration = 'none'}
              >
                {user.phone}
              </a>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default UserDetail;
