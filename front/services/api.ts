import axios, { AxiosError } from "axios";
import { parseCookies, setCookie } from "nookies";

import { signOut } from "../contexts/AuthContext";
import { AuthTokenError } from "./errors/AuthTokenError";

type FailedRequestsQueueProps = {
  onSuccess(token: string): void;
  onFailure(err: AxiosError): void;
};

let isRefreshing = false;
let failedRequestsQueue: FailedRequestsQueueProps[] = [];

export function setupAPIClient(ctx: any = undefined) {
  let cookies = parseCookies(ctx);

  const api = axios.create({
    baseURL: "http://localhost:3333/",
    headers: {
      Authorization: `Bearer ${cookies["@NextAuthTest:token"]}`,
    },
  });

  api.interceptors.response.use(
    (response) => response,
    (errorResponse: AxiosError) => {
      if (errorResponse?.response?.status === 401) {
        if (errorResponse.response?.data?.code === "token.expired") {
          // will renew user token
          cookies = parseCookies(ctx);

          const { "@NextAuthTest:refreshToken": refreshToken } = cookies;
          const originalConfig = errorResponse.config;

          if (!isRefreshing) {
            isRefreshing = true;

            api
              .post("/refresh", {
                refreshToken,
              })
              .then((response) => {
                const { token } = response.data;

                setCookie(ctx, "@NextAuthTest:token", token, {
                  maxAge: 60 * 60 * 24 * 30, // 30 days
                  path: "/",
                });

                setCookie(
                  ctx,
                  "@NextAuthTest:refreshToken",
                  response.data.refreshToken,
                  {
                    maxAge: 60 * 60 * 24 * 30, // 30 days
                    path: "/",
                  }
                );

                api.defaults.headers.common[
                  "Authorization"
                ] = `Bearer ${token}`;

                failedRequestsQueue.forEach((request) =>
                  request.onSuccess(token)
                );
                failedRequestsQueue = [];
              })
              .catch((err) => {
                failedRequestsQueue.forEach((request) =>
                  request.onFailure(err)
                );
                failedRequestsQueue = [];

                if (process.browser) {
                  signOut();
                } else {
                  return Promise.reject(new AuthTokenError());
                }
              })
              .finally(() => {
                isRefreshing = false;
              });
          }

          return new Promise((resolve, reject) => {
            failedRequestsQueue.push({
              onSuccess: (token: string) => {
                if (originalConfig && originalConfig.headers) {
                  originalConfig.headers["Authorization"] = `Bearer ${token}`;

                  resolve(api(originalConfig));
                }
              },
              onFailure: (err: AxiosError) => {
                reject(err);
              },
            });
          });
        } else {
          // will clear user cookies
          if (process.browser) {
            signOut();
          } else {
            return Promise.reject(new AuthTokenError());
          }
        }
      }

      return Promise.reject(errorResponse);
    }
  );

  return api;
}
