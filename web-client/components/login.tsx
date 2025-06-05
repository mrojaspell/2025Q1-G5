import {
  Button,
  Paper,
  PasswordInput,
  Text,
  TextInput,
  Title,
  createStyles,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import bgImage from "../assets/images/background.jpg";
import { UnimartLogo } from "./unimart-logo";
import { IconX } from "@tabler/icons";
import { showNotification } from "@mantine/notifications";
import { useAuth } from "../context/authContext";

export const useStyles = createStyles((theme) => ({
  wrapper: {
    minHeight: 500,
    display: "flex",
    backgroundSize: "cover",
    backgroundRepeat: "no-repeat",
    backgroundPosition: "center",
    height: "100vh",
    backgroundImage: `url(${bgImage.src})`,
  },

  form: {
    borderRight: `1px solid ${theme.colorScheme === "dark" ? theme.white : theme.colors.gray[3]
      }`,

    // maxWidth: 600,
    margin: "auto",
    paddingTop: 80,

    [`@media (max-width: ${theme.breakpoints.sm}px)`]: {
      maxWidth: "100%",
    },
  },

  title: {
    color: theme.colorScheme === "dark" ? theme.white : theme.black,
    fontFamily: `Greycliff CF, ${theme.fontFamily}`,
  },

  logo: {
    color: theme.colorScheme === "dark" ? theme.white : theme.black,
    width: 120,
    display: "block",
    marginLeft: "auto",
    marginRight: "auto",
  },
}));

export function AuthenticationImage() {
  const router = useRouter();
  const { classes } = useStyles();
  const { logIn, isLoggedIn } = useAuth();
  const form = useForm({
    initialValues: {
      email: "",
      password: "",
    },
    validate: {
      email: (value) =>
        /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/.test(value)
          ? null
          : "Email inválido",
    },
    validateInputOnChange: true,
  });

  const [isLoading, setLoading] = useState(false);

  const handleLogin = () => {
    setLoading(true);
    logIn(
      form.values.email,
      form.values.password,
      () => { },
      () => {
        showNotification({
          color: "red",
          title: "Error al iniciar sesión.",
          message: "Email o contraseña incorrectos.",
          icon: <IconX size={18} />,
        });
        setLoading(false);
      }
    );
  };

  useEffect(() => {
    if (isLoggedIn) router.push("/");
  }, [isLoggedIn]);

  return (
    <div className={classes.wrapper}>
      <Paper className={classes.form} radius={"lg"} py={30} px={60}>
        <Title
          order={2}
          className={classes.title}
          align="center"
          mt="md"
          mb={50}
        >
          <Text>Bienvenido a </Text>
          <UnimartLogo />
        </Title>

        <TextInput
          label="Email"
          placeholder="pepe@gmail.com"
          size="md"
          {...form.getInputProps("email")}
        />
        <PasswordInput
          label="Contraseña"
          placeholder="Tu contraseña"
          mt="md"
          size="md"
          {...form.getInputProps("password")}
        />
        {/* <Checkbox label="Recordarme" mt="xl" size="md" /> */}
        <Button
          fullWidth
          mt="xl"
          size="md"
          onClick={handleLogin}
          disabled={!form.isValid("email") || form.values.password == ""}
          loading={isLoading}
        >
          Ingresar
        </Button>

        <Text align="center" mt="md">
          ¿No tenés una cuenta?{" "}
          <Link href={"/register"} style={{ fontWeight: 700 }}>
            Registrate
          </Link>
        </Text>
      </Paper>
    </div>
  );
}
