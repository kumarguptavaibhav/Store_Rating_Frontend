import React, { useState } from "react";
import CircularProgress from "@mui/material/CircularProgress";
import {
  Box,
  Typography,
  TextField,
  Button,
  Select,
  FormControl,
  InputLabel,
  MenuItem,
  FormHelperText,
  InputAdornment,
  IconButton,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useForm } from "react-hook-form";
import { useCreateUserMutation } from "../redux/apiSlice";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const Register = () => {
  const navigate = useNavigate();
  const [createUser, { isLoading }] = useCreateUserMutation();
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfPassword, setShowConfPassword] = useState(false);

  const handleClickShowPassword = () => setShowPassword((show) => !show);
  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  const handleClickShowConfPassword = () =>
    setShowConfPassword((show) => !show);
  const handleMouseDownConfPassword = (event) => {
    event.preventDefault();
  };

  const onSubmit = async (data) => {
    try {
      const { conf_password, ...userData } = data;
      const response = await createUser(userData).unwrap();

      if (response?.error) {
        toast.error(response?.response?.message || "Registration failed.");
        return;
      }

      navigate("/login");
      toast.success("Successfully Registered! Please log in.");
    } catch (error) {
      const errorMessage =
        error?.data?.response?.message ||
        error?.data?.message ||
        error?.message ||
        "An unexpected error occurred during registration.";
      toast.error(errorMessage);
    }
  };

  return (
    <Box
      sx={{
        width: "100vw",
        backgroundColor: "#03045e",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "2rem",
      }}
    >
      <Typography
        variant="h4"
        sx={{
          color: "white",
          fontWeight: "bold",
          letterSpacing: "0.05em",
          textShadow: "2px 2px 4px rgba(0,0,0,0.3)",
          textAlign: "center",
        }}
      >
        Store Rating Application 🌟
      </Typography>

      <Box
        sx={{
          width: "20rem",
          border: "0.06rem solid",
          display: "flex",
          flexDirection: "column",
          gap: "1.5rem",
          padding: "1rem",
          borderRadius: "1rem",
          borderColor: "#0A3981",
          backgroundColor: "white",
          marginX: "auto",
        }}
      >
        <Typography
          sx={{
            display: "flex",
            flexDirection: "row",
            alignContent: "center",
            margin: "auto",
            fontSize: "2rem",
            color: "#03045e",
          }}
        >
          Sign Up
        </Typography>

        <TextField
          required
          label="Name"
          variant="outlined"
          size="small"
          {...register("name", {
            required: "Name is required",
            maxLength: {
              value: 60,
              message: "Name cannot exceed 60 characters",
            },
          })}
          error={!!errors.name}
          helperText={errors.name?.message}
        />

        <TextField
          required
          type="email"
          label="Email"
          variant="outlined"
          size="small"
          {...register("email", {
            required: "Email is required",
            pattern: {
              value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
              message: "Invalid email address",
            },
          })}
          error={!!errors.email}
          helperText={errors.email?.message}
        />

        <TextField
          required
          type="text"
          label="Address"
          variant="outlined"
          size="small"
          {...register("address", {
            required: "Address is required",
            maxLength: {
              value: 400,
              message: "Address cannot exceed 400 characters",
            },
          })}
          error={!!errors.address}
          helperText={errors.address?.message}
        />

        <FormControl
          variant="outlined"
          size="small"
          error={!!errors.role}
          required
        >
          <InputLabel>Role</InputLabel>
          <Select
            label="Role"
            defaultValue=""
            {...register("role", { required: "Role is required" })}
          >
            <MenuItem value="">
              <em>Select Role</em>
            </MenuItem>
            <MenuItem value="user">User</MenuItem>
            <MenuItem value="admin">Admin</MenuItem>
            <MenuItem value="store_owner">Store Owner</MenuItem>
          </Select>
          {errors.role && (
            <FormHelperText>{errors.role.message}</FormHelperText>
          )}
        </FormControl>

        <TextField
          required
          type={showPassword ? "text" : "password"}
          label="Password"
          variant="outlined"
          size="small"
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
              value: /^(?=.*[A-Z])(?=.*[!@#$%^&*()_+{}[\]:;<>,.?~\\/-]).*$/,
              message:
                "Password must contain at least one uppercase letter and one special character.",
            },
          })}
          error={!!errors.password}
          helperText={errors.password?.message}
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

        <TextField
          required
          type={showConfPassword ? "text" : "password"}
          label="Confirm Password"
          variant="outlined"
          size="small"
          {...register("conf_password", {
            required: "Confirm Password is required",
            validate: (value) =>
              value === watch("password") || "Passwords do not match",
          })}
          error={!!errors.conf_password}
          helperText={errors.conf_password?.message}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  aria-label="toggle confirm password visibility"
                  onClick={handleClickShowConfPassword}
                  onMouseDown={handleMouseDownConfPassword}
                  edge="end"
                >
                  {showConfPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        <Button
          sx={{
            backgroundColor: "#074799",
            color: "white",
            borderColor: "#074799",
            "&:hover": {
              backgroundColor: "#053a7a",
            },
          }}
          onClick={handleSubmit(onSubmit)}
          disabled={isLoading}
          disableFocusRipple
        >
          {isLoading ? (
            <CircularProgress size={24} sx={{ color: "white" }} />
          ) : (
            "Register"
          )}
        </Button>
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            marginTop: "-1rem",
            gap: "0.25rem",
          }}
        >
          <Typography sx={{ fontSize: "0.8rem" }}>
            Already have an account?
          </Typography>
          <Typography
            sx={{ fontSize: "0.8rem", color: "#074799", cursor: "pointer" }}
            onClick={() => navigate("/login")}
          >
            Login now.
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default Register;
