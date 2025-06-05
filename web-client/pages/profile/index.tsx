import { Container, Text, Space, Button, Group } from "@mantine/core";
import { NextPage } from "next";
import { useRouter } from "next/router";
import { NoAccess } from "../../components/NoAccess";
import { ContactIcons } from "../../components/UserInfo";
import { Layout } from "../../components/layout";
import { useAuth } from "../../context/authContext";

const Profile: NextPage = () => {
  const { logOut, session } = useAuth();
  const router = useRouter();

  if (session == null) {
    return <NoAccess />;
  }
  return (
    <Layout title="Perfil">
      <Container my="md" size={"xl"} pt={32}>
        <Text size={32}>Mi perfil</Text>
        <Space h={16} />
        <Text size={24}>Mis datos</Text>
        <Space h={8} />
        {session != null && (
          <>
            <ContactIcons />

            <Group position="right">
              <Button
                onClick={() => {
                  logOut();
                  router.push("/");
                }}
              >
                Cerrar sesión
              </Button>
            </Group>
          </>
        )}
      </Container>{" "}
    </Layout>
  );
};

export default Profile;
