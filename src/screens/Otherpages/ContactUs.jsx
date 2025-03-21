import React, { useState, useEffect } from "react";
import axios from "axios";
import { format } from "date-fns";
import "bootstrap/dist/css/bootstrap.min.css";
import { FaEdit } from "react-icons/fa";
import {
  getAllTicketAPI,
  getTicketById,
  createTicketAPI,
  updateTicketAPI,
  IMG_URL,
} from "../../api/api";
import { Table, Button } from "react-bootstrap";
import { Link } from "react-router-dom";

const ContactUs = () => {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [newStatus, setNewStatus] = useState("");
  const [textReply, setTextReply] = useState("");
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTicket, setNewTicket] = useState({
    title: "",
    description: "",
    dealer_code: "",
    attachment: null,
  });

  const limit = 10;

  const handleFileChange = (e) => {
    setNewTicket({
      ...newTicket,
      attachment: e.target.files[0],
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("title", newTicket.title);
    formData.append("description", newTicket.description);
    formData.append("dealer_code", newTicket.dealer_code);
    if (newTicket.attachment) {
      formData.append("attachment", newTicket.attachment);
    }

    try {
      const response = await createTicketAPI(formData);
      if (response.success) {
        setShowAddModal(false);
        fetchInquiries();
        setNewTicket({
          title: "",
          description: "",
          dealer_code: "",
          attachment: null,
        });
      }
    } catch (error) {
      console.error("Error creating ticket:", error);
    }
  };

  const handleStatusUpdate = async () => {
    try {
      const response = await updateTicketAPI({
        id: selectedInquiry.ticket_id,
        status: { status: newStatus, textreply: textReply },
      });
      if (response.success) {
        console.log("Status updated successfully");
        fetchInquiries(currentPage);
        setShowModal(false);
        setTextReply("");
      }
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const fetchInquiries = async (page = 1) => {
    setLoading(true);
    try {
      const response = await getAllTicketAPI(page, limit); // Added limit parameter
      if (response.success) {
        setInquiries(response.data.tickets);
        setTotalPages(response.data.pagination.totalPages);
        setCurrentPage(response.data.pagination.currentPage);
      }
    } catch (error) {
      console.error("Error fetching tickets:", error);
    }
    setLoading(false);
  };

  const handleEdit = (inquiry) => {
    setSelectedInquiry(inquiry);
    setNewStatus(inquiry.Status);
    setTextReply("");
    setShowModal(true);
  };

  useEffect(() => {
    fetchInquiries();
  }, []);

  const handlePageChange = (page) => {
    fetchInquiries(page);
  };

  return (
    <div className="container bg-white">
      <h1 className="mb-4">Customer Tickets</h1>
      <div>
        <Button variant="primary" onClick={() => setShowAddModal(true)}>
          Add Ticket
        </Button>
      </div>
      &nbsp; &nbsp;
      {loading ? (
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : inquiries.length === 0 ? (
        <div className="alert alert-info text-center" role="alert">
          No inquiries found at the moment.
        </div>
      ) : (
        <>
          <div className="table-responsive">
            <Table bordered hover>
              <thead className="table">
                <tr>
                  <th>Ticket Id</th>
                  <th>Title</th>
                  <th>Description</th>
                  <th>Dealer Code</th>
                  <th>Order Id</th>
                  <th>Status</th>
                  <th>Initiated By</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {inquiries.map((ticket) => (
                  <tr key={ticket.ticket_id}>
                    <td>{ticket.ticket_id}</td>
                    <td>{ticket.title}</td>
                    <td>{ticket.description}</td>
                    <td>{ticket.dealer_code}</td>
                    <td>{ticket.order_id}</td>
                    <td>
                      <span
                        className={`badge ${
                          ticket.status === "PENDING"
                            ? "bg-warning"
                            : ticket.status === "IN-PROGRESS"
                            ? "bg-info"
                            : "bg-success"
                        }`}
                      >
                        {ticket.status}
                      </span>
                    </td>
                    <td>{ticket.initiated_by}</td>
                    <td>
                      {format(new Date(ticket.created_at), "dd/MM/yyyy HH:mm")}
                    </td>
                    <td>
                      {" "}
                      <FaEdit
                        onClick={() => handleEdit(ticket)}
                        style={{ cursor: "pointer", marginLeft: "10px" }}
                      />
                      &nbsp; &nbsp; &nbsp;
                      <Link
                        to={`/ticket/${ticket.ticket_id}`}
                        className="btn btn-info btn-sm"
                      >
                        View Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
          <div
            className={`modal ${showModal ? "show" : ""}`}
            style={{ display: showModal ? "block" : "none" }}
          >
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Update Status</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowModal(false)}
                  ></button>
                </div>
                <div className="modal-body">
                  <select
                    className="form-select"
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                  >
                    <option value="PENDING">PENDING</option>
                    <option value="IN_PROGRESS">IN-PROGRESS</option>
                    <option value="RESOLVED">RESOLVED</option>
                  </select>
                  {newStatus === "RESOLVED" && (
                    <div className="mb-3">
                      <label className="form-label">Reply (optional)</label>
                      <textarea
                        className="form-control"
                        value={textReply}
                        onChange={(e) => setTextReply(e.target.value)}
                        placeholder="Type your reply here..."
                        required
                      />
                    </div>
                  )}
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowModal(false)}
                  >
                    Close
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleStatusUpdate}
                  >
                    Save changes
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div
            className={`modal ${showDetailsModal ? "show" : ""}`}
            style={{ display: showDetailsModal ? "block" : "none" }}
          >
            <div className="modal-dialog modal-lg">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Ticket Details</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowDetailsModal(false)}
                  ></button>
                </div>
                <div className="modal-body">
                  {selectedTicket && (
                    <div className="container">
                      <div className="row">
                        <div className="col-md-6">
                          <div className="mb-3">
                            <label className="fw-bold">Ticket ID:</label>
                            <p>{selectedTicket.ticket_id}</p>
                          </div>
                          <div className="mb-3">
                            <label className="fw-bold">Title:</label>
                            <p>{selectedTicket.title}</p>
                          </div>
                          <div className="mb-3">
                            <label className="fw-bold">Description:</label>
                            <p>{selectedTicket.description}</p>
                          </div>
                          <div className="mb-3">
                            <label className="fw-bold">Dealer Code:</label>
                            <p>{selectedTicket.dealer_code}</p>
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="mb-3">
                            <label className="fw-bold">Status:</label>
                            <p>
                              <span
                                className={`badge ${
                                  selectedTicket.status === "PENDING"
                                    ? "bg-warning"
                                    : selectedTicket.status === "IN-PROGRESS"
                                    ? "bg-info"
                                    : "bg-success"
                                }`}
                              >
                                {selectedTicket.status}
                              </span>
                            </p>
                          </div>
                          <div className="mb-3">
                            <label className="fw-bold">Initiated By:</label>
                            <p>{selectedTicket.initiated_by}</p>
                          </div>
                          <div className="mb-3">
                            <label className="fw-bold">Created At:</label>
                            <p>
                              {format(
                                new Date(selectedTicket.created_at),
                                "dd/MM/yyyy HH:mm"
                              )}
                            </p>
                          </div>
                          <div className="mb-3">
                            <label className="fw-bold">Last Updated:</label>
                            <p>
                              {format(
                                new Date(selectedTicket.updated_at),
                                "dd/MM/yyyy HH:mm"
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                      {selectedTicket.attachment && (
                        <div className="row mt-3">
                          <div className="col-12">
                            <label className="fw-bold">Attachment:</label>
                            <div className="attachment-viewer mt-2 border rounded p-3">
                              {renderAttachment(selectedTicket.attachment)}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowDetailsModal(false)}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>

          <nav aria-label="Page navigation" className="mt-4">
            <ul className="pagination justify-content-center">
              <li
                className={`page-item ${currentPage === 1 ? "disabled" : ""}`}
              >
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
        </>
      )}
      <div
        className={`modal ${showAddModal ? "show" : ""}`}
        style={{ display: showAddModal ? "block" : "none" }}
      >
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Create New Ticket</h5>
              <button
                type="button"
                className="btn-close"
                onClick={() => setShowAddModal(false)}
              ></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Title</label>
                  <input
                    type="text"
                    className="form-control"
                    value={newTicket.title}
                    onChange={(e) =>
                      setNewTicket({ ...newTicket, title: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Description</label>
                  <textarea
                    className="form-control"
                    value={newTicket.description}
                    onChange={(e) =>
                      setNewTicket({
                        ...newTicket,
                        description: e.target.value,
                      })
                    }
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Dealer Code</label>
                  <input
                    type="text"
                    className="form-control"
                    value={newTicket.dealer_code}
                    onChange={(e) =>
                      setNewTicket({
                        ...newTicket,
                        dealer_code: e.target.value,
                      })
                    }
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Attachment</label>
                  <input
                    type="file"
                    className="form-control"
                    onChange={handleFileChange}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowAddModal(false)}
                >
                  Close
                </button>
                <button type="submit" className="btn btn-primary">
                  Create Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;
