import React, { useState, useMemo, useEffect } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Rating,
  Alert,
  IconButton,
  InputAdornment,
  TablePagination,
  Avatar,
  CircularProgress,
  FormHelperText,
} from "@mui/material";
import {
  Add,
  Search,
  Person,
  Store,
  Star,
  Group,
  Dashboard,
  Visibility,
  VisibilityOff,
  Clear,
} from "@mui/icons-material";
import { useForm } from "react-hook-form";
import {
  useCreateStoreMutation,
  useCreateUserMutation,
  useGetStoresQuery,
  useGetUsersQuery,
} from "../redux/apiSlice";
import toast from "react-hot-toast";

const AdminDashboard = () => {
  const {
    data: userData,
    isLoading: isUserDataLoading,
    isError: isUserDataError,
    refetch: reFetchUserData,
  } = useGetUsersQuery();

  const {
    data: storeData,
    isLoading: isStoreDataLoading,
    isError: isStoreDataError,
    refetch: reFetchStoreData,
  } = useGetStoresQuery();

  const [createUser, { isLoading: isCreateUserLoading }] =
    useCreateUserMutation();
  const [createStore, { isLoading: isCreateStoreLoading }] =
    useCreateStoreMutation();

  const [activeTab, setActiveTab] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogType, setDialogType] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  const [viewDialog, setViewDialog] = useState(false);

  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm();

  const users = userData?.data || [];
  const stores = storeData?.data || [];

  const allRatings = useMemo(() => {
    const ratings = [];
    stores.forEach((store) => {
      store.ratings?.forEach((rating) => {
        ratings.push({
          ...rating,
          storeName: store.name,
        });
      });
    });
    return ratings;
  }, [stores]);

  const totalUsers = users.length;
  const totalStores = stores.length;
  const totalRatings = allRatings.length;
  const normalUsers = users.filter((u) => u.role === "user").length;
  const storeOwners = users.filter((u) => u.role === "store_owner").length;
  const adminUsers = users.filter((u) => u.role === "admin").length;

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch =
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.address.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesRole = roleFilter === "" || user.role === roleFilter;

      return matchesSearch && matchesRole;
    });
  }, [users, searchTerm, roleFilter]);

  const filteredStores = useMemo(() => {
    return stores.filter((store) => {
      return (
        store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        store.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        store.address.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
  }, [stores, searchTerm]);

  const paginatedUsers = useMemo(() => {
    const startIndex = page * rowsPerPage;
    return filteredUsers.slice(startIndex, startIndex + rowsPerPage);
  }, [filteredUsers, page, rowsPerPage]);

  const paginatedStores = useMemo(() => {
    const startIndex = page * rowsPerPage;
    return filteredStores.slice(startIndex, startIndex + rowsPerPage);
  }, [filteredStores, page, rowsPerPage]);

  const storeOwnersList = useMemo(() => {
    return users.filter((user) => user.role === "store_owner");
  }, [users]);

  const availableStoreOwners = useMemo(() => {
    const storeOwnerIds = stores.map((store) => store.owner_id);
    return storeOwnersList.filter(
      (owner) => !storeOwnerIds.includes(owner.owner_id)
    );
  }, [storeOwnersList, stores]);

  const handleClickShowPassword = () => setShowPassword((show) => !show);
  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setPage(0);
    setSearchTerm("");
    setRoleFilter("");
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  const handleRoleFilterChange = (event) => {
    setRoleFilter(event.target.value);
    setPage(0);
  };

  const handleAddUser = () => {
    setDialogType("user");
    setSelectedItem(null);
    reset();
    setOpenDialog(true);
  };

  const handleAddStore = () => {
    setDialogType("store");
    setSelectedItem(null);
    reset();
    setOpenDialog(true);
  };

  const handleFormSubmit = handleSubmit(async (data) => {
    if (dialogType === "user") {
      try {
        const response = await createUser(data).unwrap();
        if (response?.error) {
          toast.error(response?.data || "User creation failed.");
          return;
        }
        toast.success("User successfully created!");
        setOpenDialog(false);
        reFetchUserData();
      } catch (error) {
        toast.error(
          error?.data?.response?.message ||
            error?.data?.message ||
            "An unexpected error occurred during user creation."
        );
      }
    } else if (dialogType === "store") {
      try {
        const response = await createStore(data).unwrap();
        if (response?.error) {
          toast.error(response?.data || "Store creation failed.");
          return;
        }
        toast.success("Store successfully created!");
        setOpenDialog(false);
        reFetchStoreData();
      } catch (error) {
        console.error("Store creation error:", error);
        toast.error(
          error?.data?.response?.message ||
            error?.data?.message ||
            "An unexpected error occurred during store creation."
        );
      }
    }
  });

  const handleView = (item, type) => {
    setSelectedItem(item);
    setDialogType(type);
    setViewDialog(true);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setRoleFilter("");
    setPage(0);
  };

  const getRoleColor = (role) => {
    switch (role) {
      case "admin":
        return "error";
      case "store_owner":
        return "warning";
      case "user":
        return "info";
      default:
        return "info";
    }
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case "admin":
        return "Admin";
      case "store_owner":
        return "Store Owner";
      case "user":
        return "User";
      default:
        return "User";
    }
  };

  const getStoreOwnerName = (storeOwnerId) => {
    const owner = users.find((user) => user.id === storeOwnerId);
    return owner ? owner.name : "No Owner Assigned";
  };

  if (isUserDataLoading || isStoreDataLoading) {
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

  if (isUserDataError || isStoreDataError) {
    return (
      <Box sx={{ marginLeft: "240px", padding: "2rem", mt: 5 }}>
        <Alert severity="error">
          Error loading data. Please try again later.
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
        sx={{ fontWeight: "bold", color: "#1976d2" }}
      >
        System Administrator Dashboard
      </Typography>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Group sx={{ fontSize: 40, color: "#1976d2", mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" variant="body2">
                    Total Users
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: "bold" }}>
                    {totalUsers}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Store sx={{ fontSize: 40, color: "#4caf50", mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" variant="body2">
                    Total Stores
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: "bold" }}>
                    {totalStores}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Star sx={{ fontSize: 40, color: "#ff9800", mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" variant="body2">
                    Total Ratings
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: "bold" }}>
                    {totalRatings}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Dashboard sx={{ fontSize: 40, color: "#9c27b0", mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" variant="body2">
                    User Breakdown
                  </Typography>
                  <Typography variant="body2">
                    Normal: {normalUsers} | Stores: {storeOwners} | Admins:{" "}
                    {adminUsers}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="Users Management" />
          <Tab label="Stores Management" />
        </Tabs>
      </Paper>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Box
          sx={{
            display: "flex",
            gap: 2,
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <TextField
            placeholder="Search by name, email, or address..."
            value={searchTerm}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
            sx={{ minWidth: 300 }}
          />

          {activeTab === 0 && (
            <FormControl sx={{ minWidth: 150 }} size="small">
              <InputLabel>Role Filter</InputLabel>
              <Select
                value={roleFilter}
                onChange={handleRoleFilterChange}
                label="Role Filter"
              >
                <MenuItem value="">All Roles</MenuItem>
                <MenuItem value="user">User</MenuItem>
                <MenuItem value="store_owner">Store Owner</MenuItem>
                <MenuItem value="admin">Admin</MenuItem>
              </Select>
            </FormControl>
          )}

          <Button
            variant="outlined"
            onClick={clearFilters}
            startIcon={<Clear />}
          >
            Clear Filters
          </Button>

          <Button
            variant="contained"
            onClick={activeTab === 0 ? handleAddUser : handleAddStore}
            startIcon={<Add />}
          >
            Add {activeTab === 0 ? "User" : "Store"}
          </Button>
        </Box>
      </Paper>

      {activeTab === 0 && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>User</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Address</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedUsers.map((user) => (
                <TableRow key={user.id} hover>
                  <TableCell>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Avatar sx={{ mr: 2 }}>
                        <Person />
                      </Avatar>
                      <Typography variant="subtitle1">{user.name}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.address}</TableCell>
                  <TableCell>
                    <Chip
                      label={getRoleLabel(user.role)}
                      color={getRoleColor(user.role)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => handleView(user, "user")}
                      title="View User"
                    >
                      <Visibility />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={filteredUsers.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={(event, newPage) => setPage(newPage)}
            onRowsPerPageChange={(event) => {
              setRowsPerPage(parseInt(event.target.value, 10));
              setPage(0);
            }}
          />
        </TableContainer>
      )}

      {activeTab === 1 && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Store Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Address</TableCell>
                <TableCell>Store Owner</TableCell>
                <TableCell>Rating</TableCell>
                <TableCell>Total Ratings</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedStores.map((store) => (
                <TableRow key={store.id} hover>
                  <TableCell>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Avatar sx={{ mr: 2 }}>
                        <Store />
                      </Avatar>
                      <Typography variant="subtitle1">{store.name}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>{store.email}</TableCell>
                  <TableCell>{store.address}</TableCell>
                  <TableCell>{getStoreOwnerName(store.owner_id)}</TableCell>
                  <TableCell>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Rating
                        value={parseFloat(store.avgRating || 0)}
                        readOnly
                        size="small"
                      />
                      <Typography variant="body2" sx={{ ml: 1 }}>
                        {parseFloat(store.avgRating || 0).toFixed(1)}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={`${store.ratings?.length || 0} ratings`}
                      color="primary"
                      variant="outlined"
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => handleView(store, "store")}
                      title="View Store"
                    >
                      <Visibility />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={filteredStores.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={(event, newPage) => setPage(newPage)}
            onRowsPerPageChange={(event) => {
              setRowsPerPage(parseInt(event.target.value, 10));
              setPage(0);
            }}
          />
        </TableContainer>
      )}

      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Add New {dialogType === "user" ? "User" : "Store"}
        </DialogTitle>
        <DialogContent>
          <Box
            component="form"
            onSubmit={handleFormSubmit}
            sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}
          >
            <TextField
              label="Name"
              {...register("name", {
                required: "Name is required",
                minLength:
                  dialogType === "store"
                    ? {
                        value: 20,
                        message: "Name must be at least 20 characters",
                      }
                    : null,
                maxLength: {
                  value: 60,
                  message: "Name cannot exceed 60 characters",
                },
              })}
              error={!!errors.name}
              helperText={errors.name?.message}
              fullWidth
              required
              size="small"
            />
            <TextField
              label="Email"
              type="email"
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                  message: "Invalid email address",
                },
              })}
              error={!!errors.email}
              helperText={errors.email?.message}
              fullWidth
              required
              size="small"
            />
            {dialogType === "user" && (
              <TextField
                label="Password"
                type={showPassword ? "text" : "password"}
                {...register("password", {
                  required: "Password is required",
                  minLength: {
                    value: 8,
                    message: "Password must be at least 8 characters",
                  },
                  maxLength: {
                    value: 16,
                    message: "Password cannot exceed 16 characters",
                  },
                  pattern: {
                    value:
                      /^(?=.*[A-Z])(?=.*[!@#$%^&*()_+{}[\]:;<>,.?~\\/-]).*$/,
                    message:
                      "Password must contain at least one uppercase letter and one special character.",
                  },
                })}
                error={!!errors.password}
                helperText={errors.password?.message}
                fullWidth
                required
                size="small"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={handleClickShowPassword}
                        onMouseDown={handleMouseDownPassword}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            )}
            <TextField
              label="Address"
              {...register("address", {
                required: "Address is required",
                maxLength: {
                  value: 400,
                  message: "Address cannot exceed 400 characters",
                },
              })}
              error={!!errors.address}
              helperText={errors.address?.message}
              fullWidth
              required
              size="small"
            />
            {dialogType === "user" && (
              <FormControl fullWidth size="small" error={!!errors.role}>
                <InputLabel>Role</InputLabel>
                <Select
                  label="Role"
                  defaultValue="user"
                  {...register("role", { required: "Role is required" })}
                >
                  <MenuItem value="user">User</MenuItem>
                  <MenuItem value="store_owner">Store Owner</MenuItem>
                  <MenuItem value="admin">Admin</MenuItem>
                </Select>
                {errors.role && (
                  <FormHelperText>{errors.role.message}</FormHelperText>
                )}
              </FormControl>
            )}
            {dialogType === "store" && (
              <FormControl fullWidth size="small" error={!!errors.owner_id}>
                <InputLabel>Assign Store Owner</InputLabel>
                <Select
                  label="Assign Store Owner"
                  defaultValue=""
                  {...register("owner_id", {
                    required: "Store owner is required",
                  })}
                  disabled={availableStoreOwners.length === 0}
                >
                  <MenuItem value="">Select Store Owner</MenuItem>
                  {availableStoreOwners.map((owner) => (
                    <MenuItem key={owner.id} value={owner.id}>
                      {owner.name} ({owner.email})
                    </MenuItem>
                  ))}
                </Select>
                {errors.owner_id && (
                  <FormHelperText>{errors.owner_id.message}</FormHelperText>
                )}
                {availableStoreOwners.length === 0 && (
                  <FormHelperText error>
                    No available store owners. Please create store owner users
                    first.
                  </FormHelperText>
                )}
              </FormControl>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setOpenDialog(false)}
            disabled={isCreateUserLoading || isCreateStoreLoading}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleFormSubmit}
            disabled={
              isCreateUserLoading ||
              isCreateStoreLoading ||
              (dialogType === "store" && availableStoreOwners.length === 0)
            }
          >
            {isCreateUserLoading || isCreateStoreLoading ? (
              <CircularProgress size={24} sx={{ color: "white" }} />
            ) : (
              `Add ${dialogType === "user" ? "User" : "Store"}`
            )}
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={viewDialog}
        onClose={() => setViewDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {dialogType === "user" ? "User" : "Store"} Details
        </DialogTitle>
        <DialogContent>
          {selectedItem && (
            <Box
              sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}
            >
              <Typography variant="h6">{selectedItem.name}</Typography>
              <Typography>
                <strong>Email:</strong> {selectedItem.email}
              </Typography>
              <Typography>
                <strong>Address:</strong> {selectedItem.address}
              </Typography>
              {dialogType === "user" && (
                <Typography>
                  <strong>Role:</strong> {getRoleLabel(selectedItem.role)}
                </Typography>
              )}
              {dialogType === "store" && (
                <>
                  <Typography>
                    <strong>Store Owner:</strong>{" "}
                    {getStoreOwnerName(selectedItem.owner_id)}
                  </Typography>
                  <Typography>
                    <strong>Average Rating:</strong>{" "}
                    {parseFloat(selectedItem.avgRating || 0).toFixed(1)}
                  </Typography>
                  <Typography>
                    <strong>Total Ratings:</strong>{" "}
                    {selectedItem.ratings?.length || 0}
                  </Typography>
                  <Typography>
                    <strong>Created:</strong>{" "}
                    {new Date(selectedItem.created_at).toLocaleDateString()}
                  </Typography>
                </>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminDashboard;
