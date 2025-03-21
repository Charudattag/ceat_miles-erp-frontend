import React, { useState, useEffect } from "react";
import { Table, Form, Button, Modal, Badge } from "react-bootstrap";
import { toast, ToastContainer } from "react-toastify";
import { FaTrash, FaEdit } from "react-icons/fa";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";

import {
  addExceptionAPI,
  getAllexceptionAPI,
  getAllTicketAPI,
  deleteexceptionAPI,
  replaceplaceOrderAPI,
  getTicketDetailsAPI,
  getAddressesByDealerIdAPI,
  updateexceptionstatusAPI,
} from "../../../src/api/api";
import UpdateStatusModal from "./UpdateStatusModal";

const ExceptionM = () => {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedExceptionId, setSelectedExceptionId] = useState(null);
  const [exceptions, setExceptions] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [showReplaceModal, setShowReplaceModal] = useState(false);
  const [selectedException, setSelectedException] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedExceptionForStatus, setSelectedExceptionForStatus] =
    useState(null);

  const [newException, setNewException] = useState({
    ticket_id: "",
    exception_type: "DAMAGED",
    description: "",
    remark: "",
  });

  const exceptionTypes = ["DAMAGED", "DEFECTIVE", "WRONG_ITEM", "OTHER"];

  const fetchExceptions = async () => {
    try {
      const response = await getAllexceptionAPI();
      if (response.success) {
        setExceptions(response.data);
      }
    } catch (error) {
      toast.error("Error fetching exceptions");
    }
  };

  const fetchTickets = async () => {
    try {
      const response = await getAllTicketAPI();
      if (response.success) {
        setTickets(response.data.tickets);
      }
    } catch (error) {
      toast.error("Error fetching tickets");
    }
  };

  useEffect(() => {
    fetchExceptions();
    fetchTickets();
  }, []);

  const handleShowModal = () => setShowModal(true);
  const handleCloseModal = () => {
    setShowModal(false);
    setNewException({ ticket_id: "", exception_type: "DAMAGED" });
  };

  const handleShowDeleteModal = (id) => {
    setSelectedExceptionId(id);
    setShowDeleteModal(true);
  };

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setSelectedExceptionId(null);
  };

  const handleShowReplaceModal = (exception) => {
    setSelectedException(exception);
    setShowReplaceModal(true);
  };

  const handleCloseReplaceModal = () => {
    setShowReplaceModal(false);
    setSelectedException(null);
  };

  const handleInputChange = (e) => {
    setNewException({
      ...newException,
      [e.target.name]: e.target.value,
    });
  };

  const handleAddException = async () => {
    try {
      const response = await addExceptionAPI(newException);
      if (response.success) {
        toast.success("Exception created successfully");
        fetchExceptions();
        handleCloseModal();
      }
    } catch (error) {
      toast.error("Failed to create exception");
    }
  };

  const handleDeleteException = async () => {
    try {
      const response = await deleteexceptionAPI(selectedExceptionId);
      if (response.success) {
        toast.success("Exception deleted successfully");
        fetchExceptions();
        handleCloseDeleteModal();
      }
    } catch (error) {
      toast.error("Failed to delete exception");
    }
  };

  const handlePlaceReplacementOrder = async () => {
    try {
      if (!selectedException) {
        throw new Error("Invalid exception data");
      }

      // Get ticket details which contains product_id
      const ticketDetails = await getTicketDetailsAPI(
        selectedException.ticket_id
      );
      if (!ticketDetails.success || !ticketDetails.data) {
        throw new Error("Failed to fetch ticket details");
      }

      // Get dealer's default address
      const dealerAddressResponse = await getAddressesByDealerIdAPI(
        ticketDetails.data.dealer_code
      );

      if (
        !dealerAddressResponse.success ||
        !dealerAddressResponse.data.length
      ) {
        throw new Error("Dealer address not found");
      }

      // Create payload using product_id from ticket
      const payload = {
        cartItems: [
          {
            dealer_id: ticketDetails.data.dealer_code,
            product_id: ticketDetails.data.product_id, // Using product_id from ticket
            product_amount: selectedException.product_details.product_price,
            product_quantity: ticketDetails.data.product_quantity || 1,
            created_date: new Date().toISOString(),
          },
        ],
        dealerId: ticketDetails.data.dealer_code,
        exceptionId: selectedException.id,
      };

      console.log("Replacement Order Payload:", payload);
      const response = await replaceplaceOrderAPI(payload);

      if (response.success) {
        toast.success("Replacement order placed successfully");
        handleCloseReplaceModal();
        fetchExceptions();
      } else {
        throw new Error(response.message || "Failed to place order");
      }
    } catch (error) {
      console.error("Replacement Order Error:", error);
      toast.error(error.message);
    }
  };

  const handleUpdateStatus = async (exceptionId, newStatus) => {
    try {
      const response = await updateexceptionstatusAPI({
        exception_id: exceptionId,
        status: newStatus,
      });

      if (response.success) {
        toast.success("Status updated successfully");
        fetchExceptions();
        setShowStatusModal(false);
      }
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = exceptions.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(exceptions.length / itemsPerPage);

  return (
    <div className="container bg-white">
      <h2 className="my-4">Exception Management</h2>

      {/* <div className="d-flex justify-content-end mb-3">
        <Button variant="primary" onClick={handleShowModal}>
          Add Exception
        </Button>
      </div> */}

      <Table bordered hover responsive>
        <thead>
          <tr>
            <th>ID</th>
            <th>Ticket ID</th>
            <th>Order ID</th>
            <th>Exception Type</th>
            <th>Status</th>
            <th>Replacement Order</th>
            <th>Description</th>
            <th>Remark</th>
            <th>Product Details</th>
            <th>Exception Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {currentItems.length > 0 ? (
            currentItems.map((exception) => (
              <tr key={exception.id}>
                <td>{exception.id}</td>
                <td>
                  <Button
                    style={{ textDecoration: "none" }}
                    variant="link"
                    onClick={() => navigate(`/ticket/${exception.ticket_id}`)}
                  >
                    {exception.ticket_id}
                  </Button>
                </td>

                <td>
                  <Button
                    variant="link"
                    style={{ textDecoration: "none" }}
                    onClick={() =>
                      navigate(`/orderDetails/${exception.order_id}`)
                    }
                  >
                    {exception.order_id}
                  </Button>
                </td>

                <td>{exception.exception_type}</td>
                <td>
                  <div className="d-flex align-items-center gap-2">
                    <Badge
                      bg={
                        exception.status === "PENDING"
                          ? "warning"
                          : exception.status === "APPROVED"
                          ? "info"
                          : exception.status === "REJECTED"
                          ? "danger"
                          : exception.status === "REPLACED"
                          ? "success"
                          : "secondary"
                      }
                    >
                      {exception.status}
                    </Badge>
                    <FaEdit
                      size={14}
                      style={{ cursor: "pointer", color: "#666" }}
                      onClick={() => {
                        setSelectedExceptionForStatus(exception);
                        setShowStatusModal(true);
                      }}
                    />
                  </div>
                </td>

                <td>
                  {exception.status === "REPLACED" ? (
                    <Button
                      variant="link"
                      style={{ textDecoration: "none" }}
                      onClick={() =>
                        navigate(
                          `/replaceOrder/${exception.replacement_order_id}`
                        )
                      }
                    >
                      {exception.replacement_order_id}
                    </Button>
                  ) : (
                    "-"
                  )}
                </td>
                <td>{exception.description}</td>
                <td>{exception.remark}</td>
                <td>
                  {exception.product_details ? (
                    <div>
                      <p>Product: {exception.product_details.product_name}</p>
                      <p>Points: {exception.product_details.product_price}</p>
                      <p>
                        Quantity: {exception.product_details.product_quantity}
                      </p>
                    </div>
                  ) : (
                    <p>No product details available</p>
                  )}
                </td>
                <td>{new Date(exception.created_at).toLocaleDateString()}</td>
                <td>
                  <div className="d-flex gap-2">
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleShowDeleteModal(exception.id)}
                    >
                      <FaTrash />
                    </Button>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="10" className="text-center">
                No exceptions found
              </td>
            </tr>
          )}
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

      {/* Add Exception Modal */}
      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>Add Exception</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Select Ticket</Form.Label>
              <Form.Select
                name="ticket_id"
                value={newException.ticket_id}
                onChange={handleInputChange}
                required
              >
                <option value="">Select a ticket</option>
                {tickets.map((ticket) => (
                  <option key={ticket.ticket_id} value={ticket.ticket_id}>
                    {ticket.title}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Exception Type</Form.Label>
              <Form.Select
                name="exception_type"
                value={newException.exception_type}
                onChange={handleInputChange}
              >
                {exceptionTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="description"
                value={newException.description}
                onChange={handleInputChange}
                placeholder="Enter description"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Remark</Form.Label>
              <Form.Control
                type="text"
                name="remark"
                value={newException.remark}
                onChange={handleInputChange}
                placeholder="Enter remark"
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Close
          </Button>
          <Button variant="primary" onClick={handleAddException}>
            Create Exception
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={handleCloseDeleteModal}>
        <Modal.Header closeButton>
          <Modal.Title>Delete Exception</Modal.Title>
        </Modal.Header>
        <Modal.Body>Are you sure you want to delete this exception?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseDeleteModal}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteException}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showReplaceModal} onHide={handleCloseReplaceModal}>
        <Modal.Header closeButton>
          <Modal.Title>Place Replacement Order</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedException && selectedException.product_details ? (
            <div>
              <h5>Product Details:</h5>
              <p>Name: {selectedException.product_details.product_name}</p>
              <p>
                Quantity: {selectedException.product_details.product_quantity}
              </p>
              <p>Points: {selectedException.product_details.product_price}</p>
            </div>
          ) : (
            <p>No product details available</p>
          )}
          <p>Are you sure you want to place a replacement order?</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseReplaceModal}>
            Cancel
          </Button>
          <Button
            variant="success"
            onClick={handlePlaceReplacementOrder}
            disabled={!selectedException?.product_details}
          >
            Place Order
          </Button>
        </Modal.Footer>
      </Modal>
      <UpdateStatusModal
        show={showStatusModal}
        onHide={() => setShowStatusModal(false)}
        exceptionId={selectedExceptionForStatus?.id}
        currentStatus={selectedExceptionForStatus?.status}
        onUpdateStatus={handleUpdateStatus}
      />

      <ToastContainer />
    </div>
  );
};

export default ExceptionM;
