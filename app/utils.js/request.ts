import axios from "axios";

interface Error {
  code: number;
  message: string;
}

const Axios = axios.create({
  // baseURL: `${process.env.API}`
  timeout: 1500
});

const request = async (opts: object): Promise<any | Error> => {
  try {
    const data = await Axios({ ...opts });
    return data;
  } catch (error) {
    if (error.response) {
      const { status, data } = error.response;
      return {
        code: status,
        message: data.error ? data.error.message : data
      };
    }
    const { statusCode, message } = error;
    return {
      code: statusCode,
      message
    };
  }
};

export default request;
