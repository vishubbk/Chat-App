// import { createContext, useContext, useState } from "react";

// const UserContext = createContext();

// export const UserProvider = ({ children }) => {
//   const [user, setUser] = useState(null);
//   const [isLoading, setIsLoading] = useState(false);

//   const login = async (credentials) => {
//     setIsLoading(true);
//     try {
//       // TODO: Implement actual API call
//       const response = await mockLoginApi(credentials);
//       setUser(response.user);
//       return { success: true };
//     } catch (error) {
//       return { success: false, error: error.message };
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const signup = async (userData) => {
//     setIsLoading(true);
//     try {
//       // TODO: Implement actual API call
//       const response = await mockSignupApi(userData);
//       setUser(response.user);
//       return { success: true };
//     } catch (error) {
//       return { success: false, error: error.message };
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const logout = () => {
//     setUser(null);
//   };

//   // Mock API calls for demonstration
//   const mockLoginApi = async (credentials) => {
//     return new Promise((resolve) => {
//       setTimeout(() => {
//         resolve({ user: { id: 1, email: credentials.email } });
//       }, 1000);
//     });
//   };

//   const mockSignupApi = async (userData) => {
//     return new Promise((resolve) => {
//       setTimeout(() => {
//         resolve({ user: { id: 1, email: userData.email } });
//       }, 1000);
//     });
//   };

//   return (
//     <UserContext.Provider value={{ user, isLoading, login, signup, logout }}>
//       {children}
//     </UserContext.Provider>
//   );
// };

// export const useUser = () => {
//   const context = useContext(UserContext);
//   if (!context) {
//     throw new Error("useUser must be used within a UserProvider");
//   }
//   return context;
// };
