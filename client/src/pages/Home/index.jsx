import { useEffect, useState } from "react";
import "./index.css";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 5,
    total: 0,
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
  }, [pagination.page, pagination.limit]);

  const API_URL = import.meta.env.VITE_SERVER_URL || "http://127.0.0.1:7999";
  console.log("Home API_URL:", API_URL);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${API_URL}/users/all?page=${pagination.page}&limit=${pagination.limit}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const json = await response.json();

      if (json.success) {
        setUsers(json.data.users);
        setPagination((prevState) => ({
          ...prevState,
          total: json.data.total,
        }));
      } else {
        throw new Error(json.message || 'Failed to fetch users');
      }
    } catch (err) {
      console.error('Error fetching users:', err);
      setError(err.message);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUserClick = (userId) => {
    navigate(`/user/${userId}`);
  };

  const totalPages = Math.ceil(pagination.total / pagination.limit);

  if (loading) {
    return (
      <div className="home">
        <h1 className="header">User List</h1>
        <div className="loading">Loading users...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="home">
        <h1 className="header">User List</h1>
        <div className="error">
          <strong>Error loading users:</strong> {error}
          <br />
          <button onClick={fetchUsers} style={{ marginTop: '1rem' }}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="home">
      <h1 className="header">
        User List {pagination.total > 0 && `(${pagination.total})`}
      </h1>

      {users.length === 0 ? (
        <div className="success" style={{ textAlign: 'center', padding: '2rem' }}>
          No users found. The database might be empty.
        </div>
      ) : (
        <>
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>First Name</th>
                <th>Last Name</th>
                <th>Email</th>
                <th>Gender</th>
                <th>Phone</th>
              </tr>
            </thead>
            <tbody>
              {users.map(({ id, first_name, last_name, email, gender, phone }) => (
                <tr
                  key={id}
                  onClick={() => handleUserClick(id)}
                  title="Click to view user details"
                >
                  <td>#{id}</td>
                  <td>{first_name}</td>
                  <td>{last_name}</td>
                  <td>{email}</td>
                  <td>
                    <span style={{
                      background: gender === 'MALE' ? '#dbeafe' : gender === 'FEMALE' ? '#fce7f3' : '#f3f4f6',
                      color: gender === 'MALE' ? '#1e40af' : gender === 'FEMALE' ? '#be185d' : '#374151',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '4px',
                      fontSize: '0.8rem',
                      fontWeight: '500'
                    }}>
                      {gender}
                    </span>
                  </td>
                  <td>{phone}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {totalPages > 1 && (
            <div className="pagination">
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                disabled={pagination.page === 1}
                style={{ opacity: pagination.page === 1 ? 0.5 : 1 }}
              >
                ← Previous
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
                <button
                  key={pageNum}
                  className={pageNum === pagination.page ? "button-active" : ""}
                  onClick={() => setPagination(prev => ({ ...prev, page: pageNum }))}
                >
                  {pageNum}
                </button>
              ))}

              <button
                onClick={() => setPagination(prev => ({ ...prev, page: Math.min(totalPages, prev.page + 1) }))}
                disabled={pagination.page === totalPages}
                style={{ opacity: pagination.page === totalPages ? 0.5 : 1 }}
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Home;
