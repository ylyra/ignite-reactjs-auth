import type { NextPage } from "next";

import { useAuth } from "../contexts/AuthContext";
import { setupAPIClient } from "../services/api";
import { withSSRAuth } from "../utils/withSSRAuth";

const Dashboard: NextPage = () => {
  const { user } = useAuth();

  return (
    <>
      <h1>Dashboard: {user?.email}</h1>
    </>
  );
};

export const getServerSideProps = withSSRAuth(async (ctx) => {
  const apiClient = setupAPIClient(ctx);
  const response = await apiClient.get("/me");
  return {
    props: {
      user: response.data,
    },
  };
});

export default Dashboard;
