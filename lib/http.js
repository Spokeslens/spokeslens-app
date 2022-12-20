import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import { API_URL } from '@env';

class HTTP {
    /**
     * Set client auth
     * @param {String} t Azure Token 
     * @param {Function} cb Reset callback function in case of failing auth
     */
    initialize(t, cb) {
        this.token = t;
        this.resetCallback = cb;
    }

    /**
     * Axios client
     * @param {AxiosRequestConfig} config
     * @return {Promise<AxiosResponse>}
     */
    async axios(config) {
        config.headers = {
            ...config.headers,
            "X-ZUMO-AUTH": this.token,
        };

        config.baseURL = API_URL;

        try {
            let resp = await axios(config);
            return resp;
        } catch (error) {
            if (error.response.status === 401) this.resetCallback();
            else return error.response;
        }
    }
}

const http = new HTTP();

export default http;