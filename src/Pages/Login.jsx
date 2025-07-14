import React, { useState } from "react";
import CircularProgress from "@mui/material/CircularProgress";
import {
  Box,
  Typography,
  TextField,
  Button,
  InputAdornment,
  IconButton,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { setCredentials } from "../redux/authSlice";
import { useNavigate } from "react-router-dom";
import { useLoginUserMutation } from "../redux/apiSlice";
import toast from "react-hot-toast";

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [loginUser, { isLoading }] = useLoginUserMutation();
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();

  const [showPassword, setShowPassword] = useState(false);

  const handleClickShowPassword = () => setShowPassword((show) => !show);
  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  const onSubmit = async (data) => {
    try {
      const { conf_password, ...loginData } = data;
      const response = await loginUser(loginData).unwrap();

      if (response?.error) {
        toast.error(response?.data || "Login failed due to API error.");
        return;
      }

      dispatch(setCredentials(response?.data));
      toast.success("Login Successfully! 🎉");
      navigate("/dashboard");
      reset();
    } catch (error) {
      console.error("Login error:", error);
      const errorMessage =
        error?.data?.response?.message ||
        error?.data?.message ||
        error?.message ||
        "An unexpected error occurred during login.";
      toast.error(errorMessage);
    }
  };

  return (
    <Box
      sx={{
        width: "100vw",
        height: "100vh",
        backgroundColor: "#03045e",
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
          marginX: "auto",
          backgroundColor: "white",
          boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
          position: "relative",
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
          Sign In
        </Typography>

        <TextField
          required
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
          type={showPassword ? "text" : "password"}
          label="Password"
          variant="outlined"
          size="small"
          {...register("password", {
            required: "Password is required",
            minLength: {
              value: 6,
              message: "Password must be at least 6 characters",
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
            "Sign In"
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
            Don't have an account?
          </Typography>
          <Typography
            sx={{ fontSize: "0.8rem", color: "#074799", cursor: "pointer" }}
            onClick={() => navigate("/register")}
          >
            Sign up now.
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default Login;
