import { useState } from "react"
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  Input,
  FormControl,
  FormLabel,
  FormErrorMessage,
  useToast,
  Textarea,
} from "@chakra-ui/react"

const AddRentalDialog = ({ isOpen, onClose, onRentalAdded }) => {
  const initialFormState = {
    name: "",
    address: "",
    roomCount: "",
    price: "",
    description: "",
    image: null,
  }

  const [formData, setFormData] = useState(initialFormState)
  const [errors, setErrors] = useState({})
  const toast = useToast()

  const validate = () => {
    let newErrors = {}

    if (!formData.name) newErrors.name = "Building name is required"
    if (!formData.address) newErrors.address = "Address is required"
    if (!formData.roomCount || isNaN(formData.roomCount)) newErrors.roomCount = "Valid room count is required"
    if (!formData.price || isNaN(formData.price)) newErrors.price = "Valid price is required"
    if (!formData.description) newErrors.description = "Description is required"
    if (!formData.image) newErrors.image = "Image is required"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0 // Return true if no errors
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validate()) return

    const formDataToSend = new FormData()
    formDataToSend.append("name", formData.name)
    formDataToSend.append("address", formData.address)
    formDataToSend.append("roomCount", formData.roomCount)
    formDataToSend.append("price", formData.price)
    formDataToSend.append("description", formData.description)
    formDataToSend.append("image", formData.image)

    try {
      const response = await fetch("http://localhost:5000/api/rentals", {
        method: "POST",
        body: formDataToSend,
      })

      if (!response.ok) throw new Error("Failed to add rental")

      toast({ title: "Rental added successfully!", status: "success", duration: 3000, isClosable: true })

      // Reset form fields after success
      setFormData(initialFormState)
      setErrors({})

      // Notify parent component (RentalList) to refresh data
      onRentalAdded()
      onClose()
    } catch (error) {
      toast({ title: error.message, status: "error", duration: 3000, isClosable: true })
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Add New Rental</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <FormControl isInvalid={errors.name}>
            <FormLabel>Building Name</FormLabel>
            <Input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            <FormErrorMessage>{errors.name}</FormErrorMessage>
          </FormControl>

          <FormControl isInvalid={errors.address} mt={4}>
            <FormLabel>Address</FormLabel>
            <Input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />
            <FormErrorMessage>{errors.address}</FormErrorMessage>
          </FormControl>

          <FormControl isInvalid={errors.roomCount} mt={4}>
            <FormLabel>Room Count</FormLabel>
            <Input
              type="number"
              value={formData.roomCount}
              onChange={(e) => setFormData({ ...formData, roomCount: e.target.value })}
            />
            <FormErrorMessage>{errors.roomCount}</FormErrorMessage>
          </FormControl>

          <FormControl isInvalid={errors.price} mt={4}>
            <FormLabel>Price (per month)</FormLabel>
            <Input
              type="number"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            />
            <FormErrorMessage>{errors.price}</FormErrorMessage>
          </FormControl>
          <FormControl isInvalid={errors.description} mt={4}>
            <FormLabel>Description</FormLabel>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Enter a detailed description..."
              size="md"
              resize="vertical"
            />
            <FormErrorMessage>{errors.description}</FormErrorMessage>
          </FormControl>

          <FormControl isInvalid={errors.image} mt={4}>
            <FormLabel>Image</FormLabel>
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => setFormData({ ...formData, image: e.target.files[0] })}
            />
            <FormErrorMessage>{errors.image}</FormErrorMessage>
          </FormControl>
        </ModalBody>
        <ModalFooter>
          <Button colorScheme="blue" onClick={handleSubmit}>
            Submit
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default AddRentalDialog
