import axios, { type AxiosInstance } from 'axios';


const platformApi: string = import.meta.env.VITE_ORYXEN_API_URL;

export class BaseApi {

    private httpInstance: AxiosInstance;

    constructor() {
        // Inicializamos la instancia de Axios.
        this.httpInstance = axios.create({
            baseURL: platformApi,
        });
    }


    public get http(): AxiosInstance {
        return this.httpInstance;
    }
}

export const ENDPOINTS = {
    PLANTS: import.meta.env.VITE_PLANTS_ENDPOINT_PATH || '/plants',
    ANALYTICS: import.meta.env.VITE_ANALYTICS_ENDPOINT_PATH || '/analytics',
    USERS: import.meta.env.VITE_USERS_ENDPOINT_PATH?.trim() || '/users',
    PROFILES: import.meta.env.VITE_PROFILES_ENDPOINT_PATH || '/profiles',
    POSTS: import.meta.env.VITE_POSTS_ENDPOINT_PATH || '/posts',
    COMMENTS: import.meta.env.VITE_COMMENTS_ENDPOINT_PATH || '/comments',
    REACTIONS: import.meta.env.VITE_REACTIONS_ENDPOINT_PATH || '/reactions',
    PLANTREPORTS: import.meta.env.VITE_PLANTREPORTS_ENDPOINT_PATH || '/plantReports',
    AUTH_REGISTER: '/auth/register'
};
