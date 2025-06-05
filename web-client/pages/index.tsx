import { ReactElement } from "react";
import { FooterLinks } from "../components/footer";
import { HeaderMegaMenu } from "../components/header";
import { HeroText } from "../components/hero-section";
import { NextPageWithLayout } from "./_app";
import { Layout } from "../components/layout";

const Home: NextPageWithLayout = () => {
  return (
    <Layout>
      <HeroText />
    </Layout>
  );
};

Home.getLayout = function getLayout(page: ReactElement) {
  return (
    <>
      <HeaderMegaMenu />
      {page}
      <FooterLinks data={[]} />
    </>
  );
};

export default Home;
