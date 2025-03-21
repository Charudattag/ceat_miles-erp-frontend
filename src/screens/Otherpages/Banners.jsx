// eslint-disable-next-line no-unused-vars
import React, { useState, useEffect, useCallback } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "react-toastify/dist/ReactToastify.css";
import { Modal, Button, Table } from "react-bootstrap";
import { FaPlus, FaCheck, FaTimes, FaEdit } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import Footer from "./Footer";
import {
  addAnnouncementAPI,
  getAllAnnouncementAPI,
  updateAnnouncementAPI,
  toggleAnnouncementStatusApi,
  IMG_URL,
} from "../../../src/api/api";
// import { Link } from 'react-router-dom'

function Banners() {
  const [banners, setBanners] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [formData, setFormData] = useState({
    title: "",
    description: "", // Changed from text
    img: null, // Changed from type
    link: "",
  });
  const [selectedAnnouncementId, setSelectedAnnouncementId] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null); // State for the selected image

  const fetchBanners = useCallback(async () => {
    try {
      const response = await getAllAnnouncementAPI(currentPage);
      if (response?.success) {
        setBanners(response.data);
        setTotalPages(response.pagination.totalPages);
        setTotalRecords(response.pagination.totalItems);
      }
    } catch (error) {
      console.error("Error fetching banners:", error);
    }
  }, [currentPage]);

  useEffect(() => {
    fetchBanners();
  }, [fetchBanners]);

  const handleEditClick = (announcement) => {
    setEditMode(true);
    setSelectedAnnouncementId(announcement.id);
    setFormData({
      title: announcement.title,
      description: announcement.description,
      link: announcement.link,
    });
    handleShowModal();
  };

  const handleShowModal = () => setShowModal(true);

  const handleCloseModal = () => {
    setShowModal(false);
    setEditMode(false);
    setFormData({
      title: "",
      description: "",
      link: "",
      img: null,
    });
    setSelectedImage(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddBanner = async () => {
    toast.dismiss();
    if (!formData.title || !formData.description) {
      toast.error("Please fill in required fields");
      return;
    }

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("title", formData.title);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("link", formData.link);
      if (selectedImage) {
        formDataToSend.append("attachment", selectedImage);
      }

      const response = await addAnnouncementAPI(formDataToSend);
      if (response?.success) {
        toast.success("Banner added successfully");
        fetchBanners();
        handleCloseModal();
      }
    } catch (error) {
      console.error("Error adding banner:", error);
      toast.error("An error occurred while adding the banner");
    }
  };

  const handleUpdateAnnouncement = async () => {
    toast.dismiss(); // Clear any existing toasts

    const formDataToSend = new FormData();
    formDataToSend.append("title", formData.title);
    formDataToSend.append("description", formData.description);
    formDataToSend.append("link", formData.link);

    if (selectedImage) {
      formDataToSend.append("attachment", selectedImage);
    }

    try {
      const response = await updateAnnouncementAPI(
        selectedAnnouncementId,
        formDataToSend
      );
      if (response?.success) {
        toast.success("Announcement updated successfully");
        fetchBanners();
        handleCloseModal();
      } else {
        toast.error(response?.message || "Failed to update announcement");
      }
    } catch (error) {
      console.error("Error updating announcement:", error);
      toast.error("Failed to update announcement");
    }
  };

  const handleImageChange = (e) => {
    setSelectedImage(e.target.files[0]);
  };

  // Handle toggle for is_active
  const handleToggleBannerStatus = async (id, newStatus) => {
    toast.dismiss();
    try {
      const response = await toggleAnnouncementStatusApi({
        id,
        is_active: newStatus,
      });
      console.log("API Response:", response); // Ensure correct data structure
      if (response?.success) {
        fetchBanners();
        toast.success("Status updated successfully");
      } else {
        toast.error("Failed to update status");
      }
    } catch (error) {
      console.error("Error toggling status:", error);
      toast.error("Failed to update status");
    }
  };

  return (
    <div className="container bg-white">
      <h2 className="text-left mb-4">Announcement Management</h2>
      <Button
        variant="primary"
        onClick={handleShowModal}
        className="mb-3 d-flex gap-2"
        style={{ marginLeft: "85%" }}
      >
        <FaPlus />
        Announcement
      </Button>

      <Table bordered hover>
        <thead>
          <tr>
            <th>Sr.No</th>
            <th>Title</th>
            <th>Subtitle</th>
            <th>Link</th>
            <th>Image</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {banners.map((banner, index) => (
            <tr key={banner.id}>
              <td>{index + 1}</td>
              <td>{banner.title}</td>
              <td>{banner.description}</td>
              <td>{banner.link}</td>
              <td>
                {banner.img && (
                  <img
                    src={`${IMG_URL}/uploads/${banner.img}`}
                    alt=""
                    style={{ height: "50px", width: "50px" }}
                  />
                )}
              </td>
              <td style={{ minWidth: "20px" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <div
                    style={{
                      width: "20px",
                      height: "20px",
                      border: `2px solid ${
                        banner.is_active ? "#28a745" : "#dc3545"
                      }`,
                      backgroundColor: banner.is_active ? "#28a745" : "#dc3545",
                      borderRadius: "3px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                    onClick={() =>
                      handleToggleBannerStatus(banner.id, !banner.is_active)
                    }
                  >
                    <span style={{ color: "white", fontSize: "14px" }}>
                      {banner.is_active ? (
                        <FaCheck style={{ color: "white", fontSize: "12px" }} />
                      ) : (
                        <FaTimes style={{ color: "white", fontSize: "12px" }} />
                      )}
                    </span>
                  </div>
                  &nbsp; &nbsp; &nbsp;
                  <Button
                    variant="warning"
                    onClick={() => handleEditClick(banner)}
                    className="d-flex align-items-center gap-2"
                  >
                    <FaEdit />
                    Edit
                  </Button>
                </div>
              </td>

              {/* Rest of the columns */}
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Banner Modal */}
      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>
            {editMode ? "Update Banner" : "Add New Banner"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="mb-3">
            <label htmlFor="title" className="form-label">
              Title <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              className="form-control"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
            />
          </div>
          <div className="mb-3">
            <label htmlFor="description" className="form-label">
              Description <span className="text-danger">*</span>
            </label>
            <textarea
              className="form-control"
              id="description"
              name="description"
              rows="3"
              value={formData.description}
              onChange={handleInputChange}
            ></textarea>
          </div>
          <div className="mb-3">
            <label htmlFor="image" className="form-label">
              Banner Image
            </label>
            <input
              type="file"
              className="form-control"
              id="image"
              onChange={handleImageChange}
              accept="image/*"
            />
          </div>
          <div className="mb-3">
            <label htmlFor="link" className="form-label">
              Link
            </label>
            <input
              type="text"
              className="form-control"
              id="link"
              name="link"
              value={formData.link}
              onChange={handleInputChange}
            />
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Close
          </Button>
          <Button
            variant="primary"
            onClick={editMode ? handleUpdateAnnouncement : handleAddBanner}
          >
            {editMode ? "Update" : "Add"} Announcement
          </Button>
        </Modal.Footer>
      </Modal>

      <Footer />
      {/* Pagination */}
      <div className="d-flex justify-content-between align-items-center mt-3 mb-4">
        <div>
          Showing {banners.length} of {totalRecords} entries
        </div>
        <ul className="pagination">
          <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
            <button
              className="page-link"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            >
              Previous
            </button>
          </li>
          {[...Array(totalPages)].map((_, index) => (
            <li
              key={index + 1}
              className={`page-item ${
                currentPage === index + 1 ? "active" : ""
              }`}
            >
              <button
                className="page-link"
                onClick={() => setCurrentPage(index + 1)}
              >
                {index + 1}
              </button>
            </li>
          ))}
          <li
            className={`page-item ${
              currentPage === totalPages ? "disabled" : ""
            }`}
          >
            <button
              className="page-link"
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
            >
              Next
            </button>
          </li>
        </ul>
      </div>
      <ToastContainer />
    </div>
  );
}

export default Banners;
