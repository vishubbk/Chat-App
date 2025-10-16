/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from "react";
import { FaUserCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { MdModeEdit, MdOutlineDeleteSweep } from "react-icons/md";
import { TiUserDelete } from "react-icons/ti";
import Swal from "sweetalert2";
import { IoPersonRemove } from "react-icons/io5";
import { RxCross2 } from "react-icons/rx";

const YourGroups = () => {
  const [projects, setProjects] = useState([]);
  const [manageGroup, setManageGroup] = useState(false);
  const [groupUsers, setGroupUsers] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [loading, setLoading] = useState({ edit: false, delete: false });
  const navigate = useNavigate();



  // ✅ Verify user token
  const verifyUser = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return false;
    }
    return true;
  };

  // ✅ Fetch user's owned projects
  useEffect(() => {
    async function fetchGroups() {
      try {
        if (!verifyUser()) return;

        const { data } = await axios.get(
          `${import.meta.env.VITE_API_URL}/user/ownerProject-all`,
          {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          }
        );

        setProjects(data?.projects || []);
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Failed",
          text: error.response?.data?.message || "Could not load your groups.",
        });
      }
    }

    fetchGroups();
  }, []);



  // ✅ Edit Group Name
  async function EditName(project) {
    try {
      setLoading((prev) => ({ ...prev, edit: true }));

      const { value: newName } = await Swal.fire({
        title: "Edit Group Name",
        input: "text",
        inputLabel: "Enter your new group name",
        inputValue: project.name,
        showCancelButton: true,
        confirmButtonText: "Save",
        inputValidator: (value) => {
          if (!value.trim()) return "Group name cannot be empty!";
        },
      });

      if (!newName || newName === project.name) return;

      await axios.put(
        `${import.meta.env.VITE_API_URL}/project/update/${project._id}`,
        { name: newName },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      setProjects((prev) =>
        prev.map((p) => (p._id === project._id ? { ...p, name: newName } : p))
      );

      Swal.fire({
        icon: "success",
        title: "Updated!",
        text: "Project name updated successfully.",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.response?.data?.message || "Failed to update group name.",
      });
    } finally {
      setLoading((prev) => ({ ...prev, edit: false }));
    }
  }

  // ✅ Delete Group
  async function DeleteGroup(projectId) {
    try {
      const confirm = await Swal.fire({
        title: "Are you sure?",
        text: "This action cannot be undone!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Yes, delete it!",
      });

      if (!confirm.isConfirmed) return;

      setLoading((prev) => ({ ...prev, delete: true }));

      await axios.delete(
        `${import.meta.env.VITE_API_URL}/project/delete/${projectId}`,
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );

      setProjects((prev) => prev.filter((p) => p._id !== projectId));
      Swal.fire("Deleted!", "Your group has been deleted.", "success");
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.response?.data?.message || "Failed to delete group.",
      });
    } finally {
      setLoading((prev) => ({ ...prev, delete: false }));
    }
  }

  // ✅ Fetch users in a group
  async function GetPeople(project) {
    try {
      if (!verifyUser()) return;

      const { data } = await axios.get(
        `${import.meta.env.VITE_API_URL}/project/getProjectusers/${project._id}`,
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );

      setGroupUsers(data?.users || []);
      setSelectedGroup(project);
      setManageGroup(true);
    } catch (error) {
      Swal.fire("Error", "Failed to fetch project users.", "error");
    }
  }

  // ✅ Remove a specific user from a group
  async function RemoveUser(userId) {
    try {
      if (!verifyUser()) return;

      const confirm = await Swal.fire({
        title: "Remove this user?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, remove",
      });
      if (!confirm.isConfirmed) return;

      await axios.put(
        `${import.meta.env.VITE_API_URL}/project/removeUser/${selectedGroup._id}`,
        { userId },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );

      setGroupUsers((prev) => prev.filter((u) => u._id !== userId));
      Swal.fire("Removed!", "User removed from the group.", "success");
    } catch (error) {
      Swal.fire("Error", "Failed to remove user.", "error");
    }
  }

  return (
    <div className="relative">
      <div className="m-5">
        <h2 className="text-2xl font-bold mb-4">Your Groups</h2>

        {projects?.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No Group found.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {projects.map((p) => (
              <div
                key={p._id}
                className="mb-2 w-64 p-4 flex-col justify-between bg-white rounded-lg shadow-md hover:shadow-lg transition-all"
              >
                <div>
                  <h1 className="text-xl font-semibold mb-2 truncate">{p.name}</h1>
                  <div className="flex items-center gap-2 text-gray-600 mb-2">
                    <FaUserCircle className="text-lg" />
                    <span>{p.users?.length || 0} members</span>
                  </div>
                  <p className="text-gray-500 text-sm mb-4">
                    {p.description || "No description"}
                  </p>
                </div>

                <div className="flex justify-end items-center gap-5">
                  <MdModeEdit
                    onClick={() => EditName(p)}
                    className="text-blue-500 hover:text-blue-800 cursor-pointer w-6"
                  />
                  <MdOutlineDeleteSweep
                    onClick={() => DeleteGroup(p._id)}
                    className="text-red-500 hover:text-red-800 cursor-pointer w-6"
                  />
                  <TiUserDelete
                    onClick={() => GetPeople(p)}
                    className="text-blue-500 hover:text-green-800 cursor-pointer w-6"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ✅ Overlay Blur */}
      {manageGroup && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-10 transition-all duration-300"></div>
      )}

      {/* ✅ Group Members Modal */}
      {manageGroup && (
        <div className="fixed z-20 top-1/2 left-1/2 w-[90%] md:w-[35%] h-[60%] -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-lg p-5">
          <div className="flex justify-between items-center border-b pb-2">
            <h2 className="text-xl font-bold">{selectedGroup?.name || "Group"}</h2>
            <RxCross2
              onClick={() => setManageGroup(false)}
              className="text-2xl cursor-pointer"
            />
          </div>

          <div className="mt-4 overflow-y-auto h-[80%] space-y-3">
            {groupUsers.length === 0 ? (
              <p className="text-gray-500 text-center py-5">
                No members found in this group.
              </p>
            ) : (
              groupUsers.map((user) => (
                <div
                  key={user._id}
                  className="flex justify-between items-center bg-gray-100 p-3 rounded-lg"
                >
                  <span className="font-medium">{user.email}</span>
                  <IoPersonRemove
                    onClick={() => RemoveUser(user._id)}
                    className="text-red-500 text-xl cursor-pointer hover:text-red-700"
                  />
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default YourGroups;
