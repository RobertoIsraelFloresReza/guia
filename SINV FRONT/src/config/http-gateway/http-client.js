import axios from 'axios';
// archivos .env
const SERVER_URL = import.meta.env.VITE_APP_SERVER_URL;

const AxiosClient = axios.create({
    baseURL: SERVER_URL,
    withCredentials: false,
});

const requestHandler = (request) => {
    request.headers["Accept"] = "application/json";

    // Solo establecer si no es multipart/form-data
    if (!request.headers["Content-Type"]) {
        request.headers["Content-Type"] = "application/json";
    }


    const session = JSON.parse(localStorage.getItem("user")) || null;
    if (session?.token)
        request.headers["Authorization"] = `Bearer ${session.token}`;
    return request;
};
AxiosClient.interceptors.request.use(
    (req) => requestHandler(req),
    (err) => Promise.reject(err)
);
AxiosClient.interceptors.response.use(
    (res) => Promise.resolve(res.data),
    (err) => Promise.reject(err)
);
export default AxiosClient;