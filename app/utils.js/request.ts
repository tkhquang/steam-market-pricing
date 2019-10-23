import axios from "axios";

interface Error {
  code: number;
  message: string;
}

const Axios = axios.create({
  // baseURL: `${process.env.API}`
  timeout: 15000
});

const request = async (opts: any): Promise<any | Error> => {
  try {
    const data = await Axios({ ...opts });
    return data;
  } catch (error) {
    return Promise.reject(error);
  }
};

export default request;
