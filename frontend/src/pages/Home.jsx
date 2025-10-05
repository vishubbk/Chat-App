import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import { RiLink } from "react-icons/ri";
import Swal from "sweetalert2";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FaUserCircle } from "react-icons/fa"; // FontAwesome user icon

const Home = () => {
  const [isModelOpen, setIsModelOpen] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [projects, setProjects] = useState([]);
  const navigate = useNavigate();

  // ✅ Fetch all projects when component mounts
  useEffect(() => {
    async function allProjects() {
      try {
        const response = await axios.get(
          import.meta.env.VITE_API_URL + "/project/all",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setProjects(response.data.projects || []);
      } catch (error) {
        console.error(error);
      }
    }
    allProjects();
  }, []);

  // ✅ Handle project creation
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!projectName.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Project name required",
        text: "Please enter a valid project name!",
      });
      return;
    }

    Swal.fire({
      title: "Are you sure?",
      text: `Do you want to create project: "${projectName}"?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, Create",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#2563eb",
      cancelButtonColor: "#d33",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await axios.post(
            import.meta.env.VITE_API_URL + "/project/create",
            { name: projectName },
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          );

          Swal.fire({
            icon: "success",
            title: "Project Created!",
            text: `Your project "${
              response.data.project?.name || projectName
            }" has been created successfully.`,
          });

          // ✅ Update project list without refreshing
          setProjects((prev) => [...prev, response.data.project]);

          setProjectName("");
          setIsModelOpen(false);
        } catch (error) {
          console.error(error);
          Swal.fire({
            icon: "error",
            title: "Error!",
            text: "Something went wrong while creating the project.",
          });
        }
      }
    });
  };

  return (
    <div className="">
      {" "}
      {/* temporary styling */}
      {/* Navbar */}
      <div className="sticky top-0 z-50">
        <Navbar />
      </div>
      {/* Create Project Button */}
      <div
        className="justify-center items-center bg-blue-700 w-60 p-5 m-5 text-white font-bold text-lg flex gap-3 cursor-pointer rounded"
        onClick={() => setIsModelOpen(true)}
      >
        <p>Create Project</p>
        <p>{}</p>
        <RiLink />
      </div>
      {/* ✅ List of Projects */}
      <div className="m-5">
        <h2 className="text-2xl font-bold mb-4">All Projects</h2>
        {projects.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No projects found.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {projects.map((p) => (
              <div
                key={p._id}
                className="mb-2 w-64 p-4 flex-col justify-between bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
              >
                <div>
                  <h1 className="text-xl font-semibold mb-2 truncate">
                    {p.name}
                  </h1>
                  <div className="flex items-center gap-2 text-gray-600 mb-2">
                    <FaUserCircle className="text-lg" />
                    <span>{p.users.length} members</span>
                  </div>
                  <p className="text-gray-500 text-sm mb-4">
                    {p.description || "No description"}
                  </p>
                </div>
                <div className="flex justify-end">
                  <button
                    onClick={() => navigate(`/project`,{
                      state:{project:p}
                    })}
                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm font-medium"
                  >
                    View Project
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {/* Modal */}
      {isModelOpen && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-5 rounded-2xl shadow-md w-96">
            <h2 className="text-lg font-bold mb-4">Create a New Project</h2>

            <form onSubmit={handleSubmit}>
              <input
                type="text"
                placeholder="Project Name"
                className="border p-2 mb-4 w-full rounded"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
              />

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModelOpen(false)}
                  className="bg-gray-400 px-4 py-2 rounded text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-500 px-4 py-2 rounded text-white"
                >
                  Add Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
