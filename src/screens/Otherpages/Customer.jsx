import React, { useState, useEffect, useCallback } from 'react'
import { Table, Form, Button, Modal, Row, Col } from 'react-bootstrap'
import { FaEdit, FaSearch } from 'react-icons/fa'
import { MdContactPhone, MdEdit } from 'react-icons/md'
import Footer from './Footer'
import {
  getAllDealersAPI,
  addDealerAPI,
  updateDealerAPI,
  importDealersAPI,
  exportPointsReportAPI
} from '../../../src/api/api'
import { FaCommentDots } from 'react-icons/fa6'
import { toast, ToastContainer } from 'react-toastify'
import { useNavigate } from 'react-router-dom'

const AddCustomerForm = () => {
  const navigate = useNavigate()
  const [showModal, setShowModal] = useState(false)
  const [imageModal, setimageModal] = useState(false)
  const [isEditing, setIsEditing] = useState(false)

  const [searchTerm, setSearchTerm] = useState('')
  const [customers, setCustomers] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [pageSize, setPageSize] = useState(10)
  const [DealerData, setDealerData] = useState({
    id: '',
    first_name: '',
    last_name: '',
    dealer_name: '',
    dealer_code: '',
    zone: '',
    region: '',
    type: '',
    mobile: '',
    points: ''
  })
  const [showMobileModal, setShowMobileModal] = useState(false)
  const [selectedDealerId, setSelectedDealerId] = useState(null)
  const [newMobileNumber, setNewMobileNumber] = useState('')
  const [showPointsModal, setShowPointsModal] = useState(false)
  const [selectedDealer, setSelectedDealer] = useState(null)
  const [pointsData, setPointsData] = useState({
    points: '',
    remarks: ''
  })
  const [showRemarkModal, setShowRemarkModal] = useState(false)
  const [remarkData, setRemarkData] = useState({
    remark: '',
    dealer_id: null
  })
  // Add these states
  const [showImportDealerModal, setShowImportDealerModal] = useState(false)
  const [showImportPointsModal, setShowImportPointsModal] = useState(false)
  const [showUpdateDealersModal, setShowUpdateDealersModal] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const [pagination, setPagination] = useState({
    totalRecords: 0,
    currentPage: 1,
    totalPages: 0,
    pageSize: 10
  })

  const fetchCustomers = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      // Pass search term along with pagination params
      const response = await getAllDealersAPI(currentPage, pageSize, searchTerm)
      setCustomers(response.data.data)
      setPagination({
        totalRecords: response.data.pagination.totalRecords,
        currentPage: response.data.pagination.currentPage,
        totalPages: response.data.pagination.totalPages,
        pageSize: response.data.pagination.pageSize
      })
    } catch (err) {
      setError('Failed to fetch customer data')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }, [currentPage, pageSize, searchTerm])
  

  // Update useEffect
  useEffect(() => {
    fetchCustomers()
  }, [fetchCustomers, currentPage])

  const handleSearchChange = e => {
    setSearchTerm(e.target.value)
    setCurrentPage(1) // Reset to first page when searching
    fetchCustomers() // Fetch new results with search term
  }
  

