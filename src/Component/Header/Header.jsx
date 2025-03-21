import { FaBell } from "react-icons/fa";
import { IoMdLogOut } from "react-icons/io";

import "./Header.scss"; // Importing SCSS file
import logo from "../../assets/logo/logo.png";
import { useNavigate } from "react-router-dom";

const Header = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("authToken");

    navigate("/");
  };

  return (
    <header className="header d-flex justify-content-between align-items-center p-3 shadow-sm">
      <div className="logo-section">
        <img
          src={logo}
          alt="Logo"
          className="logo"
          style={{ width: "150px" }}
        />
        {/* <h4 className="company-name">Gajraj Jewellers</h4> */}
      </div>
      <div className="user-section d-flex align-items-center">
        {/* <FaBell className="icon-bell me-3" /> */}
        <IoMdLogOut onClick={handleLogout} className="icon-user" />
      </div>
    </header>
  );
};

export default Header;
