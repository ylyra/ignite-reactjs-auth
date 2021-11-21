import type { NextPage } from "next";
import { Can } from "../components/Can";
import { signOut } from "../contexts/AuthContext";

import { useAuth } from "../hooks/useAuth";
import { setupAPIClient } from "../services/api";
import { withSSRAuth } from "../utils/withSSRAuth";

const Dashboard: NextPage = () => {
  const { user } = useAuth();

  return (
    <>
      <h1>Dashboard: {user?.email}</h1>

      <button onClick={signOut}>Log out</button>

      <Can permissions={["metrics.list"]}>
        <div>Métricas</div>
      </Can>
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
