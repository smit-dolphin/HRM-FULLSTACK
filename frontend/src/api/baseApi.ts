import { useAuthStore } from "@/store/useAuthStore";
import axios,{type AxiosInstance} from "axios"
const baseApi:AxiosInstance=axios.create({
    baseURL:import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api",
    withCredentials:true
})

baseApi.interceptors.response.use(
    function (response) {

        return response;
    },
    function (error){
        if (error.response?.status===401){
            useAuthStore.getState().logout();
            if (!window.location.pathname.includes('/login')){
                window.location.href='/login';
            }
        }

        return Promise.reject(error);
    }
)
export default baseApi