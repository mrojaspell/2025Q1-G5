import { createStyles, ThemeIcon, Text, SimpleGrid, Box, Stack } from '@mantine/core';
import { IconMail, IconGift, IconUser, IconFriends } from '@tabler/icons';
import { useAuth } from '../context/authContext';

type ContactIconVariant = 'white' | 'gradient';


interface ContactIconStyles {
    variant: ContactIconVariant;
}

const useStyles = createStyles((theme, { variant }: ContactIconStyles) => ({
    wrapper: {
        display: 'flex',
        alignItems: 'center',
        color: theme.white,
    },

    icon: {
        marginRight: theme.spacing.md,
        backgroundImage:
            variant === 'gradient'
                ? `linear-gradient(135deg, ${theme.colors[theme.primaryColor][4]} 0%, ${theme.colors[theme.primaryColor][6]
                } 100%)`
                : 'none',
        backgroundColor: 'transparent',
    },

    title: {
        color: variant === 'gradient' ? theme.colors.gray[6] : theme.colors[theme.primaryColor][0],
    },

    description: {
        color: variant === 'gradient' ? theme.black : theme.white,
    },
}));

interface ContactIconProps extends Omit<React.ComponentPropsWithoutRef<'div'>, 'title'> {
    icon: React.FC<any>;
    title: React.ReactNode;
    description: React.ReactNode;
    variant?: ContactIconVariant;
}

function ContactIcon({
    icon: Icon,
    title,
    description,
    variant = 'gradient',
    className,
    ...others
}: ContactIconProps) {
    const { classes, cx } = useStyles({ variant });
    return (
        <div className={cx(classes.wrapper, className)} {...others}>
            {variant === 'gradient' ? (
                <ThemeIcon size={40} radius="md" className={classes.icon}>
                    <Icon size={24} />
                </ThemeIcon>
            ) : (
                <Box mr="md">
                    <Icon size={24} />
                </Box>
            )}

            <div>
                <Text size="xs" className={classes.title}>
                    {title}
                </Text>
                <Text className={classes.description}>{description}</Text>
            </div>
        </div>
    );
}

interface ContactIconsListProps {
    data?: ContactIconProps[];
    variant?: ContactIconVariant;
}

export function ContactIconsList({ variant }: ContactIconsListProps) {
    const { session } = useAuth();

    if (session == null || session.idToken == null) {
        return <div></div>;
    }


    // Only if it is string
    var parts;
    if (typeof session.idToken.payload.birthdate === 'string') {
        parts = session.idToken.payload.birthdate.split('/')
    }

    const data = [
        {title: 'Email', description: session.idToken.payload.email as string, icon: IconMail },
        {title: 'Nombre', description: session.idToken.payload.name as string, icon: IconUser},
        {title: 'Apellido', description: session.idToken.payload.family_name as string, icon: IconFriends},
    ]

    if (parts && parts.length === 3) {
        data.push({
            title: 'Fecha de Nacimiento',
            description: `${parts[0]}/${parts[1]}/${parts[2]}`,
            icon: IconGift,
        });
    }

    const items = data.map((item, index) => <ContactIcon key={index} variant={variant} {...item} />);
    return <Stack>{items}</Stack>;
}

export function ContactIcons() {
    return (
        <SimpleGrid cols={2} breakpoints={[{ maxWidth: 755, cols: 1 }]}>
            <Box
                sx={(theme) => ({
                    padding: theme.spacing.xl,
                    borderRadius: theme.radius.md,
                    backgroundColor: theme.white,
                })}
            >
                <ContactIconsList />
            </Box>
        </SimpleGrid>
    );
}
