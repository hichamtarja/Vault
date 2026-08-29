"use strict";

/*
====================================================================
VAULT ENERGY TRACKER
====================================================================

Purpose:

This application DOES NOT simulate the game.

The game itself decides:
    - how much energy remains
    - how much energy a vault consumes
    - the actual money received

This tracker only:

    1. Tracks energy regeneration.
    2. Tells you when the energy should be full.
    3. Lets you record a vault check.
    4. Records balance before / after.
    5. Calculates actual earnings.
    6. Calculates overdue time.
    7. Asks you for the NEW energy shown by the game.
    8. Starts the next tracking cycle.
    9. Stores everything locally.
   10. Provides analytics and history.

====================================================================
*/


/* =================================================================
   CONSTANTS
   ================================================================= */

const STORAGE_KEY = "vaultEnergyTracker";

const APP_VERSION = 5;

const DEFAULT_CONFIG = {
    maxEnergy: 250,
    secPerEnergy: 30,

    /*
     * These reward values are informational only.
     * Actual earnings always come from:
     *
     * balanceAfter - balanceBefore
     */
    minReward: 9000,
    maxReward: 16000
};

const TEST_CONFIG = {
    maxEnergy: 10,
    secPerEnergy: 5
};


/* =================================================================
   CONFIGURATION
   ================================================================= */

let config = {
    ...DEFAULT_CONFIG
};


/* =================================================================
   APPLICATION STATE
   ================================================================= */

const state = {

    /* -------------------------------------------------------------
       Current tracking cycle
       ------------------------------------------------------------- */

    currentEnergy: 0,

    startingEnergy: 0,

    trackingStartedAt: null,

    fullAt: null,

    waitingForCheck: false,


    /*
     * After a vault is recorded, we wait for the user
     * to tell us the new energy shown by the game.
     */
    waitingForNewEnergy: false,


    /* -------------------------------------------------------------
       History
       ------------------------------------------------------------- */

    history: [],


    /* -------------------------------------------------------------
       Settings
       ------------------------------------------------------------- */

    testMode: false,

    notificationsEnabled: false,


    /* -------------------------------------------------------------
       UI
       ------------------------------------------------------------- */

    currentPage: "dashboard",

    analyticsPeriod: "today",

    historyDateFilter: "all",

    historyStatusFilter: "all",

    historySearch: "",


    /* -------------------------------------------------------------
       Runtime
       ------------------------------------------------------------- */

    notificationShownForCycle: false,

    currentModal: null,

    pendingConfirmationAction: null
};


/* =================================================================
   DOM HELPERS
   ================================================================= */

const $ = selector =>
    document.querySelector(selector);

const $$ = selector =>
    [...document.querySelectorAll(selector)];


/* =================================================================
   DOM REFERENCES
   ================================================================= */

const dom = {

    /* -------------------------------------------------------------
       Navigation
       ------------------------------------------------------------- */

    navButtons:
        $$(".nav-button"),

    pages:
        $$("[data-page-content]"),


    /* -------------------------------------------------------------
       Header
       ------------------------------------------------------------- */

    settingsButton:
        $("#settingsButton"),


    /* -------------------------------------------------------------
       Dashboard
       ------------------------------------------------------------- */

    dashboardCurrentEnergy:
        $("#dashboardCurrentEnergy"),

    dashboardMaxEnergy:
        $("#dashboardMaxEnergy"),

    energyStateBadge:
        $("#energyStateBadge"),

    energyStatusText:
        $("#energyStatusText"),

    energyProgressBar:
        $("#energyProgressBar"),

    energyProgressPercentage:
        $("#energyProgressPercentage"),

    energyProgressMax:
        $("#energyProgressMax"),

    countdown:
        $("#countdown"),

    fullAt:
        $("#fullAt"),

    energyInput:
        $("#energyInput"),

    energyInputSuffix:
        $("#energyInputSuffix"),

    startTrackingButton:
        $("#startTrackingButton"),

    energyInputError:
        $("#energyInputError"),

    energyCheckSection:
        $("#energyCheckSection"),

    balanceBeforeInput:
        $("#balanceBeforeInput"),

    checkVaultButton:
        $("#checkVaultButton"),

    latestResultCard:
        $("#latestResultCard"),

    latestBalanceBefore:
        $("#latestBalanceBefore"),

    latestBalanceAfter:
        $("#latestBalanceAfter"),

    latestEarnings:
        $("#latestEarnings"),

    latestCheckedTime:
        $("#latestCheckedTime"),

    latestOverdue:
        $("#latestOverdue"),

    todayChecks:
        $("#todayChecks"),

    todayVaults:
        $("#todayVaults"),

    todayEarnings:
        $("#todayEarnings"),

    todayOverdue:
        $("#todayOverdue"),

    todayLateTime:
        $("#todayLateTime"),

    todayAverageReward:
        $("#todayAverageReward"),

    startingEnergy:
        $("#startingEnergy"),

    remainingEnergy:
        $("#remainingEnergy"),

    rechargeRate:
        $("#rechargeRate"),

    fullRechargeDuration:
        $("#fullRechargeDuration"),

    vaultEnergyCost:
        $("#vaultEnergyCost"),

    vaultsPossible:
        $("#vaultsPossible"),

    energyCard:
        document.querySelector(".energy-card"),


    /* -------------------------------------------------------------
       Analytics
       ------------------------------------------------------------- */

    periodButtons:
        $$(".period-button"),

    analyticsTotalEarnings:
        $("#analyticsTotalEarnings"),

    analyticsAverageReward:
        $("#analyticsAverageReward"),

    analyticsHighestReward:
        $("#analyticsHighestReward"),

    analyticsLowestReward:
        $("#analyticsLowestReward"),

    analyticsVaultCount:
        $("#analyticsVaultCount"),

    analyticsChecks:
        $("#analyticsChecks"),

    analyticsOnTime:
        $("#analyticsOnTime"),

    analyticsOverdue:
        $("#analyticsOverdue"),

    analyticsLateTime:
        $("#analyticsLateTime"),

    analyticsAverageLate:
        $("#analyticsAverageLate"),

    analyticsBestStreak:
        $("#analyticsBestStreak"),

    analyticsDaysTracked:
        $("#analyticsDaysTracked"),

    earningsChart:
        $("#earningsChart"),

    vaultChart:
        $("#vaultChart"),

    overdueChart:
        $("#overdueChart"),

    checkEfficiency:
        $("#checkEfficiency"),

    checkEfficiencyBar:
        $("#checkEfficiencyBar"),

    vaultCapacityEfficiency:
        $("#vaultCapacityEfficiency"),

    vaultCapacityEfficiencyBar:
        $("#vaultCapacityEfficiencyBar"),


    /* -------------------------------------------------------------
       History
       ------------------------------------------------------------- */

    historyDateFilter:
        $("#historyDateFilter"),

    historyStatusFilter:
        $("#historyStatusFilter"),

    historySearch:
        $("#historySearch"),

    historySummaryRecords:
        $("#historySummaryRecords"),

    historySummaryEarnings:
        $("#historySummaryEarnings"),

    historySummaryOverdue:
        $("#historySummaryOverdue"),

    historyRecordCount:
        $("#historyRecordCount"),

    historyList:
        $("#historyList"),


    /* -------------------------------------------------------------
       Settings
       ------------------------------------------------------------- */

    settingMaxEnergy:
        $("#settingMaxEnergy"),

    settingSecondsPerEnergy:
        $("#settingSecondsPerEnergy"),

    settingVaultEnergyCost:
        $("#settingVaultEnergyCost"),

    settingMinReward:
        $("#settingMinReward"),

    settingMaxReward:
        $("#settingMaxReward"),

    notificationPermissionButton:
        $("#notificationPermissionButton"),

    notificationStatus:
        $("#notificationStatus"),

    testModeButton:
        $("#testModeButton"),

    exportDataButton:
        $("#exportDataButton"),

    importDataButton:
        $("#importDataButton"),

    importFileInput:
        $("#importFileInput"),

    clearHistoryButton:
        $("#clearHistoryButton"),

    resetApplicationButton:
        $("#resetApplicationButton"),


    /* -------------------------------------------------------------
       Check result modal
       ------------------------------------------------------------- */

    checkResultModal:
        $("#checkResultModal"),

    closeCheckResultModal:
        $("#closeCheckResultModal"),

    modalBalanceBefore:
        $("#modalBalanceBefore"),

    modalBalanceAfter:
        $("#modalBalanceAfter"),

    modalEarningsPreview:
        $("#modalEarningsPreview"),

    modalFullTime:
        $("#modalFullTime"),

    modalCheckedTime:
        $("#modalCheckedTime"),

    modalOverdueTime:
        $("#modalOverdueTime"),

    cancelCheckResultButton:
        $("#cancelCheckResultButton"),

    saveCheckResultButton:
        $("#saveCheckResultButton"),


    /* -------------------------------------------------------------
       Confirmation modal
       ------------------------------------------------------------- */

    confirmationModal:
        $("#confirmationModal"),

    confirmationMessage:
        $("#confirmationMessage"),

    cancelConfirmationButton:
        $("#cancelConfirmationButton"),

    confirmActionButton:
        $("#confirmActionButton")
};