// Replace the filteredCustomers variable with:
const filteredCustomers = customers.filter(customer => {
  const searchTermLower = searchTerm.toLowerCase().trim()
  return (
    customer.dealer_name?.toLowerCase().includes(searchTermLower) ||
    customer.dealer_code?.toString().toLowerCase().includes(searchTermLower) ||
    customer.mobile?.toString().includes(searchTermLower) ||
    customer.total_points?.toString().includes(searchTermLower) ||
    customer.current_points?.toString().includes(searchTermLower) ||
    customer.redeemed_points?.toString().includes(searchTermLower) ||
    `${customer.first_name} ${customer.last_name}`.toLowerCase().includes(searchTermLower)
  )
})




  // Calculate pagination for filtered results
  const handleShowModal = (dealer = null) => {
    if (dealer) {
      setIsEditing(true)
      setDealerData({
        id: dealer.id,
        first_name: dealer.first_name,
        last_name: dealer.last_name,
        dealer_name: dealer.dealer_name,
        dealer_code: dealer.dealer_code,
        zone: dealer.zone,
        region: dealer.region,
        type: dealer.type,
        mobile: dealer.mobile,
        points: dealer.points
      })
    } else {
      setIsEditing(false)
      setDealerData({
        id: '',
        first_name: '',
        last_name: '',
        dealer_name: '',
        dealer_code: '',
        zone: '',
        region: '',
        type: '',
        mobile: '',
        points: ''
      })
    }
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setIsEditing(false)
    setDealerData({
      first_name: '',
      last_name: '',
      dealer_name: '',
      dealer_code: '',
      zone: '',
      region: '',
      type: '',
      mobile: '',
      points: ''
    })
  }

  const handleimageShowModal = () => setimageModal(true)
  const handleimageCloseModal = () => setimageModal(false)

  const renderPaginationItems = () => {
    const items = []
    const maxVisiblePages = 3
    const halfVisible = Math.floor(maxVisiblePages / 2)

    let startPage = Math.max(1, currentPage - halfVisible)
    let endPage = Math.min(
      pagination.totalPages,
      startPage + maxVisiblePages - 1
    )

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1)
    }
    if (startPage > 1) {
      items.push(
        <li key={1} className='page-item'>
          <button className='page-link' onClick={() => setCurrentPage(1)}>
            1
          </button>
        </li>
      )
      if (startPage > 2) {
        items.push(
          <li key='ellipsis1' className='page-item disabled'>
            <span className='page-link'>...</span>
          </li>
        )
      }
    }
    for (let i = startPage; i <= endPage; i++) {
      items.push(
        <li
          key={i}
          className={`page-item ${currentPage === i ? 'active' : ''}`}
        >
          <button className='page-link' onClick={() => setCurrentPage(i)}>
            {i}
          </button>
        </li>
      )
    }
    if (endPage < pagination.totalPages) {
      if (endPage < pagination.totalPages - 1) {
        items.push(
          <li key='ellipsis2' className='page-item disabled'>
            <span className='page-link'>...</span>
          </li>
        )
      }
      items.push(
        <li key={pagination.totalPages} className='page-item'>
          <button
            className='page-link'
            onClick={() => setCurrentPage(pagination.totalPages)}
          >
            {pagination.totalPages}
          </button>
        </li>
      )
    }
    return items
  }

  // Add these functions after the existing state declarations

  const handleInputChange = e => {
    const { name, value } = e.target
    setDealerData(prevState => ({
      ...prevState,
      [name]: value
    }))
  }

  const handleSubmitDealer = async customer => {
    try {
      if (
        !DealerData.first_name ||
        !DealerData.last_name ||
        !DealerData.dealer_name ||
        !DealerData.dealer_code ||
        !DealerData.zone ||
        !DealerData.region ||
        !DealerData.type ||
        !DealerData.mobile
      ) {
        toast('Please fill all required fields')
        return
      }

      if (isEditing) {
        // Call update API
        const response = await updateDealerAPI(DealerData.id, DealerData)

        toast(response.message)
      } else {
        // Call create API
        const response = await addDealerAPI(DealerData)
        toast(response.message)
      }

      handleCloseModal()
      fetchCustomers()
    } catch (error) {
      console.error('Error saving dealer:', error)
      toast('Failed to save dealer')
    }
  }

  // Add these functions
  const handleShowMobileModal = dealerId => {
    setSelectedDealerId(dealerId)
    setShowMobileModal(true)
  }

  const handleCloseMobileModal = () => {
    setShowMobileModal(false)
    setNewMobileNumber('')
  }

  const handleMobileChange = async () => {
    try {
      if (!newMobileNumber || newMobileNumber.length !== 10) {
        alert('Please enter a valid 10-digit mobile number')
        return
      }

      // Add API call here to update mobile number
      // await updateDealerMobileAPI(selectedDealerId, newMobileNumber);

      handleCloseMobileModal()
      fetchCustomers()
    } catch (error) {
      console.error('Error updating mobile number:', error)
      alert('Failed to update mobile number')
    }
  }

  // Add these functions
  const handleShowRemarkModal = dealerId => {
    setRemarkData(prev => ({ ...prev, dealer_id: dealerId }))
    setShowRemarkModal(true)
  }

  const handleCloseRemarkModal = () => {
    setShowRemarkModal(false)
    setRemarkData({ remark: '', dealer_id: null })
  }

  const handleRemarkSubmit = async () => {
    try {
      if (!remarkData.remark.trim()) {
        alert('Please enter a remark')
        return
      }

      // Add API call here
      // await addDealerRemarkAPI(remarkData);

      handleCloseRemarkModal()
      fetchCustomers()
    } catch (error) {
      console.error('Error adding remark:', error)
      alert('Failed to add remark')
    }
  }

  // Add these functions
  const handleImportDealerFile = async e => {
    const file = e.target.files[0]

    if (
      (file &&
        file.type ===
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') ||
      file.type === 'text/csv' ||
      file.type === 'application/csv'
    ) {
      setSelectedFile(file)
    } else {
      toast.warning('Please select a valid Excel file')
    }
  }

  const handleImportDealerSubmit = async () => {
    console.log(selectedFile)
    try {
      if (!selectedFile) {
        toast.warning('Please select a file first')
        return
      }
      const formData = new FormData()
      formData.append('file', selectedFile)
    const response =  await importDealersAPI(formData)
    if(response.success){
      setShowImportDealerModal(false)
      setSelectedFile(null)
      fetchCustomers()
      toast.success(response.message)
    }else{
      toast.success(response.message)
    }
    } catch (error) {
      toast.error('Failed to import dealers')
    }
  }

  const handleImportPointsSubmit = async () => {
    try {
      if (!selectedFile) {
        alert('Please select a file first')
        return
      }
      const formData = new FormData()
      formData.append('file', selectedFile)
      // await importPointsAPI(formData);
      setShowImportPointsModal(false)
      setSelectedFile(null)
      fetchCustomers()
    } catch (error) {
      alert('Failed to import points')
    }
  }

  const handleUpdateDealersSubmit = async () => {
    try {
      if (!selectedFile) {
        alert('Please select a file first')
        return
      }
      const formData = new FormData()
      formData.append('file', selectedFile)
      await updateDealerAPI({ formData })
      setShowUpdateDealersModal(false)
      setSelectedFile(null)
      fetchCustomers()
    } catch (error) {
      alert('Failed to update dealers')
    }
  }

  const handleExportPointsReport = async () => {
    try {
      const response = await  exportPointsReportAPI();
      const csvData = response.data;
      
      // Convert JSON to CSV
      const headers = Object.keys(csvData[0]);
      const csvString = [
        headers.join(','),
        ...csvData.map(row => headers.map(header => row[header]).join(','))
      ].join('\n');
      
      // Create and download CSV file
      const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', 'dealers_report.csv');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error exporting CSV:', error);
    }
  };
  

  return (
    <div className='container bg-white'>
      <div className='dealer-management mt-4'>
        <h3>Dealers Management</h3>
        <div className='d-flex mt-3 mb-3'>
          <Button variant='primary' className='me-3' onClick={handleShowModal}>
            Add Dealer
          </Button>
          <Button
            variant='success'
            className='me-3'
            onClick={() => setShowImportDealerModal(true)}
          >
            Import Dealer
          </Button>
          <Button
            variant='info'
            className='me-3'
            onClick={() => setShowImportPointsModal(true)}
          >
            Import Points
          </Button>
          {/* <Button
            variant='warning'
            className='me-3'
            onClick={() => setShowUpdateDealersModal(true)}
          >
            Update Dealers
          </Button> */}
          <Button variant='secondary' onClick={handleExportPointsReport}>
            Export Points Report
          </Button>
        </div>
      </div>

      <div className='d-flex justify-content-between mb-3'>
        <div className='d-flex align-items-center position-relative w-50'>
          <Form.Control
            type='text'
            placeholder='Search by Dealer name'
            className='w-50 pe-5'
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>
        {/* <Button variant="primary" onClick={handleShowModal}>
          <i className="fa fa-plus"></i> Add Customer
        </Button> */}
      </div>

      <div className='table-responsive'>
        {isLoading ? (
          <div className='text-center'>Loading...</div>
        ) : error ? (
          <div className='text-center text-danger'>{error}</div>
        ) : (
          <Table bordered hover>
            <thead>
              <tr>
                <th>Sr No.</th>
                <th>Dealer Name</th>
                <th>Dealer Code</th>
                <th>Mobile</th>
                <th>Total Points</th>
                <th>Current Points</th>
                <th>Redeemed Points</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.map((customer, index) => (
                <tr
                  key={customer.id}
                  onClick={() => navigate(`/dealers/${customer.id}`)}
                >
                  <td>{(currentPage - 1) * pageSize + index + 1}</td>
                  <td>{customer.dealer_name}</td>
                  <td>{customer.dealer_code}</td>

                  <td>{customer.mobile}</td>
                  <td>{customer.total_points}</td>
                  <td>{customer.current_points}</td>
                  <td>{customer.redeemed_points}</td>
                  <td>
                    <Button
                      size='sm'
                      variant='primary'
                      onClick={e => {
                        e.stopPropagation()
                        handleShowModal(customer)
                      }}
                    >
                      <MdEdit />
                    </Button>
                    &nbsp; &nbsp;
                    {/* <Button
                      size='sm'
                      variant='primary'
                      onClick={e => {
                        e.stopPropagation()
                        handleShowRemarkModal(customer.id)
                      }}
                    >
                      <FaCommentDots />
                    </Button> */}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </div>

      <div className='d-flex justify-content-center align-items-center mt-3 mb-4'>
        {/* <div>
          Showing {Math.min((currentPage - 1) * pageSize + 1, totalItems)} to{' '}
          {Math.min(currentPage * pageSize, totalItems)} of {totalItems} entries
        </div> */}
        <ul className='pagination justify-content-center'>
          <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
            <button
              className='page-link'
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              Previous
            </button>
          </li>
          {renderPaginationItems()}
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
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </li>
        </ul>
      </div>

      {/* Modal for Add Dealers */}
      <Modal show={showModal} onHide={handleCloseModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>{isEditing ? 'Edit Dealer' : 'Add Dealer'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row>
              <Col>
                <Form.Group className='mb-3'>
                  <Form.Label>First Name</Form.Label>
                  <Form.Control
                    type='text'
                    placeholder='Enter First Name'
                    value={DealerData.first_name}
                    onChange={e =>
                      setDealerData({
                        ...DealerData,
                        first_name: e.target.value
                      })
                    }
                  />
                </Form.Group>
                <Form.Group className='mb-3'>
                  <Form.Label>Last Name</Form.Label>
                  <Form.Control
                    type='text'
                    placeholder='Enter Last Name'
                    value={DealerData.last_name}
                    onChange={e =>
                      setDealerData({
                        ...DealerData,
                        last_name: e.target.value
                      })
                    }
                  />
                </Form.Group>
                <Form.Group className='mb-3'>
                  <Form.Label>Dealer Name</Form.Label>
                  <Form.Control
                    type='text'
                    placeholder='Enter Dealer Name'
                    value={DealerData.dealer_name}
                    onChange={e =>
                      setDealerData({
                        ...DealerData,
                        dealer_name: e.target.value
                      })
                    }
                  />
                </Form.Group>
                <Form.Group className='mb-3'>
                  <Form.Label>Dealer Code</Form.Label>
                  <Form.Control
                    type='text'
                    placeholder='Enter Dealer Code'
                    value={DealerData.dealer_code}
                    onChange={e =>
                      setDealerData({
                        ...DealerData,
                        dealer_code: e.target.value
                      })
                    }
                  />
                </Form.Group>
              </Col>
              <Col>
                <Form.Group className='mb-3'>
                  <Form.Label>Region</Form.Label>
                  <Form.Control
                    type='text'
                    placeholder='Enter Region'
                    value={DealerData.region}
                    onChange={e =>
                      setDealerData({ ...DealerData, region: e.target.value })
                    }
                  />
                </Form.Group>
                <Form.Group className='mb-3'>
                  <Form.Label>Type</Form.Label>
                  <Form.Control
                    type='text'
                    placeholder='Enter Type'
                    value={DealerData.type}
                    onChange={e =>
                      setDealerData({ ...DealerData, type: e.target.value })
                    }
                  />
                </Form.Group>
                <Form.Group className='mb-3'>
                  <Form.Label>Mobile</Form.Label>
                  <Form.Control
                    type='text'
                    placeholder='Enter Mobile'
                    value={DealerData.mobile}
                    onChange={e =>
                      setDealerData({ ...DealerData, mobile: e.target.value })
                    }
                  />
                </Form.Group>
                {/* <Form.Group className='mb-3'>
    <Form.Label>Points</Form.Label>
    <Form.Control 
      type='text' 
      placeholder='Enter Points' 
      value={DealerData.points}
      onChange={(e) => setDealerData({ ...DealerData, points: e.target.value })}
    />
  </Form.Group> */}
                <Form.Group className='mb-3'>
                  <Form.Label>Zone</Form.Label>
                  <Form.Control
                    type='text'
                    placeholder='Enter Zone'
                    value={DealerData.zone}
                    onChange={e =>
                      setDealerData({ ...DealerData, zone: e.target.value })
                    }
                  />
                </Form.Group>
              </Col>
            </Row>

            <div className='d-flex justify-content-end'>
              <Button variant='secondary' onClick={handleCloseModal}>
                Cancel
              </Button>
              <Button
                type='button'
                variant='primary'
                className='ms-2'
                onClick={handleSubmitDealer}
              >
                {isEditing ? 'Update' : 'Save'}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
      {/* Modal for Edit Mobile number */}
      <Modal show={showMobileModal} onHide={handleCloseMobileModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Change Mobile Number</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className='mb-3'>
              <Form.Label>New Mobile Number</Form.Label>
              <Form.Control
                type='text'
                value={newMobileNumber}
                onChange={e => setNewMobileNumber(e.target.value)}
                placeholder='Enter new mobile number'
                maxLength={10}
              />
            </Form.Group>

            <div className='d-flex justify-content-end'>
              <Button variant='secondary' onClick={handleCloseMobileModal}>
                Cancel
              </Button>
              <Button
                type='button'
                variant='primary'
                className='ms-2'
                onClick={handleMobileChange}
              >
                Update
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Modal for Add Remark */}
      <Modal show={showRemarkModal} onHide={handleCloseRemarkModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Add Remark</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className='mb-3'>
              <Form.Label>Remark</Form.Label>
              <Form.Control
                as='textarea'
                rows={4}
                value={remarkData.remark}
                onChange={e =>
                  setRemarkData(prev => ({ ...prev, remark: e.target.value }))
                }
                placeholder='Enter your remark here...'
              />
            </Form.Group>

            <div className='d-flex justify-content-end'>
              <Button variant='secondary' onClick={handleCloseRemarkModal}>
                Cancel
              </Button>
              <Button
                type='button'
                variant='primary'
                className='ms-2'
                onClick={handleRemarkSubmit}
              >
                Save Remark
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
      {/* Import Dealer Modal */}
      <Modal
        show={showImportDealerModal}
        onHide={() => setShowImportDealerModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Import Dealers</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className='mb-3'>
              <Form.Label>Select CSV File</Form.Label>
              <Form.Control
                type='file'
                accept='.xlsx,.csv'
                onChange={handleImportDealerFile}
              />

              <Form.Text className='text-muted'>
                Please upload an Excel file with dealer information
              </Form.Text>
            </Form.Group>
            <div className='d-flex justify-content-end'>
              <Button
                variant='secondary'
                onClick={() => setShowImportDealerModal(false)}
              >
                Cancel
              </Button>
              <Button
                variant='primary'
                className='ms-2'
                onClick={handleImportDealerSubmit}
              >
                Import
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Import Points Modal */}
      <Modal
        show={showImportPointsModal}
        onHide={() => setShowImportPointsModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Import Points</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className='mb-3'>
              <Form.Label>Select Excel File</Form.Label>
              <Form.Control
                type='file'
                accept='.xlsx'
                onChange={handleImportDealerFile}
              />
              <Form.Text className='text-muted'>
                Please upload an Excel file with points information
              </Form.Text>
            </Form.Group>
            <div className='d-flex justify-content-end'>
              <Button
                variant='secondary'
                onClick={() => setShowImportPointsModal(false)}
              >
                Cancel
              </Button>
              <Button
                variant='primary'
                className='ms-2'
                onClick={handleImportPointsSubmit}
              >
                Import
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Update Dealers Modal */}
      <Modal
        show={showUpdateDealersModal}
        onHide={() => setShowUpdateDealersModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Update Dealers</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className='mb-3'>
              <Form.Label>Select Excel File</Form.Label>
              <Form.Control
                type='file'
                accept='.xlsx'
                onChange={handleImportDealerFile}
              />
              <Form.Text className='text-muted'>
                Please upload an Excel file with updated dealer information
              </Form.Text>
            </Form.Group>
            <div className='d-flex justify-content-end'>
              <Button
                variant='secondary'
                onClick={() => setShowUpdateDealersModal(false)}
              >
                Cancel
              </Button>
              <Button
                variant='primary'
                className='ms-2'
                onClick={handleUpdateDealersSubmit}
              >
                Update
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
      <ToastContainer />
    </div>
  )
}

export default AddCustomerForm
