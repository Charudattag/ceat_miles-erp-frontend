import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  FaHome,
  FaUsers,
  FaBars,
  FaProductHunt,
  FaSignOutAlt,
  FaFileInvoiceDollar,
} from "react-icons/fa";
import { LiaImageSolid } from "react-icons/lia";
import { TbCategoryPlus } from "react-icons/tb";
import { HiOutlineShoppingCart, HiAnnotation } from "react-icons/hi";
import { IoImagesOutline } from "react-icons/io5";
import { MdErrorOutline } from "react-icons/md";
import "./Sidebar.scss";

const Sidebar = () => {
  const location = useLocation();
  const [isMinimized, setIsMinimized] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const sidebarRef = useRef(null);
  const username = localStorage.getItem("username");

  const getFilteredMenuItems = () => {
    if (username === "Milind") {
      return [
        {
          header: "Home",
          links: [
            {
              label: "Dashboard",
              path: "/dashboard",
              icon: FaHome,
            },
          ],
        },
        {
          header: "About Ceat Miles",
          links: [
            {
              label: "Orders",
              path: "/orders",
              icon: HiOutlineShoppingCart,
            },
            {
              label: "Exception",
              path: "/ExceptionM",
              icon: MdErrorOutline,
            },
          ],
        },
        {
          header: "",
          links: [
            {
              label: "Tickets",
              path: "/tickets",
              icon: HiAnnotation,
            },
            {
              label: "Logout",
              path: "/",
              icon: FaSignOutAlt,
              onClick: () => {
                localStorage.removeItem("authToken");
                localStorage.removeItem("username");
              },
            },
          ],
        },
      ];
    }

    return [
      {
        header: "Home",
        links: [
          {
            label: "Dashboard",
            path: "/dashboard",
            icon: FaHome,
          },
        ],
      },
      {
        header: "About Ceat Miles",
        links: [
          // {
          //   label: "Orders",
          //   path: "/orders",
          //   icon: HiOutlineShoppingCart,
          // },
          {
            label: "Products",
            path: "/product",
            icon: FaProductHunt,
          },
          // {
          //   label: "Dealers",
          //   path: "/dealers",
          //   icon: FaUsers,
          // },
          // {
          //   label: "ProductImage",
          //   path: "/category",
          //   icon: TbCategoryPlus,
          // },
          {
            label: "BulkProductImport",
            path: "/bulkProductImport",
            icon: LiaImageSolid,
          },
          // {
          //   label: "Banner",
          //   path: "/All-Banners",
          //   icon: IoImagesOutline,
          // },
          // {
          //   label: "PurchaseOrder",
          //   path: "/purchaseOrder",
          //   icon: FaFileInvoiceDollar,
          // },
          // {
          //   label: "Exception",
          //   path: "/exception",
          //   icon: MdErrorOutline,
          // },
        ],
      },
      {
        header: "",
        links: [
          // {
          //   label: "Tickets",
          //   path: "/tickets",
          //   icon: HiAnnotation,
          // },
          {
            label: "Logout",
            path: "/",
            icon: FaSignOutAlt,
            onClick: () => {
              localStorage.removeItem("authToken");
              localStorage.removeItem("username");
            },
          },
        ],
      },
    ];
  };

  const toggleSidebar = () => {
    setIsMinimized(!isMinimized);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [sidebarRef]);

  useEffect(() => {
    if (isMobileMenuOpen) {
      setIsMobileMenuOpen(false);
    }
  }, [location]);

  return (
    <div>
      <div
        className="mobile-menu-toggle d-lg-none"
        onClick={toggleMobileMenu}
        style={{ position: "fixed", top: "15px", left: "4px", zIndex: 80 }}
      >
        <FaBars />
      </div>

      <div
        className={`sidebar bg-white ${isMinimized ? "minimized" : ""} ${
          isMobileMenuOpen ? "open" : ""
        }`}
        ref={sidebarRef}
      >
        <div className="minimize-button" onClick={toggleSidebar}>
          <FaBars />
        </div>

        {getFilteredMenuItems().map((section, idx) => (
          <div className="sidebar-section" key={idx}>
            <p className="sidebar-header mb-2">
              {!isMinimized && section.header}
            </p>
            <ul className="list-unstyled">
              {section.links.map((link, linkIdx) => (
                <li key={linkIdx}>
                  <Link
                    to={link.path}
                    className={`sidebar-link ${
                      location.pathname === link.path ? "active" : ""
                    }`}
                    onClick={link.onClick}
                  >
                    <link.icon className="me-2 icon" />
                    {!isMinimized && link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
