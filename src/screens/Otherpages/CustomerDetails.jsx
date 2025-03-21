import React, { useState, useEffect } from 'react'
import {
  getDealersAPI,
  addPoints,
  removePoints,
  addRemarksAPI
} from '../../api/api'
import { Tabs, Table, Badge } from 'antd'
import { useNavigate, useParams } from 'react-router-dom'
import { Row, Col, Container, Button, Modal, Form } from 'react-bootstrap'
import './CustomerDetails.css'
import { toast, ToastContainer } from 'react-toastify'
import {
  MdOutlineAdd,
  MdOutlineRemoveCircleOutline,
  MdOutlineAddCircleOutline,
  MdHistory,
  MdComment
} from 'react-icons/md'

const CustomerDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [dealerData, setDealerData] = useState(null)
  const [activeTab, setActiveTab] = useState('1')
  const [pointsHistory, setPointsHistory] = useState([])
  const [showPointsModal, setShowPointsModal] = useState(false)
  const [selectedDealerId, setSelectedDealerId] = useState(null)
  const [selectedDealer, setSelectedDealer] = useState(null)
  const [showRemarkModal, setShowRemarkModal] = useState(false)
  const [pointsAction, setPointsAction] = useState('add')
  const [pointsData, setPointsData] = useState({
    points: '',
    remarks: ''
  })
  const [remarksData, setRemarksData] = useState({
    remarks: ''
  })
  const [remarksHistory, setRemarksHistory] = useState([])

  const [isEditing, setIsEditing] = useState(false)

  const handlePointsInputChange = e => {
    const { name, value } = e.target
    setPointsData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleRemarksInputChange = e => {
    const { name, value } = e.target
    setRemarksData(prev => ({
      ...prev,
      [name]: value
    }))
  }
  // Add these functions
  const handleShowPointsModal = (dealer, action) => {
    setSelectedDealer(dealer)
    setPointsAction(action)
    setPointsData({ points: '', remarks: '' })
    setShowPointsModal(true)
  }

  const handleClosePointsModal = () => {
    setShowPointsModal(false)
    setPointsData({ points: '', remarks: '' })
  }

  const handleShowRemarkModal = dealer => {
    console.log(dealer)
    setSelectedDealer(dealer)
    setSelectedDealerId(dealer.id)
    setRemarksData({ remarks: '' })
    setShowRemarkModal(true)
  }

  const handleCloseRemarksModal = () => {
    setShowRemarkModal(false)
    setRemarksData({ remarks: '' })
  }

  const handleSubmitRemarks = async () => {
    try {
      if (!remarksData.remarks.trim()) {
        toast.warning('Please enter remarks')
        return
      }

      const response = await addRemarksAPI(selectedDealer.id, remarksData)

      if (response.success) {
        toast.success('Remarks added successfully')
        handleCloseRemarksModal()
        fetchDealerDetails()
      }
    } catch (error) {
      console.error('Error adding remarks:', error)
      toast.error('Failed to add remarks')
    }
  }

  const pointsHistoryColumns = [
    {
        title: 'Sr. No',
        dataIndex: '',
        key: '',
        width: 80,
        render: (_, record, index) => index + 1 // Display the serial number
      },
    {
        title: 'Points',
        dataIndex: 'points',
        key: 'points',
        width: 100,
        render: (text, record) => (
          <span
            className={
              record.type === 'CREDIT' ? 'text-green-600' : 'text-red-600'
            }
          >
            {record.type === 'CREDIT' ? '+' : '-'}
            {text}
          </span>
        )
      },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      width: 100,
      render: type => (
        <Badge color={type === 'CREDIT' ? 'success' : 'error'} text={type} />
      )
    },
    {
      title: 'Order ID',
      dataIndex: 'order_id',
      key: 'order_id',
      width: 100,
      render: orderId => orderId || '-'
    },
    {
      title: 'Comments',
      dataIndex: 'comment',
      key: 'comment',
      width: 250
    },
    {
      title: 'Date',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 120,
      render: date => new Date(date).toLocaleDateString()
    }
  ]

  const remarksHistoryColumns = [
    {
      title: 'Sr. No',
      dataIndex: 'id',
      key: 'id',
      width: 80
    },
    // {
    //   title: 'Dealer Id',
    //   dataIndex: 'dealer_id',
    //   key: 'dealer_id',
    //   width: 100
    // },

    {
      title: 'Date',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 120,
      render: date => {
        if (date) {
          const dt = new Date(date)
          return `${dt.getDate().toString().padStart(2, '0')}/${(
            dt.getMonth() + 1
          )
            .toString()
            .padStart(2, '0')}/${dt.getFullYear()}`
        }
        return '-'
      }
    },
    {
      title: 'Remarks',
      dataIndex: 'remark',
      key: 'remark'
    }
  ]

  const exportHistoryToCSV = () => {
    const csvData = [];
    const headers = ['Sr. No', 'Type', 'Points', 'Order_id', 'Comment', 'Date'];
    const data = pointsHistory;
  
    csvData.push(headers.join(','));
  
    let srNo = 1;
    data.forEach((row) => {
      const csvRow = [
        srNo,
        row.type,
        row.points,
        row.order_id,
        row.comment,
        row.created_at
      ].join(',');
      csvData.push(csvRow);
      srNo++;
    });
  
    const csvString = csvData.join('\n');
    const a = document.createElement('a');
    a.href = `data:text/csv;charset=utf-8,${csvString}`;
    a.target = '_blank';
    a.download = `${dealerData.dealer_name}.csv`;
    a.click();
  };

  const handleSubmitPoints = async () => {
    try {
      if (!pointsData.points || pointsData.points <= 0) {
        toast.warning('Please enter valid points')
        return
      }

      const response = await (pointsAction === 'remove'
        ? removePoints(selectedDealer.id, pointsData)
        : addPoints(selectedDealer.id, pointsData))

      if (response.success) {
        toast.success(response.message)
        handleClosePointsModal()
        fetchDealerDetails()
      }
    } catch (error) {
      console.error('Error handling points:', error)
      toast.error('Failed to process points')
    }
  }

  useEffect(() => {
    if (id) {
      fetchDealerDetails()
    }
  }, [id])

  const fetchDealerDetails = async () => {
    try {
      const response = await getDealersAPI(id)
      if (response.success) {
        setDealerData(response.dealer)
        setPointsHistory(response.dealer.PointsHistories)
        setRemarksHistory(response.dealer.remarks)
      }
    } catch (error) {
      console.error('Error fetching dealer details:', error)
    }
  }

  return (
    <div className='dealer-summary mt-4 container bg-white'>
      {dealerData && (
        <>
          <Row>
            <Col md={6}>
              <h2 className='text-left mt-4'>Dealer Summary #{id}</h2>
            </Col>
            <Col md={6}>
              <Container
                className=''
                style={{ display: 'flex', justifyContent: 'flex-end' }}
              >
                {/* <Button variant='outline-primary' className='edit-button'>
                  <i className='fas fa-edit'></i> Edit
                </Button> */}
                &nbsp; &nbsp;
                <Button
                  variant='outline-primary'
                  className='back-button'
                  onClick={() => navigate('/dealers')}
                >
                  <i className='fas fa-arrow-left me-2'></i>
                  Back to Dealers
                </Button>
              </Container>
            </Col>
          </Row>
          <div className='row mt-5'>
            <div className='col-md-4'>
              <p>
                <strong>Dealer Name:</strong> {dealerData.dealer_name}
              </p>
              <p>
                <strong>Dealer Code:</strong> {dealerData.dealer_code}
              </p>
              <p>
                <strong>Contact:</strong> {dealerData.mobile}
              </p>
            </div>
            <div className='col-md-4'>
              <p>
                <strong>Region:</strong> {dealerData.region}
              </p>
              <p>
                <strong>Zone:</strong> {dealerData.zone}
              </p>
              <p>
                <strong>Type:</strong> {dealerData.type}
              </p>
            </div>
            <div className='col-md-4'>
              <p>
                <strong>Current Points:</strong> {dealerData.current_points}
              </p>
              <p>
                <strong>Redeemed Points:</strong> {dealerData.redeemed_points}
              </p>
              <p>
                <strong>Total Points:</strong> {dealerData.total_points}
              </p>
            </div>
          </div>
          <div className='points-history mt-4'>
            <div className='mb-4'>
              <div className='buttons-container'>
                <Button
                  size='md'
                  variant='success'
                  onClick={e => {
                    handleShowPointsModal(dealerData, 'add')
                  }}
                >
                  <MdOutlineAddCircleOutline size={25} />&nbsp;
                  Add Points
                </Button>
                &nbsp; &nbsp;
                <Button
                  size='md'
                  variant='danger'
                  onClick={e => {
                    handleShowPointsModal(dealerData, 'remove')
                  }}
                >
                  {' '}
                  <MdOutlineRemoveCircleOutline size={25} />&nbsp;
                  Remove Points
                </Button>
                &nbsp; &nbsp;
                <Button
                  variant='warning'
                  className='add-remarks-button'
                  onClick={() => handleShowRemarkModal(dealerData)}
                >
                  <MdComment size={23} />&nbsp;
                  Add Remarks
                </Button>
                &nbsp; &nbsp;
                <Button 
  variant='info' 
  className='export-points-history'
  onClick={() => exportHistoryToCSV()}
>
  <MdHistory size={25} />&nbsp;
  Exports Points History
</Button>
              </div>
            </div>
            <h5>Points History & Remarks</h5>
            <Tabs
              activeKey={activeTab}
              onChange={setActiveTab}
              items={[
                {
                  key: '1',
                  label: 'Points History',
                  children: (
                    <Table
                      columns={pointsHistoryColumns}
                      dataSource={pointsHistory}
                      pagination={{ pageSize: 10 }}
                      scroll={{ x: 'max-content' }}
                      rowKey='id'
                    />
                  )
                },
                {
                  key: '2',
                  label: 'Remarks',
                  children: (
                    <Table
                      columns={remarksHistoryColumns}
                      dataSource={remarksHistory}
                      pagination={{ pageSize: 10 }}
                      scroll={{ x: 'max-content' }}
                      rowKey='id'
                    />
                  )
                }
              ]}
            />
          </div>
        </>
      )}

      <Modal show={showPointsModal} onHide={handleClosePointsModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            {pointsAction === 'remove' ? 'Remove Points' : 'Add Points'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            {selectedDealer && (
              <div className='mb-3'>
                <p>
                  <strong>Dealer Name:</strong> {selectedDealer.dealer_name}
                </p>
                <p>
                  <strong>Current Points:</strong>{' '}
                  {selectedDealer.current_points}
                </p>
              </div>
            )}

            <Form.Group className='mb-3'>
              <Form.Label>
                {pointsAction === 'remove'
                  ? 'Points to Remove'
                  : 'Points to Add'}
              </Form.Label>
              <Form.Control
                type='number'
                name='points'
                value={pointsData.points}
                onChange={handlePointsInputChange}
                placeholder='Enter points'
                min='1'
              />
            </Form.Group>

            <Form.Group className='mb-3'>
              <Form.Label>Remarks</Form.Label>
              <Form.Control
                as='textarea'
                name='remarks'
                value={pointsData.remarks}
                onChange={handlePointsInputChange}
                placeholder='Enter remarks'
                rows={3}
              />
            </Form.Group>

            <div className='d-flex justify-content-end'>
              <Button variant='secondary' onClick={handleClosePointsModal}>
                Cancel
              </Button>
              <Button
                type='button'
                variant={pointsAction === 'remove' ? 'danger' : 'success'}
                className='ms-2'
                onClick={handleSubmitPoints}
              >
                {pointsAction === 'remove' ? 'Remove Points' : 'Add Points'}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      <Modal show={showRemarkModal} onHide={handleCloseRemarksModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Add Remarks</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className='mb-3'>
              <Form.Label>Remarks</Form.Label>
              <Form.Control
                as='textarea'
                rows={3}
                name='remarks'
                value={remarksData.remarks}
                onChange={handleRemarksInputChange}
                placeholder='Enter remarks'
              />
            </Form.Group>
            <div className='d-flex justify-content-end'>
              <Button variant='secondary' onClick={handleCloseRemarksModal}>
                Cancel
              </Button>
              <Button
                type='button'
                variant='success'
                className='ms-2'
                onClick={handleSubmitRemarks}
              >
                Add Remarks
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
      <ToastContainer />
    </div>
  )
}

export default CustomerDetails
