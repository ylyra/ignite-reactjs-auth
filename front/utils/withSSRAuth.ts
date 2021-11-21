import type {
  GetServerSideProps,
  GetServerSidePropsContext,
  GetServerSidePropsResult,
} from "next";
import { destroyCookie, parseCookies } from "nookies";
import { AuthTokenError } from "../services/errors/AuthTokenError";

export function withSSRAuth<P = any>(
  fn: GetServerSideProps<P>
): GetServerSideProps {
  return async (
    ctx: GetServerSidePropsContext
  ): Promise<GetServerSidePropsResult<P>> => {
    const cookies = parseCookies(ctx);
    if (!cookies["@NextAuthTest:token"]) {
      return {
        redirect: {
          destination: "/",
          permanent: false,
        },
      };
    }

    try {
      return await fn(ctx);
    } catch (error) {
      if (error instanceof AuthTokenError) {
        destroyCookie(ctx, "@NextAuthTest:token");
        destroyCookie(ctx, "@NextAuthTest:refreshToken");
        return {
          redirect: {
            destination: "/",
            permanent: false,
          },
        };
      } else {
        return {
          redirect: {
            destination: "/",
            permanent: false,
          },
        };
      }
    }
  };
}
