import axios from "axios";

const api = axios.create({
  baseURL: "http://192.168.1.13:5000/api",
  timeout: 120000
});

// Add response interceptor to handle type conversion
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Server ne response diya lekin status code 2xx nahi hai
      console.log("Data:", error.response.data);
      console.log("Status:", error.response.status);
    } else if (error.request) {
      // Request send hui par koi response nahi mila (MOST LIKELY YOUR ISSUE)
      console.log("Request info:", error.request);
    } else {
      console.log("Error Message:", error.message);
    }
    return Promise.reject(error);
  }
);

export default api;