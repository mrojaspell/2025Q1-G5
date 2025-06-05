import {
  Box,
  Button,
  Center,
  Group,
  Paper,
  PasswordInput,
  Stack,
  Stepper,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { DatePicker } from "@mantine/dates";
import { useForm } from "@mantine/form";
import { IconCheck, IconX } from "@tabler/icons";
import type { NextPage } from "next";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useStyles } from "../../components/login";
import { UnimartLogo } from "../../components/unimart-logo";
import logoWink from "../../public/logo_wink.png";
import { showNotification } from "@mantine/notifications";
import Router from "next/router";
import { Layout } from "../../components/layout";
import { useAuth } from "../../context/authContext";

function PasswordRequirement({
  meets,
  label,
}: {
  meets: boolean;
  label: string;
}) {
  return (
    <Text color={meets ? "teal" : "red"} mt={5} size="sm">
      <Center inline>
        {meets ? <IconCheck size={14} /> : <IconX size={14} />}
        <Box ml={7}>{label}</Box>
      </Center>
    </Text>
  );
}

const requirements = [
  { re: /(?=.{8,})/, label: "Contiene 8 caracteres como mínimo" },
  { re: /[0-9]/, label: "Incluye un número" },
  { re: /[a-z]/, label: "Incluye letra minúscula" },
  { re: /[A-Z]/, label: "Incluye letra mayúscula" },
];

function checkCurrentPassword(password: string) {
  return requirements.every(
    (requirement) => requirement.re.test(password) == true,
  );
}

