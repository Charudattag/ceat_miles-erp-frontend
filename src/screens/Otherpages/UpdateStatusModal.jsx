import React from "react";
import { Modal, Button, Form } from "react-bootstrap";

const UpdateStatusModal = ({
  show,
  onHide,
  exceptionId,
  currentStatus,
  onUpdateStatus,
}) => {
  const statusOptions = ["PENDING", "APPROVED", "REJECTED"];

  const handleSubmit = (e) => {
    e.preventDefault();
    const newStatus = e.target.status.value;
    onUpdateStatus(exceptionId, newStatus);
  };

  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>Update Exception Status</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          <Form.Group>
            <Form.Label>Select Status</Form.Label>
            <Form.Select name="status" defaultValue={currentStatus}>
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide}>
            Cancel
          </Button>
          <Button variant="primary" type="submit">
            Update Status
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default UpdateStatusModal;
