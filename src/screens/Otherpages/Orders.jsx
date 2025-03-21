import React, { useState, useEffect } from 'react'
import 'bootstrap/dist/css/bootstrap.min.css'
import {
  Form,
  Button,
  Table,
  Badge,
  InputGroup,
  FormControl,
  Modal,
  Dropdown
} from 'react-bootstrap'
import { FaSearch, FaEdit } from 'react-icons/fa'
import { Link, useNavigate } from 'react-router-dom'
import Footer from './Footer'
import { getAllOrderAPI, updateOrderstatusAPI ,exportOrdersToCSV,exportOrderToCSVByDate,exportOrderItemsToCSV,exportOrderItemsToCSVByDate} from '../../../src/api/api'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { set } from 'react-hook-form'

function Orders () {
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [selectedOrderId, setSelectedOrderId] = useState(null)
  const [newStatus, setNewStatus] = useState('')
  const [ordersPerPage] = useState(10)
  const [showExportModal, setShowExportModal] = useState(false);
  const [showExportItemsModal, setShowExportItemsModal] = useState(false);
const [startDate, setStartDate] = useState('');
const [endDate, setEndDate] = useState('');


  const [pagination, setPagination] = useState({
    totalRecords: 0,
    currentPage: 1,
    totalPages: 0,
    pageSize: 10
  })
  const itemsPerPage = 10

  // Then create filtered orders
  const filteredOrders = orders.filter(
    order =>
      order.orderId.toString().includes(searchQuery.toLowerCase()) ||
      order.dealerId.toString().includes(searchQuery.toLowerCase())
  )

  // Now use filteredOrders for pagination
  const indexOfLastOrder = currentPage * ordersPerPage
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage
  const currentOrders = filteredOrders.slice(
    indexOfFirstOrder,
    indexOfLastOrder
  )
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage)

  // Pagination control functions
  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1)
    }
  }

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
  }
  const statusColors = {
    PENDING: 'warning',
    DISPATCHED: 'info',
    DELIVERED: 'success',
    CANCELLED: 'danger',
    RETURNED: 'secondary'
  }
  useEffect(() => {
    setCurrentPage(1)
  }, []) 

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true)
      try {
        const response = await getAllOrderAPI()
        if (response.success) {
          const formattedOrders = response.orders.map(order => ({
            orderId: order.id,
            dealerId: order.dealer_id,
            orderAmount: order.order_amount,
            orderDate: new Date(order.order_date).toLocaleDateString(),
            addressId: order.address_id,
            status: order.order_status,
            promoCode: order.promocode || 'N/A',
            discountValue: order.discount_value || '0',
            approval: order.approval,
            courierName: order.courier_name || 'N/A',
            awbNumber: order.awb || 'N/A',
            dispatchDate: order.dispatch_date
              ? new Date(order.dispatch_date).toLocaleDateString()
              : 'N/A',
            deliveredDate: order.delivered_date
              ? new Date(order.delivered_date).toLocaleDateString()
              : 'N/A'
          }))
          setOrders(formattedOrders)
          setPagination(response.pagination)
        }
      } catch (error) {
        console.error('Error fetching orders:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [])

  const handleEditClick = (orderId, currentStatus) => {
    setSelectedOrderId(orderId)
    setNewStatus(currentStatus)
    setShowModal(true)
  }

  const handleStatusChange = status => {
    setNewStatus(status)
  }

  const handleUpdateStatus = async () => {
    if (!selectedOrderId || !newStatus) {
      console.error('Missing order ID or status')
      return
    }

    try {
      const response = await updateOrderstatusAPI({
        orderId: selectedOrderId,
        status: newStatus
      })

      if (response.success) {
        console.log('Status updated successfully')
        setOrders(prevOrders =>
          prevOrders.map(order =>
            order.orderId === selectedOrderId
              ? { ...order, status: newStatus }
              : order
          )
        )
        setShowModal(false)
        toast.success('Order status updated successfully!') // Show success toast
      } else {
        console.error('Failed to update status:', response.message)
        toast.error('Failed to update order status!') // Show error toast
      }
    } catch (error) {
      console.error('Error updating status:', error)
      toast.error('An error occurred while updating the status!') // Show error toast
    }
  }

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

    for (let page = startPage; page <= endPage; page++) {
      items.push(
        <li
          key={page}
          className={`page-item ${currentPage === page ? 'active' : ''}`}
        >
          <button className='page-link' onClick={() => setCurrentPage(page)}>
            {page}
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


  const handleExportOrderReport = async () => {
    const toastId = toast.loading('Preparing export...');
    
    try {
      const response = await (startDate && endDate
        ? exportOrderToCSVByDate(startDate, endDate)
        : exportOrdersToCSV());
  
      if (!response.data || !response.data.length) {
        toast.update(toastId, {
          render: 'No data available for export',
          type: 'warning',
          isLoading: false,
          autoClose: 3000
        });
        return;
      }
  
      const csvData = response.data;
      const headers = Object.keys(csvData[0]);
      const csvString = [
        headers.join(','),
        ...csvData.map(row =>
          headers.map(header => {
            const value = row[header]?.toString().trim() || '';
            return value.includes(',') || value.includes('"')
              ? `"${value.replace(/"/g, '""')}"` 
              : value;
          }).join(',')
        )
      ].join('\n');
  
      const blob = new Blob(['\ufeff' + csvString], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const fileName = `Order_report_${startDate ? `${startDate}_to_${endDate}` : 'all'}.csv`;
  
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
  
      setShowExportModal(false);
      toast.update(toastId, {
        render: 'Export completed successfully',
        type: 'success',
        isLoading: false,
        autoClose: 3000
      });
    } catch (error) {
      console.error('Error exporting CSV:', error);
      toast.update(toastId, {
        render: 'Failed to export data',
        type: 'error',
        isLoading: false,
        autoClose: 3000
      });
    }
  };
  


  const handleExportOrderItemsReport = async () => {
    try {
      const response = await (startDate && endDate
        ? exportOrderItemsToCSVByDate(startDate, endDate)
        : exportOrderItemsToCSV());
  
      if (!response.data || !response.data.length) {
        toast.warning('No data available for export');
        return;
      }
  
      const csvData = response.data;
      const headers = Object.keys(csvData[0]);
      const csvString = [
        headers.join(','),
        ...csvData.map(row =>
          headers.map(header => {
            const value = row[header]?.toString().trim() || '';
            return value.includes(',') || value.includes('"')
              ? `"${value.replace(/"/g, '""')}"` 
              : value;
          }).join(',')
        )
      ].join('\n');
  
      const blob = new Blob(['\ufeff' + csvString], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const fileName = `Order_Items_report_${startDate ? `${startDate}_to_${endDate}` : 'all'}.csv`;
  
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
  
      setShowExportItemsModal(false);
      toast.success('Export completed successfully');
    } catch (error) {
      console.error('Error exporting CSV:', error);
      toast.error('Failed to export data');
    }
  };
  


  return (
    <div className='container bg-white'>
      <h2 className='text-left mb-4'>Orders Management</h2>
      <div>
  <button 
    className='btn btn-primary mb-3' 
    onClick={() => setShowExportModal(true)}
  >
    Order Report
  </button>
  &nbsp;
  &nbsp;
  <button
  className='btn btn-secondary mb-3'
  onClick={() => setShowExportItemsModal(true)}
  >
    Order Items Report
  </button>
</div>

      <div className='d-flex justify-content-between align-items-center mb-3'>
        <InputGroup style={{ width: '100%' }} className='d-flex'>
          <FormControl
            type='text'
            placeholder='Search by order ID or customer name'
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className='form-control-lg form-control-sm w-75 w-md-50'
          />

          <InputGroup.Text className='order-1 order-md-0'>
            <FaSearch />
          </InputGroup.Text>
        </InputGroup>
      </div>

      {loading ? (
        <div className='text-center'>Loading...</div>
      ) : (
        <div className='table-responsive'>
          <Table bordered hover>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Dealer ID</th>
                <th>Order Amount</th>
                <th>Order Date</th>
                <th>Status</th>
                <th>Courier Name</th>
                <th>AWB Number</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {currentOrders.map((order, index) => (
                <tr
                  key={index}
                  onClick={() => navigate(`/orderDetails/${order.orderId}`)}
                >
                  <td>{order.orderId}</td>
                  <td>{order.dealerId}</td>
                  <td>₹{order.orderAmount}</td>
                  <td>{order.orderDate}</td>
                  <td>
                    <Badge bg={statusColors[order.status] || 'secondary'}>
                      {order.status}
                    </Badge>
                  </td>
                  <td>{order.courierName}</td>
                  <td>{order.awbNumber}</td>
                  <td>
                    <FaEdit
                      onClick={e => {
                        e.stopPropagation() // Prevent row click navigation
                        handleEditClick(order.orderId, order.status)
                      }}
                      style={{ cursor: 'pointer' }}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      )}

      <ul className='pagination justify-content-center'>
        <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
          <button
            className='page-link'
            onClick={prevPage}
            disabled={currentPage === 1}
          >
            Previous
          </button>
        </li>
        {renderPaginationItems()}
        <li
          className={`page-item ${
            currentPage === pagination.totalPages ? 'disabled' : ''
          }`}
        >
          <button
            className='page-link'
            onClick={nextPage}
            disabled={currentPage === pagination.totalPages}
          >
            Next
          </button>
        </li>
      </ul>

      {/* Modal for editing order status */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Order Status</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Dropdown onSelect={handleStatusChange}>
            <Dropdown.Toggle
              id='dropdown-basic'
              style={{
                width: '50%',
                textDecoration: 'none',
                backgroundColor: 'white',
                color: 'black'
              }}
            >
              {newStatus || 'Select Status'}
            </Dropdown.Toggle>
            <Dropdown.Menu style={{ width: '50%' }}>
              {Object.keys(statusColors).map(status => (
                <Dropdown.Item key={status} eventKey={status}>
                  {status}
                </Dropdown.Item>
              ))}
            </Dropdown.Menu>
          </Dropdown>
        </Modal.Body>
        <Modal.Footer>
          <Button variant='secondary' onClick={() => setShowModal(false)}>
            Close
          </Button>

          <Button variant='primary' onClick={handleUpdateStatus}>
            Update Status
          </Button>
        </Modal.Footer>
      </Modal>
      {/* Modal for exporting order report */}
      <Modal show={showExportModal} onHide={() => setShowExportModal(false)}>
  <Modal.Header closeButton>
    <Modal.Title>Export Order Report</Modal.Title>
  </Modal.Header>
  <Modal.Body>
    <Form>
      <Form.Group controlId='startDate'>
        <Form.Label>Start Date</Form.Label>
        <Form.Control
          type='date'
          value={startDate}
          onChange={e => setStartDate(e.target.value)}
        />
      </Form.Group>
      <Form.Group controlId='endDate'>
        <Form.Label>End Date</Form.Label>
        <Form.Control
          type='date'
          value={endDate}
          onChange={e => setEndDate(e.target.value)}
        />
      </Form.Group>
    </Form>
  </Modal.Body>
  <Modal.Footer>
    <Button variant='secondary' onClick={() => setShowExportModal(false)}>
      Close
    </Button>
    <Button 
      variant='info' 
      onClick={() => {
        setStartDate('');
        setEndDate('');
        handleExportOrderReport();
      }}
    >
      Export All Orders
    </Button>
    <Button 
      variant='primary' 
      onClick={handleExportOrderReport}
      disabled={!startDate || !endDate}
    >
      Export By Date
    </Button>
  </Modal.Footer>
</Modal>

{/* Modal for exporting order items */}
      <Modal show={showExportItemsModal} onHide={() => setShowExportItemsModal(false)}>
      <Modal.Header closeButton>
    <Modal.Title>Export Order Items Report</Modal.Title>
  </Modal.Header>
  <Modal.Body>
    <Form>
      <Form.Group controlId='startDate'>
        <Form.Label>Start Date</Form.Label>
        <Form.Control
          type='date'
          value={startDate}
          onChange={e => setStartDate(e.target.value)}
        />
      </Form.Group>
      <Form.Group controlId='endDate'>
        <Form.Label>End Date</Form.Label>
        <Form.Control
          type='date'
          value={endDate}
          onChange={e => setEndDate(e.target.value)}
        />
      </Form.Group>
    </Form>
  </Modal.Body>
  <Modal.Footer>
    <Button variant='secondary' onClick={() => setShowExportItemsModal(false)}>
      Close
    </Button>
    <Button 
      variant='info' 
      onClick={() => {
        setStartDate('');
        setEndDate('');
        handleExportOrderItemsReport();
      }}
    >
      Export All Orders Items
    </Button>
    <Button 
      variant='primary' 
      onClick={handleExportOrderItemsReport}
      disabled={!startDate || !endDate}
    >
      Export By Date 
    </Button>
  </Modal.Footer>
      </Modal>
      <ToastContainer />
    </div>
  )
}

export default Orders
