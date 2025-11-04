import "./signIN.css";
import logo from "../assets/logo2.png";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Alert from "@mui/material/Alert";

export default function signIN() {
  const [isSignup, setIsSignup] = useState(false);

  const [userName, setUserName] = useState("");
  const [Email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const [alertMsg, setAlertMsg] = useState(""); // <-- alert message
  const [alertType, setAlertType] = useState("info"); // <-- alert type (success,error,info,warning)

  const handleSubmit = async (e) => {
    e.preventDefault();

    // signup api

    if (isSignup) {
      const res = await fetch(
        "https://allorachat.onrender.com/api/user/signup",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userName, Email, password }),
        }
      );
      const data = await res.json();
      if (res.ok) {
        setAlertType("success");
        setAlertMsg(
          "🎉 Welcome to our chat app! Your account has been created."
        );

        localStorage.setItem("token", data.token);
        localStorage.setItem("userId", data.user._id);
        localStorage.setItem("userName", data.user.userName);
        setTimeout(() => {
          navigate("/");
        }, 1500);
      } else {
        setAlertType("error");
        setAlertMsg(data.message);
        setTimeout(() => setAlertMsg(""), 3000);
      }

      // signin api
    } else {
      const res = await fetch(
        "https://allorachat.onrender.com/api/user/signin",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userName, password }),
        }
      );
      const data = await res.json();
      if (res.ok) {
        setAlertType("success");
        setAlertMsg("👋 Welcome back! Great to see you again.");
        localStorage.setItem("token", data.token);
        localStorage.setItem("userId", data.user._id);
        localStorage.setItem("userName", data.user.userName);
        setTimeout(() => {
          navigate("/");
        }, 1500);
      } else {
        setAlertType("error");
        setAlertMsg(data.message);
        setTimeout(() => setAlertMsg(""), 3000);
      }
    }
  };

  return (
    <>
      <div className="page min-h-screen flex flex-col items-center justify-center p-4">
        {/* show some alert messages */}
        {alertMsg && (
          <Alert
            className=" md:w-96 p-8"
            severity={alertType}
            onClose={() => setAlertMsg("")}
            sx={{ mb: 2 }}
          >
            {alertMsg}
          </Alert>
        )}

        {/* logo */}
        <img
          className="logo mb-6 w-58 sm:w-70 md:w-90 drop-shadow-lg"
          src={logo}
          alt="logoImage"
        />

        {/* Signup Box */}
        <div className="w-full max-w-[20rem] sm:max-w-[25rem] md:max-w-[32rem] lg:max-w-[40rem] p-6 rounded-xl bg-white/30 shadow-inner backdrop-blur-md border border-white/40 flex flex-col">
          <h2 className="text-gray-800 text-2xl font-semibold mb-4 text-center">
            {isSignup ? "Sign Up" : "Sign In"}
          </h2>

          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="userName"
              required
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="px-3 py-2 rounded-md bg-white/70 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
            {isSignup && (
              <input
                type="email"
                placeholder="Email"
                required
                value={Email}
                onChange={(e) => setEmail(e.target.value)}
                className="px-3 py-2 rounded-md bg-white/70 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            )}

            <input
              type="password"
              placeholder="Password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="px-3 py-2 rounded-md bg-white/70 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
            <button
              type="submit"
              className="mt-2 py-2 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-semibold shadow-md hover:opacity-80 transition cursor-pointer"
            >
              {isSignup ? "Sign Up" : "Sign In"}
            </button>
          </form>

          {/* Sign In Link */}
          <p className="mt-4 text-center text-gray-700 text-sm">
            {isSignup ? "Have an account? " : "Don't have an account? "}
            <button
              onClick={() => {
                setIsSignup(!isSignup);
                setUserName("");
                setPassword("");
                setEmail("");
              }}
              className="text-orange-500 font-semibold hover:underline cursor-pointer"
            >
              {isSignup ? "Sign In" : "Sign Up"}
            </button>
          </p>
        </div>
      </div>
    </>
  );
}
