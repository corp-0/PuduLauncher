import {HealthApi} from "../pudu/generated";
import {PropsWithChildren, useEffect, useRef, useState} from "react";
import Modal from '@mui/joy/Modal';
import {CircularProgress, ModalDialog, Stack, Typography} from "@mui/joy";

export function BackendConnectionChecker(props: PropsWithChildren){
    const api = new HealthApi();
    const firstTimeRef = useRef(true);
    const [ready, setReady] = useState(false);

    useEffect(() => {
        if (!firstTimeRef.current) return;
        const apiCall = async () => {
            const res = await api.isPuduAlive();
            if (res.success) {
                setReady(true);
            }
        }
        void apiCall();
    }, []);

    return (
        <Stack width="100%" height="100%">
            <Modal open={!ready} >
                <ModalDialog layout="fullscreen">
                    <Stack spacing={8} width="100%" height="100%" alignItems="center" justifyContent="center" direction="column">
                        <Typography level="h1">
                            PuduLauncher
                        </Typography>
                        <CircularProgress />
                    </Stack>
                </ModalDialog>
            </Modal>
            {props.children}
        </Stack>
    )
}
