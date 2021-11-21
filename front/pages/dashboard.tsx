import type { NextPage } from "next";
import { useAuth } from "../contexts/AuthContext";
import { withSSRAuth } from "../utils/withSSRAuth";

const Dashboard: NextPage = () => {
  const { user } = useAuth();

  return (
    <>
      <h1>Dashboard: {user?.email}</h1>
    </>
  );
};

export const getServerSideProps = withSSRAuth(async () => {
  return {
    props: {},
  };
});

export default Dashboard;
