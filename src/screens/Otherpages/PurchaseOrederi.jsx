import React, { useState, useEffect, useCallback } from "react";
import { Table, Form, Button, Modal } from "react-bootstrap";
import { FaPlus, FaEdit, FaTrash } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  addpurchaseorderAPI,
  getAllpurchaseAPI,
  updatePurchaseOrderAPI,
  deletePurchaseorderAPI,
  IMG_URL,
} from "../../api/api";
import { useNavigate } from "react-router-dom";

const PurchaseOrder = () => {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [newOrder, setNewOrder] = useState({
    po_no: "",
    date: "",
    valid_from: "",
    valid_to: "",
    image: null,
  });

  const fetchPurchaseOrders = useCallback(async () => {
    try {
      const response = await getAllpurchaseAPI();
      if (response) {
        setPurchaseOrders(response.purchaseOrders);
      }
    } catch (error) {
      toast.error("Error fetching purchase orders");
    }
  }, []);

  useEffect(() => {
    fetchPurchaseOrders();
  }, [fetchPurchaseOrders]);

  const handleInputChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === "file") {
      setNewOrder((prev) => ({
        ...prev,
        [name]: files[0],
      }));
    } else {
      setNewOrder((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const resetForm = () => {
    setNewOrder({
      po_no: "",
      date: "",
      valid_from: "",
      valid_to: "",
    });
    setIsEditing(false);
    setSelectedId(null);
    setShowModal(false);
  };

  const handleEdit = (order) => {
    setIsEditing(true);
    setSelectedId(order.id);
    setNewOrder({
      po_no: order.po_no || "",
      date: order.date ? new Date(order.date).toISOString().split("T")[0] : "",
      valid_from: order.valid_from
        ? new Date(order.valid_from).toISOString().split("T")[0]
        : "",
      valid_to: order.valid_to
        ? new Date(order.valid_to).toISOString().split("T")[0]
        : "",
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    try {
      await deletePurchaseorderAPI(id);
      toast.success("Purchase order deleted successfully");
      fetchPurchaseOrders();
      setShowDeleteModal(false);
    } catch (error) {
      toast.error("Failed to delete purchase order");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("po_no", newOrder.po_no);
      formData.append("date", newOrder.date);
      formData.append("valid_from", newOrder.valid_from);
      formData.append("valid_to", newOrder.valid_to);
      if (newOrder.image) {
        formData.append("image", newOrder.image);
      }

      if (isEditing) {
        await updatePurchaseOrderAPI({
          id: selectedId,
          formData: formData,
        });
        toast.success("Purchase order updated successfully");
      } else {
        if (
          !newOrder.po_no ||
          !newOrder.date ||
          !newOrder.valid_from ||
          !newOrder.valid_to
        ) {
          toast.error("All fields are required for new purchase order");
          return;
        }
        await addpurchaseorderAPI(formData);
        toast.success("Purchase order created successfully");
      }
      fetchPurchaseOrders();
      resetForm();
    } catch (error) {
      toast.error(
        isEditing
          ? "Failed to update purchase order"
          : "Failed to create purchase order"
      );
    }
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = Array.isArray(purchaseOrders)
    ? purchaseOrders.slice(indexOfFirstItem, indexOfLastItem)
    : [];
  const totalPages = Math.ceil(
    (Array.isArray(purchaseOrders) ? purchaseOrders.length : 0) / itemsPerPage
  );

  return (
    <div className="container bg-white p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Purchase Orders</h2>
        <Button variant="primary" onClick={() => setShowModal(true)}>
          <FaPlus /> New Purchase Order
        </Button>
      </div>

      <Table striped bordered hover>
        <thead>
          <tr>
            <th>PO Number</th>
            <th>Date</th>
            <th>Valid From</th>
            <th>Valid To</th>
            <th>Image</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {currentItems.map((order) => (
            <tr key={order.id}>
              <td
                style={{
                  color: "blue",
                  cursor: "pointer",
                  textDecoration: "none",
                }}
                onClick={() => navigate(`/purchaseOrderItem/${order.id}`)}
              >
                {order.po_no}
              </td>
              <td>{new Date(order.date).toLocaleDateString()}</td>
              <td>{new Date(order.valid_from).toLocaleDateString()}</td>
              <td>{new Date(order.valid_to).toLocaleDateString()}</td>
              <td>
                {order.image &&
                  (order.image.toLowerCase().endsWith(".pdf") ? (
                    <a
                      href={`${IMG_URL}/uploads/${order.image}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-sm btn-primary"
                    >
                      View PDF
                    </a>
                  ) : (
                    <img
                      src={`${IMG_URL}/uploads/${order.image}`}
                      alt="Purchase Order"
                      style={{
                        width: "50px",
                        height: "50px",
                        objectFit: "contain",
                      }}
                    />
                  ))}
              </td>
              <td>
                <Button
                  variant="warning"
                  className="me-2"
                  onClick={() => handleEdit(order)}
                >
                  <FaEdit />
                </Button>
                <Button
                  variant="danger"
                  onClick={() => {
                    setSelectedId(order.id);
                    setShowDeleteModal(true);
                  }}
                >
                  <FaTrash />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <nav aria-label="Page navigation" className="mt-4">
        <ul className="pagination justify-content-center">
          <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
            <button
              className="page-link"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </button>
          </li>
          {[...Array(totalPages)].map((_, index) => (
            <li
              key={index}
              className={`page-item ${
                currentPage === index + 1 ? "active" : ""
              }`}
            >
              <button
                className="page-link"
                onClick={() => handlePageChange(index + 1)}
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
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </li>
        </ul>
      </nav>

      <Modal show={showModal} onHide={resetForm}>
        <Modal.Header closeButton>
          <Modal.Title>
            {isEditing ? "Edit Purchase Order" : "Create Purchase Order"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>PO Number</Form.Label>
              <Form.Control
                type="text"
                name="po_no"
                value={newOrder.po_no}
                onChange={handleInputChange}
                required={!isEditing}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Date</Form.Label>
              <Form.Control
                type="date"
                name="date"
                value={newOrder.date}
                onChange={handleInputChange}
                required={!isEditing}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Valid From</Form.Label>
              <Form.Control
                type="date"
                name="valid_from"
                value={newOrder.valid_from}
                onChange={handleInputChange}
                required={!isEditing}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Valid To</Form.Label>
              <Form.Control
                type="date"
                name="valid_to"
                value={newOrder.valid_to}
                onChange={handleInputChange}
                required={!isEditing}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Upload Image/PDF</Form.Label>
              <Form.Control
                type="file"
                name="image"
                onChange={handleInputChange}
                accept="image/*,.pdf" // Allow both image and PDF files
              />
            </Form.Group>

            <div className="d-flex justify-content-end gap-2">
              <Button variant="secondary" onClick={resetForm}>
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                {isEditing ? "Update" : "Create"}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete this purchase order?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={() => handleDelete(selectedId)}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>

      <ToastContainer />
    </div>
  );
};

export default PurchaseOrder;
