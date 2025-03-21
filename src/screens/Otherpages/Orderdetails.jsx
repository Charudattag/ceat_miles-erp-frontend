import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import { Table, Badge, Container, Row, Col, Button } from "react-bootstrap";
import {
  getOrderdetailsByOrderIdAPI,
  IMG_URL,
  addExceptionAPI,
} from "../../../src/api/api";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Modal, Form } from "react-bootstrap";

function OrderDetails() {
  const navigate = useNavigate();
  const { orderId } = useParams();
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showExceptionModal, setShowExceptionModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [exceptionForm, setExceptionForm] = useState({
    ticket_id: "",
    exception_type: "DAMAGED",
    description: "",
    remark: "",
  });

  const exceptionTypes = ["DAMAGED", "DEFECTIVE", "WRONG_ITEM", "OTHER"];

  const handleDownloadInvoice = (orderId) => {
    window.open(`/invoice/${orderId}`, "_blank");
  };

  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!orderId) return;
      setLoading(true);
      try {
        const response = await getOrderdetailsByOrderIdAPI(orderId);
        console.log(response.data);
        setOrderDetails(response.data);
      } catch (error) {
        console.error("Error fetching order details:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrderDetails();
  }, [orderId]);

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case "PENDING":
        return "warning";
      case "RECEIVED":
        return "primary";
      case "SHIPPED":
        return "info";
      case "DISPATCHED":
        return "info";
      case "DELIVERED":
        return "success";
      case "CANCELLED":
        return "danger";
      case "REFUND":
        return "dark";
      case "RETURNED":
        return "secondary";
      default:
        return "secondary";
    }
  };

  const handleShowExceptionModal = (item) => {
    setSelectedItem(item);
    setExceptionForm({
      ...exceptionForm,
      ticket_id: "",
      exception_type: "DAMAGED",
      description: "",
      remark: "",
    });
    setShowExceptionModal(true);
  };

  const handleExceptionSubmit = async () => {
    try {
      if (!exceptionForm.ticket_id) {
        toast.error("Please enter a ticket ID");
        return;
      }

      const response = await addExceptionAPI(exceptionForm);
      if (response.success) {
        toast.success("Exception created successfully");
        setShowExceptionModal(false);

        const updatedOrder = await getOrderdetailsByOrderIdAPI(orderId);
        setOrderDetails(updatedOrder.data);
      }
    } catch (error) {
      toast.error("Failed to create exception: " + error.message);
    }
  };
  return (
    <div className="container bg-white" style={{ overflowX: "hidden" }}>
      <Row>
        <Col md={6}>
          <h2 className="text-left mt-4">Order Details {orderDetails?.id}</h2>
        </Col>
        <Col md={6}>
          <Container className="d-flex justify-content-end gap-2">
            <Button
              variant="outline-primary"
              className="back-button"
              onClick={() => navigate("/orders")}
            >
              <i className="fas fa-arrow-left me-2"></i>
              Back to Orders
            </Button>
            <Button
              variant="warning"
              onClick={() => handleShowExceptionModal(orderDetails)}
            >
              Add Exception
            </Button>
          </Container>
        </Col>
      </Row>

      {loading ? (
        <div className="text-center">Loading...</div>
      ) : !orderDetails ? (
        <div className="text-center">No order details found.</div>
      ) : (
        <>
          {/* <div className='customer-info mb-4'>
            <p>Name: {orderDetails.customer?.name}</p>
            <p>Email: {orderDetails.customer?.email}</p>
            <p>Phone: {orderDetails.customer?.mobile}</p>
          </div> */}

          {/* <div className='shipping-info mb-4'>
            <h4>Shipping Address</h4>
            <p>{orderDetails.shippingAddress?.type}</p>
            <p>
              {orderDetails.shippingAddress?.addressLine1},
              {orderDetails.shippingAddress?.addressLine2},{' '}
              {orderDetails.shippingAddress?.city},{' '}
              {orderDetails.shippingAddress?.state},{' '}
              {orderDetails.shippingAddress?.country} -{' '}
              {orderDetails.shippingAddress?.pincode}
            </p>
          </div> */}

          <div className="order-summary mt-4">
            <h4>Order Summary</h4>
            <div className="row">
              <div className="col-md-4">
                <p>
                  <strong>Order Status:</strong>
                  &nbsp;
                  <Badge bg={getStatusBadgeColor(orderDetails.order_status)}>
                    {orderDetails.order_status}
                  </Badge>
                </p>
              </div>
              <div className="col-md-4">
                <p>
                  <strong>Order Date: </strong>

                  {new Date(orderDetails.order_date).toLocaleDateString()}
                </p>
              </div>
              <div className="col-md-4">
                <p>
                  <strong>Order Amount:</strong> ₹{orderDetails.order_amount}
                </p>
              </div>
            </div>

            <div className="dealer-info mt-4">
              <h5>Dealer Information</h5>
              <div className="row">
                <div className="col-md-4">
                  <p>
                    <strong>Dealer Name:</strong>{" "}
                    {orderDetails.dealer?.dealer_name}
                  </p>
                  <p>
                    <strong>Dealer Code:</strong>{" "}
                    {orderDetails.dealer?.dealer_code}
                  </p>
                  <p>
                    <strong>Contact:</strong> {orderDetails.dealer?.mobile}
                  </p>
                </div>
                <div className="col-md-4">
                  <p>
                    <strong>Region:</strong> {orderDetails.dealer?.region}
                  </p>
                  <p>
                    <strong>Zone:</strong> {orderDetails.dealer?.zone}
                  </p>
                  <p>
                    <strong>Type:</strong> {orderDetails.dealer?.type}
                  </p>
                </div>
                <div className="col-md-4">
                  <p>
                    <strong>Current Points:</strong>{" "}
                    {orderDetails.dealer?.current_points}
                  </p>
                  <p>
                    <strong>Redeemed Points:</strong>{" "}
                    {orderDetails.dealer?.redeemed_points}
                  </p>
                  <p>
                    <strong>Total Points:</strong>{" "}
                    {orderDetails.dealer?.total_points}
                  </p>
                </div>
              </div>
            </div>
            <div className="shipping-address mt-4">
              <h5>Shipping Address</h5>
              {orderDetails.dealer?.Addresses.map((address) => {
                if (address.id === orderDetails.address_id) {
                  return (
                    <div key={address.id} className="row">
                      <div className="col-md-4">
                        <p>
                          <strong>Name:</strong> {address.nickname}
                        </p>
                        <p>
                          <strong>Landmark:</strong> {address.landmark}
                        </p>
                      </div>
                      <div className="col-md-4">
                        <p>
                          <strong>Address:</strong> {address.address_line_1},{" "}
                          {address.address_line_2}
                        </p>
                        <p>
                          <strong>City:</strong> {address.city}
                        </p>
                      </div>
                      <div className="col-md-4">
                        <p>
                          <strong>State:</strong> {address.state}
                        </p>
                        <p>
                          <strong>Pincode:</strong> {address.pincode}
                        </p>
                      </div>
                    </div>
                  );
                }
                return null;
              })}
            </div>
          </div>

          <div className="table-responsive">
            <Table bordered>
              <thead>
                <tr>
                  <th>Product Image</th>
                  <th>Product Name</th>
                  <th>Product Points</th>
                  <th>Quantity</th>
                  <th>Total Points</th>
                  <th>Status</th>
                  <th>AWB</th>
                  <th>Courier</th>
                </tr>
              </thead>
              <tbody>
                {orderDetails.items.map((item, index) => (
                  <tr key={index}>
                    <td>
                      <img
                        src={`${IMG_URL}/uploads/${item.product.product_image1}`}
                        alt={item.product.product_name}
                        style={{
                          width: "50px",
                          height: "50px",
                          objectFit: "cover",
                        }}
                      />
                    </td>
                    <td>{item.product.product_name}</td>
                    <td>{item.product_amount}</td>
                    <td>{item.product_quantity}</td>
                    <td>{item.product_amount * item.product_quantity}</td>
                    <td>
                      <Badge bg={getStatusBadgeColor(item.status)}>
                        {item.status}
                      </Badge>
                    </td>
                    <td>{item.awb}</td>
                    <td>{item.courier_name}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </>
      )}

      {/* <button
        className="btn btn-primary"
        onClick={() => handleDownloadInvoice(orderId)}
      >
        Download Invoice
      </button> */}

      <Modal
        show={showExceptionModal}
        onHide={() => setShowExceptionModal(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title>Create Exception</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>
                Select Ticket <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                type="text"
                value={exceptionForm.ticket_id}
                onChange={(e) =>
                  setExceptionForm({
                    ...exceptionForm,
                    ticket_id: e.target.value,
                  })
                }
                placeholder="Enter ticket ID"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>
                {" "}
                Exception Type <span className="text-danger">*</span>
              </Form.Label>
              <Form.Select
                value={exceptionForm.exception_type}
                onChange={(e) =>
                  setExceptionForm({
                    ...exceptionForm,
                    exception_type: e.target.value,
                  })
                }
              >
                {exceptionTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>
                {" "}
                Description <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={exceptionForm.description}
                onChange={(e) =>
                  setExceptionForm({
                    ...exceptionForm,
                    description: e.target.value,
                  })
                }
                placeholder="Enter description"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>
                Remark <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                type="text"
                value={exceptionForm.remark}
                onChange={(e) =>
                  setExceptionForm({
                    ...exceptionForm,
                    remark: e.target.value,
                  })
                }
                placeholder="Enter remark"
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowExceptionModal(false)}
          >
            Close
          </Button>
          <Button variant="primary" onClick={handleExceptionSubmit}>
            Create Exception
          </Button>
        </Modal.Footer>
      </Modal>
      <ToastContainer />
    </div>
  );
}

export default OrderDetails;
