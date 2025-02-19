import * as XLSX from "xlsx"
import { Button } from "@chakra-ui/react"
import { FaFileExport } from "react-icons/fa"

const ExportRentals = ({ rentals }) => {
  const exportToExcel = () => {
    if (rentals.length === 0) return

    const worksheet = XLSX.utils.json_to_sheet(rentals)

    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Rentals")

    XLSX.writeFile(workbook, "rentals.xlsx")
  }

  return (
    <Button onClick={exportToExcel} colorScheme="green" leftIcon={<FaFileExport />}>
      Export to Excel
    </Button>
  )
}

export default ExportRentals
