import React, { useState, useEffect } from "react";
import { Button, Modal, Form, Table, Container } from "react-bootstrap";
import { useParams, Link } from "react-router-dom";
import {
  uploadImageAPI,
  getByBannerIdAPI,
  deleteProductImageAPI,
  updateProductImageAPI,
  IMG_URL
} from "../../../src/api/api";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const BannerImage = () => {
  const { bannerId } = useParams();
  const [image, setImage] = useState(null);
  const [imageList, setImageList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [type, setType] = useState("B_image");
  const [priority, setPriority] = useState(0);
  const [editingImage, setEditingImage] = useState(null);

  // Fetch banner details by ID
  useEffect(() => {
    const fetchBannerDetails = async () => {
      try {
        const response = await getByBannerIdAPI(bannerId);
        if (response?.data) {
          setImageList(response.data);
        } else {
          setImageList([]);
        }
      } catch (error) {
        console.error("Error fetching banner details:", error);
      }
    };

    fetchBannerDetails();
  }, [bannerId]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
  };

  const handleImageUpload = async () => {
    if (!image) {
      toast.error("Please upload an image.");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("images", image);
    formData.append("bannerId", parseInt(bannerId, 10));
    formData.append("type", type);
    formData.append("priority", priority);

    try {
      const response = await uploadImageAPI(formData);
      if (response?.data) {
        setImageList((prevList) => [...prevList, response.data]);
        setImage(null);
        setShowModal(false);
        toast.success("Image uploaded successfully.");
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Failed to upload image.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateImage = async () => {
    // if (!image) {
    //   toast.error("Please upload an image.");
    //   return;
    // }

    setLoading(true);

    const formData1 = new FormData();
    formData1.append("images", image);
    formData1.append("bannerId", parseInt(bannerId, 10));
    formData1.append("type", type);
    formData1.append("priority", priority);
    formData1.append("id", editingImage.id);

    try {
      const response = await updateProductImageAPI(formData1);

      if (response?.data) {
        setImageList((prevList) =>
          prevList.map((item) =>
            item.id === editingImage.id ? { ...item, ...response.data } : item
          )
        );
        setImage(null);
        setShowModal(false);
        setEditingImage(null); // Reset editing image
        toast.success("Image updated successfully.");
      }
    } catch (error) {
      console.error("Error updating image:", error);
      toast.error("Failed to update image.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteImage = async (id) => {
    try {
      await deleteProductImageAPI(id);
      setImageList((prevList) => prevList.filter((item) => item.id !== id));
      toast.success("Image deleted successfully.");
    } catch (error) {
      console.error("Error deleting image:", error);
      toast.error("Failed to delete image.");
    }
  };

  const handleEditImage = (item) => {
    setEditingImage(item);
    setType(item.type);
    setPriority(item.priority);
    setShowModal(true);
  };

  return (
    <div>
      <h1>Upload Banner Image</h1>
      <Container style={{ marginLeft: "90%" }}>
        <Link to={"/banners"} style={{ textDecoration: "none" }}>
          <span className="text-danger">Back</span>
        </Link>
      </Container>

      {/* Button to trigger modal */}
      <Button variant="primary" onClick={() => setShowModal(true)}>
        Add Image
      </Button>

      {/* Modal for uploading/updating image */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            {editingImage ? "Update Banner Image" : "Upload Banner Image"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="type">
              <Form.Label>Type</Form.Label>
              <Form.Control
                as="select"
                value={type}
                onChange={(e) => setType(e.target.value)}
              >
                <option value="B_image"> Shop Banner Image</option>

                <option value="H_image">Slider Image</option>

                <option value="HS_image">Home Section Image</option>
              </Form.Control>
            </Form.Group>

            <Form.Group controlId="priority">
              <Form.Label>Priority</Form.Label>
              <Form.Control
                type="number"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                min={1}
              />
            </Form.Group>

            <Form.Group controlId="image">
              <Form.Label>Image</Form.Label>
              <Form.Control
                type="file"
                onChange={handleImageChange}
                accept="image/*"
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
              ? "Update Image"
              : "Upload Image"}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Table to display uploaded images */}
      <div>
        <h3>Uploaded Images</h3>
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>ID</th>
              <th>Image</th>
              <th>Priority</th>
              <th>type</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {imageList.length > 0 ? (
              imageList.map((item) => (
                <tr key={item.id}>
                  <td>{item.id}</td>
                  <td>
                    {item.image && (
                      <img
                        src={`${IMG_URL}/uploads/${item.image}`}
                        alt="Banner Image"
                        style={{ width: "50px", height: "auto" }}
                      />
                    )}
                  </td>
                  <td>{item.priority}</td>
                  <td>
                    {item.type === "B_image" && "Shop Banner Image"}
                    {item.type === "H_image" && "Slider Image"}
                    {item.type === "HS_image" && "Home Section Image"}
                    {item.type === "B_video" && "Shop Banner Video"}
                    {item.type === "H_video" && "Slider Video"}
                    {item.type === "HS_video" && "Home Section Video"}
                  </td>

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
                <td colSpan="4">No images uploaded</td>
              </tr>
            )}
          </tbody>
        </Table>
      </div>

      {/* Toast Container for Notifications */}
      <ToastContainer />
    </div>
  );
};

export default BannerImage;
