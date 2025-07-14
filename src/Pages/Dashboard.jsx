import React, { useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TableSortLabel,
  Paper,
  TextField,
  Box,
  Typography,
  Chip,
  Rating,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Toolbar,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  Stack,
  Alert,
  CircularProgress,
} from "@mui/material";
import { Search, Star, Edit, Close, Refresh } from "@mui/icons-material";
import {
  useCreateRankingMutation,
  useGetStoresQuery,
  useUpdateRankingMutation,
} from "../redux/apiSlice";
import { user } from "../Utilities/utils.js";
import toast from "react-hot-toast";

const Dashboard = () => {
  const { data, isLoading, isError, refetch } = useGetStoresQuery();
  const [
    createRanking,
    { isLoading: isCreatingRanking, isError: isCreatingError },
  ] = useCreateRankingMutation();
  const [
    updateRanking,
    { isLoading: isUpdatingRanking, isError: isUpdatingError },
  ] = useUpdateRankingMutation();

  const stores = useMemo(() => {
    if (!data) return [];

    if (data.data && Array.isArray(data.data)) {
      return data.data;
    }

    if (data.error) {
      console.error("API Error:", data.error);
      return [];
    }
    return [];
  }, [data]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState("");
  const [ratingFilter, setRatingFilter] = useState("");
  const [sortBy, setSortBy] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
  const [openRatingDialog, setOpenRatingDialog] = useState(false);
  const [selectedStore, setSelectedStore] = useState(null);
  const [newRating, setNewRating] = useState(0);
  const [alert, setAlert] = useState({
    open: false,
    message: "",
    type: "success",
  });

  const user_details = user();
  const { id } = user_details.user;

  const filteredStores = useMemo(() => {
    if (!stores || stores.length === 0) return [];

    let filtered = stores.filter((store) => {
      const matchesSearch =
        store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        store.address.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesRating =
        ratingFilter === "" ||
        Math.floor(parseFloat(store.avgRating)) === parseInt(ratingFilter);

      return matchesSearch && matchesRating;
    });

    if (sortBy) {
      filtered.sort((a, b) => {
        let aValue = a[sortBy];
        let bValue = b[sortBy];

        if (sortBy === "avgRating") {
          aValue = parseFloat(aValue);
          bValue = parseFloat(bValue);
        }

        if (sortOrder === "asc") {
          return aValue > bValue ? 1 : -1;
        } else {
          return aValue < bValue ? 1 : -1;
        }
      });
    }

    return filtered;
  }, [stores, searchTerm, ratingFilter, sortBy, sortOrder]);

  const paginatedStores = useMemo(() => {
    const startIndex = page * rowsPerPage;
    return filteredStores.slice(startIndex, startIndex + rowsPerPage);
  }, [filteredStores, page, rowsPerPage]);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  const handleRatingFilterChange = (event) => {
    setRatingFilter(event.target.value);
    setPage(0);
  };

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("asc");
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleRatingClick = (store) => {
    setSelectedStore(store);
    const userRating = store.ratings?.find((r) => r.user_id === id);
    setNewRating(userRating ? userRating.rating : 0);
    setOpenRatingDialog(true);
  };

  const handleRatingSubmit = async () => {
    if (selectedStore && newRating > 0) {
      try {
        const existingRating = selectedStore.ratings?.find(
          (r) => r.user_id === id
        );
        if (existingRating) {
          const response = await updateRanking({
            id: existingRating.id,
            rating: newRating,
            store_id: selectedStore.id,
            user_id: id,
          }).unwrap();
          if (response?.error) {
            toast.error(response?.data);
            return;
          }
          toast.success("Successfully Registered");
          refetch();
          setOpenRatingDialog(false);
          setSelectedStore(null);
          setNewRating(0);
        } else {
          const response = await createRanking({
            rating: newRating,
            store_id: selectedStore.id,
            user_id: id,
          }).unwrap();
          if (response?.error) {
            toast.error(response?.data);
            return;
          }
          toast.success("Successfully Registered");
          refetch();
          setOpenRatingDialog(false);
          setSelectedStore(null);
          setNewRating(0);
        }
      } catch (error) {
        toast.error(error?.data?.response?.message);
      }
    }
  };

  const getUserRating = (store) => {
    const userRating = store.ratings?.find((r) => r.user_id === id);
    return userRating ? userRating.rating : 0;
  };

  const clearFilters = () => {
    setSearchTerm("");
    setRatingFilter("");
    setSortBy("");
    setSortOrder("asc");
    setPage(0);
  };

  const totalStores = stores.length;
  const averageRating =
    stores.length > 0
      ? (
          stores.reduce(
            (sum, store) => sum + parseFloat(store.avgRating || 0),
            0
          ) / stores.length
        ).toFixed(2)
      : "0.00";

  if (isLoading) {
    return (
      <Box
        sx={{
          marginLeft: "240px",
          padding: "2rem",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (isError) {
    return (
      <Box
        sx={{
          marginLeft: "240px",
          padding: "2rem",
          width: "calc(100% - 320px)",
        }}
      >
        <Alert severity="error">
          Failed to load stores. Please try again.
          <Button onClick={refetch} sx={{ ml: 2 }}>
            Retry
          </Button>
        </Alert>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        marginLeft: "240px",
        padding: "2rem",
        width: "calc(100vw - 320px)",
      }}
    >
      <Typography
        variant="h4"
        gutterBottom
        sx={{ fontWeight: "bold", color: "#1976d2", marginBottom: "2rem" }}
      >
        Store Management
      </Typography>

      {alert.open && (
        <Alert
          severity={alert.type}
          onClose={() => setAlert({ ...alert, open: false })}
          sx={{ mb: 2 }}
        >
          {alert.message}
        </Alert>
      )}

      <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
        <Card sx={{ minWidth: 200, flex: 1 }}>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              Total Stores
            </Typography>
            <Typography variant="h5" component="div">
              {totalStores}
            </Typography>
          </CardContent>
        </Card>
        <Card sx={{ minWidth: 200, flex: 1 }}>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              Average Rating
            </Typography>
            <Typography variant="h5" component="div">
              {averageRating}
            </Typography>
          </CardContent>
        </Card>
        <Card sx={{ minWidth: 200, flex: 1 }}>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              Filtered Results
            </Typography>
            <Typography variant="h5" component="div">
              {filteredStores.length}
            </Typography>
          </CardContent>
        </Card>
      </Box>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Toolbar sx={{ pl: 0, pr: 0 }}>
          <Box
            sx={{
              display: "flex",
              gap: 2,
              flexWrap: "wrap",
              alignItems: "center",
              width: "100%",
            }}
          >
            <TextField
              placeholder="Search by name or address..."
              value={searchTerm}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
              sx={{ minWidth: 300, flex: 1 }}
            />

            <FormControl sx={{ minWidth: 150 }}>
              <InputLabel>Rating Filter</InputLabel>
              <Select
                value={ratingFilter}
                onChange={handleRatingFilterChange}
                label="Rating Filter"
              >
                <MenuItem value="">All Ratings</MenuItem>
                <MenuItem value="5">5 Stars</MenuItem>
                <MenuItem value="4">4 Stars</MenuItem>
                <MenuItem value="3">3 Stars</MenuItem>
                <MenuItem value="2">2 Stars</MenuItem>
                <MenuItem value="1">1 Star</MenuItem>
              </Select>
            </FormControl>

            <Button
              variant="outlined"
              onClick={clearFilters}
              startIcon={<Refresh />}
            >
              Clear Filters
            </Button>
          </Box>
        </Toolbar>
      </Paper>

      <TableContainer component={Paper} sx={{ mb: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                <TableSortLabel
                  active={sortBy === "name"}
                  direction={sortBy === "name" ? sortOrder : "asc"}
                  onClick={() => handleSort("name")}
                >
                  Store Name
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortBy === "address"}
                  direction={sortBy === "address" ? sortOrder : "asc"}
                  onClick={() => handleSort("address")}
                >
                  Address
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortBy === "avgRating"}
                  direction={sortBy === "avgRating" ? sortOrder : "asc"}
                  onClick={() => handleSort("avgRating")}
                >
                  Overall Rating
                </TableSortLabel>
              </TableCell>
              <TableCell>Your Rating</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedStores.map((store) => (
              <TableRow key={store.id} hover>
                <TableCell>
                  <Typography variant="h6" sx={{ fontWeight: "medium" }}>
                    {store.name}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {store.email}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">{store.address}</Typography>
                </TableCell>
                <TableCell>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Rating
                      value={parseFloat(store.avgRating || 0)}
                      readOnly
                      precision={0.1}
                    />
                    <Chip
                      label={`${store.avgRating || "0.00"} (${
                        store.ratings?.length || 0
                      })`}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  </Stack>
                </TableCell>
                <TableCell>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Rating value={getUserRating(store)} readOnly />
                    <Typography variant="body2" color="textSecondary">
                      {getUserRating(store) > 0
                        ? getUserRating(store)
                        : "Not rated"}
                    </Typography>
                  </Stack>
                </TableCell>
                <TableCell>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => handleRatingClick(store)}
                    startIcon={getUserRating(store) > 0 ? <Edit /> : <Star />}
                    disabled={isCreatingRanking || isUpdatingRanking}
                  >
                    {getUserRating(store) > 0 ? "Update" : "Rate"}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={filteredStores.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />

      <Dialog
        open={openRatingDialog}
        onClose={() => setOpenRatingDialog(false)}
      >
        <DialogTitle>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            Rate Store
            <IconButton onClick={() => setOpenRatingDialog(false)}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedStore && (
            <Box sx={{ textAlign: "center", py: 2 }}>
              <Typography variant="h6" gutterBottom>
                {selectedStore.name}
              </Typography>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                {selectedStore.address}
              </Typography>
              <Box sx={{ my: 3 }}>
                <Typography variant="body1" gutterBottom>
                  Rate this store:
                </Typography>
                <Rating
                  value={newRating}
                  onChange={(event, newValue) => setNewRating(newValue)}
                  size="large"
                />
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setOpenRatingDialog(false)}
            disabled={isCreatingRanking || isUpdatingRanking}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleRatingSubmit}
            disabled={newRating === 0 || isCreatingRanking || isUpdatingRanking}
          >
            {isCreatingRanking || isUpdatingRanking ? (
              <CircularProgress size={20} />
            ) : (
              "Submit Rating"
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Dashboard;
