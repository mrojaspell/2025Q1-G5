import type { NextPage } from "next";
import { AuthenticationImage } from "../../components/login";
import { Layout } from "../../components/layout";

const Access: NextPage = () => {
  return (
    <Layout title="Iniciar sesión">
      <AuthenticationImage />
    </Layout>
  );
};

export default Access;
