import { Box, Button, Center, Divider, Heading, Image, Spinner, Text, VStack } from "@chakra-ui/react"
import { useEffect, useState } from "react"
import { Link, useLocation } from "react-router-dom"
import { API_URL } from "../../constant/api"

const RentalDetail = () => {
  const location = useLocation()
  const [rental, setRental] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const rentalId = location.state?.id
    if (!rentalId) return

    fetch(`${API_URL}/api/rentals/${rentalId}`)
      .then((res) => res.json())
      .then((data) => setRental(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false))
  }, [location.state])

  if (loading)
    return (
      <Center h="100vh">
        <Spinner size="xl" thickness="4px" speed="0.65s" color="blue.500" />
      </Center>
    )

  if (!rental) return <Text textAlign="center">Rental not found</Text>

  return (
    <Box maxW="700px" mx="auto" p={6} boxShadow="lg" borderRadius="md" bg="white">
      <Heading as="h2" size="xl" textAlign="center" mb={4} color="blue.600">
        {rental.name}
      </Heading>
      <Image src={`${API_URL}${rental.image}`} alt={rental.name} borderRadius="md" w="100%" mb={4} />

      <VStack align="start" spacing={3}>
        <Text fontSize="lg" fontWeight="bold">
          Address:
        </Text>
        <Text>{rental.address}</Text>
        <Divider />

        <Text fontSize="lg" fontWeight="bold">
          Rooms:
        </Text>
        <Text>{rental.roomCount}</Text>
        <Divider />

        <Text fontSize="lg" fontWeight="bold">
          Price:
        </Text>
        <Text color="green.500" fontWeight="bold">
          ${rental.price} / month
        </Text>
        <Divider />

        <Text fontSize="lg" fontWeight="bold">
          Description:
        </Text>
        <Text>{rental.description}</Text>
      </VStack>

      <Button as={Link} to="/" mt={6} colorScheme="blue" w="100%">
        Back to Rentals
      </Button>
    </Box>
  )
}

export default RentalDetail
