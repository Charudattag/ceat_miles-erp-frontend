import React, { useState, useEffect, useCallback } from "react";
import { Table, Form, Button, Modal } from "react-bootstrap";
import { FaSearch, FaPlus, FaEdit, FaTrash } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Swal from "sweetalert2";

import {
  addCategoryAPI,
  getAllcategoriesAPI,
  updateCategoryAPI,
  deleteCategoryAPI,
} from "../../../src/api/api";

const Category = () => {
  const [showModal, setShowModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [formData, setFormData] = useState({
    category_name: "",
    is_active: true,
  });

  const fetchCategories = useCallback(async () => {
    try {
      const payload = {
        page: currentPage,
        limit: 10,
        search: searchQuery,
      };

      const response = await getAllcategoriesAPI(payload);
      if (response?.success && response?.data?.categories) {
        setCategories(response.data.categories);
        setTotalPages(response.data.pagination.totalPages);
      } else {
        toast.error(response?.message || "Failed to fetch categories");
      }
    } catch (error) {
      toast.error("Error fetching categories");
    }
  }, [currentPage, searchQuery]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleCloseModal = () => {
    setShowModal(false);
    setIsEditing(false);
    setSelectedCategory(null);
    setFormData({
      category_name: "",
      is_active: true,
    });
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.category_name.trim()) {
      toast.error("Category name is required!");
      return;
    }

    try {
      let response;

      if (isEditing && selectedCategory) {
        response = await updateCategoryAPI({
          id: selectedCategory.id,
          formData: formData,
        });
      } else {
        response = await addCategoryAPI(formData);
      }

      if (response.success) {
        toast.success(
          isEditing
            ? "Category updated successfully!"
            : "Category added successfully!"
        );
        fetchCategories();
        handleCloseModal();
      } else {
        toast.error(response.message || "Operation failed");
      }
    } catch (error) {
      toast.error(
        isEditing ? "Failed to update category" : "Failed to add category"
      );
    }
  };

  const handleEditCategory = (category) => {
    setIsEditing(true);
    setSelectedCategory(category);
    setFormData({
      category_name: category.category_name,
      is_active: category.is_active,
    });
    setShowModal(true);
  };

  const handleDeleteCategory = async (categoryId, categoryName) => {
    Swal.fire({
      title: "Are you sure?",
      text: `Do you want to delete the category "${categoryName}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await deleteCategoryAPI(categoryId);
          if (response.success) {
            Swal.fire(
              "Deleted!",
              "Category has been deleted successfully.",
              "success"
            );
            fetchCategories();
          } else {
            Swal.fire(
              "Error!",
              response.message || "Failed to delete category",
              "error"
            );
          }
        } catch (error) {
          Swal.fire("Error!", "Error deleting category", "error");
        }
      }
    });
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  return (
    <div className="container bg-white p-4 rounded shadow">
      <h2 className="my-4">Category Management</h2>

      <div className="d-flex justify-content-between mb-3">
        <div className="d-flex">
          <div className="input-group" style={{ width: "300px" }}>
            <span className="input-group-text">
              <FaSearch />
            </span>
            <Form.Control
              type="text"
              placeholder="Search categories..."
              value={searchQuery}
              onChange={handleSearch}
            />
          </div>
        </div>
        <Button variant="primary" onClick={() => setShowModal(true)}>
          <FaPlus className="me-2" /> Add Category
        </Button>
      </div>

      <Table bordered hover responsive>
        <thead className="bg-light">
          <tr>
            <th>#</th>
            <th>Category Name</th>
            <th>Status</th>
            {/* <th>Created At</th> */}
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {categories.length > 0 ? (
            categories.map((category, index) => (
              <tr key={category.id || index}>
                <td>{category.id}</td>
                <td>{category.category_name}</td>
                <td>
                  <span
                    className={`badge ${
                      category.is_active ? "bg-success" : "bg-danger"
                    }`}
                  >
                    {category.is_active ? "Active" : "Inactive"}
                  </span>
                </td>
                {/* <td>{new Date(category.createdAt).toLocaleDateString()}</td> */}
                <td>
                  <Button
                    variant="info"
                    size="sm"
                    className="me-2"
                    onClick={() => handleEditCategory(category)}
                  >
                    <FaEdit />
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() =>
                      handleDeleteCategory(category.id, category.category_name)
                    }
                  >
                    <FaTrash />
                  </Button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" className="text-center py-3">
                No categories found
              </td>
            </tr>
          )}
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
          <Modal.Title>
            {isEditing ? "Edit Category" : "Add New Category"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Category Name</Form.Label>
              <Form.Control
                type="text"
                name="category_name"
                value={formData.category_name}
                onChange={handleInputChange}
                placeholder="Enter category name"
                required
              />
            </Form.Group>

            {isEditing && (
              <Form.Group className="mb-3">
                <Form.Check
                  type="checkbox"
                  name="is_active"
                  label="Active"
                  checked={formData.is_active}
                  onChange={handleInputChange}
                />
              </Form.Group>
            )}

            <div className="d-flex justify-content-end">
              <Button
                variant="secondary"
                onClick={handleCloseModal}
                className="me-2"
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                {isEditing ? "Update" : "Save"}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default Category;
