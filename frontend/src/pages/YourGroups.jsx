import React, { useState, useEffect } from "react";
import { FaUserCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { MdModeEdit } from "react-icons/md";
import { MdOutlineDeleteSweep } from "react-icons/md";  
import { TiUserDelete } from "react-icons/ti";

const YourGroups = () => {
  const [projects, setProjects] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchGroups() {
      try {
        const response = await axios.get(
          import.meta.env.VITE_API_URL + "/user/ownerProject-all",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        console.log("response is:", response.data);
        // Assuming response.data.groups or response.data.projects contains the array
        setProjects(response.data.projects || []);
      } catch (error) {
        console.error(error);
      }
    }

    fetchGroups();
  }, []); // Empty dependency array so it runs only once

  return (
    <div>
      <div className="main">
        <div className="m-5">
          <h2 className="text-2xl font-bold mb-4">Your Groups</h2>
          {projects.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No Group found.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {projects.map((p) => (
                <div
                  key={p._id}
                  className="mb-2 w-64 p-4 flex-col justify-between bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
                >
                  <div>
                    <h1 className="text-xl font-semibold mb-2 truncate">{p.name}</h1>
                    <div className="flex items-center gap-2 text-gray-600 mb-2">
                      <FaUserCircle className="text-lg" />
                      <span>{p.users.length} members</span>
                    </div>
                    <p className="text-gray-500 text-sm mb-4">
                      {p.description || "No description"}
                    </p>
                  </div>
                  <div className="flex justify-end">
                    {/* <button
                      onClick={() =>
                        navigate(`/project`, { state: { project: p } })
                      }
                      className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm font-medium"
                    >
                      View Group
                    </button> */}
                    <div className="flex items-center justify-center gap-5  transition-all">
                      <MdModeEdit className="text-blue-500 hover:text-blue-800 cursor-pointer transition-all scale-100 w-6 hover:scale-110" />
                    <MdOutlineDeleteSweep className="text-blue-500 hover:text-blue-800 cursor-pointer transition-all scale-100 w-6 hover:scale-110" />
                    <TiUserDelete className="text-blue-500 hover:text-blue-800 cursor-pointer transition-all scale-100 w-6 hover:scale-110" />
                    </div>
                    
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default YourGroups;
