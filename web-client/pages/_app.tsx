import { Button, MantineProvider, Text } from "@mantine/core";
import { ContextModalProps, ModalsProvider } from "@mantine/modals";
import { NotificationsProvider } from "@mantine/notifications";
import { Amplify } from "aws-amplify";
import { NextPage } from "next";
import { AppProps } from "next/app";
import { ReactElement, ReactNode } from "react";
import { FooterLinks } from "../components/footer";
import { HeaderMegaMenu } from "../components/header";
import { RouterTransition } from "../components/loaders/router-transition";
import { AuthProvider } from "../context/authContext";
import { CartContextProvider } from "../context/cartContext";
import { rtlCache } from "../rtl-cache";
import "../styles/nprogress.css";

export type NextPageWithLayout<P = {}, IP = P> = NextPage<P, IP> & {
  getLayout?: (page: ReactElement) => ReactNode;
};

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};

const noProAccountModal = ({ context, id, innerProps}: ContextModalProps<{ modalBody: string}>) => (
  <>
    <Text size="sm">{innerProps.modalBody}</Text>
    <Button fullWidth mt="md" onClick={() => context.closeModal(id)}>
      Cerrar
    </Button>
  </>
);

Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: process.env.NEXT_PUBLIC_USER_POOL_ID as string,
      userPoolClientId: process.env.NEXT_PUBLIC_USER_POOL_CLIENT_ID as string,
      loginWith: {
        email: true,
      },
      signUpVerificationMethod: "code",
      userAttributes: {
        email: {
          required: true,
        },
      },
      passwordFormat: {
        minLength: 8,
        requireLowercase: true,
        requireUppercase: true,
        requireNumbers: true,
        requireSpecialCharacters: false,
      },
    },
  },
});

export default function App({
  Component,
  pageProps,
}: AppPropsWithLayout) {
  const getContent = () => {
    return (
      <>
        <NotificationsProvider
          autoClose={2000}
          position="bottom-right"
          limit={3}
        >
          <AuthProvider>
            <CartContextProvider>
              <ModalsProvider modals={{notProAcount: noProAccountModal}}>
                <HeaderMegaMenu />
                <Component {...pageProps} />
                <FooterLinks data={[]} />
              </ModalsProvider>
            </CartContextProvider>
          </AuthProvider>
        </NotificationsProvider>
      </>
    );
  };

  return (
    <div dir="ltr">
      <MantineProvider
        withGlobalStyles
        withNormalizeCSS
        emotionCache={rtlCache}
        theme={{
          dir: "ltr",
          primaryColor: "teal",
          fontFamily: "Inter, sans-serif",
        }}
      >
        <RouterTransition />
        {getContent()}
      </MantineProvider>
    </div>
  );
}
