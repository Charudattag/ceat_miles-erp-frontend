import React, { useState, useEffect, useCallback } from "react";
import { Table, Form, Button, Modal, Row, Col } from "react-bootstrap";
import { MdEdit, MdDelete } from "react-icons/md";
import { toast, ToastContainer } from "react-toastify";
import { useNavigate } from "react-router-dom";
import {
  addCustomerAPI,
  getAllcustomerAPI,
  updateCustomerAPI,
  deleteCustomerAPI,
} from "../../api/api";
import Swal from "sweetalert2";

const CustomerList = () => {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [customers, setCustomers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [pagination, setPagination] = useState({
    totalRecords: 0,
    currentPage: 1,
    totalPages: 0,
    pageSize: 10,
  });

  const [customerData, setCustomerData] = useState({
    name: "",
    mobile_number: "",
    email: "",
    company_name: "",
    type_lead: "IMPROGRESS LEAD",
  });

  const fetchCustomers = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await getAllcustomerAPI({
        page: currentPage,
        limit: pageSize,
        searchTerm,
      });

      if (response.success) {
        setCustomers(response.data.customers);
        setPagination(response.data.pagination);
      }
    } catch (error) {
      toast.error("Failed to fetch customers");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, pageSize, searchTerm]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const handleSubmitCustomer = async () => {
    try {
      if (
        !customerData.name ||
        !customerData.mobile_number ||
        !customerData.email ||
        !customerData.company_name
      ) {
        toast.warning("Please fill all required fields");
        return;
      }

      let response;
      if (isEditing) {
        response = await updateCustomerAPI({
          id: customerData.id,
          userData: customerData,
        });
        if (response.success) {
          toast.success("Customer updated successfully");
        }
      } else {
        response = await addCustomerAPI(customerData);
        if (response.success) {
          toast.success("Customer added successfully");
        }
      }

      if (response.success) {
        handleCloseModal();
        fetchCustomers();
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      toast.error(
        isEditing ? "Failed to update customer" : "Failed to add customer"
      );
      console.error(error);
    }
  };

  const handleDeleteCustomer = async (customerId, customerName) => {
    try {
      // Show confirmation dialog before deleting
      const result = await Swal.fire({
        title: "Are you sure?",
        text: `You are about to delete customer "${customerName}". This action cannot be undone!`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Yes, delete it!",
        cancelButtonText: "Cancel",
      });

      if (result.isConfirmed) {
        // User confirmed, proceed with deletion
        const response = await deleteCustomerAPI(customerId);

        if (response.success) {
          toast.success("Customer deleted successfully");
          fetchCustomers(); // Refresh the customer list
        } else {
          toast.error(response.message || "Failed to delete customer");
        }
      }
    } catch (error) {
      toast.error("Failed to delete customer");
      console.error("Delete customer error:", error);
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleShowModal = (customer = null) => {
    if (customer) {
      setIsEditing(true);
      setCustomerData(customer);
    } else {
      setIsEditing(false);
      setCustomerData({
        name: "",
        mobile_number: "",
        email: "",
        company_name: "",
        type_lead: "IMPROGRESS LEAD",
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setIsEditing(false);
    setCustomerData({
      name: "",
      mobile_number: "",
      email: "",
      company_name: "",
      type_lead: "IMPROGRESS LEAD",
    });
  };

  const renderPaginationItems = () => {
    const items = [];
    for (let i = 1; i <= pagination.totalPages; i++) {
      items.push(
        <li
          key={i}
          className={`page-item ${currentPage === i ? "active" : ""}`}
        >
          <button className="page-link" onClick={() => setCurrentPage(i)}>
            {i}
          </button>
        </li>
      );
    }
    return items;
  };

  return (
    <div className="container bg-white p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3>Customer Management</h3>
        <Button variant="primary" onClick={() => handleShowModal()}>
          Add Customer
        </Button>
      </div>

      <div className="mb-3">
        <Form.Control
          type="text"
          placeholder="Search customers..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="w-25"
        />
      </div>

      {isLoading ? (
        <div className="text-center py-4">Loading...</div>
      ) : (
        <Table bordered hover responsive>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Mobile</th>
              <th>Email</th>
              <th>Company</th>
              <th>Type</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((customer, index) => (
              <tr key={customer.id}>
                <td>{(currentPage - 1) * pageSize + index + 1}</td>
                <td>{customer.name}</td>
                <td>{customer.mobile_number}</td>
                <td>{customer.email}</td>
                <td>{customer.company_name}</td>
                <td>{customer.type_lead}</td>
                <td>
                  <div className="d-flex gap-2">
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => handleShowModal(customer)}
                    >
                      <MdEdit />
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() =>
                        handleDeleteCustomer(customer.id, customer.name)
                      }
                    >
                      <MdDelete />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      <div className="d-flex justify-content-center mt-3">
        <ul className="pagination">
          <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
            <button
              className="page-link"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            >
              Previous
            </button>
          </li>
          {renderPaginationItems()}
          <li
            className={`page-item ${
              currentPage === pagination.totalPages ? "disabled" : ""
            }`}
          >
            <button
              className="page-link"
              onClick={() =>
                setCurrentPage((prev) =>
                  Math.min(prev + 1, pagination.totalPages)
                )
              }
            >
              Next
            </button>
          </li>
        </ul>
      </div>

      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>
            {isEditing ? "Edit Customer" : "Add Customer"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Name</Form.Label>
              <Form.Control
                type="text"
                value={customerData.name}
                onChange={(e) =>
                  setCustomerData({ ...customerData, name: e.target.value })
                }
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Mobile Number</Form.Label>
              <Form.Control
                type="text"
                value={customerData.mobile_number}
                onChange={(e) =>
                  setCustomerData({
                    ...customerData,
                    mobile_number: e.target.value,
                  })
                }
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                value={customerData.email}
                onChange={(e) =>
                  setCustomerData({ ...customerData, email: e.target.value })
                }
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Company Name</Form.Label>
              <Form.Control
                type="text"
                value={customerData.company_name}
                onChange={(e) =>
                  setCustomerData({
                    ...customerData,
                    company_name: e.target.value,
                  })
                }
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Type</Form.Label>
              <Form.Select
                value={customerData.type_lead}
                onChange={(e) =>
                  setCustomerData({
                    ...customerData,
                    type_lead: e.target.value,
                  })
                }
              >
                <option value="IMPROGRESS LEAD">In Progress Lead</option>
                <option value="ABENDEND LEAD">Abandoned Lead</option>
                <option value="FUTURE LEAD">Future Lead</option>
              </Form.Select>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmitCustomer}>
            {isEditing ? "Update" : "Save"}
          </Button>
        </Modal.Footer>
      </Modal>

      <ToastContainer />
    </div>
  );
};

export default CustomerList;
