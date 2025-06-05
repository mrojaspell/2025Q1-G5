import Head from "next/head";
import { ReactNode } from "react";

interface LayoutProps {
  children: ReactNode[] | ReactNode;
  title?: string;
  description?: string;
}

export const Layout = ({
  children,
  title = "Unimart",
  description = "unimart",
}: LayoutProps) => {
  return (
    <>
      <Head>
        <meta name="description" content={description} />
        <title>{title}</title>
      </Head>
      <main>{children}</main>
    </>
  );
};
