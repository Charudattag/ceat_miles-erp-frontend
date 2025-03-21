import { Outlet } from "react-router-dom";
import "./Layout.scss"; // Ensure this file contains the dashboard styles
import Header from "../Header/Header";
import Sidebar from "../Sidebar/Sidebar";

const Layout = () => {
  return (
    <div
      className="dashboard d-flex flex-column"
      style={{ minHeight: "100vh" }}
    >
      <Header />
      <div
        className="dashboard-body d-flex flex-grow-1"
        style={{ minHeight: "0" }}
      >
        <Sidebar />
        <div
          className="main-content p-4 w-100"
          style={{ overflowY: "auto" ,backgroundColor:'#f0f0f1' }}
        >
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Layout;
