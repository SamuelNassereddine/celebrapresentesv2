
import { Outlet } from "react-router-dom";
import Layout from "@/components/Layout/Layout";

const Index = () => {
  return (
    
    <Layout>
      <Outlet />
    </Layout>
  );
};

export default Index;
