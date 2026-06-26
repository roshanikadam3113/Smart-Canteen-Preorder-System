import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    roll: "",
    department: "",
    email: "",
    password: "",
    confirmPassword: ""
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  try {

    const response = await axios.post(
      "http://localhost:5000/auth/register",
      formData
    );

     alert("Registration Successful");

    navigate("/");

  } catch (error) {

    console.log(error);

  }
};
  return (
    <div>
      <h1>Create Account</h1>

      <form onSubmit={handleSubmit}>
        <div>
          <label>Full Name</label>
          <input
            type="text"
            name="name"
            placeholder="Enter your name"
            onChange={handleChange}
          />
        </div>

        <div>
          <label>Roll Number</label>
          <input
            type="text"
            name="roll"
            placeholder="Enter roll number"
            onChange={handleChange}
          />
        </div>

        <div>
          <label>Department</label>
          <input
            type="text"
            name="department"
            placeholder="Enter department"
            onChange={handleChange}
          />
        </div>

        <div>
          <label>Email</label>
          <input
            type="email"
            name="email"
            placeholder="Enter email"
            onChange={handleChange}
          />
        </div>

        <div>
          <label>Password</label>
          <input
            type="password"
            name="password"
            placeholder="Enter password"
            onChange={handleChange}
          />
        </div>

        <div>
          <label>Confirm Password</label>
          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm password"
            onChange={handleChange}
          />
        </div>

        <button type="submit">
          Create Account
        </button>
      </form>

      <h3>Current Data:</h3>

      <p>Name: {formData.name}</p>
      <p>Roll: {formData.roll}</p>
      <p>Department: {formData.department}</p>
      <p>Email: {formData.email}</p>

    </div>
  );
}

export default Register;