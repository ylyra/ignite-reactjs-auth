import type { NextPage } from "next";
import { useAuth } from "../contexts/AuthContext";

const Dashboard: NextPage = () => {
  const { user } = useAuth();

  return (
    <>
      <h1>Dashboard: {user?.email}</h1>
    </>
  );
};

export default Dashboard;