/* =================================================================
   BASIC UTILITIES
   ================================================================= */

function now() {
    return Date.now();
}


function clamp(value, min, max) {
    return Math.max(
        min,
        Math.min(max, value)
    );
}


function isFiniteNumber(value) {
    return (
        typeof value === "number" &&
        Number.isFinite(value)
    );
}


function pad(value) {
    return String(value).padStart(2, "0");
}


function sum(array, selector) {

    return array.reduce(
        (total, item) =>
            total +
            (
                Number(
                    selector(item)
                ) || 0
            ),
        0
    );
}


function escapeHtml(value) {

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


function randomId() {

    if (
        globalThis.crypto &&
        typeof crypto.randomUUID ===
            "function"
    ) {
        return crypto.randomUUID();
    }

    return (
        Date.now().toString(36) +
        "-" +
        Math.random()
            .toString(36)
            .slice(2)
    );
}


/* =================================================================
   FORMATTERS
   ================================================================= */

function formatMoney(value) {

    const number =
        Number(value);

    if (!Number.isFinite(number)) {
        return "$0";
    }

    return new Intl.NumberFormat(
        undefined,
        {
            style: "currency",
            currency: "USD",
            maximumFractionDigits: 2
        }
    ).format(number);
}


function formatSignedMoney(value) {

    const number =
        Number(value);

    if (!Number.isFinite(number)) {
        return "$0";
    }

    if (number === 0) {
        return "$0";
    }

    const formatted =
        formatMoney(
            Math.abs(number)
        );

    return number > 0
        ? `+${formatted}`
        : `-${formatted}`;
}


function formatDuration(totalSeconds) {

    if (
        !Number.isFinite(totalSeconds) ||
        totalSeconds < 0
    ) {
        return "--:--:--";
    }

    const seconds =
        Math.floor(totalSeconds);

    const hours =
        Math.floor(
            seconds / 3600
        );

    const minutes =
        Math.floor(
            (seconds % 3600) / 60
        );

    const remainingSeconds =
        seconds % 60;

    return (
        `${pad(hours)}:` +
        `${pad(minutes)}:` +
        `${pad(remainingSeconds)}`
    );
}


function formatHumanDuration(
    totalSeconds
) {

    if (
        !Number.isFinite(totalSeconds) ||
        totalSeconds <= 0
    ) {
        return "0s";
    }

    let seconds =
        Math.round(totalSeconds);

    const hours =
        Math.floor(
            seconds / 3600
        );

    seconds %= 3600;

    const minutes =
        Math.floor(
            seconds / 60
        );

    seconds %= 60;

    const parts = [];

    if (hours > 0) {
        parts.push(`${hours}h`);
    }

    if (minutes > 0) {
        parts.push(`${minutes}m`);
    }

    if (
        seconds > 0 &&
        hours === 0
    ) {
        parts.push(`${seconds}s`);
    }

    return parts.length
        ? parts.join(" ")
        : "0s";
}


function formatTime(timestamp) {

    if (!timestamp) {
        return "—";
    }

    return new Date(timestamp)
        .toLocaleTimeString(
            [],
            {
                hour: "2-digit",
                minute: "2-digit"
            }
        );
}


function formatTimeWithSeconds(
    timestamp
) {

    if (!timestamp) {
        return "—";
    }

    return new Date(timestamp)
        .toLocaleTimeString(
            [],
            {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit"
            }
        );
}


function formatDate(timestamp) {

    if (!timestamp) {
        return "—";
    }

    return new Date(timestamp)
        .toLocaleDateString(
            [],
            {
                year: "numeric",
                month: "short",
                day: "numeric"
            }
        );
}


function formatDateLong(timestamp) {

    if (!timestamp) {
        return "—";
    }

    return new Date(timestamp)
        .toLocaleDateString(
            [],
            {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric"
            }
        );
}


/* =================================================================
   DATE HELPERS
   ================================================================= */

function getStartOfDay(
    timestamp = now()
) {

    const date =
        new Date(timestamp);

    date.setHours(
        0,
        0,
        0,
        0
    );

    return date.getTime();
}


function getDaysAgoStart(
    days
) {

    const date =
        new Date();

    date.setHours(
        0,
        0,
        0,
        0
    );

    date.setDate(
        date.getDate() -
        days
    );

    return date.getTime();
}


/* =================================================================
   STORAGE
   ================================================================= */

function saveState() {

    try {

        const payload = {

            version:
                APP_VERSION,

            config:
                {
                    ...config
                },

            state: {

                currentEnergy:
                    state.currentEnergy,

                startingEnergy:
                    state.startingEnergy,

                trackingStartedAt:
                    state.trackingStartedAt,

                fullAt:
                    state.fullAt,

                waitingForCheck:
                    state.waitingForCheck,

                waitingForNewEnergy:
                    state.waitingForNewEnergy,

                history:
                    state.history,

                testMode:
                    state.testMode,

                notificationsEnabled:
                    state.notificationsEnabled,

                currentPage:
                    state.currentPage,

                analyticsPeriod:
                    state.analyticsPeriod,

                historyDateFilter:
                    state.historyDateFilter,

                historyStatusFilter:
                    state.historyStatusFilter
            }
        };


        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(payload)
        );

    } catch (error) {

        console.error(
            "Failed to save state:",
            error
        );
    }
}


function loadState() {

    try {

        const raw =
            localStorage.getItem(
                STORAGE_KEY
            );


        if (!raw) {
            return false;
        }


        const payload =
            JSON.parse(raw);


        /* ---------------------------------------------------------
           Config
           --------------------------------------------------------- */

        if (
            payload.config
        ) {

            config.maxEnergy =
                sanitizeInteger(
                    payload.config.maxEnergy,
                    DEFAULT_CONFIG.maxEnergy,
                    1,
                    9999
                );


            config.secPerEnergy =
                sanitizeInteger(
                    payload.config.secPerEnergy,
                    DEFAULT_CONFIG.secPerEnergy,
                    1,
                    9999
                );


            config.minReward =
                sanitizeNumber(
                    payload.config.minReward,
                    DEFAULT_CONFIG.minReward,
                    0
                );


            config.maxReward =
                sanitizeNumber(
                    payload.config.maxReward,
                    DEFAULT_CONFIG.maxReward,
                    config.minReward
                );
        }


        /* ---------------------------------------------------------
           State
           --------------------------------------------------------- */

        const saved =
            payload.state || {};


        state.currentEnergy =
            sanitizeInteger(
                saved.currentEnergy,
                0,
                0,
                config.maxEnergy
            );


        state.startingEnergy =
            sanitizeInteger(
                saved.startingEnergy,
                state.currentEnergy,
                0,
                config.maxEnergy
            );


        state.trackingStartedAt =
            isFiniteNumber(
                saved.trackingStartedAt
            )
                ? saved.trackingStartedAt
                : null;


        state.fullAt =
            isFiniteNumber(
                saved.fullAt
            )
                ? saved.fullAt
                : null;


        state.waitingForCheck =
            Boolean(
                saved.waitingForCheck
            );


        state.waitingForNewEnergy =
            Boolean(
                saved.waitingForNewEnergy
            );


        state.history =
            Array.isArray(
                saved.history
            )
                ? normalizeHistory(
                    saved.history
                )
                : [];


        state.testMode =
            Boolean(
                saved.testMode
            );


        state.notificationsEnabled =
            Boolean(
                saved.notificationsEnabled
            );


        state.currentPage =
            [
                "dashboard",
                "analytics",
                "history",
                "settings"
            ].includes(
                saved.currentPage
            )
                ? saved.currentPage
                : "dashboard";


        state.analyticsPeriod =
            [
                "today",
                "7days",
                "30days",
                "all"
            ].includes(
                saved.analyticsPeriod
            )
                ? saved.analyticsPeriod
                : "today";


        state.historyDateFilter =
            [
                "all",
                "today",
                "yesterday",
                "7days",
                "30days"
            ].includes(
                saved.historyDateFilter
            )
                ? saved.historyDateFilter
                : "all";


        state.historyStatusFilter =
            [
                "all",
                "ontime",
                "overdue"
            ].includes(
                saved.historyStatusFilter
            )
                ? saved.historyStatusFilter
                : "all";


        return true;

    } catch (error) {

        console.error(
            "Could not load tracker state:",
            error
        );

        return false;
    }
}


function sanitizeInteger(
    value,
    fallback,
    min,
    max
) {

    const number =
        Number(value);

    if (!Number.isFinite(number)) {
        return fallback;
    }

    return clamp(
        Math.floor(number),
        min,
        max
    );
}


