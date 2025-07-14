import React, { useState, useMemo } from "react";
import { useSelector } from "react-redux";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  TextField,
  Box,
  Typography,
  Chip,
  Rating,
  Card,
  CardContent,
  Grid,
  Alert,
  CircularProgress,
  Avatar,
  InputAdornment,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
} from "@mui/material";
import {
  Search,
  Star,
  Person,
  Store,
  Email,
  LocationOn,
  ExpandMore,
  Group,
} from "@mui/icons-material";
import { useGetStoreByIdQuery } from "../redux/apiSlice";
import { user } from "../Utilities/utils";

const StoreOwnerDashboard = () => {
  const user_data = user();
  const { data, isLoading, isError, refetch } = useGetStoreByIdQuery({
    owner_id: user_data.user.id,
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [expandedStore, setExpandedStore] = useState(null);

  const storesData = useMemo(() => {
    if (!data) return [];

    let stores = [];
    if (data.error === false && data.data && Array.isArray(data.data)) {
      stores = data.data;
    } else if (Array.isArray(data)) {
      stores = data;
    } else if (data.data && Array.isArray(data.data)) {
      stores = data.data;
    } else if (data.stores && Array.isArray(data.stores)) {
      stores = data.stores;
    } else if (data.store) {
      stores = [data.store];
    } else if (data.id && data.name) {
      stores = [data];
    }

    return stores.filter((store) => store && store.id);
  }, [data]);

  const processedStores = useMemo(() => {
    if (!storesData || storesData.length === 0) return [];

    return storesData.map((store) => {
      const ratings = store.ratings || [];
      const users = ratings.map((rating) => ({
        id: rating.user_id,
        name: rating.users?.name || `User ${rating.user_id}`,
        email: rating.users?.email || `user${rating.user_id}@example.com`,
        address: rating.users?.address || "Address not available",
        rating: rating.rating,
        ratingId: rating.id,
        submittedAt: new Date(rating.updated_at).toLocaleDateString(),
        submittedTime: new Date(rating.updated_at).toLocaleTimeString(),
      }));

      return {
        id: store.id,
        name: store.name,
        email: store.email,
        address: store.address,
        averageRating: parseFloat(store.avgRating) || 0,
        totalRatings: ratings.length,
        users: users,
        createdAt: new Date(store.created_at).toLocaleDateString(),
      };
    });
  }, [storesData]);

  const filteredStores = useMemo(() => {
    if (!searchTerm) return processedStores;

    return processedStores.filter((store) => {
      const storeMatch = store.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const userMatch = store.users.some(
        (user) =>
          user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
      return storeMatch || userMatch;
    });
  }, [processedStores, searchTerm]);

  const handleAccordionChange = (storeId) => (event, isExpanded) => {
    setExpandedStore(isExpanded ? storeId : null);
  };

  const getRatingColor = (rating) => {
    if (rating >= 4) return "success";
    if (rating >= 3) return "warning";
    return "error";
  };

  const getRatingChipColor = (rating) => {
    if (rating >= 4.5) return "#4caf50";
    if (rating >= 3.5) return "#ff9800";
    return "#f44336";
  };

  if (isLoading) {
    return (
      <Box
        sx={{
          marginLeft: "240px",
          padding: "2rem",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "400px",
        }}
      >
        <CircularProgress size={50} />
      </Box>
    );
  }

  if (isError || !processedStores || processedStores.length === 0) {
    return (
      <Box sx={{ marginLeft: "240px", padding: "2rem" }}>
        <Alert severity="error">
          {isError ? "Failed to load store data." : "No stores found."}
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
      <Box sx={{ mb: 3 }}>
        <Typography
          variant="h4"
          gutterBottom
          sx={{ fontWeight: "bold", color: "#1976d2" }}
        >
          Store Owner Dashboard
        </Typography>
        <Typography variant="body1" color="textSecondary">
          View users who have submitted ratings for your stores and see average
          ratings
        </Typography>
      </Box>
      <Box sx={{ mb: 3 }}>
        <TextField
          placeholder="Search by store name, user name, or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
          fullWidth
        />
      </Box>

      <Box sx={{ mb: 3 }}>
        {filteredStores.map((store) => (
          <Accordion
            key={store.id}
            expanded={expandedStore === store.id}
            onChange={handleAccordionChange(store.id)}
            sx={{ mb: 2 }}
          >
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Box
                sx={{ display: "flex", alignItems: "center", width: "100%" }}
              >
                <Store sx={{ mr: 2, color: "#1976d2" }} />
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" sx={{ fontWeight: "medium" }}>
                    {store.name}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {store.address}
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", mr: 2 }}>
                  <Rating
                    value={store.averageRating}
                    readOnly
                    precision={0.1}
                    size="small"
                  />
                  <Typography
                    variant="body2"
                    sx={{
                      ml: 1,
                      mr: 2,
                      fontWeight: "medium",
                      color: getRatingChipColor(store.averageRating),
                    }}
                  >
                    {store.averageRating.toFixed(1)}
                  </Typography>
                </Box>
                <Chip
                  icon={<Group />}
                  label={`${store.totalRatings} ${
                    store.totalRatings === 1 ? "User" : "Users"
                  }`}
                  size="small"
                  color="primary"
                  variant="outlined"
                />
              </Box>
            </AccordionSummary>

            <AccordionDetails>
              <Box sx={{ pt: 2 }}>
                <Grid container spacing={2} sx={{ mb: 3 }}>
                  <Grid item xs={12} md={6}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          Store Information
                        </Typography>
                        <Box
                          sx={{ display: "flex", alignItems: "center", mb: 1 }}
                        >
                          <Email
                            sx={{
                              mr: 1,
                              fontSize: 16,
                              color: "text.secondary",
                            }}
                          />
                          <Typography variant="body2">{store.email}</Typography>
                        </Box>
                        <Box
                          sx={{ display: "flex", alignItems: "center", mb: 1 }}
                        >
                          <LocationOn
                            sx={{
                              mr: 1,
                              fontSize: 16,
                              color: "text.secondary",
                            }}
                          />
                          <Typography variant="body2">
                            {store.address}
                          </Typography>
                        </Box>
                        <Typography variant="body2" color="textSecondary">
                          Created: {store.createdAt}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          Rating Summary
                        </Typography>
                        <Box
                          sx={{ display: "flex", alignItems: "center", mb: 2 }}
                        >
                          <Typography
                            variant="h3"
                            sx={{ mr: 2, fontWeight: "bold" }}
                          >
                            {store.averageRating.toFixed(1)}
                          </Typography>
                          <Box>
                            <Rating
                              value={store.averageRating}
                              readOnly
                              precision={0.1}
                            />
                            <Typography variant="body2" color="textSecondary">
                              Based on {store.totalRatings}{" "}
                              {store.totalRatings === 1 ? "rating" : "ratings"}
                            </Typography>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>

                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                  Users Who Rated This Store ({store.users.length})
                </Typography>

                {store.users.length === 0 ? (
                  <Alert severity="info">
                    No users have rated this store yet.
                  </Alert>
                ) : (
                  <Paper variant="outlined">
                    <List>
                      {store.users.map((user, index) => (
                        <React.Fragment key={user.ratingId}>
                          <ListItem>
                            <ListItemAvatar>
                              <Avatar sx={{ bgcolor: "#1976d2" }}>
                                <Person />
                              </Avatar>
                            </ListItemAvatar>
                            <ListItemText
                              primary={
                                <Box
                                  sx={{ display: "flex", alignItems: "center" }}
                                >
                                  <Typography
                                    variant="subtitle1"
                                    sx={{ mr: 2 }}
                                  >
                                    {user.name}
                                  </Typography>
                                  <Chip
                                    label={`User ID: ${user.id}`}
                                    size="small"
                                    variant="outlined"
                                  />
                                </Box>
                              }
                              secondary={
                                <Box>
                                  <Typography
                                    variant="body2"
                                    color="textSecondary"
                                  >
                                    {user.email}
                                  </Typography>
                                  <Typography
                                    variant="body2"
                                    color="textSecondary"
                                  >
                                    {user.address}
                                  </Typography>
                                  <Typography
                                    variant="body2"
                                    color="textSecondary"
                                  >
                                    Submitted: {user.submittedAt} at{" "}
                                    {user.submittedTime}
                                  </Typography>
                                </Box>
                              }
                            />
                            <ListItemSecondaryAction>
                              <Box
                                sx={{ display: "flex", alignItems: "center" }}
                              >
                                <Rating
                                  value={user.rating}
                                  readOnly
                                  size="small"
                                />
                                <Chip
                                  label={user.rating}
                                  size="small"
                                  color={getRatingColor(user.rating)}
                                  sx={{ ml: 1 }}
                                />
                              </Box>
                            </ListItemSecondaryAction>
                          </ListItem>
                          {index < store.users.length - 1 && <Divider />}
                        </React.Fragment>
                      ))}
                    </List>
                  </Paper>
                )}
              </Box>
            </AccordionDetails>
          </Accordion>
        ))}
      </Box>

      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Overall Summary
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={3}>
              <Box sx={{ textAlign: "center" }}>
                <Typography
                  variant="h4"
                  sx={{ fontWeight: "bold", color: "#1976d2" }}
                >
                  {processedStores.length}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Total Stores
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={3}>
              <Box sx={{ textAlign: "center" }}>
                <Typography
                  variant="h4"
                  sx={{ fontWeight: "bold", color: "#4caf50" }}
                >
                  {processedStores.reduce(
                    (sum, store) => sum + store.totalRatings,
                    0
                  )}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Total Ratings
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={3}>
              <Box sx={{ textAlign: "center" }}>
                <Typography
                  variant="h4"
                  sx={{ fontWeight: "bold", color: "#ff9800" }}
                >
                  {processedStores.reduce(
                    (sum, store) => sum + store.users.length,
                    0
                  )}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Unique Users
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={3}>
              <Box sx={{ textAlign: "center" }}>
                <Typography
                  variant="h4"
                  sx={{ fontWeight: "bold", color: "#9c27b0" }}
                >
                  {processedStores.length > 0
                    ? (
                        processedStores.reduce(
                          (sum, store) => sum + store.averageRating,
                          0
                        ) / processedStores.length
                      ).toFixed(1)
                    : "0.0"}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Average Rating
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
};

export default StoreOwnerDashboard;
