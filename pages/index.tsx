import { useRouter } from "next/router";

export default function Dashboard() {
  const username = localStorage.getItem('username') || 'User';
  return (
    <div>
      <DashboardHeader username={username} />
      <main style={{ padding: '20px' }}>
        <h1>Dashboard</h1>
        <p>Welcome to your dashboard!</p>
      </main>
    </div>
  );
}

const DashboardHeader = ({ username }:{username:string}) => {
  const router = useRouter();

  const handleLogout = () => {
    // Clear tokens from localStorage
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    // Redirect to login page
    router.push('/login');
  };

  return (
    <header
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '15px 20px',
        backgroundColor: '#fff',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)', // Drop shadow
      }}
    >
      <div style={{ fontSize: '18px', fontWeight: 'bold' }}>
        {username || 'User'}
      </div>
      <button
        onClick={handleLogout}
        style={{
          padding: '8px 16px',
          backgroundColor: '#dc3545', // Red color for logout
          color: '#fff',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '14px',
        }}
      >
        Logout
      </button>
    </header>
  );
};