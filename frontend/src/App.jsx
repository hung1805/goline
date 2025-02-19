import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { Box, ChakraProvider } from "@chakra-ui/react"
import RentalList from "./pages/RentalList"
import RentalDetail from "./pages/RentalDetail"
import theme from "./theme.js"

const App = () => {
  return (
    <ChakraProvider theme={theme}>
      <Box w="full" h="100vh" p={8} bg={"#F6F7F9"}>
        <Router>
          <Routes>
            <Route path="/" element={<RentalList />} />
            <Route path="/rentals/:name" element={<RentalDetail />} />
          </Routes>
        </Router>
      </Box>
    </ChakraProvider>
  )
}

export default App
