import type { NextPage } from "next";
import { withSSRAuth } from "../utils/withSSRAuth";
import decode from "jwt-decode";

const Metrics: NextPage = () => {
  return (
    <>
      <h1>Metrics</h1>
    </>
  );
};

export const getServerSideProps = withSSRAuth(
  async () => {
    return {
      props: {},
    };
  },
  {
    permissions: ["metrics.list"],
    roles: ["administrator"],
  }
);

export default Metrics;
