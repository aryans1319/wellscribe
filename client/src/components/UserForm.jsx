import React, { useState } from 'react';
import axios from 'axios';

const UserForm = ({ fetchData }) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    role: '',
    place: '',
    phoneNumber: '',
  });

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    try {
      // Update the URL to the correct registration endpoint
      await axios.post('http://localhost:4000/api/v1/signup', formData);

      // Fetch updated user data after successful registration
      fetchData();
      
      // Clear the form data
      setFormData({
        username: '',
        email: '',
        role: '',
        place: '',
        phoneNumber: '',
      });
    } catch (error) {
      console.error('Error registering user:', error);
    }
  };

  return (
    <form onSubmit={handleFormSubmit} className="mt-4">
      <h2 className="text-lg font-bold mb-4">Create User</h2>

      <label className="block mb-2">
        Username:
        <input
          type="text"
          name="username"
          value={formData.username}
          onChange={handleFormChange}
          className="border p-2"
          required
        />
      </label>
      <label className="block mb-2">
        Email:
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleFormChange}
          className="border p-2"
          required
        />
      </label>
      <label className="block mb-2">
        Role:
        <input
          type="text"
          name="role"
          value={formData.role}
          onChange={handleFormChange}
          className="border p-2"
          required
        />
      </label>
      <label className="block mb-2">
        Place:
        <input
          type="text"
          name="place"
          value={formData.place}
          onChange={handleFormChange}
          className="border p-2"
          required
        />
      </label>
      <label className="block mb-2">
        Phone Number:
        <input
          type="text"
          name="phoneNumber"
          value={formData.phoneNumber}
          onChange={handleFormChange}
          className="border p-2"
          required
        />
      </label>
      <button type="submit" className="bg-blue-500 text-white py-2 px-4">
        Register User
      </button>
    </form>
  );
};

export default UserForm;