function sanitizeNumber(
    value,
    fallback,
    min = 0
) {

    const number =
        Number(value);

    if (!Number.isFinite(number)) {
        return fallback;
    }

    return Math.max(
        min,
        number
    );
}


function normalizeHistory(
    history
) {

    return history

        .filter(record =>
            record &&
            Number.isFinite(
                record.checkedAt
            ) &&
            Number.isFinite(
                record.fullAt
            )
        )

        .map(record => {

            const before =
                Number(
                    record.balanceBefore
                );


            const after =
                Number(
                    record.balanceAfter
                );


            let earnings =
                Number(
                    record.earnings
                );


            if (
                !Number.isFinite(
                    earnings
                )
            ) {

                earnings =
                    (
                        Number.isFinite(
                            before
                        ) &&
                        Number.isFinite(
                            after
                        )
                    )
                        ? after - before
                        : 0;
            }


            return {

                id:
                    record.id ||
                    randomId(),

                fullAt:
                    Number(
                        record.fullAt
                    ),

                checkedAt:
                    Number(
                        record.checkedAt
                    ),

                overdueSeconds:
                    Math.max(
                        0,
                        Number(
                            record.overdueSeconds
                        ) || 0
                    ),

                balanceBefore:
                    Number.isFinite(
                        before
                    )
                        ? before
                        : 0,

                balanceAfter:
                    Number.isFinite(
                        after
                    )
                        ? after
                        : 0,

                earnings,

                /*
                 * The energy values are observations,
                 * not simulated values.
                 */

                energyAtStart:
                    Number.isFinite(
                        record.energyAtStart
                    )
                        ? record.energyAtStart
                        : null,

                energyAfterVault:
                    Number.isFinite(
                        record.energyAfterVault
                    )
                        ? record.energyAfterVault
                        : null
            };
        });
}


/* =================================================================
   ENERGY TRACKING
   ================================================================= */

function recomputeState() {

    /*
     * Nothing to calculate when we're waiting for
     * the user to enter the new energy after a vault.
     */

    if (
        state.waitingForNewEnergy
    ) {

        return;
    }


    if (
        state.fullAt === null ||
        state.trackingStartedAt === null
    ) {

        return;
    }


    const currentTime =
        now();


    /* -------------------------------------------------------------
       Full
       ------------------------------------------------------------- */

    if (
        currentTime >=
        state.fullAt
    ) {

        state.currentEnergy =
            config.maxEnergy;

        state.waitingForCheck =
            true;

        return;
    }


    /* -------------------------------------------------------------
       Recharging
       ------------------------------------------------------------- */

    const elapsedSeconds =
        Math.max(
            0,
            (
                currentTime -
                state.trackingStartedAt
            ) / 1000
        );


    const energyGained =
        Math.floor(
            elapsedSeconds /
            config.secPerEnergy
        );


    state.currentEnergy =
        clamp(
            state.startingEnergy +
            energyGained,
            0,
            config.maxEnergy
        );


    state.waitingForCheck =
        false;
}


/* =================================================================
   START A NEW TRACKING CYCLE
   ================================================================= */

function startTracking(
    energy
) {

    const safeEnergy =
        clamp(
            Math.floor(
                Number(energy)
            ),
            0,
            config.maxEnergy
        );


    const currentTime =
        now();


    state.currentEnergy =
        safeEnergy;


    state.startingEnergy =
        safeEnergy;


    state.trackingStartedAt =
        currentTime;


    const remainingEnergy =
        config.maxEnergy -
        safeEnergy;


    const secondsNeeded =
        remainingEnergy *
        config.secPerEnergy;


    state.fullAt =
        currentTime +
        secondsNeeded *
        1000;


    state.waitingForNewEnergy =
        false;


    state.waitingForCheck =
        safeEnergy >=
        config.maxEnergy;


    state.notificationShownForCycle =
        false;


    saveState();

    renderAll();
}


/* =================================================================
   AFTER VAULT CHECK
   ================================================================= */

function prepareForNextEnergyEntry() {

    /*
     * We do NOT calculate the next energy ourselves.
     *
     * The user checks the game and enters whatever
     * energy the game actually shows.
     */

    state.currentEnergy = 0;

    state.startingEnergy = 0;

    state.trackingStartedAt = null;

    state.fullAt = null;

    state.waitingForCheck = false;

    state.waitingForNewEnergy = true;

    state.notificationShownForCycle = false;


    dom.energyInput.value = "";


    dom.energyInput.placeholder =
        "Enter energy after vault";


    dom.energyInputError.hidden =
        false;


    dom.energyInputError.textContent =
        "Enter the new energy shown in the game to start the next cycle.";


    dom.energyStatusText.textContent =
        "Vault recorded. Enter the remaining energy from the game.";


    dom.energyStateBadge.textContent =
        "Next cycle";

    dom.energyStateBadge.className =
        "status-badge status-badge--idle";


    saveState();

    renderAll();


    setTimeout(
        () => {

            dom.energyInput.focus();

        },
        50
    );
}


/* =================================================================
   CHECK RESULT MODAL
   ================================================================= */

function openCheckResultModal() {

    if (
        !state.waitingForCheck
    ) {

        return;
    }


    const dashboardBalance =
        Number(
            dom.balanceBeforeInput.value
        );


    const previousBalance =
        getMostRecentBalance();


    if (
        Number.isFinite(
            dashboardBalance
        ) &&
        dashboardBalance >= 0
    ) {

        dom.modalBalanceBefore.value =
            dashboardBalance;

    } else if (
        previousBalance !== null
    ) {

        dom.modalBalanceBefore.value =
            previousBalance;

    } else {

        dom.modalBalanceBefore.value =
            "";
    }


    dom.modalBalanceAfter.value =
        "";


    updateCheckModalPreview();


    dom.checkResultModal.hidden =
        false;


    state.currentModal =
        "check-result";


    setTimeout(
        () => {

            dom.modalBalanceAfter.focus();

        },
        50
    );
}


function closeCheckResultModal() {

    dom.checkResultModal.hidden =
        true;

    state.currentModal =
        null;
}


function getMostRecentBalance() {

    if (
        state.history.length === 0
    ) {

        return null;
    }


    const sorted =
        [...state.history]
            .sort(
                (a, b) =>
                    b.checkedAt -
                    a.checkedAt
            );


    const latest =
        sorted[0];


    return Number.isFinite(
        latest.balanceAfter
    )
        ? latest.balanceAfter
        : null;
}


function updateCheckModalPreview() {

    const before =
        Number(
            dom.modalBalanceBefore.value
        );


    const after =
        Number(
            dom.modalBalanceAfter.value
        );


    const earnings =
        (
            Number.isFinite(before) &&
            Number.isFinite(after)
        )
            ? after - before
            : 0;


    const currentTime =
        now();


    const fullTimestamp =
        state.fullAt ??
        currentTime;


    const overdue =
        Math.max(
            0,
            (
                currentTime -
                fullTimestamp
            ) / 1000
        );


    dom.modalEarningsPreview.textContent =
        formatSignedMoney(
            earnings
        );


    dom.modalFullTime.textContent =
        formatTimeWithSeconds(
            fullTimestamp
        );


    dom.modalCheckedTime.textContent =
        formatTimeWithSeconds(
            currentTime
        );


    dom.modalOverdueTime.textContent =
        formatHumanDuration(
            overdue
        );
}


function saveVaultCheck() {

    if (
        !state.waitingForCheck
    ) {

        return;
    }


    const balanceBefore =
        Number(
            dom.modalBalanceBefore.value
        );


    const balanceAfter =
        Number(
            dom.modalBalanceAfter.value
        );


    if (
        !Number.isFinite(
            balanceBefore
        ) ||
        balanceBefore < 0
    ) {

        dom.modalBalanceBefore.focus();

        return;
    }


    if (
        !Number.isFinite(
            balanceAfter
        ) ||
        balanceAfter < 0
    ) {

        dom.modalBalanceAfter.focus();

        return;
    }


    const checkedAt =
        now();


    const fullTimestamp =
        state.fullAt ??
        checkedAt;


    const overdueSeconds =
        Math.max(
            0,
            (
                checkedAt -
                fullTimestamp
            ) / 1000
        );


    const earnings =
        balanceAfter -
        balanceBefore;


    /*
     * Record ONLY what we know.
     *
     * Energy after the vault is intentionally
     * not guessed by the tracker.
     */

    const record = {

        id:
            randomId(),

        fullAt:
            fullTimestamp,

        checkedAt,

        overdueSeconds,

        balanceBefore,

        balanceAfter,

        earnings,

        energyAtStart:
            config.maxEnergy,

        energyAfterVault:
            null
    };


    state.history.push(
        record
    );


    state.history =
        normalizeHistory(
            state.history
        );


    closeCheckResultModal();


    showLatestResult(
        record
    );


    saveState();


    renderAll();


    /*
     * Now ask for the actual remaining energy
     * from the game.
     */

    prepareForNextEnergyEntry();
}


