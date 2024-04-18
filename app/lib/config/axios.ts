import axios from "axios";
import type { AxiosInstance } from 'axios'

type ApiKey = string;

const clientAxios = (apiKey: ApiKey): AxiosInstance => {
    return axios.create({
        baseURL: 'https://api.contifico.com/sistema/api/v1/',
        headers: {
            Authorization: apiKey,
            ContentType: "application/json"
        }
    });
};

export default clientAxios;