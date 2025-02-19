import {
  Box,
  Button,
  Flex,
  Heading,
  HStack,
  IconButton,
  Image,
  Input,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useToast,
} from "@chakra-ui/react"
import { useEffect, useState } from "react"
import {
  FaEdit,
  FaEllipsisV,
  FaEye,
  FaLongArrowAltDown,
  FaLongArrowAltUp,
  FaPlus,
  FaSearch,
  FaTimes,
  FaTrash,
} from "react-icons/fa"
import { Link } from "react-router-dom"
import { API_URL } from "../../constant/api"
import AddRentalDialog from "../components/AddRentalDialog"
import DeleteConfirmDialog from "../components/DeleteConfirmDialog"
import EditRentalDialog from "../components/EditRentalDialog"
import { slugify } from "../utils/slug"
import ExportRentals from "../components/ExportRental"

const RentalList = () => {
  const limit = 5
  const [rentals, setRentals] = useState([])
  const [isAdding, setIsAdding] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [sortKey, setSortKey] = useState("")
  const [sortOrder, setSortOrder] = useState("")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalRecords, setTotalRecords] = useState(0)
  const [isEditing, setIsEditing] = useState(false)
  const [editRental, setEditRental] = useState(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedRentalId, setSelectedRentalId] = useState(null)
  const toast = useToast()

  const fetchRentals = async () => {
    try {
      const response = await fetch(
        `${API_URL}/api/rentals?page=${page}&limit=${limit}&sort=${sortKey}&order=${sortOrder}`
      )
      const data = await response.json()
      setRentals(data.rentals)
      setTotalRecords(data.total)
      setTotalPages(Math.ceil(data.total / limit))
      setIsSearching(false)
    } catch (error) {
      console.error("Error fetching rentals:", error)
      toast({ title: "Error fetching rentals", status: "error", duration: 3000, isClosable: true })
    }
  }

  const fetchSearchResults = async (searchPage = 1) => {
    if (!searchQuery.trim()) return
    try {
      const response = await fetch(
        `${API_URL}/api/rentals/search?query=${searchQuery}&page=${searchPage}&limit=${limit}&sort=${sortKey}&order=${sortOrder}`
      )
      const data = await response.json()
      setRentals(data.rentals)
      setTotalRecords(data.total) // Total matching records
      setTotalPages(Math.ceil(data.total / limit))
      setIsSearching(true)
      setPage(searchPage)
    } catch (error) {
      console.error("Error searching rentals:", error)
      toast({ title: "Error searching rentals", status: "error", duration: 3000, isClosable: true })
    }
  }

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!searchQuery.trim()) return
    fetchSearchResults(1)
  }

  const handleSort = async (key, direction) => {
    setSortKey(key)
    setSortOrder(direction)

    if (isSearching) {
      fetchSearchResults(page)
    } else {
      fetchRentals(page)
    }
  }

  const handlePageChange = (newPage) => {
    setPage(newPage)

    if (isSearching) {
      fetchSearchResults(newPage)
    } else {
      fetchRentals(newPage)
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      if (isSearching) {
        await fetchSearchResults(page)
      } else {
        await fetchRentals()
      }
    }

    fetchData()
  }, [page, sortKey, sortOrder])

  const handleClearSearch = () => {
    setSearchQuery("")
    setPage(1)
    setSortKey("")
    setSortOrder("")
    setIsSearching(false)
    fetchRentals(1)
  }

  const handleEditClick = (rental) => {
    setEditRental(rental)
    setIsEditing(true)
  }

  const handleDeleteClick = (id) => {
    setSelectedRentalId(id)
    setIsDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!selectedRentalId) return
    try {
      await fetch(`${API_URL}/api/rentals/${selectedRentalId}`, { method: "DELETE" })
      setRentals(rentals.filter((rental) => rental._id !== selectedRentalId))
      toast({ title: "Rental deleted successfully", status: "success", duration: 3000, isClosable: true })
    } catch (error) {
      console.log(error)
      toast({ title: "Error deleting rental", status: "error", duration: 3000, isClosable: true })
    }
    setIsDeleteDialogOpen(false)
  }

  return (
    <Box p={6} w="full">
      <Flex justify="space-between" align="center" mb={4}>
        <Heading size="md" textTransform="uppercase">
          Rental List
        </Heading>
        <Button colorScheme="blue" leftIcon={<FaPlus />} onClick={() => setIsAdding(true)}>
          Add New Rental
        </Button>
      </Flex>

      <Flex justify="space-between" align="center" mb={4}>
        {/* Left: Search Bar */}
        <HStack spacing={2} w="full" maxW="400px">
          <Input
            placeholder="Search by name or address..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            size="sm"
            variant="filled"
            borderRadius="md"
          />
          <Button type="submit" colorScheme="blue" size="sm" onClick={handleSearch}>
            <FaSearch />
          </Button>
          {searchQuery && (
            <IconButton
              icon={<FaTimes />}
              size="sm"
              colorScheme="red"
              onClick={handleClearSearch}
              aria-label="Clear search"
            />
          )}
        </HStack>

        <ExportRentals rentals={rentals} />
      </Flex>

      <Text fontSize="md" fontWeight="semibold" mb={4}>
        Total records: {rentals.length} / {totalRecords}
      </Text>

      <Table variant="simple" bg={"#F6F7F9"}>
        <Thead borderBottom="3px solid #a2a4a8">
          <Tr>
            <Th>Image</Th>
            <Th>Building Name</Th>
            <Th>Address</Th>
            <Th>
              Rooms
              <IconButton
                size="xs"
                icon={<FaLongArrowAltDown color="red" />}
                onClick={() => handleSort("roomCount", "desc")}
              />
              <IconButton
                size="xs"
                icon={<FaLongArrowAltUp color="green" />}
                onClick={() => handleSort("roomCount", "asc")}
              />
            </Th>
            <Th>
              Price (per month)
              <IconButton
                size="xs"
                icon={<FaLongArrowAltDown color="red" />}
                onClick={() => handleSort("price", "desc")}
              />
              <IconButton
                size="xs"
                icon={<FaLongArrowAltUp color="green" />}
                onClick={() => handleSort("price", "asc")}
              />
            </Th>
            <Th>Actions</Th>
          </Tr>
        </Thead>
        <Tbody>
          {rentals.length > 0 ? (
            rentals.map((item) => (
              <Tr key={item._id} bg="white">
                <Td>
                  <Image width="250px" height="150px" src={`${API_URL}${item.image}`} alt={item.name} />
                </Td>
                <Td>{item.name}</Td>
                <Td>{item.address}</Td>
                <Td>{item.roomCount}</Td>
                <Td>${item.price}</Td>
                <Td>
                  <HStack>
                    <Link to={`/rentals/${slugify(item.name)}`} state={{ id: item._id }}>
                      <Button colorScheme="blue" variant="outline" leftIcon={<FaEye />}>
                        View
                      </Button>
                    </Link>
                    <Menu>
                      <MenuButton as={IconButton} icon={<FaEllipsisV />} colorScheme="blue" />
                      <MenuList>
                        <MenuItem icon={<FaEdit />} onClick={() => handleEditClick(item)}>
                          Edit
                        </MenuItem>
                        <MenuItem icon={<FaTrash />} onClick={() => handleDeleteClick(item._id)}>
                          Delete
                        </MenuItem>
                      </MenuList>
                    </Menu>
                  </HStack>
                </Td>
              </Tr>
            ))
          ) : (
            <Tr>
              <Td colSpan="6" textAlign="center">
                No rentals found.
              </Td>
            </Tr>
          )}
        </Tbody>
      </Table>
      <AddRentalDialog isOpen={isAdding} onClose={() => setIsAdding(false)} onRentalAdded={fetchRentals} />

      {editRental && (
        <EditRentalDialog
          isOpen={isEditing}
          onClose={() => setIsEditing(false)}
          rental={editRental}
          onRentalUpdated={fetchRentals}
        />
      )}

      <DeleteConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
      />

      <Flex justify="center" mt={4} align={"center"}>
        <Button onClick={() => handlePageChange(page - 1)} disabled={page === 1}>
          Previous
        </Button>
        <Text mx={2}>
          Page <strong>{page}</strong> of <strong>{totalPages}</strong>
        </Text>
        <Button onClick={() => handlePageChange(page + 1)} disabled={page >= totalPages}>
          Next
        </Button>
      </Flex>
    </Box>
  )
}

export default RentalList