/* =================================================================
   LATEST RESULT
   ================================================================= */

function showLatestResult(
    record
) {

    dom.latestResultCard.hidden =
        false;


    dom.latestBalanceBefore.textContent =
        formatMoney(
            record.balanceBefore
        );


    dom.latestBalanceAfter.textContent =
        formatMoney(
            record.balanceAfter
        );


    dom.latestEarnings.textContent =
        formatSignedMoney(
            record.earnings
        );


    dom.latestCheckedTime.textContent =
        formatTimeWithSeconds(
            record.checkedAt
        );


    dom.latestOverdue.textContent =
        formatHumanDuration(
            record.overdueSeconds
        );


    dom.balanceBeforeInput.value =
        record.balanceAfter;
}


/* =================================================================
   START NEXT CYCLE FROM USER-ENTERED ENERGY
   ================================================================= */

function handleEnergyInputSubmit() {

    const raw =
        dom.energyInput.value.trim();


    if (
        raw === ""
    ) {

        dom.energyInputError.hidden =
            false;

        dom.energyInputError.textContent =
            state.waitingForNewEnergy
                ? "Enter the new energy shown in the game."
                : "Enter your current energy.";

        dom.energyInput.focus();

        return;
    }


    const value =
        Number(raw);


    if (
        !Number.isInteger(value)
    ) {

        dom.energyInputError.hidden =
            false;

        dom.energyInputError.textContent =
            "Energy must be a whole number.";

        dom.energyInput.focus();

        return;
    }


    if (
        value < 0 ||
        value > config.maxEnergy
    ) {

        dom.energyInputError.hidden =
            false;

        dom.energyInputError.textContent =
            `Enter a value from 0 to ${config.maxEnergy}.`;

        dom.energyInput.focus();

        return;
    }


    dom.energyInputError.hidden =
        true;


    if (
        state.waitingForNewEnergy
    ) {

        startTracking(
            value
        );

    } else {

        startTracking(
            value
        );
    }


    dom.energyInput.value =
        "";
}


/* =================================================================
   NAVIGATION
   ================================================================= */

