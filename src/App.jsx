import "./App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Homepage from "./pages/homepage";
import SignIN from "./pages/signIN";
import ProtectRoute from "./pages/ProtectRoute";

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          {/* root path / show signin or signup page  */}
          <Route path="/signin" element={<SignIN />} />
          <Route
            path="/"
            element={
              <ProtectRoute>
                <Homepage />
              </ProtectRoute>
            }
          />
          <Route path="*" element={<Navigate to="/signin" />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
