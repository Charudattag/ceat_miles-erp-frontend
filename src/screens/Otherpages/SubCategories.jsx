import React, { useState, useEffect, useCallback } from 'react'
import { Table, Form, Button, Modal } from 'react-bootstrap'
import { FaSearch, FaPlus, FaEdit } from 'react-icons/fa'
import { toast,ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css';

import {
  addSubcategopryAPI,
  getAllcategoriesAPI,
  getAllSubcategoriesAPI,
  updateSubcategoryAPI,
  IMG_URL
} from '../../../src/api/api'

const AddSubcategoryForm = () => {
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showUpdateModal, setShowUpdateModal] = useState(false)
  const [categories, setCategories] = useState([])
  const [subcategories, setSubcategories] = useState([])
  const [newSubcategory, setNewSubcategory] = useState({
    name: '',
    description: '',
    category_id: '',
    image: null,
    SubCategory_banner: null
  })
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState(null)

  const fetchCategories = async () => {
    try {
      const response = await getAllcategoriesAPI()
      if (response.success) {
        setCategories(response.data)
      } else {
        toast.error(response.message)
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
      toast.error('Failed to fetch categories.')
    }
  }

  
  const fetchSubcategories = useCallback(async () => {
    try {
      const response = await getAllSubcategoriesAPI(currentPage);
      if (response.message === 'Subcategories retrieved successfully') {
        setSubcategories(response.data);
        setTotalPages(response.pagination.totalPages);
        setTotalItems(response.pagination.totalRecords);
      } else {
        toast.error(response.error);
      }
    } catch (error) {
      console.error('Error fetching subcategories:', error);
      toast.error('Failed to fetch subcategories.');
    }
  }, [currentPage]);
  
  

  useEffect(() => {
    fetchCategories()
    fetchSubcategories()
  }, [currentPage])

  const handleInputChange = e => {
    const { name, value } = e.target
    setNewSubcategory(prev => ({ ...prev, [name]: value }))
  }

  const handleFileChange = e => {
    const { name, files } = e.target
    setNewSubcategory(prev => ({ ...prev, [name]: files[0] }))
  }

  // Add subcategory
  const handleAddSubcategory = async () => {
    const { name, category_id, image, SubCategory_banner } = newSubcategory

    if (!name || !category_id) {
      toast.error('Subcategory name and category are required.')
      return
    }

    const formData = new FormData()
    formData.append('name', name)
    formData.append('description', newSubcategory.description)
    formData.append('category_id', category_id)
    if (image) formData.append('images', image)
    if (SubCategory_banner)
      formData.append('SubCategory_banner', SubCategory_banner)

    try {
      const response = await addSubcategopryAPI(formData)
      if (response.success) {
        toast.success('Subcategory added successfully')
        fetchSubcategories()
        setShowAddModal(false)
      } else {
        toast.error(response.error || 'Failed to add subcategory')
      }
    } catch (error) {
      console.error('Error adding subcategory:', error)
      toast.error('An error occurred while adding the subcategory.')
    }
  }

  // Edit subcategory
  const handleEditSubcategory = subcategory => {
    setSelectedSubcategoryId(subcategory.id)
    setNewSubcategory({
      name: subcategory.name,
      description: subcategory.description,
      category_id: subcategory.category_id,
      image: null,
      SubCategory_banner: null
    })
    setShowUpdateModal(true)
  }

  // Update subcategory
  const handleUpdateSubcategory = async () => {
    const { name, category_id, image, SubCategory_banner } = newSubcategory

    if (!name || !category_id) {
      toast.error('Subcategory name and category are required.')
      return
    }

    const formData = new FormData()
    formData.append('name', name)
    formData.append('description', newSubcategory.description)
    formData.append('category_id', category_id)
    if (image) formData.append('images', image)
    if (SubCategory_banner)
      formData.append('SubCategory_banner', SubCategory_banner)

    try {
      const response = await updateSubcategoryAPI(
        selectedSubcategoryId,
        formData
      )
      if (response.success) {
        toast.success('Subcategory updated successfully')
        fetchSubcategories()
        setShowUpdateModal(false)
      } else {
        toast.error(response.error || 'Failed to update subcategory')
      }
    } catch (error) {
      console.error('Error updating subcategory:', error)
      toast.error('An error occurred while updating the subcategory.')
    }
  }

  const filteredSubcategories = subcategories.filter(subcategory =>
    subcategory.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className='container bg-white'>
      <h2 className='my-4'>Subcategories Management</h2>

      <div className='d-flex justify-content-between mb-3'>
        <div className='d-flex align-items-center position-relative w-50'>
          <Form.Control
            type='text'
            placeholder='Search by Subcategory name'
            className='w-100 pe-5'
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
          {/* <FaSearch className='position-absolute end-0 me-3 text-muted' /> */}
                    <FaSearch className='position-reletive ml-2 text-info' size={22} />
          
        </div>
        <Button
          variant='primary'
          onClick={() => {
            setNewSubcategory({
              name: '',
              description: '',
              category_id: '',
              image: null,
              SubCategory_banner: null
            })
            setShowAddModal(true)
          }}
        >
          <FaPlus /> Add Subcategory
        </Button>
      </div>

      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Sr No.</th>
            <th>Subcategory Name</th>
            <th>Description</th>
            <th>Category</th>
            <th>Image</th>
            <th>Banner</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredSubcategories.map((subcategory, index) => (
            <tr key={subcategory.id || index}>
              <td>{index + 1}</td>
              <td>{subcategory.name}</td>
              <td>{subcategory.description}</td>
              <td>
                {categories.find(cat => cat.id === subcategory.category_id)
                  ?.name || 'Unknown'}
              </td>
              <td>
                {subcategory.image ? (
                  <img
                    src={`${IMG_URL}/uploads/${subcategory.image}`}
                    alt='subcategory'
                    style={{ width: '50px', height: 'auto' }}
                  />
                ) : (
                  'No Image'
                )}
              </td>
              <td>
                {subcategory.SubCategory_banner ? (
                  <img
                    src={`${IMG_URL}/uploads/${subcategory.SubCategory_banner}`}
                    alt='banner'
                    style={{ width: '50px', height: 'auto' }}
                  />
                ) : (
                  'No Banner'
                )}
              </td>
              <td>
                <Button
                  variant='warning'
                  size='sm'
                  onClick={() => handleEditSubcategory(subcategory)}
                >
                  <FaEdit /> Edit
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Add Subcategory Modal */}
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Add Subcategory</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Form>
            <Form.Group className='mb-3'>
              <Form.Label>Name <span className='text-danger'>*</span></Form.Label>
              <Form.Control
                type='text'
                placeholder='Enter subcategory name'
                name='name'
                value={newSubcategory.name}
                onChange={handleInputChange}
              />
            </Form.Group>

            <Form.Group className='mb-3'>
              <Form.Label>Description</Form.Label>
              <Form.Control
                type='text'
                placeholder='Enter description'
                name='description'
                value={newSubcategory.description}
                onChange={handleInputChange}
              />
            </Form.Group>

            <Form.Group className='mb-3'>
              <Form.Label>Category <span className='text-danger'>*</span></Form.Label>
              <Form.Select
                name='category_id'
                value={newSubcategory.category_id}
                onChange={handleInputChange}
              >
                <option value=''>Select Category</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className='mb-3'>
              <Form.Label>Subcategory Image 425px*425px</Form.Label>
              <Form.Control
                type='file'
                name='image'
                onChange={handleFileChange}
              />
            </Form.Group>

            <Form.Group className='mb-3'>
              <Form.Label>Subcategory Banner 1050px*486px</Form.Label>
              <Form.Control
                type='file'
                name='SubCategory_banner'
                onChange={handleFileChange}
              />
            </Form.Group>
          </Form>
        </Modal.Body>

        <Modal.Footer>
          <Button variant='secondary' onClick={() => setShowAddModal(false)}>
            Close
          </Button>
          <Button variant='primary' onClick={handleAddSubcategory}>
            Add Subcategory
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Update Subcategory Modal */}
      <Modal
        show={showUpdateModal}
        onHide={() => setShowUpdateModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Update Subcategory</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Form>
            <Form.Group className='mb-3'>
              <Form.Label>Name</Form.Label>
              <Form.Control
                type='text'
                placeholder='Enter subcategory name'
                name='name'
                value={newSubcategory.name}
                onChange={handleInputChange}
              />
            </Form.Group>

            <Form.Group className='mb-3'>
              <Form.Label>Description</Form.Label>
              <Form.Control
                type='text'
                placeholder='Enter description'
                name='description'
                value={newSubcategory.description}
                onChange={handleInputChange}
              />
            </Form.Group>

            <Form.Group className='mb-3'>
              <Form.Label>Category</Form.Label>
              <Form.Select
                name='category_id'
                value={newSubcategory.category_id}
                onChange={handleInputChange}
              >
                <option value=''>Select Category</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className='mb-3'>
              <Form.Label>Subcategory Image 425px*425px</Form.Label>
              <Form.Control
                type='file'
                name='image'
                onChange={handleFileChange}
              />
            </Form.Group>

            <Form.Group className='mb-3'>
              <Form.Label>Subcategory Banner 1050px*486px</Form.Label>
              <Form.Control
                type='file'
                name='SubCategory_banner'
                onChange={handleFileChange}
              />
            </Form.Group>
          </Form>
        </Modal.Body>

        <Modal.Footer>
          <Button variant='secondary' onClick={() => setShowUpdateModal(false)}>
            Close
          </Button>
          <Button variant='primary' onClick={handleUpdateSubcategory}>
            Update Subcategory
          </Button>
        </Modal.Footer>
      </Modal>

      <div className='d-flex justify-content-between align-items-center mt-3 mb-4'>
        <div>
          Showing {filteredSubcategories.length} of {totalItems} entries
        </div>
        <ul className='pagination'>
          <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
            <button
              className='page-link'
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            >
              Previous
            </button>
          </li>
          {[...Array(totalPages)].map((_, index) => (
            <li
              key={index + 1}
              className={`page-item ${
                currentPage === index + 1 ? 'active' : ''
              }`}
            >
              <button
                className='page-link'
                onClick={() => setCurrentPage(index + 1)}
              >
                {index + 1}
              </button>
            </li>
          ))}
          <li
            className={`page-item ${
              currentPage === totalPages ? 'disabled' : ''
            }`}
          >
            <button
              className='page-link'
              onClick={() =>
                setCurrentPage(prev => Math.min(prev + 1, totalPages))
              }
            >
              Next
            </button>
          </li>
        </ul>
      </div>
      <ToastContainer />
    </div>
  )
}

export default AddSubcategoryForm
