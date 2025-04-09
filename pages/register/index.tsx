import { useState } from 'react';
import Link from 'next/link';
import { useMutation, gql } from '@apollo/client';
import styles from '../../styles/Auth.module.css';
import Loading from '../components/Loading';
import { useRouter } from 'next/router';

const CREATE_USER = gql`
  mutation CreateUser($username: String!, $email: String!, $password: String!) {
    createUser(username: $username, email: $email, password: $password) {
      id
      username
      email
    }
  }
`;

export default function Register() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [createUser, { loading, error }] = useMutation(CREATE_USER);
  const router = useRouter();

  interface HandleChangeEvent extends React.ChangeEvent<HTMLInputElement> {}

  const handleChange = (e: HandleChangeEvent): void => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  interface HandleSubmitEvent extends React.FormEvent<HTMLFormElement> {}

  interface CreateUserVariables {
    username: string;
    email: string;
    password: string;
  }

  const handleSubmit = async (e: HandleSubmitEvent): Promise<void> => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords don't match!");
      return;
    }

    try {
      const { data } = await createUser({
        variables: {
          username: formData.username,
          email: formData.email,
          password: formData.password,
        } as CreateUserVariables,
      });
      //console.log('User created:', data?.createUser);
      alert('Registration successful!');
      setFormData({ username: '', email: '', password: '', confirmPassword: '' });
      setTimeout(() => router.push('/login'), 1000);
    } catch (err) {
      console.error('Error creating user:', err);
      alert('Registration failed: ' + (error?.message || 'Unknown error'));
    }
  };
  if (loading) return <Loading />;
  return (
    <div className={styles.screen}>
      <div className={styles.container}>
        <h2>Register</h2>
        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label>Username</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              placeholder="Choose a username"
            />
          </div>
          <div className={styles.formGroup}>
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="Enter your email"
            />
          </div>
          <div className={styles.formGroup}>
            <label>Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Create a password"
            />
          </div>
          <div className={styles.formGroup}>
            <label>Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              placeholder="Confirm your password"
            />
          </div>
          <button type="submit" className={styles.btn} disabled={loading}>
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>
        {error && <p className={styles.error}>Error: {error.message}</p>}
        <p>
          Already have an account?{' '}
          <Link href="/login">Login here</Link>
        </p>
      </div>
    </div>
    
  );
}