const Register: NextPage = () => {
  const [isLoading, setLoading] = useState(false);

  const form = useForm({
    initialValues: {
      email: "",
      name: "",
      surname: "",
      birthDate: new Date(),
      password: "",
      confirmPassword: "",
      code: "",
    },
    validate: {
      email: (value) =>
        /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/.test(value)
          ? null
          : "Email inválido",
      name: (value) => (/^[a-zA-Z ]+$/.test(value) ? null : "Nombre inválido"),
      surname: (value) =>
        /^[a-zA-Z ]+$/.test(value) ? null : "Apellido inválido",
      birthDate: (value) => (value < new Date() ? null : "Fecha inválida"),
      confirmPassword: (value, values) =>
        value != values.password ? "Contraseñas no coinciden" : null,
      code: (value) => (/^[0-9]{6}$/.test(value) ? null : "Codigo inválido"),
    },
    validateInputOnChange: true,
  });
  const checks = requirements.map((requirement, index) => (
    <PasswordRequirement
      key={index}
      label={requirement.label}
      meets={requirement.re.test(form.getInputProps("password").value)}
    />
  ));
  useEffect(() => {
    //console.log(form.values);
  }, [form.values]);
  const [active, setActive] = useState(0);

  const nextStep = () =>
    setActive((current) => (current < 4 ? current + 1 : current));
  const previousStep = () =>
    setActive((current) => (current > 0 ? current - 1 : current));

  const { classes } = useStyles();
  const { signUp, logIn, accountCreated, confirm, accountConfirmed } = useAuth();

  useEffect(() => {
    if (accountCreated) nextStep();
  }, [accountCreated]); //TODO agregar animacion de carga o mensaje de error

  useEffect(() => {
    if (accountConfirmed) nextStep();
  }, [accountConfirmed]); //TODO agregar animacion de carga o mensaje de error

  return (
    <Layout title="Registrarse">
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

          <Stepper active={active} breakpoint="sm">
            <Stepper.Step label="Primer paso" description="Ingresar email">
              <TextInput
                label="Email"
                placeholder="pepe@gmail.com"
                size="md"
                mt="md"
                // value={email}
                // onChange={(event) => setEmail(event.target.value)}
                {...form.getInputProps("email")}
              />
              <Group position="center">
                <Button
                  onClick={nextStep}
                  mt="xl"
                  size="md"
                  disabled={!form.isValid("email")}
                >
                  Ingresar email
                </Button>
              </Group>
            </Stepper.Step>
            <Stepper.Step label="Segundo paso" description="Ingresar datos">
              <TextInput
                label="Nombre"
                placeholder="Nombre"
                size="md"
                mt="md"
                // value={name}
                // onChange={(event) => setName(event.target.value)}
                {...form.getInputProps("name")}
              />
              <TextInput
                label="Apellido"
                placeholder="Apellido"
                size="md"
                mt="md"
                // value={surname}
                // onChange={(event) => setSurname(event.target.value)}
                {...form.getInputProps("surname")}
              />
              <DatePicker
                placeholder="Seleccionar fecha"
                label="Ingresar fecha de nacimiento"
                locale="es"
                size="md"
                mt="md"
                // value={value}
                // onChange={setValue}
                {...form.getInputProps("birthDate")}
              />
              <Group position="center">
                <Button
                  onClick={previousStep}
                  mt="xl"
                  size="md"
                  variant="outline"
                >
                  Volver atrás
                </Button>
                <Button
                  onClick={nextStep}
                  mt="xl"
                  size="md"
                  disabled={
                    !form.isValid("name") ||
                    !form.isValid("surname") ||
                    !form.isValid("birthDate")
                  }
                >
                  Ingresar datos
                </Button>
              </Group>
            </Stepper.Step>
            <Stepper.Step label="Tercer paso" description="Crear contraseña">
              <PasswordInput
                label="Contraseña"
                size="md"
                mt="md"
                // value={password}
                // onChange={(event) => setPassword(event.target.value)}
                {...form.getInputProps("password")}
              />
              {checks}
              <PasswordInput
                label="Confirmar contraseña"
                size="md"
                mt="md"
                // value={confirmPassword}
                // onChange={(event) => setPassword2(event.target.value)}
                {...form.getInputProps("confirmPassword")}
              />
              <Group position="center">
                <Button
                  onClick={previousStep}
                  mt="xl"
                  size="md"
                  variant="outline"
                >
                  Volver atrás
                </Button>
                <Button
                  onClick={() => {
                    setLoading(true);
                    signUp(
                      form.values.email,
                      form.values.password,
                      form.values.name,
                      form.values.surname,
                      `${form.values.birthDate.toLocaleDateString("en-us", {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                      })}`,
                      () => {
                        showNotification({
                          title: "¡Cuenta creada con éxito!",
                          message:
                            "Revisá tu email para obtener el código de confirmación",
                          icon: <IconCheck size={18} />,
                        });
                        setLoading(false);
                      },
                      () => {
                        showNotification({
                          color: "red",
                          title: "Error al crear cuenta.",
                          message: "Email ya registrado.",
                          icon: <IconX size={18} />,
                        });
                        setLoading(false);
                      },
                    );
                  }}
                  mt="xl"
                  size="md"
                  disabled={
                    !form.isValid("confirmPassword") ||
                    !checkCurrentPassword(form.values.confirmPassword)
                  }
                  loading={isLoading}
                >
                  Crear cuenta
                </Button>
              </Group>
            </Stepper.Step>
            <Stepper.Step label="Paso final" description="Verificar email">
              <TextInput
                label="Código"
                size="md"
                mt="md"
                {...form.getInputProps("code")}
              />
              <Group position="center">
                <Button
                  onClick={() => {
                    setLoading(true);
                    confirm(
                      form.values.email,
                      form.values.code,
                      () => {
                        setLoading(false);
                      },
                      () => {
                        showNotification({
                          color: "red",
                          title: "Código incorrecto.",
                          message: "El código ingresado no es el correcto.",
                          icon: <IconX size={18} />,
                        });
                        setLoading(false);
                      },
                    );
                  }}
                  mt="xl"
                  size="md"
                  disabled={!form.isValid("code")}
                  loading={isLoading}
                >
                  Verificar código
                </Button>
              </Group>
            </Stepper.Step>

            <Stepper.Completed>
              <Stack justify="center" align="center" my={"xl"}>
                ¡Enhorabuena! ¡Ahora disfrutá de los mejores precios!
                <Image
                  src={logoWink}
                  alt="register_image"
                  style={{ height: "100px", width: "69px" }}
                  unoptimized
                />
                <Button
                  onClick={() => {
                    setLoading(true);
                    logIn(
                      form.values.email,
                      form.values.password,
                      () => {
                        Router.push("/");
                      },
                      () => {
                        setLoading(false);
                      },
                    );
                  }}
                  mt="xl"
                  size="md"
                  loading={isLoading}
                >
                  Volver a Inicio
                </Button>
              </Stack>
            </Stepper.Completed>
          </Stepper>
        </Paper>
      </div>
    </Layout>
  );
};

export default Register;