function navigateTo(
    page
) {

    const validPages = [
        "dashboard",
        "analytics",
        "history",
        "settings"
    ];


    if (
        !validPages.includes(
            page
        )
    ) {

        page =
            "dashboard";
    }


    state.currentPage =
        page;


    dom.pages.forEach(
        pageElement => {

            const active =
                pageElement.dataset.pageContent ===
                page;


            pageElement.hidden =
                !active;


            pageElement.classList.toggle(
                "is-active",
                active
            );
        }
    );


    dom.navButtons.forEach(
        button => {

            button.classList.toggle(
                "is-active",
                button.dataset.page ===
                page
            );
        }
    );


    if (
        page ===
        "dashboard"
    ) {

        renderDashboard();
    }


    if (
        page ===
        "analytics"
    ) {

        renderAnalytics();
    }


    if (
        page ===
        "history"
    ) {

        renderHistory();
    }


    if (
        page ===
        "settings"
    ) {

        updateSettingsUI();
    }


    saveState();


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


/* =================================================================
   DASHBOARD
   ================================================================= */

function renderDashboard() {

    recomputeState();


    const current =
        state.currentEnergy;


    const max =
        config.maxEnergy;


    dom.dashboardCurrentEnergy.textContent =
        current;


    dom.dashboardMaxEnergy.textContent =
        max;


    dom.energyInput.max =
        max;


    dom.energyInputSuffix.textContent =
        `/ ${max}`;


    /*
     * ---------------------------------------------------------------
     * Progress
     * ---------------------------------------------------------------
     */

    const percentage =
        max > 0
            ? (
                current /
                max
            ) *
            100
            : 0;


    dom.energyProgressBar.style.width =
        `${clamp(
            percentage,
            0,
            100
        )}%`;


    dom.energyProgressPercentage.textContent =
        `${Math.round(
            percentage
        )}%`;


    dom.energyProgressMax.textContent =
        max;


    dom.energyProgressBar
        .setAttribute(
            "aria-valuenow",
            String(current)
        );


    /*
     * ---------------------------------------------------------------
     * Current state
     * ---------------------------------------------------------------
     */

    if (
        state.waitingForNewEnergy
    ) {

        renderWaitingForNewEnergy();

    } else if (
        state.waitingForCheck
    ) {

        renderFullState();

    } else if (
        state.fullAt !== null
    ) {

        renderChargingState();

    } else {

        renderIdleState();
    }


    renderRechargeInfo();

    renderTodayStats();
}


function renderIdleState() {

    dom.energyStateBadge.textContent =
        "Idle";

    dom.energyStateBadge.className =
        "status-badge status-badge--idle";


    dom.energyStatusText.textContent =
        "Enter your current energy to begin.";


    dom.countdown.textContent =
        "--:--:--";


    dom.fullAt.innerHTML =
        "Full at <strong>—</strong>";


    dom.startTrackingButton.textContent =
        "Start";


    dom.startTrackingButton.disabled =
        false;


    dom.energyCheckSection.hidden =
        true;


    dom.energyCard?.classList.remove(
        "is-full"
    );
}


function renderWaitingForNewEnergy() {

    dom.energyStateBadge.textContent =
        "Next cycle";


    dom.energyStateBadge.className =
        "status-badge status-badge--idle";


    dom.energyStatusText.textContent =
        "Vault recorded — enter the remaining energy from the game.";


    dom.countdown.textContent =
        "--:--:--";


    dom.fullAt.innerHTML =
        "Full at <strong>waiting for energy</strong>";


    dom.startTrackingButton.textContent =
        "Start Next Cycle";


    dom.startTrackingButton.disabled =
        false;


    dom.energyCheckSection.hidden =
        true;


    dom.energyCard?.classList.remove(
        "is-full"
    );
}


function renderChargingState() {

    const remainingSeconds =
        Math.max(
            0,
            (
                state.fullAt -
                now()
            ) / 1000
        );


    dom.energyStateBadge.textContent =
        "Recharging";


    dom.energyStateBadge.className =
        "status-badge status-badge--counting";


    dom.energyStatusText.textContent =
        `⏳ Recharging · ${
            state.currentEnergy
        }/${config.maxEnergy}`;


    dom.countdown.textContent =
        formatDuration(
            remainingSeconds
        );


    dom.fullAt.innerHTML =
        `Full at <strong>${
            formatTimeWithSeconds(
                state.fullAt
            )
        }</strong>`;


    dom.startTrackingButton.textContent =
        "Tracking";


    dom.startTrackingButton.disabled =
        true;


    dom.energyCheckSection.hidden =
        true;


    dom.energyCard?.classList.remove(
        "is-full"
    );
}


function renderFullState() {

    dom.dashboardCurrentEnergy.textContent =
        config.maxEnergy;


    dom.energyStateBadge.textContent =
        "Full";


    dom.energyStateBadge.className =
        "status-badge status-badge--full";


    dom.energyStatusText.textContent =
        "✅ ENERGY FULL — check the vault.";


    dom.countdown.textContent =
        "⚡ FULL";


    dom.fullAt.innerHTML =
        `Full at <strong>${
            formatTimeWithSeconds(
                state.fullAt
            )
        }</strong>`;


    dom.startTrackingButton.textContent =
        "Full";


    dom.startTrackingButton.disabled =
        true;


    dom.energyCheckSection.hidden =
        false;


    dom.energyCard?.classList.add(
        "is-full"
    );


    dom.energyProgressBar.style.width =
        "100%";


    if (
        !state.notificationShownForCycle
    ) {

        maybeSendNotification();

        state.notificationShownForCycle =
            true;

        saveState();
    }
}


function renderRechargeInfo() {

    if (
        state.waitingForNewEnergy
    ) {

        dom.startingEnergy.textContent =
            "Waiting";


        dom.remainingEnergy.textContent =
            "Enter from game";

    } else if (
        state.trackingStartedAt !== null
    ) {

        dom.startingEnergy.textContent =
            `${state.startingEnergy} / ${config.maxEnergy}`;


        dom.remainingEnergy.textContent =
            `${Math.max(
                0,
                config.maxEnergy -
                state.currentEnergy
            )} ⚡`;

    } else {

        dom.startingEnergy.textContent =
            "—";


        dom.remainingEnergy.textContent =
            "—";
    }


    dom.rechargeRate.textContent =
        `${config.secPerEnergy}s / energy`;


    dom.fullRechargeDuration.textContent =
        formatHumanDuration(
            getFullRechargeSeconds()
        );


    /*
     * The tracker intentionally does not simulate
     * vault energy consumption.
     */

    dom.vaultEnergyCost.textContent =
        "Game decides";


    dom.vaultsPossible.textContent =
        "—";
}


/* =================================================================
   TODAY
   ================================================================= */

function renderTodayStats() {

    const records =
        getRecordsForPeriod(
            "today"
        );


    const checks =
        records.length;


    const overdue =
        records.filter(
            record =>
                record.overdueSeconds > 1
        ).length;


    const earnings =
        sum(
            records,
            record =>
                record.earnings
        );


    const lateSeconds =
        sum(
            records,
            record =>
                record.overdueSeconds
        );


    const average =
        checks > 0
            ? earnings /
              checks
            : 0;


    dom.todayChecks.textContent =
        checks;


    dom.todayVaults.textContent =
        checks;


    dom.todayEarnings.textContent =
        formatMoney(
            earnings
        );


    dom.todayOverdue.textContent =
        overdue;


    dom.todayLateTime.textContent =
        formatHumanDuration(
            lateSeconds
        );


    dom.todayAverageReward.textContent =
        formatMoney(
            average
        );
}


/* =================================================================
   ANALYTICS
   ================================================================= */

function renderAnalytics() {

    const records =
        getRecordsForPeriod(
            state.analyticsPeriod
        );


    const checks =
        records.length;


    const earnings =
        sum(
            records,
            record =>
                record.earnings
        );


    const average =
        checks > 0
            ? earnings /
              checks
            : 0;


    const rewards =
        records.map(
            record =>
                Number(
                    record.earnings
                ) || 0
        );


    const highest =
        rewards.length
            ? Math.max(
                ...rewards
            )
            : 0;


    const lowest =
        rewards.length
            ? Math.min(
                ...rewards
            )
            : 0;


    const overdueRecords =
        records.filter(
            record =>
                record.overdueSeconds > 1
        );


    const onTime =
        checks -
        overdueRecords.length;


    const lateSeconds =
        sum(
            records,
            record =>
                record.overdueSeconds
        );


    const averageLate =
        overdueRecords.length
            ? lateSeconds /
              overdueRecords.length
            : 0;


    dom.analyticsTotalEarnings.textContent =
        formatMoney(
            earnings
        );


    dom.analyticsAverageReward.textContent =
        formatMoney(
            average
        );


    dom.analyticsHighestReward.textContent =
        formatSignedMoney(
            highest
        );


    dom.analyticsLowestReward.textContent =
        formatSignedMoney(
            lowest
        );


    dom.analyticsVaultCount.textContent =
        checks;


    dom.analyticsChecks.textContent =
        checks;


    dom.analyticsOnTime.textContent =
        onTime;


    dom.analyticsOverdue.textContent =
        overdueRecords.length;


    dom.analyticsLateTime.textContent =
        formatHumanDuration(
            lateSeconds
        );


    dom.analyticsAverageLate.textContent =
        formatHumanDuration(
            averageLate
        );


    dom.analyticsBestStreak.textContent =
        calculateBestOnTimeStreak(
            records
        );


    dom.analyticsDaysTracked.textContent =
        calculateTrackedDays(
            state.history
        );


    renderAnalyticsCharts(
        records
    );


    renderEfficiency(
        records
    );


    dom.periodButtons.forEach(
        button => {

            button.classList.toggle(
                "is-active",
                button.dataset.period ===
                state.analyticsPeriod
            );
        }
    );
}


function calculateBestOnTimeStreak(
    records
) {

    if (
        records.length === 0
    ) {

        return 0;
    }


    const sorted =
        [...records]
            .sort(
                (a, b) =>
                    a.checkedAt -
                    b.checkedAt
            );


    let current =
        0;


    let best =
        0;


    for (
        const record
        of sorted
    ) {

        if (
            record.overdueSeconds <= 1
        ) {

            current++;

            best =
                Math.max(
                    best,
                    current
                );

        } else {

            current = 0;
        }
    }


    return best;
}


function calculateTrackedDays(
    records
) {

    const days =
        new Set();


    for (
        const record
        of records
    ) {

        days.add(
            getStartOfDay(
                record.checkedAt
            )
        );
    }


    return days.size;
}


/* =================================================================
   ANALYTICS PERIOD
   ================================================================= */

function getRecordsForPeriod(
    period
) {

    if (
        period ===
        "all"
    ) {

        return [
            ...state.history
        ];
    }


    const currentTime =
        now();


    let start;


    switch (
        period
    ) {

        case "7days":

            start =
                getDaysAgoStart(
                    6
                );

            break;


        case "30days":

            start =
                getDaysAgoStart(
                    29
                );

            break;


        case "today":

        default:

            start =
                getStartOfDay(
                    currentTime
                );
    }


    return state.history.filter(
        record =>
            record.checkedAt >=
            start
    );
}


/* =================================================================
   CHARTS
   ================================================================= */

function groupRecordsByDay(
    records
) {

    const map =
        new Map();


    for (
        const record
        of records
    ) {

        const day =
            getStartOfDay(
                record.checkedAt
            );


        if (
            !map.has(day)
        ) {

            map.set(
                day,
                {
                    date:
                        day,

                    earnings:
                        0,

                    vaults:
                        0,

                    lateSeconds:
                        0
                }
            );
        }


        const entry =
            map.get(day);


        entry.earnings +=
            Number(
                record.earnings
            ) || 0;


        entry.vaults++;


        entry.lateSeconds +=
            Number(
                record.overdueSeconds
            ) || 0;
    }


    return [
        ...map.values()
    ].sort(
        (a, b) =>
            a.date -
            b.date
    );
}


function renderAnalyticsCharts(
    records
) {

    const grouped =
        groupRecordsByDay(
            records
        );


    renderBarChart(
        dom.earningsChart,
        grouped,
        item =>
            item.earnings,
        item =>
            formatMoney(
                item.earnings
            ),
        "Earnings"
    );


    renderBarChart(
        dom.vaultChart,
        grouped,
        item =>
            item.vaults,
        item =>
            String(
                item.vaults
            ),
        "Vaults"
    );


    renderBarChart(
        dom.overdueChart,
        grouped,
        item =>
            item.lateSeconds,
        item =>
            formatHumanDuration(
                item.lateSeconds
            ),
        "Late"
    );
}


function renderBarChart(
    container,
    data,
    valueSelector,
    valueFormatter,
    label
) {

    if (!container) {
        return;
    }


    if (
        data.length === 0
    ) {

        container.innerHTML =
            `
                <div
                    style="
                        display:flex;
                        align-items:center;
                        justify-content:center;
                        width:100%;
                        min-height:145px;
                        color:var(--text-muted);
                        font-size:.73rem;
                    "
                >
                    No data yet.
                </div>
            `;

        return;
    }


    const visible =
        data.slice(-14);


    const maximum =
        Math.max(
            1,
            ...visible.map(
                valueSelector
            )
        );


    container.innerHTML =
        `
            <div
                style="
                    width:100%;
                    height:160px;
                    display:flex;
                    align-items:flex-end;
                    gap:5px;
                    padding:3px;
                    overflow-x:auto;
                "
                aria-label="${escapeHtml(label)} chart"
            >
                ${
                    visible
                        .map(
                            item => {

                                const value =
                                    Math.max(
                                        0,
                                        valueSelector(
                                            item
                                        )
                                    );


                                const height =
                                    Math.max(
                                        3,
                                        (
                                            value /
                                            maximum
                                        ) *
                                        100
                                    );


                                return `
                                    <div
                                        style="
                                            flex:1;
                                            min-width:18px;
                                            height:150px;
                                            display:flex;
                                            flex-direction:column;
                                            align-items:center;
                                            justify-content:flex-end;
                                            gap:5px;
                                        "
                                        title="${escapeHtml(
                                            formatDateLong(
                                                item.date
                                            )
                                        )}"
                                    >

                                        <span
                                            style="
                                                color:var(--text-muted);
                                                font-size:.50rem;
                                                max-width:55px;
                                                overflow:hidden;
                                                text-overflow:ellipsis;
                                                white-space:nowrap;
                                            "
                                        >
                                            ${escapeHtml(
                                                valueFormatter(
                                                    item
                                                )
                                            )}
                                        </span>


                                        <div
                                            style="
                                                width:100%;
                                                max-width:28px;
                                                height:${height}%;
                                                min-height:3px;
                                                border-radius:6px 6px 3px 3px;
                                                background:
                                                    linear-gradient(
                                                        to top,
                                                        var(--accent-dark),
                                                        var(--accent)
                                                    );
                                            "
                                        ></div>


                                        <span
                                            style="
                                                color:var(--text-muted);
                                                font-size:.50rem;
                                                white-space:nowrap;
                                            "
                                        >
                                            ${escapeHtml(
                                                new Date(
                                                    item.date
                                                )
                                                    .toLocaleDateString(
                                                        [],
                                                        {
                                                            month:
                                                                "short",
                                                            day:
                                                                "numeric"
                                                        }
                                                    )
                                            )}
                                        </span>

                                    </div>
                                `;
                            }
                        )
                        .join("")
                }
            </div>
        `;
}


