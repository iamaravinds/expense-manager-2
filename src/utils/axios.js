import axios from "axios";

export const axiosInstance = (baseUrl) => {
  const hostname = window.location.host;
  const isDevelopment =
    hostname.startsWith("localhost") || hostname.startsWith("127.0.0.1:8080");
  const port = 3300;
  const baseURL = isDevelopment
    ? `http://localhost:${port}${baseUrl}`
    : baseUrl;
  const axiosInstances = axios.create({ baseURL, timeout: 1800000 });
  return axiosInstances;
};
