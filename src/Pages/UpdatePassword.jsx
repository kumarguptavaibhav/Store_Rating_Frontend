import React, { useState } from "react";
import {
  Box,
  Button,
  CircularProgress,
  IconButton,
  InputAdornment,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useUpdatePasswordMutation } from "../redux/apiSlice";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { user } from "../Utilities/utils.js";
import { setCredentials } from "../redux/authSlice";

const UpdatePassword = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [UpdatePassword, { isLoading }] = useUpdatePasswordMutation();
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: {
      new_password: "",
      old_password: "",
    },
  });

  const [showPassword, setShowPassword] = useState(false);
  const user_detail = user();
  const { id } = user_detail.user;
  const handleClickShowPassword = () => setShowPassword((show) => !show);
  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };
  const onSubmit = async (data) => {
    try {
      const response = await UpdatePassword({ ...data, id: id });
      if (response?.error) {
        toast.error(response?.response?.message || "Registration failed.");
        return;
      }
      dispatch(setCredentials(response?.data?.data));
      toast.success("Successfully Registered! Please log in.");
      reset();
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
        marginLeft: "240px",
        padding: "2rem",
        width: "calc(100vw - 320px)",
      }}
    >
      <Paper
        elevation={3}
        sx={{
          margin: "auto",
          display: "flex",
          flexDirection: "column",
          width: "500px",
          alignItems: "center",
          gap: "10px",
          borderRadius: "25px",
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
            marginTop: "10px",
          }}
        >
          Update Password
        </Typography>
        <TextField
          required
          type={showPassword ? "text" : "password"}
          label="New Password"
          variant="outlined"
          sx={{
            marginBottom: "10px",
          }}
          size="small"
          {...register("new_password", {
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
            marginBottom: "10px",
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
            "Update Password"
          )}
        </Button>
      </Paper>
    </Box>
  );
};

export default UpdatePassword;