/* =================================================================
   EFFICIENCY
   ================================================================= */

function renderEfficiency(
    records
) {

    const checks =
        records.length;


    const onTime =
        records.filter(
            record =>
                record.overdueSeconds <= 1
        ).length;


    const efficiency =
        checks > 0
            ? (
                onTime /
                checks
            ) *
            100
            : 0;


    dom.checkEfficiency.textContent =
        `${Math.round(
            efficiency
        )}%`;


    dom.checkEfficiencyBar.style.width =
        `${clamp(
            efficiency,
            0,
            100
        )}%`;


    /*
     * There is intentionally NO "vault capacity simulation".
     *
     * The tracker does not know what energy the game leaves after
     * a vault, so theoretical vault capacity would be fake data.
     */

    dom.vaultCapacityEfficiency.textContent =
        "Observed";


    dom.vaultCapacityEfficiencyBar.style.width =
        "0%";
}


/* =================================================================
   HISTORY
   ================================================================= */

function getFilteredHistory() {

    let records =
        [...state.history];


    const currentTime =
        now();


    switch (
        state.historyDateFilter
    ) {

        case "today":

            records =
                records.filter(
                    record =>
                        record.checkedAt >=
                        getStartOfDay(
                            currentTime
                        )
                );

            break;


        case "yesterday": {

            const today =
                getStartOfDay(
                    currentTime
                );


            const yesterday =
                today -
                86400000;


            records =
                records.filter(
                    record =>
                        record.checkedAt >=
                        yesterday &&
                        record.checkedAt <
                        today
                );

            break;
        }


        case "7days":

            records =
                records.filter(
                    record =>
                        record.checkedAt >=
                        getDaysAgoStart(
                            6
                        )
                );

            break;


        case "30days":

            records =
                records.filter(
                    record =>
                        record.checkedAt >=
                        getDaysAgoStart(
                            29
                        )
                );

            break;
    }


    if (
        state.historyStatusFilter ===
        "ontime"
    ) {

        records =
            records.filter(
                record =>
                    record.overdueSeconds <= 1
            );
    }


    if (
        state.historyStatusFilter ===
        "overdue"
    ) {

        records =
            records.filter(
                record =>
                    record.overdueSeconds > 1
            );
    }


    const search =
        state.historySearch
            .trim()
            .toLowerCase();


    if (
        search
    ) {

        records =
            records.filter(
                record => {

                    const text =
                        [
                            formatDate(
                                record.checkedAt
                            ),

                            formatTime(
                                record.checkedAt
                            ),

                            formatMoney(
                                record.balanceBefore
                            ),

                            formatMoney(
                                record.balanceAfter
                            ),

                            formatMoney(
                                record.earnings
                            ),

                            String(
                                record.energyAtStart
                            )
                        ]
                        .join(" ")
                        .toLowerCase();


                    return text.includes(
                        search
                    );
                }
            );
    }


    return records.sort(
        (a, b) =>
            b.checkedAt -
            a.checkedAt
    );
}


function renderHistory() {

    const records =
        getFilteredHistory();


    const earnings =
        sum(
            records,
            record =>
                record.earnings
        );


    const overdue =
        records.filter(
            record =>
                record.overdueSeconds > 1
        ).length;


    dom.historySummaryRecords.textContent =
        records.length;


    dom.historySummaryEarnings.textContent =
        formatMoney(
            earnings
        );


    dom.historySummaryOverdue.textContent =
        overdue;


    dom.historyRecordCount.textContent =
        `${records.length} ${
            records.length === 1
                ? "record"
                : "records"
        }`;


    if (
        records.length === 0
    ) {

        dom.historyList.innerHTML =
            `
                <div class="history-empty">

                    <span class="history-empty__icon">
                        📜
                    </span>

                    <p>
                        No matching records.
                    </p>

                    <small>
                        Complete a vault check to create history.
                    </small>

                </div>
            `;

        return;
    }


    dom.historyList.innerHTML =
        records
            .map(
                createHistoryItem
            )
            .join("");
}


function createHistoryItem(
    record
) {

    const overdue =
        record.overdueSeconds > 1;


    const statusClass =
        overdue
            ? "history-item__status--overdue"
            : "history-item__status--on-time";


    const statusText =
        overdue
            ? `⚠ ${
                formatHumanDuration(
                    record.overdueSeconds
                )
              } late`
            : "✓ On time";


    const earningsClass =
        record.earnings > 0
            ? "text-success"
            : record.earnings < 0
                ? "text-danger"
                : "text-muted";


    return `
        <article
            class="history-item"
            data-history-id="${escapeHtml(
                record.id
            )}"
        >

            <div class="history-item__top">

                <div>

                    <div class="history-item__time">
                        ${escapeHtml(
                            formatTimeWithSeconds(
                                record.checkedAt
                            )
                        )}
                    </div>

                    <div class="history-item__date">
                        ${escapeHtml(
                            formatDateLong(
                                record.checkedAt
                            )
                        )}
                    </div>

                </div>


                <span
                    class="
                        history-item__status
                        ${statusClass}
                    "
                >
                    ${escapeHtml(
                        statusText
                    )}
                </span>

            </div>


            <div class="history-item__body">

                <div class="history-item__detail">

                    <span class="history-item__detail-label">
                        Balance Before
                    </span>

                    <strong class="history-item__detail-value">
                        ${escapeHtml(
                            formatMoney(
                                record.balanceBefore
                            )
                        )}
                    </strong>

                </div>


                <div class="history-item__detail">

                    <span class="history-item__detail-label">
                        Balance After
                    </span>

                    <strong class="history-item__detail-value">
                        ${escapeHtml(
                            formatMoney(
                                record.balanceAfter
                            )
                        )}
                    </strong>

                </div>


                <div class="history-item__detail">

                    <span class="history-item__detail-label">
                        Vault Earnings
                    </span>

                    <strong
                        class="
                            history-item__detail-value
                            ${earningsClass}
                        "
                    >
                        ${escapeHtml(
                            formatSignedMoney(
                                record.earnings
                            )
                        )}
                    </strong>

                </div>


                <div class="history-item__detail">

                    <span class="history-item__detail-label">
                        Energy at Start
                    </span>

                    <strong class="history-item__detail-value">
                        ${
                            record.energyAtStart === null
                                ? "—"
                                : `${record.energyAtStart}/${config.maxEnergy}`
                        }
                    </strong>

                </div>


                <div class="history-item__detail">

                    <span class="history-item__detail-label">
                        Full / Checked
                    </span>

                    <strong class="history-item__detail-value">
                        ${escapeHtml(
                            formatTime(
                                record.fullAt
                            )
                        )}
                        →
                        ${escapeHtml(
                            formatTime(
                                record.checkedAt
                            )
                        )}
                    </strong>

                </div>


                <div class="history-item__detail">

                    <span class="history-item__detail-label">
                        Overdue
                    </span>

                    <strong class="history-item__detail-value">
                        ${escapeHtml(
                            formatHumanDuration(
                                record.overdueSeconds
                            )
                        )}
                    </strong>

                </div>

            </div>

        </article>
    `;
}


/* =================================================================
   SETTINGS
   ================================================================= */

function updateSettingsUI() {

    dom.settingMaxEnergy.value =
        config.maxEnergy;


    dom.settingSecondsPerEnergy.value =
        config.secPerEnergy;


    /*
     * This field is retained for compatibility with
     * the existing HTML, but it is NOT used by the
     * tracking engine.
     */

    if (
        dom.settingVaultEnergyCost
    ) {

        dom.settingVaultEnergyCost.value =
            "";
    }


    dom.settingMinReward.value =
        config.minReward;


    dom.settingMaxReward.value =
        config.maxReward;


    dom.testModeButton.textContent =
        state.testMode
            ? "ON"
            : "OFF";


    dom.testModeButton.classList.toggle(
        "button--success",
        state.testMode
    );


    dom.testModeButton.classList.toggle(
        "button--secondary",
        !state.testMode
    );


    updateNotificationUI();
}


