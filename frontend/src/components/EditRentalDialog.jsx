import { useEffect, useState } from "react"
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Button,
  FormControl,
  FormLabel,
  Input,
  NumberInput,
  NumberInputField,
  useToast,
  Image,
  Textarea,
} from "@chakra-ui/react"
import { API_URL } from "../../constant/api"

const EditRentalDialog = ({ isOpen, onClose, rental, onRentalUpdated }) => {
  const toast = useToast()
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    roomCount: 0,
    price: 0,
    description: "",
    image: "",
  })
  const [previewImage, setPreviewImage] = useState("")
  const [selectedFile, setSelectedFile] = useState(null)

  useEffect(() => {
    if (rental) {
      setFormData({
        name: rental.name || "",
        address: rental.address || "",
        roomCount: rental.roomCount,
        price: rental.price,
        description: rental.description || "",
        image: rental.image || "",
      })
      setPreviewImage(rental.image ? `${API_URL}${rental.image}` : "")
    }
  }, [rental])

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    setSelectedFile(file)

    const reader = new FileReader()
    reader.onloadend = () => {
      setPreviewImage(reader.result)
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = async () => {
    try {
      const formDataUpload = new FormData()
      formDataUpload.append("name", formData.name)
      formDataUpload.append("address", formData.address)
      formDataUpload.append("roomCount", formData.roomCount)
      formDataUpload.append("price", formData.price)
      formDataUpload.append("description", formData.description)

      if (selectedFile) {
        formDataUpload.append("image", selectedFile)
      }

      const response = await fetch(`${API_URL}/api/rentals/${rental._id}`, {
        method: "PUT",
        body: formDataUpload,
      })

      if (!response.ok) {
        throw new Error("Failed to update rental")
      }

      const updatedRental = await response.json()

      toast({
        title: "Rental updated successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      })
      onRentalUpdated && onRentalUpdated(updatedRental)

      onClose()
    } catch (error) {
      console.error("Update Error:", error)

      toast({
        title: "Error updating rental",
        description: error.message,
        status: "error",
        duration: 3000,
        isClosable: true,
      })
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Edit Rental</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <FormControl>
            <FormLabel>Building Name</FormLabel>
            <Input name="name" value={formData.name} onChange={handleChange} />
          </FormControl>

          <FormControl mt={4}>
            <FormLabel>Address</FormLabel>
            <Input name="address" value={formData.address} onChange={handleChange} />
          </FormControl>

          <FormControl mt={4}>
            <FormLabel>Room Count</FormLabel>
            <NumberInput
              value={formData.roomCount}
              onChange={(valueString) => setFormData({ ...formData, roomCount: Number(valueString) })}
            >
              <NumberInputField />
            </NumberInput>
          </FormControl>

          <FormControl mt={4}>
            <FormLabel>Price</FormLabel>
            <NumberInput
              value={formData.price}
              onChange={(valueString) => setFormData({ ...formData, price: Number(valueString) })}
            >
              <NumberInputField />
            </NumberInput>
          </FormControl>
          <FormControl mt={4}>
            <FormLabel>Description</FormLabel>
            <Textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter a detailed description..."
              size="md"
              resize="vertical"
            />
          </FormControl>

          <FormControl mt={4}>
            <FormLabel>Current Image URL</FormLabel>
            <Input name="image" value={formData.image} readOnly />
          </FormControl>

          {previewImage && (
            <Image
              src={previewImage}
              alt="Current Rental Image"
              mt={4}
              width="250px"
              height="150px"
              borderRadius="md"
            />
          )}

          <FormControl mt={4}>
            <FormLabel>Change Image</FormLabel>
            <Input type="file" accept="image/*" onChange={handleFileChange} />
          </FormControl>
        </ModalBody>
        <ModalFooter>
          <Button colorScheme="blue" onClick={handleSubmit}>
            Save Changes
          </Button>
          <Button onClick={onClose} ml={3}>
            Cancel
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default EditRentalDialog
