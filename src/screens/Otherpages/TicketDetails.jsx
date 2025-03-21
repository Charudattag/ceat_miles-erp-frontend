import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { format } from "date-fns";
import { getTicketById,IMG_URL } from "../../api/api";
import { Button } from "react-bootstrap";

const TicketDetails = () => {
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    fetchTicketDetails();
  }, []);

  const fetchTicketDetails = async () => {
    try {
      const response = await getTicketById(id);
      if (response.success) {
        setTicket(response.data);
      }
    } catch (error) {
      console.error("Error fetching ticket details:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderAttachment = (attachment) => {
    const fileExtension = attachment.split('.').pop().toLowerCase();
    
    if (fileExtension === 'pdf') {
      return (
        <div className="pdf-container" style={{ height: '600px', width: '100%' }}>
          <embed
            src={`${IMG_URL}/uploads/${attachment}`}
            type="application/pdf"
            width="100%"
            height="100%"
          />
        </div>
      );
    } else if (['jpg', 'jpeg', 'png', 'gif'].includes(fileExtension)) {
      return (
        <div className="image-container text-center" style={{ height: '600px', width: '100%' }}>
          <img
            src={`${IMG_URL}/uploads/${attachment}`}
            alt="Ticket Attachment"
            className="img-fluid"
            style={{ maxHeight: '600px' }}
          />
        </div>
      );
    }
    
    return <p>Unsupported file format</p>;
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="card">
      <div className="card-header d-flex justify-content-between align-items-center">
  <h4 className="mb-0">Ticket Details</h4>
  <Button
    variant='outline-primary'
    className='back-button'
    onClick={() => navigate('/tickets')}
  >
    <i className='fas fa-arrow-left me-2'></i>
    Back to Ticket
  </Button>
</div>

        <div className="card-body">
          <div className="row">
            <div className="col-md-6">
              <div className="mb-3">
                <label className="fw-bold">Ticket ID:</label>
                <p>{ticket?.ticket_id}</p>
              </div>
              <div className="mb-3">
                <label className="fw-bold">Title:</label>
                <p>{ticket?.title}</p>
              </div>
              <div className="mb-3">
                <label className="fw-bold">Description:</label>
                <p>{ticket?.description}</p>
              </div>
              <div className="mb-3">
                <label className="fw-bold">Dealer Code:</label>
                <p>{ticket?.dealer_code}</p>
              </div>
            </div>
            <div className="col-md-6">
              <div className="mb-3">
                <label className="fw-bold">Status:</label>
                <p>
                  <span className={`badge ${
                    ticket?.status === "PENDING" ? "bg-warning" :
                    ticket?.status === "IN-PROGRESS" ? "bg-info" : "bg-success"
                  }`}>
                    {ticket?.status}
                  </span>
                </p>
              </div>
              <div className="mb-3">
                <label className="fw-bold">Initiated By:</label>
                <p>{ticket?.initiated_by}</p>
              </div>
              <div className="mb-3">
                <label className="fw-bold">Created At:</label>
                <p>{ticket?.created_at && format(new Date(ticket.created_at), "dd/MM/yyyy HH:mm")}</p>
              </div>
              <div className="mb-3">
                <label className="fw-bold">Last Updated:</label>
                <p>{ticket?.updated_at && format(new Date(ticket.updated_at), "dd/MM/yyyy HH:mm")}</p>
              </div>
            </div>
          </div>
          {ticket?.attachment && (
            <div className="row mt-3">
              <div className="col-12">
                <label className="fw-bold">Attachment:</label>
                <div className="attachment-viewer mt-2 border rounded p-3">
                  {renderAttachment(ticket.attachment)}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TicketDetails;
