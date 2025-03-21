import React, { useState, useEffect, useCallback } from "react";
import { Table, Form, Button, Modal } from "react-bootstrap";
import { FaSearch, FaPlus, FaEdit, FaTrash } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  addMediaAPI,
  getAllMediaAPI,
  deleteMediaAPI,
  IMG_URL,
  getAllproductsAPI,
} from "../../../src/api/api";

const Category = () => {
  const [showModal, setShowModal] = useState(false);
  const [mediaType, setMediaType] = useState("image");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [mediaList, setMediaList] = useState([]);
  const [productList, setProductList] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [newMedia, setNewMedia] = useState({
    product_id: "",
    media_file: null,
  });

  const fetchMedia = useCallback(async () => {
    try {
      const response = await getAllMediaAPI(currentPage);
      if (response?.data?.media) {
        setMediaList(response.data.media);
        setTotalPages(response.data.pagination.totalPages);
      }
    } catch (error) {
      toast.error("Error fetching media");
    }
  }, [currentPage]);

  useEffect(() => {
    fetchMedia();
  }, [fetchMedia]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await getAllproductsAPI();
        if (response.success && response.data.products) {
          setProductList(response.data.products);
        } else {
          toast.error("Failed to fetch products.");
        }
      } catch (error) {
        toast.error("Error fetching products.");
      }
    };
    fetchProducts();
  }, []);

  const handleCloseModal = () => {
    setShowModal(false);
    setNewMedia({ product_id: "", media_file: null });
  };

  const handleFileChange = (e) => {
    setNewMedia({ ...newMedia, media_file: e.target.files[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newMedia.product_id || !newMedia.media_file) {
      toast.error("Please fill all required fields!");
      return;
    }
    try {
      const formData = new FormData();
      formData.append("product_id", newMedia.product_id);

      // Append file to the correct field based on media type
      if (mediaType === "image") {
        formData.append("images", newMedia.media_file);
      } else if (mediaType === "video") {
        formData.append("videos", newMedia.media_file);
      } else if (mediaType === "pdf") {
        formData.append("pdf", newMedia.media_file);
      }

      const response = await addMediaAPI(formData);
      if (response.success) {
        toast.success("Media uploaded successfully!");
        fetchMedia();
        handleCloseModal();
      } else {
        toast.error(response.message || "Error uploading media");
      }
    } catch (error) {
      toast.error("Failed to upload media");
    }
  };

  const handleDeleteMedia = async (mediaId) => {
    try {
      const response = await deleteMediaAPI(mediaId);
      if (response.success) {
        toast.success("Media deleted successfully");
        fetchMedia();
      } else {
        toast.error(response.message || "Failed to delete media");
      }
    } catch (error) {
      toast.error("Error deleting media");
    }
  };

  // Filter media list based on search query
  const filteredMediaList = mediaList.filter((media) =>
    media.product_id.toString().includes(searchQuery)
  );

  return (
    <div className="container bg-white">
      <h2 className="my-4">Media Management</h2>

      <div className="d-flex justify-content-between mb-3">
        <Form.Control
          type="text"
          placeholder="Search by Product ID"
          className="w-50"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <Button variant="primary" onClick={() => setShowModal(true)}>
          <FaPlus /> Add Media
        </Button>
      </div>

      <Table bordered hover>
        <thead>
          <tr>
            <th>#</th>
            <th>Product ID</th>
            <th>Media Type</th>
            <th>Preview</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredMediaList.map((media, index) => (
            <tr key={media.id || index}>
              <td>{index + 1}</td>
              <td>{media.product_id}</td>
              <td>{media.type}</td>
              <td>
                {media.type === "IMAGE" ? (
                  <img
                    src={`${IMG_URL}/uploads/${media.name}`}
                    alt={media.name}
                    style={{
                      width: "50px",
                      height: "50px",
                      objectFit: "cover",
                    }}
                  />
                ) : media.type === "VIDEO" ? (
                  <video width="50" height="50" controls>
                    <source
                      src={`${IMG_URL}/uploads/${media.name}`}
                      type="video/mp4"
                    />
                  </video>
                ) : (
                  <a
                    href={`${IMG_URL}/uploads/${media.name}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View PDF
                  </a>
                )}
              </td>
              <td>
                <Button
                  variant="danger"
                  onClick={() => handleDeleteMedia(media.id)}
                >
                  <FaTrash />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {totalPages > 1 && (
        <div className="d-flex justify-content-center mt-3">
          <Button
            variant="outline-primary"
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <span className="mx-3 pt-2">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline-primary"
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      )}

      <Modal show={showModal} onHide={handleCloseModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Add Media</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Product ID</Form.Label>
              <Form.Select
                name="product_id"
                value={newMedia.product_id}
                onChange={(e) =>
                  setNewMedia({ ...newMedia, product_id: e.target.value })
                }
                required
              >
                <option value="">Select Product</option>
                {productList.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.product_name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Media Type</Form.Label>
              <Form.Select
                value={mediaType}
                onChange={(e) => setMediaType(e.target.value)}
                required
              >
                <option value="image">Image</option>
                <option value="video">Video</option>
                <option value="pdf">PDF</option>
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Upload File</Form.Label>
              <Form.Control
                type="file"
                accept={
                  mediaType === "image"
                    ? "image/*"
                    : mediaType === "video"
                    ? "video/*"
                    : "application/pdf"
                }
                onChange={handleFileChange}
                required
              />
            </Form.Group>
            <div className="d-flex justify-content-end">
              <Button variant="secondary" onClick={handleCloseModal}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" className="ms-2">
                Save
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
      <ToastContainer />
    </div>
  );
};

export default Category;