function applySettings() {

    /*
     * Capture actual current energy BEFORE changing
     * configuration.
     */

    recomputeState();


    const oldCurrentEnergy =
        state.currentEnergy;


    let maxEnergy =
        sanitizeInteger(
            dom.settingMaxEnergy.value,
            config.maxEnergy,
            1,
            9999
        );


    let secPerEnergy =
        sanitizeInteger(
            dom.settingSecondsPerEnergy.value,
            config.secPerEnergy,
            1,
            9999
        );


    let minReward =
        sanitizeNumber(
            dom.settingMinReward.value,
            config.minReward,
            0
        );


    let maxReward =
        sanitizeNumber(
            dom.settingMaxReward.value,
            config.maxReward,
            minReward
        );


    if (
        maxReward <
        minReward
    ) {

        maxReward =
            minReward;
    }


    config.maxEnergy =
        maxEnergy;


    config.secPerEnergy =
        secPerEnergy;


    config.minReward =
        minReward;


    config.maxReward =
        maxReward;


    /*
     * Never allow current energy above the new max.
     */

    state.currentEnergy =
        clamp(
            oldCurrentEnergy,
            0,
            config.maxEnergy
        );


    /*
     * If currently tracking, rebuild the timer
     * from the observed current energy.
     */

    if (
        state.trackingStartedAt !== null &&
        !state.waitingForCheck &&
        !state.waitingForNewEnergy
    ) {

        state.startingEnergy =
            state.currentEnergy;


        state.trackingStartedAt =
            now();


        const remaining =
            config.maxEnergy -
            state.currentEnergy;


        state.fullAt =
            now() +
            remaining *
            config.secPerEnergy *
            1000;
    }


    /*
     * If full, keep it full.
     */

    if (
        state.waitingForCheck
    ) {

        state.currentEnergy =
            config.maxEnergy;

        state.fullAt =
            now();
    }


    saveState();

    renderAll();
}


function toggleTestMode() {

    state.testMode =
        !state.testMode;


    if (
        state.testMode
    ) {

        config.maxEnergy =
            TEST_CONFIG.maxEnergy;


        config.secPerEnergy =
            TEST_CONFIG.secPerEnergy;

    } else {

        config = {
            ...DEFAULT_CONFIG
        };
    }


    /*
     * Test mode resets the ACTIVE timer.
     * History remains intact.
     */

    state.currentEnergy =
        0;

    state.startingEnergy =
        0;

    state.trackingStartedAt =
        null;

    state.fullAt =
        null;

    state.waitingForCheck =
        false;

    state.waitingForNewEnergy =
        false;

    state.notificationShownForCycle =
        false;


    saveState();

    renderAll();
}


/* =================================================================
   NOTIFICATIONS
   ================================================================= */

function updateNotificationUI() {

    if (
        !("Notification" in window)
    ) {

        dom.notificationPermissionButton.textContent =
            "Unsupported";

        dom.notificationPermissionButton.disabled =
            true;

        dom.notificationStatus.textContent =
            "Notifications are not supported.";

        return;
    }


    if (
        Notification.permission ===
        "granted"
    ) {

        state.notificationsEnabled =
            true;


        dom.notificationPermissionButton.textContent =
            "Enabled";


        dom.notificationPermissionButton.disabled =
            false;


        dom.notificationStatus.textContent =
            "Notifications are enabled.";

        return;
    }


    if (
        Notification.permission ===
        "denied"
    ) {

        state.notificationsEnabled =
            false;


        dom.notificationPermissionButton.textContent =
            "Blocked";


        dom.notificationPermissionButton.disabled =
            true;


        dom.notificationStatus.textContent =
            "Notifications are blocked by the browser.";

        return;
    }


    state.notificationsEnabled =
        false;


    dom.notificationPermissionButton.textContent =
        "Enable";


    dom.notificationPermissionButton.disabled =
        false;


    dom.notificationStatus.textContent =
        "Not enabled.";
}


async function requestNotificationPermission() {

    if (
        !("Notification" in window)
    ) {

        return;
    }


    try {

        const permission =
            await Notification
                .requestPermission();


        state.notificationsEnabled =
            permission ===
            "granted";


        saveState();

        updateNotificationUI();

    } catch (error) {

        console.error(
            "Notification permission error:",
            error
        );
    }
}


function maybeSendNotification() {

    if (
        !state.notificationsEnabled
    ) {

        return;
    }


    if (
        !("Notification" in window)
    ) {

        return;
    }


    if (
        Notification.permission !==
        "granted"
    ) {

        return;
    }


    try {

        new Notification(
            "🔋 Energy Full!",
            {
                body:
                    `Your energy reached ${config.maxEnergy}/${config.maxEnergy}.`,
                tag:
                    "vault-energy-full"
            }
        );

    } catch (error) {

        console.error(
            "Could not send notification:",
            error
        );
    }
}


/* =================================================================
   EXPORT / IMPORT
   ================================================================= */

function exportData() {

    const payload = {

        exportedAt:
            new Date()
                .toISOString(),

        version:
            APP_VERSION,

        config:
            {
                ...config
            },

        tracker: {

            currentEnergy:
                state.currentEnergy,

            startingEnergy:
                state.startingEnergy,

            trackingStartedAt:
                state.trackingStartedAt,

            fullAt:
                state.fullAt,

            waitingForCheck:
                state.waitingForCheck,

            waitingForNewEnergy:
                state.waitingForNewEnergy,

            testMode:
                state.testMode
        },

        history:
            state.history
    };


    const blob =
        new Blob(
            [
                JSON.stringify(
                    payload,
                    null,
                    2
                )
            ],
            {
                type:
                    "application/json"
            }
        );


    const url =
        URL.createObjectURL(
            blob
        );


    const link =
        document.createElement(
            "a"
        );


    link.href =
        url;


    link.download =
        `vault-energy-backup-${
            new Date()
                .toISOString()
                .slice(0, 10)
        }.json`;


    document.body.appendChild(
        link
    );


    link.click();

    link.remove();


    URL.revokeObjectURL(
        url
    );
}


function importData() {

    dom.importFileInput.click();
}


async function handleImportFile(
    event
) {

    const file =
        event.target.files?.[0];


    if (!file) {
        return;
    }


    try {

        const text =
            await file.text();


        const payload =
            JSON.parse(
                text
            );


        if (
            !payload ||
            typeof payload !==
                "object"
        ) {

            throw new Error(
                "Invalid backup."
            );
        }


        if (
            payload.config
        ) {

            config.maxEnergy =
                sanitizeInteger(
                    payload.config.maxEnergy,
                    DEFAULT_CONFIG.maxEnergy,
                    1,
                    9999
                );


            config.secPerEnergy =
                sanitizeInteger(
                    payload.config.secPerEnergy,
                    DEFAULT_CONFIG.secPerEnergy,
                    1,
                    9999
                );


            config.minReward =
                sanitizeNumber(
                    payload.config.minReward,
                    DEFAULT_CONFIG.minReward,
                    0
                );


            config.maxReward =
                sanitizeNumber(
                    payload.config.maxReward,
                    DEFAULT_CONFIG.maxReward,
                    config.minReward
                );
        }


        if (
            payload.tracker
        ) {

            const tracker =
                payload.tracker;


            state.currentEnergy =
                sanitizeInteger(
                    tracker.currentEnergy,
                    0,
                    0,
                    config.maxEnergy
                );


            state.startingEnergy =
                sanitizeInteger(
                    tracker.startingEnergy,
                    state.currentEnergy,
                    0,
                    config.maxEnergy
                );


            state.trackingStartedAt =
                isFiniteNumber(
                    tracker.trackingStartedAt
                )
                    ? tracker.trackingStartedAt
                    : null;


            state.fullAt =
                isFiniteNumber(
                    tracker.fullAt
                )
                    ? tracker.fullAt
                    : null;


            state.waitingForCheck =
                Boolean(
                    tracker.waitingForCheck
                );


            state.waitingForNewEnergy =
                Boolean(
                    tracker.waitingForNewEnergy
                );


            state.testMode =
                Boolean(
                    tracker.testMode
                );
        }


        if (
            Array.isArray(
                payload.history
            )
        ) {

            state.history =
                normalizeHistory(
                    payload.history
                );
        }


        state.notificationShownForCycle =
            false;


        saveState();

        renderAll();

        navigateTo(
            "dashboard"
        );


        alert(
            "Data imported successfully."
        );

    } catch (error) {

        console.error(
            "Import failed:",
            error
        );


        alert(
            "Could not import this backup file."
        );

    } finally {

        event.target.value =
            "";
    }
}


/* =================================================================
   CONFIRMATION
   ================================================================= */

function openConfirmation(
    message,
    action
) {

    dom.confirmationMessage.textContent =
        message;


    state.pendingConfirmationAction =
        action;


    state.currentModal =
        "confirmation";


    dom.confirmationModal.hidden =
        false;
}


function closeConfirmation() {

    dom.confirmationModal.hidden =
        true;


    state.pendingConfirmationAction =
        null;


    state.currentModal =
        null;
}


/* =================================================================
   DATA MANAGEMENT
   ================================================================= */

function clearHistory() {

    state.history =
        [];


    saveState();

    renderAll();
}


