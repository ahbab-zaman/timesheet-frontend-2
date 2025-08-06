import { jwtDecode } from "jwt-decode";



export const verifyToken = (token) => {
  if (!token) {
    return false;
  } 
  try {
    return jwtDecode(token);
  } catch (error) {
    console.error("Token verification failed:", error);
    return false;
  }
}