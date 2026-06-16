import axios from 'axios';
import type { AxiosInstance } from 'axios';

const API_BASE_URL: string = (import.meta.env.VITE_ORYXEN_API_URL as string) || '/api/v1';


const http: AxiosInstance = axios.create({
    baseURL: API_BASE_URL,
    headers: {

        'Content-Type': 'application/json',
        'Accept': 'application/json'
    },
    timeout: 30000,
    withCredentials: false
});


http.defaults.headers.common['Content-Type'] = 'application/json';
http.defaults.headers.common['Accept'] = 'application/json';


export default http;