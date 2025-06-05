import { createStyles, Paper, Title, Text, Group, Button } from "@mantine/core";
import { useRouter } from "next/router";

export const useStyles = createStyles((theme) => ({
    wrapper: {
        minHeight: 350,
        display: "flex",
        // height: "100vh",
        alignContent: "center",
        justifyContent: "center"

    },
    title: {
        color: theme.colorScheme === "dark" ? theme.white : theme.black,
        fontFamily: `Greycliff CF, ${theme.fontFamily}`,
      },

}))


export function NoAccess() {
    const router = useRouter();
    const { classes } = useStyles();

    return (
        <div className={classes.wrapper}>
            <Paper radius={"lg"} py={30} px={60}>
                <Title
                    order={2}
                    className={classes.title}
                    align="center"
                    mt="md"
                    mb={50}
                >
                    <Text>Acceso solo para usuarios registrados </Text>
                    <Text>Para acceder iniciá sesión</Text>
                </Title>
                <Group position="center">
                    <Button onClick={() => router.push("/")} mt="xl" size="md" variant="outline">
                        Volver a Inicio
                    </Button>
                    <Button onClick={() => router.push("/access")} mt="xl" size="md">
                        Ir a Iniciar Sesión
                    </Button>
                </Group>
            </Paper>
        </div>
    );
}