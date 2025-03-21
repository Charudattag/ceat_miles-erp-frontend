import React, { useEffect, useState } from 'react'
import {
  Modal,
  Form,
  Button,
  Row,
  Col,
  
  Table
} from 'react-bootstrap'
import {
  getAllCouponCodeAPI,
  updateCouponCodeAPI,
  addCouponCodeAPI
} from '../../api/api'
import { toast,ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css';
import { FaSearch } from 'react-icons/fa'

const COUPON_TYPES = ['PERCENTAGE', 'AMOUNT', 'CARTPERCENTAGE', 'CARTAMOUNT']

const initialFormState = {
  name: '',
  type: 'PERCENTAGE',
  value: '',
  minimum_cart_value: '',
  maximum_discount: '',
  validTill: '',
  is_active: true
}

const CouponCode = () => {
  const [couponData, setCouponData] = useState({ coupons: [], pagination: {} })
  const [showModal, setShowModal] = useState(false)
  const [isEdit, setIsEdit] = useState(false)
  const [formData, setFormData] = useState(initialFormState)
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')

  const fetchCouponCode = async (page = 1) => {
    try {
      const response = await getAllCouponCodeAPI(page)
      setCouponData(response.data)
    } catch (error) {
      console.error('Error fetching coupons:', error)
    }
  }

  useEffect(() => {
    fetchCouponCode(currentPage)
  }, [currentPage])

  const handleCloseModal = () => {
    setShowModal(false)
    setFormData(initialFormState)
    setIsEdit(false)
  }

  const handleEdit = coupon => {
    setIsEdit(true)
    setFormData({
      ...coupon,
      validTill: new Date(coupon.validTill).toISOString().split('T')[0]
    })
    setShowModal(true)
  }

  const handleInputChange = e => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit = async e => {
    e.preventDefault()
    try {
      const date = new Date(formData.validTill)
      const formattedDate = `${date.getDate().toString().padStart(2, '0')}/${(
        date.getMonth() + 1
      )
        .toString()
        .padStart(2, '0')}/${date.getFullYear()}`

      const formattedData = {
        ...formData,
        validTill: formattedDate
      }

      if (isEdit) {
        const response = await updateCouponCodeAPI(formattedData)
        if (
          response.data?.message ===
          'Coupon code already used in orders and cannot be updated'
        ) {
          toast.error(
            'This coupon has been used in orders and cannot be modified'
          )
        } else {
          toast.success('Coupon updated successfully')
          await fetchCouponCode(currentPage)
          handleCloseModal()
        }
      } else {
        await addCouponCodeAPI(formattedData)
        toast.success('Coupon added successfully')
        await fetchCouponCode(currentPage)
        handleCloseModal()
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error processing coupon')
      console.error('Error submitting coupon:', error)
    }
  }

  const handlePageChange = page => {
    setCurrentPage(page)
  }

  const filteredCoupons = couponData.coupons?.filter(
    coupon =>
      (coupon.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (coupon.type?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (coupon.is_active ? 'active' : 'inactive')
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
  )

  return (
    <div className='container bg-white p-4'>
      <div className='d-flex justify-content-between mb-4'>
        <h1>Coupon Codes</h1>
      </div>
      <div className='d-flex justify-content-between mb-3'>
        <div className='d-flex align-items-center position-relative w-50'>
          <Form.Control
            type='text'
            placeholder='Search by coupon code, type or status'
            className='w-100'
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
          <FaSearch className='position-reletive ml-2 text-info' size={22} />
        </div>
        <Button onClick={() => setShowModal(true)}>Add New Coupon</Button>
      </div>
      <div className='d-flex justify-content-between align-items-center mb-3'></div>
      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>Coupon Code</th>
            <th>Type</th>
            <th>Value</th>
            <th>Min Cart Value</th>
            <th>Max Discount</th>
            <th>Valid Till</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredCoupons?.map(coupon => (
            <tr key={coupon.id}>
              <td>{coupon.name}</td>
              <td>{coupon.type}</td>
              <td>{coupon.value}</td>
              <td>₹{coupon.minimum_cart_value}</td>
              <td>₹{coupon.maximum_discount}</td>
              <td>{new Date(coupon.validTill).toLocaleDateString()}</td>
              <td>
                <span
                  className={`badge ${
                    coupon.is_active ? 'bg-success' : 'bg-danger'
                  }`}
                >
                  {coupon.is_active ? 'Active' : 'Inactive'}
                </span>
              </td>
              <td>
                <Button
                  variant='primary'
                  size='sm'
                  onClick={() => handleEdit(coupon)}
                >
                  Edit
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
      <div className='d-flex justify-content-between align-items-center mt-3 mb-4'>
        <div>
          Showing {couponData.coupons?.length} of{' '}
          {couponData.pagination?.totalItems} entries
        </div>
        <ul className='pagination'>
          <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
            <button
              className='page-link'
              onClick={() => handlePageChange(currentPage - 1)}
            >
              Previous
            </button>
          </li>
          {[...Array(couponData.pagination?.totalPages)].map((_, index) => (
            <li
              key={index + 1}
              className={`page-item ${
                currentPage === index + 1 ? 'active' : ''
              }`}
            >
              <button
                className='page-link'
                onClick={() => handlePageChange(index + 1)}
              >
                {index + 1}
              </button>
            </li>
          ))}
          <li
            className={`page-item ${
              currentPage === couponData.pagination?.totalPages
                ? 'disabled'
                : ''
            }`}
          >
            <button
              className='page-link'
              onClick={() => handlePageChange(currentPage + 1)}
            >
              Next
            </button>
          </li>
        </ul>
      </div>

      <Modal show={showModal} onHide={handleCloseModal} centered size='lg'>
        <Modal.Header closeButton>
          <Modal.Title>{isEdit ? 'Edit Coupon' : 'Add Coupon'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={6}>
                <Form.Group className='mb-3'>
                  <Form.Label>Coupon Code</Form.Label>
                  <Form.Control
                    type='text'
                    name='name'
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className='mb-3'>
                  <Form.Label>Type</Form.Label>
                  <Form.Select
                    name='type'
                    value={formData.type}
                    onChange={handleInputChange}
                    required
                  >
                    {COUPON_TYPES.map(type => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className='mb-3'>
                  <Form.Label>Value</Form.Label>
                  <Form.Control
                    type='number'
                    name='value'
                    value={formData.value}
                    onChange={handleInputChange}
                    required
                    min='0'
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className='mb-3'>
                  <Form.Label>Minimum Cart Value</Form.Label>
                  <Form.Control
                    type='number'
                    name='minimum_cart_value'
                    value={formData.minimum_cart_value}
                    onChange={handleInputChange}
                    required
                    min='0'
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className='mb-3'>
                  <Form.Label>Maximum Discount</Form.Label>
                  <Form.Control
                    type='number'
                    name='maximum_discount'
                    value={formData.maximum_discount}
                    onChange={handleInputChange}
                    required
                    min='0'
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className='mb-3'>
                  <Form.Label>Valid Till</Form.Label>
                  <Form.Control
                    type='date'
                    name='validTill'
                    value={formData.validTill}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className='mb-3'>
              <Form.Check
                type='checkbox'
                label='Active'
                name='is_active'
                checked={formData.is_active}
                onChange={handleInputChange}
              />
            </Form.Group>

            <div className='text-center'>
              <Button variant='primary' type='submit'>
                {isEdit ? 'Update Coupon' : 'Add Coupon'}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
      <ToastContainer />
    </div>
  )
}

export default CouponCode
