import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Table } from 'flowbite-react';
import UserForm from './UserForm';
import socketIOClient from 'socket.io-client';

const UserTable = () => {
  const [userData, setUserData] = useState([]);
  const [showForm, setShowForm] = useState(false);

  const fetchData = async () => {
    try {
      const response = await axios.get('http://localhost:4000/api/v1/all');
      setUserData(response.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    const socket = socketIOClient('http://localhost:4000');

    socket.on('newUser', (newUser) => {
      setUserData((prevData) => [...prevData, newUser]);
    });

    fetchData();

    return () => {
      socket.disconnect();
    };
  }, []);

  const toggleForm = () => {
    setShowForm(!showForm);
  };

  return (
    <div className="overflow-x-auto p-4">
      <button onClick={toggleForm} className="bg-green-500 text-white py-2 px-4 mb-4">
        {showForm ? 'Close Form' : 'Create User'}
      </button>

      {showForm && <UserForm fetchData={fetchData} />}
      <Table striped className="w-full bg-white dark:border-gray-700 dark:bg-gray-800">
        <Table.Head>
          <Table.HeadCell className="text-lg font-bold">Username</Table.HeadCell>
          <Table.HeadCell className="text-lg font-bold">Email</Table.HeadCell>
          <Table.HeadCell className="text-lg font-bold">Role</Table.HeadCell>
          <Table.HeadCell className="text-lg font-bold">Place</Table.HeadCell>
          <Table.HeadCell className="text-lg font-bold">Phone Number</Table.HeadCell>
        </Table.Head>
        <Table.Body className="divide-y">
          {userData.map((user) => (
            <Table.Row key={user._id} className="dark:border-gray-700">
              <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
                {user.username}
              </Table.Cell>
              <Table.Cell>{user.email}</Table.Cell>
              <Table.Cell>{user.role}</Table.Cell>
              <Table.Cell>{user.place}</Table.Cell>
              <Table.Cell>{user.phoneNumber}</Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
    </div>
  );
};

export default UserTable;
