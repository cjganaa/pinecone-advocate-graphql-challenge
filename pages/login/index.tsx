import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useMutation, gql } from '@apollo/client';
import styles from '../../styles/Auth.module.css';
import Loading from '../../components/Loading';

const LOGIN_USER = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      accessToken
      refreshToken
      user {
        id
        username
        email
      }
    }
  }
`;

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginUser, { loading, error }] = useMutation(LOGIN_USER);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const { data } = await loginUser({
        variables: { email, password },
      });
      const { accessToken, refreshToken } = data.login;

      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem("user", JSON.stringify(data.login.user));

      console.log('Logged in:', data.login.user);
      // alert('Login successful!');
      router.push('/'); // Redirect to home page or dashboard
    } catch (err) {
      console.error('Login error:', err);
      alert('Login failed: ' + (error?.message || 'Unknown error'));
    }
  };
  if (loading) return <Loading />;
  return (
    <div className={styles.screen}>
      <div className={styles.container}>
        <h2>Login</h2>
          <form onSubmit={handleSubmit}>
            <div className={styles.formGroup}>
              <label>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Enter your email"
              />
            </div>
            <div className={styles.formGroup}>
              <label>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter your password"
              />
            </div>
            <button type="submit" className={styles.btn} disabled={loading}>
              Login
            </button>
          </form>
        {error && <p className={styles.error}>Error: {error.message}</p>}
        <p>
          Don't have an account? <Link href="/register">Register here</Link>
        </p>
      </div>
    </div>
    
  );
}