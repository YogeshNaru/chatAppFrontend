import { socket } from "./socket";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import logoai from "../assets/logoai.png";
import Alert from "@mui/material/Alert";

export default function Homepage() {
  const [user, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);
  const bottomref = useRef(null);

  const [alertMsg, setAlertMsg] = useState(""); // <-- alert message
  const [alertType, setAlertType] = useState("info"); // <-- alert type (success,error,info,warning)

  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const handleLogout = () => {
    setAlertType("success");
    setAlertMsg("👋 See you soon!");
    localStorage.clear();
    setTimeout(() => {
      navigate("/signin");
    }, 1500);
  };

  // Register this user with socket
  useEffect(() => {
    if (userId) socket.emit("register", userId);
  }, [userId]);

  // Fetch All users
  useEffect(() => {
    fetch("https://allorachat.onrender.com/api/user/all", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setUsers(data.filter((u) => u._id !== userId)))
      .catch((err) => {
        console.error("Error fetching users:", err);
      });
  }, []);

  // all users online or offline status in users array
  useEffect(() => {
    socket.on("online-users", (list) => {
      setUsers((prev) =>
        prev.map((u) => ({
          ...u,
          online: list.includes(u._id),
        }))
      );
    });
  });

  // Fetch chat messages when selecteduser changed show chat userid and selecteduserid
  useEffect(() => {
    if (!selectedUser) return;
    fetch(
      `https://allorachat.onrender.com/api/chat?user1=${userId}&user2=${selectedUser._id}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    )
      .then((res) => res.json())
      .then((data) => setChat(data))
      .catch((err) => {
        console.log("error fetching chats", err);
      });
  }, [selectedUser]);

  // Receive new messages in real time
  useEffect(() => {
    socket.on("receive-message", (msg) => {
      if (
        (msg.sender._id === userId && msg.receiver._id === selectedUser._id) ||
        (msg.sender._id === selectedUser._id && msg.receiver._id === userId)
      ) {
        setChat((prev) => [...prev, msg]);
      }
    });
    return () => {
      socket.off("receive-message");
    };
  }, [selectedUser]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (!message.trim() || !selectedUser) return;
    socket.emit("send-message", {
      message,
      senderId: userId,
      receiverId: selectedUser._id,
    });
    setMessage("");
  };

  useEffect(() => {
    bottomref.current?.scrollIntoView({ behavior: "auto" });
  }, [chat]);

  return (
    <>
      {/* Main container: 
        - On mobile: 'flex-col' (Sidebar and Chat stacked)
        - On desktop: 'md:flex-row' (Sidebar and Chat side-by-side)
      */}
      <div className="flex flex-col md:flex-row h-screen w-screen bg-gradient-to-r from-[#fff8f4] to-[#ffe5d3] md:p-4 shadow-md">
        {/* === Sidebar === */}
        {/* - On mobile: 'w-full'. Hidden if a user is selected ('hidden md:flex').
          - On desktop: 'md:w-1/4' (25% width). Always visible.
        */}

        <div
          className={`flex flex-col ${
            selectedUser ? "hidden md:flex" : "flex "
          } w-full  bg-gradient-to-r from-[#fff8f4] to-[#ffe5d3] p-2 shadow-md md:w-1/3 md:p-4 lg:w-1/4`}
        >
          {/* Sidebar Header */}

          {/* show some alert messages */}
          {alertMsg && (
            <Alert
              className="md:w-98 m-8"
              severity={alertType}
              onClose={() => setAlertMsg("")}
              sx={{ mb: 2 }}
            >
              {alertMsg}
            </Alert>
          )}

          <div className="flex justify-between items-center p-2 border-b border-gray-900">
            <h3 className="text-xl font-semibold">Chats</h3>
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-3 py-1 rounded-md text-sm
                         hover:bg-red-600 focus:outline-none focus:ring-2 
                         focus:ring-red-400"
            >
              Logout
            </button>
          </div>

          {/* User List */}
          <div className="overflow-y-auto flex-1">
            {user.map((u) => (
              <div
                key={u._id}
                onClick={() => setSelectedUser(u)}
                className={`p-3 cursor-pointer hover:bg-[#ffd9b3] rounded-md mt-2 ${
                  selectedUser?._id === u._id ? "font-bold bg-[#ffd9b3]" : ""
                }`}
              >
                <img
                  className="w-13 h-13 rounded-full object-cover inline-block "
                  src={
                    u.avatarUrl ||
                    `https://api.dicebear.com/7.x/initials/png?seed=${u.userName}`
                  }
                  alt="avatarImg"
                />
                <span className="px-4">{u.userName}</span>
                <span
                  className={
                    u.online
                      ? "text-green-600 text-sm"
                      : "text-gray-500 text-sm"
                  }
                >
                  {u.online ? "Online" : "Offline"}
                </span>
                <hr className="mt-2 text-gray-400" />
              </div>
            ))}
          </div>
        </div>

        {/* === Chat Window === */}
        {/* - On mobile: Hidden if no user is selected ('hidden md:flex'). Takes 'w-full'.
          - On desktop: Always visible ('md:flex'). Takes 'flex-1'.
        */}
        <div
          className={` bg-gradient-to-tr from-[#f6d365] to-[#fda085] ${
            selectedUser ? "flex" : "hidden md:flex"
          } w-full md:flex-1 flex-col h-full`}
        >
          {/* Chat Header */}
          <div className="flex-none sticky top-0 z-10 text-center p-4 bg-white/30 backdrop-blur-sm border-b border-gray-300 shadow-sm">
            {/* Mobile-only Back Button */}
            <button
              onClick={() => setSelectedUser(null)}
              className="md:hidden absolute left-4 top-1/2 -translate-y-1/2 
                 bg-gray-200 px-3 py-1 rounded-md hover:bg-gray-300"
            >
              Back
            </button>

            <h3
              className="text-lg font-semibold"
              style={{ fontFamily: "cursive" }}
            >
              {selectedUser
                ? `Chat with ${selectedUser.userName}`
                : "Select a user"}
            </h3>
          </div>

          {/* Message Area */}
          <div
            className="flex-1 overflow-y-auto p-2 md:m-3 md:p-4 
               md:rounded-lg bg-white/50 backdrop-blur-sm shadow-inner"
          >
            {selectedUser ? (
              chat.map((msg) => (
                <div
                  key={msg._id}
                  className={`flex mb-2 ${
                    msg.sender._id === userId ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`py-2 px-3 rounded-xl shadow-md inline-block max-w-[70%] ${
                      msg.sender._id === userId
                        ? "bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white"
                        : "bg-[#e9ecef] text-[#343a40]"
                    }`}
                  >
                    <strong className="block text-sm">
                      {msg.sender._id === userId ? "You" : msg.sender.userName}
                    </strong>
                    {msg.message}

                    {msg.image && (
                      <img
                        src={msg.image}
                        alt="chat-img"
                        className="mt-2 rounded-lg max-w-[280px]"
                      />
                    )}
                    <span className="block text-xs  mt-1 py-1 text-right">
                      {new Date(msg.createdAt).toLocaleTimeString([], {
                        day: "2-digit",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex  items-center justify-center h-full">
                <img
                  src={logoai}
                  alt="logo"
                  className="h-1/2 w-1/3 object-contain"
                />
                <p
                  className="text-xl font-medium"
                  style={{ fontFamily: "cursive" }}
                >
                  Select a user and start chatting...💬
                </p>
              </div>
            )}
            <div ref={bottomref} />
          </div>

          {/* Input Form */}
          {selectedUser && (
            <form
              onSubmit={sendMessage}
              className="flex-none sticky bottom-0 z-10 flex p-3 bg-white/30 backdrop-blur-sm"
            >
              <input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 p-3 border border-gray-300 rounded-l-full 
                   focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <button
                type="submit"
                className="p-3 bg-blue-500 text-white rounded-r-full 
                   hover:bg-blue-600 focus:outline-none focus:ring-1 
                   focus:ring-blue-500"
              >
                Send
              </button>
            </form>
          )}
        </div>
      </div>
    </>
  );
}
