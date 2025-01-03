"use client";
import { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import axios from 'axios';

const API_BASE_URL = 'http://localhost/pos/POS/api';

export default function Home() {
  const [errorMessage, setErrorMessage] = useState("");
  const [testMessage, setTestMessage] = useState("Système de Caisse");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Clear any stale data on page load
    localStorage.clear();
    sessionStorage.clear();

    const checkAuth = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/auth.php`, {
          withCredentials: true
        });
        
        // If already authenticated, redirect based on role
        if (response.data.success && response.data.user) {
          const user = response.data.user;
          localStorage.setItem('user', JSON.stringify(user));
          
          switch (user.role.toLowerCase()) {
            case 'manager':
            case 'admin':
              router.push('/management');
              break;
            case 'waiter':
              router.push('/waiter/orders');
              break;
            case 'kitchen':
              router.push('/kitchen');
              break;
          }
        }
      } catch (error) {
        // Only log the error if it's not a 401 (unauthorized)
        if (error.response?.status !== 401) {
          console.error('Auth check failed:', error);
          setErrorMessage("Erreur de connexion au serveur");
        }
      }
    };

    checkAuth();
  }, [router]);

  const handleRFIDSubmit = async (e) => {
    if (e.key !== "Enter") return;

    const rfid = e.target.value.trim();
    if (!rfid) return;

    try {
      setLoading(true);
      setErrorMessage("");

      const response = await axios.post(`${API_BASE_URL}/auth.php`, 
        { rfid }, 
        {
          headers: { 'Content-Type': 'application/json' },
          withCredentials: true
        }
      );

      if (response.data.success && response.data.user) {
        const user = response.data.user;
        localStorage.setItem('user', JSON.stringify(user));
        
        // Handle different roles for redirection
        switch (user.role.toLowerCase()) {
          case 'manager':
          case 'admin':
            router.push('/management');
            break;
          case 'waiter':
            router.push('/waiter/orders');
            break;
          case 'kitchen':
            router.push('/kitchen');
            break;
          default:
            throw new Error("Role non reconnu");
        }
      } else {
        throw new Error(response.data.message || "RFID invalide");
      }
    } catch (error) {
      console.error('Login error:', error);
      setErrorMessage(error.message || "Erreur de connexion");
      e.target.value = ''; // Clear input on error
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">{testMessage}</h1>
          <p className="text-gray-600 mt-2">
            Passez votre badge RFID pour vous connecter
          </p>
        </div>

        {errorMessage && (
          <div 
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
            role="alert"
          >
            <span className="block sm:inline">{errorMessage}</span>
          </div>
        )}

        <div className="space-y-4">
          <input
            type="text"
            autoFocus
            className="opacity-0 absolute"
            onKeyPress={handleRFIDSubmit}
            disabled={loading}
            placeholder="RFID"
          />
          <div className="border-4 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <svg
              className="mx-auto h-16 w-16 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
              />
            </svg>
            <p className="mt-4 text-lg text-gray-600">
              {loading ? "Authentification en cours..." : "En attente du badge RFID..."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