function resetApplication() {

    localStorage.removeItem(
        STORAGE_KEY
    );


    config = {
        ...DEFAULT_CONFIG
    };


    state.currentEnergy =
        0;

    state.startingEnergy =
        0;

    state.trackingStartedAt =
        null;

    state.fullAt =
        null;

    state.waitingForCheck =
        false;

    state.waitingForNewEnergy =
        false;

    state.history =
        [];

    state.testMode =
        false;

    state.notificationsEnabled =
        false;

    state.currentPage =
        "dashboard";

    state.analyticsPeriod =
        "today";

    state.historyDateFilter =
        "all";

    state.historyStatusFilter =
        "all";

    state.historySearch =
        "";

    state.notificationShownForCycle =
        false;


    dom.energyInput.value =
        "";

    dom.energyInput.placeholder =
        "Enter current energy";


    dom.latestResultCard.hidden =
        true;


    closeConfirmation();

    closeCheckResultModal();


    renderAll();

    navigateTo(
        "dashboard"
    );
}


/* =================================================================
   EVENT LISTENERS
   ================================================================= */


/* -------------------------------------------------------------
   Navigation
   ------------------------------------------------------------- */

dom.navButtons.forEach(
    button => {

        button.addEventListener(
            "click",
            () => {

                navigateTo(
                    button.dataset.page
                );
            }
        );
    }
);


/* -------------------------------------------------------------
   Settings
   ------------------------------------------------------------- */

dom.settingsButton.addEventListener(
    "click",
    () => {

        navigateTo(
            "settings"
        );
    }
);


/* -------------------------------------------------------------
   Start / next cycle
   ------------------------------------------------------------- */

dom.startTrackingButton.addEventListener(
    "click",
    handleEnergyInputSubmit
);


dom.energyInput.addEventListener(
    "keydown",
    event => {

        if (
            event.key ===
            "Enter"
        ) {

            event.preventDefault();

            handleEnergyInputSubmit();
        }
    }
);


dom.energyInput.addEventListener(
    "input",
    () => {

        dom.energyInputError.hidden =
            true;
    }
);


/* -------------------------------------------------------------
   Vault checking
   ------------------------------------------------------------- */

dom.checkVaultButton.addEventListener(
    "click",
    openCheckResultModal
);


/* -------------------------------------------------------------
   Check result modal
   ------------------------------------------------------------- */

dom.closeCheckResultModal.addEventListener(
    "click",
    closeCheckResultModal
);


dom.cancelCheckResultButton.addEventListener(
    "click",
    closeCheckResultModal
);


dom.modalBalanceBefore.addEventListener(
    "input",
    updateCheckModalPreview
);


dom.modalBalanceAfter.addEventListener(
    "input",
    updateCheckModalPreview
);


dom.saveCheckResultButton.addEventListener(
    "click",
    saveVaultCheck
);


/* -------------------------------------------------------------
   Analytics
   ------------------------------------------------------------- */

dom.periodButtons.forEach(
    button => {

        button.addEventListener(
            "click",
            () => {

                state.analyticsPeriod =
                    button.dataset.period;


                saveState();

                renderAnalytics();
            }
        );
    }
);


/* -------------------------------------------------------------
   History filters
   ------------------------------------------------------------- */

dom.historyDateFilter.addEventListener(
    "change",
    event => {

        state.historyDateFilter =
            event.target.value;


        saveState();

        renderHistory();
    }
);


dom.historyStatusFilter.addEventListener(
    "change",
    event => {

        state.historyStatusFilter =
            event.target.value;


        saveState();

        renderHistory();
    }
);


dom.historySearch.addEventListener(
    "input",
    event => {

        state.historySearch =
            event.target.value;


        renderHistory();
    }
);


/* -------------------------------------------------------------
   Settings
   ------------------------------------------------------------- */

dom.settingMaxEnergy.addEventListener(
    "change",
    applySettings
);


dom.settingSecondsPerEnergy.addEventListener(
    "change",
    applySettings
);


dom.settingMinReward.addEventListener(
    "change",
    applySettings
);


dom.settingMaxReward.addEventListener(
    "change",
    applySettings
);


/* -------------------------------------------------------------
   Notifications
   ------------------------------------------------------------- */

dom.notificationPermissionButton.addEventListener(
    "click",
    requestNotificationPermission
);


/* -------------------------------------------------------------
   Test mode
   ------------------------------------------------------------- */

dom.testModeButton.addEventListener(
    "click",
    () => {

        openConfirmation(
            state.testMode
                ? "Turn test mode off?"
                : "Turn test mode on? The active recharge will be reset.",
            toggleTestMode
        );
    }
);


/* -------------------------------------------------------------
   Data
   ------------------------------------------------------------- */

dom.exportDataButton.addEventListener(
    "click",
    exportData
);


dom.importDataButton.addEventListener(
    "click",
    importData
);


dom.importFileInput.addEventListener(
    "change",
    handleImportFile
);


dom.clearHistoryButton.addEventListener(
    "click",
    () => {

        if (
            state.history.length === 0
        ) {

            return;
        }


        openConfirmation(
            "Delete all vault history? This cannot be undone.",
            clearHistory
        );
    }
);


dom.resetApplicationButton.addEventListener(
    "click",
    () => {

        openConfirmation(
            "Reset the entire tracker and delete all saved data?",
            resetApplication
        );
    }
);


/* -------------------------------------------------------------
   Confirmation modal
   ------------------------------------------------------------- */

dom.cancelConfirmationButton.addEventListener(
    "click",
    closeConfirmation
);


dom.confirmActionButton.addEventListener(
    "click",
    () => {

        const action =
            state.pendingConfirmationAction;


        closeConfirmation();


        if (
            typeof action ===
            "function"
        ) {

            action();
        }
    }
);


/* -------------------------------------------------------------
   Modal backdrop
   ------------------------------------------------------------- */

dom.checkResultModal
    .querySelector(
        ".modal__backdrop"
    )
    ?.addEventListener(
        "click",
        closeCheckResultModal
    );


dom.confirmationModal
    .querySelector(
        ".modal__backdrop"
    )
    ?.addEventListener(
        "click",
        closeConfirmation
    );


/* -------------------------------------------------------------
   Escape
   ------------------------------------------------------------- */

document.addEventListener(
    "keydown",
    event => {

        if (
            event.key !==
            "Escape"
        ) {

            return;
        }


        if (
            state.currentModal ===
            "check-result"
        ) {

            closeCheckResultModal();

        } else if (
            state.currentModal ===
            "confirmation"
        ) {

            closeConfirmation();
        }
    }
);


/* =================================================================
   TIMER
   ================================================================= */

let timer = null;

let lastSecond = null;


function startTimer() {

    if (
        timer !== null
    ) {

        clearInterval(
            timer
        );
    }


    timer =
        setInterval(
            () => {

                const currentSecond =
                    Math.floor(
                        Date.now() /
                        1000
                    );


                if (
                    currentSecond ===
                    lastSecond
                ) {

                    return;
                }


                lastSecond =
                    currentSecond;


                const wasWaiting =
                    state.waitingForCheck;


                recomputeState();


                if (
                    !wasWaiting &&
                    state.waitingForCheck
                ) {

                    saveState();
                }


                renderDashboard();


                if (
                    state.currentPage ===
                    "analytics"
                ) {

                    renderAnalytics();
                }


                if (
                    state.currentPage ===
                    "history"
                ) {

                    renderHistory();
                }

            },
            250
        );
}


/* =================================================================
   PAGE VISIBILITY
   ================================================================= */

document.addEventListener(
    "visibilitychange",
    () => {

        if (
            !document.hidden
        ) {

            recomputeState();

            renderAll();
        }
    }
);


window.addEventListener(
    "pageshow",
    () => {

        recomputeState();

        renderAll();
    }
);


/* =================================================================
   INITIALIZATION
   ================================================================= */

function initialize() {

    loadState();


    recomputeState();


    /*
     * If the app was closed while charging and the
     * timestamp has passed, restore FULL.
     */

    if (
        !state.waitingForNewEnergy &&
        state.fullAt !== null &&
        now() >= state.fullAt
    ) {

        state.currentEnergy =
            config.maxEnergy;

        state.waitingForCheck =
            true;
    }


    /*
     * Repair impossible state.
     */

    if (
        state.waitingForCheck &&
        state.fullAt === null
    ) {

        state.waitingForCheck =
            false;
    }


    if (
        state.waitingForNewEnergy
    ) {

        state.currentEnergy =
            0;
    }


    saveState();

    renderAll();

    navigateTo(
        state.currentPage
    );

    startTimer();


    console.log(
        "🔋 Vault Energy Tracker initialized."
    );

    console.log(
        "Config:",
        config
    );

    console.log(
        "State:",
        state
    );
}


/* =================================================================
   START
   ================================================================= */

initialize();


/* =================================================================
   DEBUG API
   ================================================================= */

window.VaultTracker = {

    state,

    config,

    startTracking,

    recomputeState,

    renderAll,

    saveState,

    openCheckResultModal,

    saveVaultCheck,

    prepareForNextEnergyEntry,

    navigateTo
};
