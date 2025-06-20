import React, { useState } from "react";
import { signUp, confirmSignUp, resendSignUpCode } from "aws-amplify/auth";
import { cognitoErrorToItalian } from "../helpers/cognitoErrorHelper";
import axios from "axios";
import "../styles/Register.css";

const Register = () => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmationCode, setConfirmationCode] = useState("");

  // Genera un profileImageId casuale tra avatar0 e avatar4
  const getRandomAvatarId = () => {
    const n = Math.floor(Math.random() * 5);
    return `avatar${n}`;
  };

  // Capitalizza la prima lettera di ogni parola
  const capitalizeWords = (str) =>
    str
      .split(" ")
      .filter(Boolean)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(" ");

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsSubmitting(true);

    if (!fullName.trim().includes(" ")) {
      setError("Inserire nome intero");
      setIsSubmitting(false);
      return;
    }

    try {
      const profileImageId = getRandomAvatarId();
      const capitalizedFullName = capitalizeWords(fullName.trim());
      // 1. Registrazione Cognito
      await signUp({
        username: email,
        password,
        options: {
          userAttributes: {
            email,
            name: capitalizedFullName,
            "custom:profileImageId": profileImageId,
          },
        },
      });

      // 2. Chiamata alla funzione Lambda per inserire l'utente nel DB
      await axios.post(`${process.env.REACT_APP_BACKEND_URL}/users`, {
        full_name: capitalizedFullName,
        email,
        profileImageId,
      });

      setSuccess(
        "Registrazione avvenuta! Controlla la tua email per confermare"
      );
      setShowConfirm(true);
    } catch (err) {
      setError(cognitoErrorToItalian(err.message || err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirm = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      await confirmSignUp({ username: email, confirmationCode });
      setSuccess("Account confermato! Ora puoi effettuare il login");
      // Reindirizza alla pagina di login dopo la conferma
      window.location.href = "/login";
      setShowConfirm(false);
      setFullName("");
      setEmail("");
      setPassword("");
      setConfirmationCode("");
    } catch (err) {
      setError(cognitoErrorToItalian(err.message || err));
    }
  };

  const handleResendCode = async () => {
    setError("");
    setSuccess("");
    try {
      await resendSignUpCode({ username: email });
      setSuccess("Codice di conferma inviato di nuovo!");
    } catch (err) {
      setError(cognitoErrorToItalian(err.message || err));
    }
  };

  return (
    <div className="register-container">
      <h1 className="auth-section-title">Registrazione</h1>
      {!showConfirm ? (
        <form className="register-form" onSubmit={handleRegister}>
          <label>
            <p>Nome completo:</p>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              maxLength={255}
              placeholder="Nome e Cognome"
              disabled={isSubmitting}
            />
          </label>
          <label>
            <p>Email:</p>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              maxLength={255}
              placeholder="Email"
              disabled={isSubmitting}
            />
          </label>
          <label>
            <p>Password:</p>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              placeholder="Password"
              disabled={isSubmitting}
            />
          </label>
          <button
            type="submit"
            className="register-button"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Registrando..." : "Registrati"}
          </button>
          <div className="login-section">
            <p className="login-label">Hai già un account?</p>
            <button
              type="button"
              className="login-link-button"
              onClick={() => (window.location.href = "/login")}
              disabled={isSubmitting}
            >
              Accedi
            </button>
          </div>
          {error && <div className="message error">{error}</div>}
          {success && <div className="message success">{success}</div>}
        </form>
      ) : (
        <form className="register-form" onSubmit={handleConfirm}>
          <label>
            <p>Codice di conferma:</p>
            <input
              type="text"
              value={confirmationCode}
              onChange={(e) => setConfirmationCode(e.target.value)}
              required
              maxLength={6}
              placeholder="Codice"
            />
          </label>
          <button type="submit" className="register-button">
            Conferma account
          </button>
          <button
            type="button"
            className="register-button"
            style={{ background: "#888", marginTop: 10 }}
            onClick={handleResendCode}
          >
            Invia di nuovo il codice
          </button>
          {error && <div className="message error">{error}</div>}
          {success && <div className="message success">{success}</div>}
        </form>
      )}
    </div>
  );
};

export default Register;
