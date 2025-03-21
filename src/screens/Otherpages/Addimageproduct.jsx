import React, { useState, useEffect } from "react";
import { Button, Modal, Form, Table, Container } from "react-bootstrap";
import { useParams, Link } from "react-router-dom";
import {
  uploadImageAPI,
  getByproductIdAPI,
  deleteProductImageAPI,
  updateProductImageAPI,
  IMG_URL
} from "../../../src/api/api";
import { toast, ToastContainer } from "react-toastify";

const ProductImage = () => {
  const { productId } = useParams();
  const [image, setImage] = useState(null);
  const [video, setVideo] = useState(null); // Added state for video
  const [imageList, setImageList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [type, setType] = useState("P_image");
  const [priority, setPriority] = useState(0);
  const [editingImage, setEditingImage] = useState(null);

  // Fetch product details by ID
  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        const response = await getByproductIdAPI(productId);
        if (response?.data) {
          // Sort images by priority before setting the state
          const sortedImages = response.data.sort(
            (a, b) => a.priority - b.priority
          );
          setImageList(sortedImages);
        } else {
          setImageList([]);
        }
      } catch (error) {
        console.error("Error fetching Product details:", error);
      }
    };

    fetchProductDetails();
  }, [productId]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (type === "P_image" || type === "B_image") {
      setImage(file);
    } else if (type === "P_video" || type === "B_video") {
      setVideo(file);
    }
  };

  // const BASE_URL = "http://147.93.31.166:8010";

  const handleImageUpload = async () => {
    if ((!image && type === "P_image") || (!video && type === "P_video")) {
      toast.error("Please fill in all the required fields.");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    if (image) formData.append("images", image);
    if (video) formData.append("videos", video);
    formData.append("productId", parseInt(productId, 10));
    formData.append("type", type);
    formData.append("priority", priority);

    try {
      const response = await uploadImageAPI(formData);
      if (response?.data) {
        setImageList((prevList) => {
          const updatedList = [...prevList, response.data];
          return updatedList.sort((a, b) => a.priority - b.priority); // Sort after adding new item
        });
        setImage(null);
        setVideo(null);
        setShowModal(false);
        toast.success("Image/Video uploaded successfully.");
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      toast.error("Failed to upload file.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteImage = async (id) => {
    try {
      await deleteProductImageAPI(id);
      setImageList((prevList) => {
        const updatedList = prevList.filter((item) => item.id !== id);
        return updatedList.sort((a, b) => a.priority - b.priority); // Sort after deletion
      });
      toast.success("Image/Video deleted successfully.");
    } catch (error) {
      console.error("Error deleting image/video:", error);
      toast.error("Failed to delete image/video.");
    }
  };

  const handleEditImage = (item) => {
    setEditingImage(item);
    setType(item.type);
    setPriority(item.priority);
    setShowModal(true);
  };

  const handleUpdateImage = async () => {
    setLoading(true);

    const formData1 = new FormData();
    if (image) formData1.append("images", image);
    if (video) formData1.append("video", video);
    formData1.append("productId", parseInt(productId, 10));
    formData1.append("type", type);
    formData1.append("priority", priority);
    formData1.append("id", editingImage.id);

    try {
      const response = await updateProductImageAPI(formData1);
      if (response?.data) {
        setImageList((prevList) => {
          const updatedList = prevList.map((item) =>
            item.id === editingImage.id ? { ...item, ...response.data } : item
          );
          return updatedList.sort((a, b) => a.priority - b.priority); // Sort after update
        });
        setImage(null);
        setVideo(null);
        setShowModal(false);
        setEditingImage(null);
        toast.success("Image/Video updated successfully.");
      }
    } catch (error) {
      console.error("Error updating image/video:", error);
      toast.error("Failed to update image/video.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container bg-white">
      <h1>Upload Product Image</h1>
      <Container style={{ marginLeft: "90%" }}>
        <Link to={"/product"} style={{ textDecoration: "none" }}>
          <span className="text-danger">Back</span>
        </Link>
      </Container>

      <Button variant="primary" onClick={() => setShowModal(true)}>
        Add Image/Video
      </Button>

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            {editingImage
              ? "Update Product Image/Video"
              : "Upload Prodcut Image/Video"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="type">
              <Form.Label>Type <span className="text-danger">*</span></Form.Label>
              <Form.Control
                as="select"
                value={type}
                onChange={(e) => setType(e.target.value)}
              >
                <option value="P_image">Product Image </option>
                <option value="P_video">Product Video</option>
              </Form.Control>
            </Form.Group>

            <Form.Group controlId="priority">
              <Form.Label>Priority <span className="text-danger">*</span></Form.Label>
              <Form.Control
                type="number"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                min={0}
              />
            </Form.Group>

            <Form.Group controlId="image">
              <Form.Label>Image 800*800 <span className="text-danger">*</span></Form.Label>
              <Form.Control
                type="file"
                name="images"
                onChange={handleFileChange}
                accept="image/*"
              />
            </Form.Group>

            <Form.Group controlId="video">
              <Form.Label>Video</Form.Label>
              <Form.Control
                type="file"
                name="video"
                onChange={handleFileChange}
                accept="videos/*"
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Close
          </Button>
          <Button
            variant="primary"
            onClick={editingImage ? handleUpdateImage : handleImageUpload}
            disabled={loading}
          >
            {loading
              ? "Uploading..."
              : editingImage
              ? "Update Image/Video"
              : "Upload Image/Video"}
          </Button>
        </Modal.Footer>
      </Modal>

      <div className="mt-4">
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>ID</th>
              <th>Image/Video</th>
              <th>Priority</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {imageList.length > 0 ? (
              imageList.map((item) => (
                <tr key={item.id}>
                  <td>{item.id}</td>
                  <td>
                    {item.type === "P_image" && (
                      <img
                        src={`${IMG_URL}/uploads/${item.image}`}
                        alt="product"
                        style={{ width: "50px", height: "auto" }}
                      />
                    )}
                    {item.type === "P_video" && (
                      <video width="50" controls>
                        <source
                          src={`${IMG_URL}/uploads/${item.video}`}
                          type="video/mp4"
                        />
                      </video>
                    )}
                  </td>
                  <td>{item.priority}</td>
                  <td>
                    <Button
                      variant="warning"
                      size="sm"
                      onClick={() => handleEditImage(item)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDeleteImage(item.id)}
                      style={{ marginLeft: "8px" }}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4">No images or videos uploaded</td>
              </tr>
            )}
          </tbody>
        </Table>
      </div>
      <ToastContainer/>
    </div>
  );
};

export default ProductImage;
