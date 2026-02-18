import { CircularProgress, Stack } from "@mui/joy";
import { useEffect, useState } from "react";
import { useErrorContext } from "../../../../../contextProviders/ErrorContextProvider";
import type { OnboardingStepComponentProps } from "../../../../../contextProviders/onboardingStepRegistry";
import { useStepContext } from "../../../../../contextProviders/StepContextProvider";
import { PreferencesApi, TtsApi, type Preferences } from "../../../../../pudu/generated";
import HonkTtsSetupLayout from "./HonkTtsSetupLayout";
import ImmersiveVoicesIntroLayout from "./ImmersiveVoicesIntroLayout";
import InstallationsPathLayout from "./InstallationsPathLayout";

export default function MainLayout(props: OnboardingStepComponentProps) {
    const { onComplete } = props;
    const { currentStep, goToNextStep, goToPreviousStep } = useStepContext();
    const { showError } = useErrorContext();

    const [preferences, setPreferences] = useState<Preferences | null>(null);
    const [installationsPath, setInstallationsPath] = useState("");
    const [ttsInstallPath, setTtsInstallPath] = useState("");
    const [autoStartOnLaunch, setAutoStartOnLaunch] = useState(true);
    const [isLoadingPreferences, setIsLoadingPreferences] = useState(true);
    const [isSavingPreferences, setIsSavingPreferences] = useState(false);
    const [isInstallingTts, setIsInstallingTts] = useState(false);

    useEffect(() => {
        let isCancelled = false;

        void (async () => {
            const api = new PreferencesApi();
            try {
                const result = await api.getPreferences();
                if (!result.success || !result.data) {
                    if (!isCancelled) {
                        showError({
                            source: "frontend.onboarding.launcher-basics.get-preferences",
                            userMessage: "Could not load onboarding preferences.",
                            code: "ONBOARDING_PREFS_FETCH_FAILED",
                            technicalDetails: result.error ?? "Unknown backend error.",
                        });
                    }
                    return;
                }

                if (isCancelled) {
                    return;
                }

                setPreferences(result.data);
                setInstallationsPath(result.data.installations.installationPath);
                setTtsInstallPath(result.data.tts.installPath);
                setAutoStartOnLaunch(result.data.tts.autoStartOnLaunch);
            } catch (error: unknown) {
                if (!isCancelled) {
                    showError({
                        source: "frontend.onboarding.launcher-basics.get-preferences",
                        userMessage: "Could not load onboarding preferences.",
                        code: "ONBOARDING_PREFS_FETCH_EXCEPTION",
                        technicalDetails: error instanceof Error ? error.toString() : String(error),
                    });
                }
            } finally {
                if (!isCancelled) {
                    setIsLoadingPreferences(false);
                }
            }
        })();

        return () => {
            isCancelled = true;
        };
    }, [showError]);

    const updatePreferences = async (updatedPreferences: Preferences): Promise<boolean> => {
        setIsSavingPreferences(true);
        const api = new PreferencesApi();

        try {
            const result = await api.updatePreferences(updatedPreferences);
            if (!result.success) {
                showError({
                    source: "frontend.onboarding.launcher-basics.update-preferences",
                    userMessage: "Could not save onboarding settings.",
                    code: "ONBOARDING_PREFS_UPDATE_FAILED",
                    technicalDetails: result.error ?? "Unknown backend error.",
                });
                return false;
            }

            setPreferences(updatedPreferences);
            return true;
        } catch (error: unknown) {
            showError({
                source: "frontend.onboarding.launcher-basics.update-preferences",
                userMessage: "Could not save onboarding settings.",
                code: "ONBOARDING_PREFS_UPDATE_EXCEPTION",
                technicalDetails: error instanceof Error ? error.toString() : String(error),
            });
            return false;
        } finally {
            setIsSavingPreferences(false);
        }
    };

    const persistInstallationsAndContinue = async () => {
        if (isSavingPreferences || isInstallingTts) {
            return;
        }

        if (preferences === null) {
            goToNextStep();
            return;
        }

        const resolvedInstallationsPath = installationsPath.trim().length > 0
            ? installationsPath.trim()
            : preferences.installations.installationPath;

        const updatedPreferences: Preferences = {
            ...preferences,
            installations: {
                ...preferences.installations,
                installationPath: resolvedInstallationsPath,
            },
        };

        const wasSaved = await updatePreferences(updatedPreferences);
        if (wasSaved) {
            goToNextStep();
        }
    };

    const persistTtsPreferences = async (enabled: boolean): Promise<boolean> => {
        if (isSavingPreferences || isInstallingTts) {
            return false;
        }

        if (preferences === null) {
            return true;
        }

        const resolvedInstallationsPath = installationsPath.trim().length > 0
            ? installationsPath.trim()
            : preferences.installations.installationPath;

        const resolvedTtsPath = ttsInstallPath.trim().length > 0
            ? ttsInstallPath.trim()
            : preferences.tts.installPath;

        const updatedPreferences: Preferences = {
            ...preferences,
            installations: {
                ...preferences.installations,
                installationPath: resolvedInstallationsPath,
            },
            tts: {
                ...preferences.tts,
                enabled,
                installPath: resolvedTtsPath,
                autoStartOnLaunch,
            },
        };

        return updatePreferences(updatedPreferences);
    };

    const persistTtsPreferencesAndComplete = async (enabled: boolean) => {
        const wasSaved = await persistTtsPreferences(enabled);
        if (wasSaved) {
            await onComplete();
        }
    };

    const persistTtsPreferencesAndInstall = async () => {
        const wasSaved = await persistTtsPreferences(true);
        if (!wasSaved) {
            return;
        }

        setIsInstallingTts(true);
        const api = new TtsApi();

        try {
            const result = await api.install();
            if (!result.success) {
                showError({
                    source: "frontend.onboarding.launcher-basics.install-tts",
                    userMessage: "Could not install HonkTTS.",
                    code: "ONBOARDING_TTS_INSTALL_FAILED",
                    technicalDetails: result.error ?? "Unknown backend error.",
                });
                return;
            }

            await onComplete();
        } catch (error: unknown) {
            showError({
                source: "frontend.onboarding.launcher-basics.install-tts",
                userMessage: "Could not install HonkTTS.",
                code: "ONBOARDING_TTS_INSTALL_EXCEPTION",
                technicalDetails: error instanceof Error ? error.toString() : String(error),
            });
        } finally {
            setIsInstallingTts(false);
        }
    };

    if (isLoadingPreferences) {
        return (
            <Stack sx={{ height: "100%", minHeight: 0 }} alignItems="center" justifyContent="center">
                <CircularProgress />
            </Stack>
        );
    }

    switch (currentStep) {
        case 0:
            return (
                <InstallationsPathLayout
                    installationsPath={installationsPath}
                    isSubmitting={isSavingPreferences || isInstallingTts}
                    onInstallationsPathChange={setInstallationsPath}
                    onContinue={persistInstallationsAndContinue}
                />
            );
        case 1:
            return (
                <ImmersiveVoicesIntroLayout
                    isSubmitting={isSavingPreferences || isInstallingTts}
                    onEnable={goToNextStep}
                    onSkip={async () => {
                        await persistTtsPreferencesAndComplete(false);
                    }}
                />
            );
        case 2:
            return (
                <HonkTtsSetupLayout
                    installPath={ttsInstallPath}
                    autoStartOnLaunch={autoStartOnLaunch}
                    isSubmitting={isSavingPreferences || isInstallingTts}
                    onInstallPathChange={setTtsInstallPath}
                    onAutoStartOnLaunchChange={setAutoStartOnLaunch}
                    onBack={goToPreviousStep}
                    onContinue={async () => {
                        await persistTtsPreferencesAndInstall();
                    }}
                />
            );
        default:
            return (
                <InstallationsPathLayout
                    installationsPath={installationsPath}
                    isSubmitting={isSavingPreferences || isInstallingTts}
                    onInstallationsPathChange={setInstallationsPath}
                    onContinue={persistInstallationsAndContinue}
                />
            );
    }
}
