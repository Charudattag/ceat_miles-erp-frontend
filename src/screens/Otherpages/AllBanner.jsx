import React, { useState, useEffect, useCallback } from "react";
import { Table, Form, Button, Modal } from "react-bootstrap";
import { FaPlus, FaEdit, FaTrash } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./AllBanner.css";

import {
  addBannerAPI,
  getAllBannersAPI,
  updateBannerAPI,
  deleteBannersAPI,
  activateBanner,
  IMG_URL,
} from "../../../src/api/api";

const BannerForm = () => {
  const [showModal, setShowModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [banners, setBanners] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [selectedBannerId, setSelectedBannerId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [bannerToDelete, setBannerToDelete] = useState(null);
  const [newBanner, setNewBanner] = useState({
    type: "CATEGORYBANNER",
    image: null,
  });

  const bannerTypes = ["CATEGORYBANNER", "PRODUCTBANNER"];

  const getBannerResolution = (type) => {
    return type === "CATEGORYBANNER" ? "333 × 434" : "1920 × 508";
  };

  const validateImageDimensions = (file, type) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = URL.createObjectURL(file);
      img.onload = () => {
        if (type === "CATEGORYBANNER") {
          resolve(img.width === 333 && img.height === 434);
        } else {
          resolve(img.width === 1920 && img.height === 508);
        }
      };
    });
  };

  const handleActivateToggle = async (bannerId) => {
    setIsLoading(true);
    try {
      const response = await activateBanner(bannerId);
      if (response.success) {
        toast.success(response.message);
        await fetchBanners();
      } else {
        toast.error(response.message || "Failed to update banner status");
      }
    } catch (error) {
      toast.error("Error updating banner status");
    }
    setIsLoading(false);
  };

  const getBannerTypeStyle = (type) => {
    const styles = {
      CATEGORYBANNER: { color: "#007bff", fontWeight: "bold" },
      PRODUCTBANNER: { color: "#28a745", fontWeight: "bold" },
    };
    return styles[type] || {};
  };

  const fetchBanners = useCallback(async () => {
    try {
      const bannersData = await getAllBannersAPI(currentPage);
      if (bannersData?.banners) {
        setBanners(bannersData.banners);
        setTotalPages(bannersData.pagination.totalPages);
      }
    } catch (error) {
      toast.error("Error fetching banners");
    }
  }, [currentPage]);

  useEffect(() => {
    fetchBanners();
  }, [fetchBanners]);

  const handleShowModal = () => setShowModal(true);

  const handleCloseModal = () => {
    setShowModal(false);
    setEditMode(false);
    setNewBanner({ type: "CATEGORYBANNER", image: null });
    setSelectedBannerId(null);
  };

  const handleShowDeleteModal = (bannerId) => {
    setBannerToDelete(bannerId);
    setShowDeleteModal(true);
  };

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setBannerToDelete(null);
  };

  const handleTypeChange = (e) => {
    setNewBanner((prev) => ({
      ...prev,
      type: e.target.value,
      image: null,
    }));
  };

  const handleImageChange = async (e) => {
    if (e.target.files[0]) {
      setNewBanner((prev) => ({
        ...prev,
        image: e.target.files[0],
      }));
      if (isValidDimensions) {
      } else {
        toast.error(
          `Image must be ${getBannerResolution(newBanner.type)} pixels`
        );
        e.target.value = null;
      }
    }
  };

  const handleAddBanner = async () => {
    if (!newBanner.image) {
      toast.error("Banner image is required");
      return;
    }

    const formData = new FormData();
    formData.append("type", newBanner.type);
    formData.append("image", newBanner.image);

    try {
      const response = await addBannerAPI(formData);
      if (response.success) {
        toast.success("Banner added successfully");
        await fetchBanners();
        handleCloseModal();
      } else {
        toast.error(response.message || "Failed to add banner");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error adding banner");
    }
  };

  const handleEditBanner = (banner) => {
    console.log("Editing banner ID:", banner.id); // Debugging log
    setEditMode(true);
    setSelectedBannerId(banner.id);
    setNewBanner({
      type: banner.type,
      image: null,
    });
    handleShowModal();
  };

  const handleUpdateBanner = async () => {
    console.log("Selected Banner ID:", selectedBannerId);

    if (!selectedBannerId) {
      toast.error("Banner ID is required");
      return;
    }

    const formData = new FormData();
    formData.append("type", newBanner.type);
    if (newBanner.image) {
      formData.append("image", newBanner.image);
    }

    try {
      const response = await updateBannerAPI({
        id: selectedBannerId,
        formData,
      });

      if (response.success) {
        toast.success("Banner updated successfully");
        await fetchBanners();
        handleCloseModal();
      } else {
        toast.error(response.message || "Failed to update banner");
      }
    } catch (error) {
      console.error("Update error:", error);
      toast.error(error.response?.data?.message || "Error updating banner");
    }
  };

  const handleConfirmDelete = async () => {
    try {
      const response = await deleteBannersAPI(bannerToDelete);
      if (response.success) {
        toast.success("Banner deleted successfully");
        await fetchBanners();
      } else {
        toast.error(response.message || "Failed to delete banner");
      }
    } catch (error) {
      toast.error("Error deleting banner");
    }
    handleCloseDeleteModal();
  };

  return (
    <div className="container bg-white">
      <h2 className="my-4">Banner Management</h2>

      <div className="d-flex justify-content-end mb-3">
        <Button variant="primary" onClick={handleShowModal}>
          <FaPlus /> Add Banner
        </Button>
      </div>

      <Table bordered hover responsive>
        <thead>
          <tr>
            <th>Sr No.</th>
            <th>Banner Type</th>
            <th>Resolution</th>
            <th>Image</th>
            <th>Active</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {banners.length > 0 ? (
            banners.map((banner, index) => (
              <tr key={banner.id || index}>
                <td>{index + 1}</td>
                <td style={getBannerTypeStyle(banner.type)}>{banner.type}</td>
                <td>{getBannerResolution(banner.type)}</td>
                <td>
                  <img
                    src={`${IMG_URL}/uploads/${banner.image}`}
                    alt={banner.type}
                    style={{
                      width: "150px",
                      height: "100px",
                      objectFit: "contain",
                      cursor: "pointer",
                    }}
                    onClick={() =>
                      window.open(
                        `${IMG_URL}/uploads/${banner.image}`,
                        "_blank"
                      )
                    }
                  />
                </td>
                <td>
                  <Form.Check
                    type="switch"
                    id={`banner-switch-${banner.id}`}
                    checked={banner.is_active}
                    onChange={() => handleActivateToggle(banner.id)}
                    disabled={isLoading}
                    className="custom-switch"
                  />
                </td>

                <td>
                  <Button
                    variant="warning"
                    onClick={() => handleEditBanner(banner)}
                    className="me-2"
                  >
                    <FaEdit />
                  </Button>
                  <Button
                    variant="danger"
                    onClick={() => handleShowDeleteModal(banner.id)}
                  >
                    <FaTrash />
                  </Button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" className="text-center">
                No banners found
              </td>
            </tr>
          )}
        </tbody>
      </Table>

      <Modal show={showModal} onHide={handleCloseModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>{editMode ? "Edit Banner" : "Add Banner"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={(e) => e.preventDefault()}>
            <Form.Group className="mb-3">
              <Form.Label>
                Type <span className="text-danger">*</span>
              </Form.Label>
              <Form.Select
                value={newBanner.type}
                onChange={handleTypeChange}
                required
                style={getBannerTypeStyle(newBanner.type)}
              >
                {bannerTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>
                Image <span className="text-danger">*</span>
              </Form.Label>
              <Form.Text className="text-muted d-block mb-2">
                Required resolution: {getBannerResolution(newBanner.type)}{" "}
                pixels
              </Form.Text>
              <Form.Control
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                required={!editMode}
              />
            </Form.Group>

            <div className="d-flex justify-content-end">
              <Button
                variant="secondary"
                onClick={handleCloseModal}
                className="me-2"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                onClick={editMode ? handleUpdateBanner : handleAddBanner}
              >
                {editMode ? "Update" : "Save"}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      <Modal show={showDeleteModal} onHide={handleCloseDeleteModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Are you sure you want to delete this banner?</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseDeleteModal}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleConfirmDelete}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>

      <div className="d-flex justify-content-center mt-3 mb-4">
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
};

export default BannerForm;
