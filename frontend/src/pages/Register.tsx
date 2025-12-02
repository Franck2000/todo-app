import { useState } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/auth/register", { email, password });
      setMessage("Compte créé avec succès !");
      setTimeout(() => navigate("/"), 1000);
    } catch (err: any) {
      setMessage(err.response?.data?.message || "Erreur lors de la création");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6">Créer un compte</h1>

        <form onSubmit={handleRegister} className="space-y-4">
          <input
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            type="password"
            placeholder="Mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {message && (
            <p className="text-blue-600 text-sm">{message}</p>
          )}

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
          >
            S'inscrire
          </button>
        </form>

        <p className="text-center mt-4">
          Déjà un compte ?{" "}
          <span
            className="text-blue-600 cursor-pointer hover:underline"
            onClick={() => navigate("/")}
          >
            Se connecter
          </span>
        </p>
      </div>
    </div>
  );
}
