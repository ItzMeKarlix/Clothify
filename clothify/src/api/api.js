import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:4000/api", // replace with your deployed backend URL later
});

export default API;
