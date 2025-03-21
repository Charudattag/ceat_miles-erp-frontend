import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Button, Form, Modal, Table } from 'react-bootstrap'
import { useMutation, useQuery } from '@tanstack/react-query'
import {
  addRateAPI,
  getlatestAllRatesAPI,
  updateProductRateAPI
} from '../../../src/api/api'
import { FaPlus } from 'react-icons/fa'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

const AddRatePage = () => {
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(false)
  const [editRate, setEditRate] = useState(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm()

  // Fetch the latest rates
  const {
    data: response,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['latestrate'],
    queryFn: getlatestAllRatesAPI,
    initialData: { data: [] } // Ensure an empty array as the initial state
  })

  // Extract rates from the API response
  const rates = response?.data || []

  // Mutation for adding rates
  const addMutation = useMutation({
    mutationFn: addRateAPI,
    onSuccess: data => {
      toast.success(data.message || 'Rate added successfully!')
      setShowModal(false)
      reset()
      refetch() // Refetch data after mutation
    },
    onError: error => {
      toast.error(error?.response?.data?.message || 'An error occurred.')
      setLoading(false)
    },
    onSettled: () => {
      setLoading(false)
    }
  })

  // Mutation for updating rates
  const updateMutation = useMutation({
    mutationFn: updateProductRateAPI,
    onSuccess: data => {
      toast.success(data.message || 'Rate updated successfully!')
      setShowModal(false)
      reset()
      refetch() // Refetch data after mutation
    },
    onError: error => {
      toast.error(error?.response?.data?.message || 'An error occurred.')
      setLoading(false)
    },
    onSettled: () => {
      setLoading(false)
    }
  })

  const onSubmit = async data => {
    setLoading(true)
    try {
      if (editRate) {
        // Update rate
        await updateMutation.mutateAsync({
          id: editRate.id,
          Gold: data.Gold,
          Silver: data.Silver
        })
      } else {
        // Add new rate
        await addMutation.mutateAsync({
          Gold: data.Gold,
          Silver: data.Silver
        })
      }
      setLoading(false)
    } catch (error) {
      setLoading(false)
      toast.error('Error adding/updating rate')
    }
  }

  // Show the modal for adding or editing rates
  const handleShowModal = (rate = null) => {
    setEditRate(rate)
    setShowModal(true)
    reset(rate || { Gold: '', Silver: '' })
  }

  const handleCloseModal = () => setShowModal(false)

  return (
    <div className='container bg-white'>
      <div className='container1 '>
        <h1 className='mt-4'>Rate Management</h1>
        {/* <Button
          variant="primary mt-5"
          onClick={() => handleShowModal()}
          style={{ marginLeft: "90%" }}
        >
          <FaPlus /> Add Rate
        </Button> */}
        {isLoading ? (
          <p>Loading rates...</p>
        ) : error ? (
          <p>Error loading rates: {error.message}</p>
        ) : (
          <Table striped bordered hover className='mt-5'>
            <thead>
              <tr>
                <th>Gold</th>
                <th>Silver</th>
                <th>Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {Array.isArray(rates) && rates.length > 0 ? (
                rates.map((rate, index) => (
                  <tr key={index}>
                    <td>{rate.Gold}</td>
                    <td>{rate.Silver}</td>
                    <td>{new Date(rate.updatedAt).toLocaleDateString()}</td>
                    <td>
                      <Button
                        variant='warning'
                        onClick={() => handleShowModal(rate)}
                      >
                        Update
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan='4' className='text-center'>
                    No rates available
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        )}

        <Modal show={showModal} onHide={handleCloseModal} centered>
          <Modal.Header closeButton>
            <Modal.Title>{editRate ? 'Update Rate' : 'Add Rate'}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form onSubmit={handleSubmit(onSubmit)}>
              <Form.Group controlId='Gold'>
                <Form.Label>Gold Rate</Form.Label>
                <Form.Control
                  type='number'
                  placeholder='Enter Gold rate'
                  {...register('Gold', { required: 'Gold rate is required' })}
                  isInvalid={!!errors.Gold}
                  min={1}
                />
                <Form.Control.Feedback type='invalid'>
                  {errors.Gold?.message}
                </Form.Control.Feedback>
              </Form.Group>
              <Form.Group controlId='Silver'>
                <Form.Label>Silver Rate</Form.Label>
                <Form.Control
                  type='number'
                  placeholder='Enter Silver rate'
                  {...register('Silver', {
                    required: 'Silver rate is required'
                  })}
                  isInvalid={!!errors.Silver}
                  min={1}
                />
                <Form.Control.Feedback type='invalid'>
                  {errors.Silver?.message}
                </Form.Control.Feedback>
              </Form.Group>

              <div className='d-flex justify-content-end mt-3'>
                <Button type='submit' variant='primary' disabled={loading}>
                  {loading ? 'Saving...' : 'Save'}
                </Button>
              </div>
            </Form>
          </Modal.Body>
        </Modal>
      </div>
      <ToastContainer />
    </div>
  )
}

export default AddRatePage
