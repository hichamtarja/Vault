"use strict";


/* =====================================================================
   VAULT ENERGY TRACKER
   Application controller
   ===================================================================== */


/* =====================================================================
   CONSTANTS
   ===================================================================== */

const STORAGE_KEY = "vaultEnergyTracker";

const APP_VERSION = 3;

const DEFAULT_CONFIG = {
    maxEnergy: 250,
    secPerEnergy: 30,
    vaultEnergyCost: 20,
    minReward: 9000,
    maxReward: 16000
};

const TEST_CONFIG = {
    maxEnergy: 10,
    secPerEnergy: 5
};


/* =====================================================================
   APPLICATION STATE
   ===================================================================== */

const state = {

    /* Current energy system */

    currentEnergy: 0,

    startingEnergy: 0,

    trackingStartedAt: null,

    fullAt: null,

    waitingForCheck: false,


    /* History */

    history: [],


    /* Settings / runtime */

    testMode: false,

    notificationsEnabled: false,


    /* UI */

    currentPage: "dashboard",

    analyticsPeriod: "today",

    historyDateFilter: "all",

    historyStatusFilter: "all",

    historySearch: "",


    /* Modal */

    currentModal: null,

    pendingConfirmationAction: null,


    /* Internal runtime flags */

    notificationShownForCycle: false,

    initialized: false
};


/* =====================================================================
   CONFIGURATION
   ===================================================================== */

let config = {
    ...DEFAULT_CONFIG
};


/* =====================================================================
   DOM HELPERS
   ===================================================================== */

const $ = (selector) =>
    document.querySelector(selector);

const $$ = (selector) =>
    [...document.querySelectorAll(selector)];


/* =====================================================================
   DOM REFERENCES
   ===================================================================== */

const dom = {

    /* Navigation */

    navButtons:
        $$(".nav-button"),

    pages:
        $$("[data-page-content]"),


    /* Header */

    settingsButton:
        $("#settingsButton"),


    /* Dashboard */

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

    trackerCard:
        $("#trackerCard"),

    energyCard:
        document.querySelector(".energy-card"),


    /* Analytics */

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


    /* History */

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


    /* Settings */

    settingsPanel:
        $("#page-settings"),

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


    /* Check result modal */

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


    /* Confirmation modal */

    confirmationModal:
        $("#confirmationModal"),

    confirmationMessage:
        $("#confirmationMessage"),

    cancelConfirmationButton:
        $("#cancelConfirmationButton"),

    confirmActionButton:
        $("#confirmActionButton")
};


/* =====================================================================
   GENERAL UTILITIES
   ===================================================================== */

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

    return String(value)
        .padStart(2, "0");
}


function now() {

    return Date.now();
}


function formatMoney(value) {

    const number = Number(value);

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

    const number = Number(value);

    if (!Number.isFinite(number)) {
        return "$0";
    }

    const absolute =
        Math.abs(number);

    const formatted =
        new Intl.NumberFormat(
            undefined,
            {
                style: "currency",
                currency: "USD",
                maximumFractionDigits: 2
            }
        ).format(absolute);

    if (number > 0) {
        return `+${formatted}`;
    }

    if (number < 0) {
        return `-${formatted}`;
    }

    return "$0";
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
        Math.floor(seconds / 3600);

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


function formatHumanDuration(totalSeconds) {

    if (
        !Number.isFinite(totalSeconds) ||
        totalSeconds <= 0
    ) {
        return "0s";
    }


    const seconds =
        Math.round(totalSeconds);


    const hours =
        Math.floor(seconds / 3600);

    const minutes =
        Math.floor(
            (seconds % 3600) / 60
        );

    const remainingSeconds =
        seconds % 60;


    const parts = [];


    if (hours > 0) {
        parts.push(`${hours}h`);
    }

    if (minutes > 0) {
        parts.push(`${minutes}m`);
    }

    if (
        remainingSeconds > 0 &&
        hours === 0
    ) {
        parts.push(`${remainingSeconds}s`);
    }


    return parts.join(" ");
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


function formatTimeWithSeconds(timestamp) {

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


function getStartOfDay(timestamp = now()) {

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


function getDaysAgoStart(days) {

    const date =
        new Date();

    date.setHours(
        0,
        0,
        0,
        0
    );

    date.setDate(
        date.getDate() - days
    );

    return date.getTime();
}


function escapeHtml(value) {

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


/* =====================================================================
   CALCULATIONS
   ===================================================================== */

function getFullRechargeSeconds() {

    return (
        config.maxEnergy *
        config.secPerEnergy
    );
}


function getRemainingEnergy() {

    return Math.max(
        0,
        config.maxEnergy -
        state.currentEnergy
    );
}


function getPossibleVaults(energy = config.maxEnergy) {

    if (
        !Number.isFinite(
            config.vaultEnergyCost
        ) ||
        config.vaultEnergyCost <= 0
    ) {
        return 0;
    }

    return Math.floor(
        energy /
        config.vaultEnergyCost
    );
}


function getCurrentRechargeEnergy() {

    if (
        state.fullAt === null ||
        state.trackingStartedAt === null
    ) {
        return state.currentEnergy;
    }


    if (state.waitingForCheck) {
        return config.maxEnergy;
    }


    if (now() >= state.fullAt) {
        return config.maxEnergy;
    }


    const elapsedSeconds =
        Math.max(
            0,
            (
                now() -
                state.trackingStartedAt
            ) / 1000
        );


    const gained =
        Math.floor(
            elapsedSeconds /
            config.secPerEnergy
        );


    return clamp(
        state.startingEnergy +
        gained,
        0,
        config.maxEnergy
    );
}


/* =====================================================================
   STATE PERSISTENCE
   ===================================================================== */

function saveState() {

    try {

        const payload = {

            version:
                APP_VERSION,

            config:
                { ...config },

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

                history:
                    state.history,

                testMode:
                    state.testMode,

                notificationsEnabled:
                    state.notificationsEnabled

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


        /* -------------------------------------------------------------
           Configuration
           ------------------------------------------------------------- */

        if (payload.config) {

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

            config.vaultEnergyCost =
                sanitizeInteger(
                    payload.config.vaultEnergyCost,
                    DEFAULT_CONFIG.vaultEnergyCost,
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


        /* -------------------------------------------------------------
           State
           ------------------------------------------------------------- */

        const saved =
            payload.state || {};


        state.currentEnergy =
            clamp(
                sanitizeInteger(
                    saved.currentEnergy,
                    0,
                    0,
                    config.maxEnergy
                ),
                0,
                config.maxEnergy
            );


        state.startingEnergy =
            clamp(
                sanitizeInteger(
                    saved.startingEnergy,
                    state.currentEnergy,
                    0,
                    config.maxEnergy
                ),
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


        return true;

    } catch (error) {

        console.error(
            "Failed to load state:",
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


function normalizeHistory(history) {

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

            const balanceBefore =
                Number(
                    record.balanceBefore
                );


            const balanceAfter =
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
                            balanceBefore
                        ) &&
                        Number.isFinite(
                            balanceAfter
                        )
                    )
                        ? balanceAfter -
                          balanceBefore
                        : 0;
            }


            return {

                id:
                    record.id ??
                    cryptoRandomId(),

                fullAt:
                    record.fullAt,

                checkedAt:
                    record.checkedAt,

                overdueSeconds:
                    Math.max(
                        0,
                        Number(
                            record.overdueSeconds
                        ) || 0
                    ),

                balanceBefore:
                    Number.isFinite(
                        balanceBefore
                    )
                        ? balanceBefore
                        : 0,

                balanceAfter:
                    Number.isFinite(
                        balanceAfter
                    )
                        ? balanceAfter
                        : 0,

                earnings,

                energyAtStart:
                    Number.isFinite(
                        record.energyAtStart
                    )
                        ? record.energyAtStart
                        : null,

                energyCost:
                    Number.isFinite(
                        record.energyCost
                    )
                        ? record.energyCost
                        : config.vaultEnergyCost
            };
        });
}


function cryptoRandomId() {

    if (
        globalThis.crypto &&
        typeof crypto.randomUUID ===
            "function"
    ) {
        return crypto.randomUUID();
    }


    return (
        Date.now()
            .toString(36) +
        "-" +
        Math.random()
            .toString(36)
            .slice(2)
    );
}


/* =====================================================================
   CORE ENERGY STATE
   ===================================================================== */

function recomputeState() {

    if (
        state.fullAt === null ||
        state.trackingStartedAt === null
    ) {
        return;
    }


    const currentTime =
        now();


    if (
        currentTime >= state.fullAt
    ) {

        state.currentEnergy =
            config.maxEnergy;

        state.waitingForCheck =
            true;

        return;
    }


    state.currentEnergy =
        getCurrentRechargeEnergy();

    state.waitingForCheck =
        false;
}


function startTracking(energy) {

    const safeEnergy =
        clamp(
            Math.floor(energy),
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


    state.fullAt =
        currentTime +
        (
            (
                config.maxEnergy -
                safeEnergy
            ) *
            config.secPerEnergy *
            1000
        );


    if (
        safeEnergy >=
        config.maxEnergy
    ) {

        state.currentEnergy =
            config.maxEnergy;

        state.fullAt =
            currentTime;

        state.waitingForCheck =
            true;

    } else {

        state.waitingForCheck =
            false;
    }


    state.notificationShownForCycle =
        false;


    saveState();

    renderDashboard();
}


function beginNextRecharge() {

    const currentTime =
        now();


    state.currentEnergy =
        0;

    state.startingEnergy =
        0;

    state.trackingStartedAt =
        currentTime;

    state.fullAt =
        currentTime +
        (
            getFullRechargeSeconds() *
            1000
        );

    state.waitingForCheck =
        false;

    state.notificationShownForCycle =
        false;


    saveState();

    renderDashboard();
}


/* =====================================================================
   CHECK WORKFLOW
   ===================================================================== */

function openCheckResultModal() {

    if (!state.waitingForCheck) {
        return;
    }


    const latestBefore =
        getMostRecentBalance();


    dom.modalBalanceBefore.value =
        latestBefore !== null
            ? latestBefore
            : "";


    dom.modalBalanceAfter.value =
        "";


    updateCheckModalPreview();


    dom.checkResultModal.hidden =
        false;


    state.currentModal =
        "check-result";


    setTimeout(() => {

        dom.modalBalanceAfter.focus();

    }, 50);
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


    if (earnings > 0) {

        dom.modalEarningsPreview
            .style.color =
            "var(--success)";

    } else if (earnings < 0) {

        dom.modalEarningsPreview
            .style.color =
            "var(--danger)";

    } else {

        dom.modalEarningsPreview
            .style.color =
            "var(--text-secondary)";
    }
}


function saveVaultCheck() {

    if (!state.waitingForCheck) {
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


    const record = {

        id:
            cryptoRandomId(),

        fullAt:
            fullTimestamp,

        checkedAt,

        overdueSeconds,

        balanceBefore,

        balanceAfter,

        earnings,

        energyAtStart:
            state.startingEnergy,

        energyCost:
            config.vaultEnergyCost
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


    beginNextRecharge();


    saveState();

    renderAll();
}


function showLatestResult(record) {

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
}


/* =====================================================================
   NAVIGATION
   ===================================================================== */

function navigateTo(page) {

    const validPages = [
        "dashboard",
        "analytics",
        "history",
        "settings"
    ];


    if (
        !validPages.includes(page)
    ) {
        page = "dashboard";
    }


    state.currentPage =
        page;


    dom.pages.forEach(
        pageElement => {

            const isCurrent =
                pageElement.dataset.pageContent ===
                page;


            pageElement.hidden =
                !isCurrent;

            pageElement.classList.toggle(
                "is-active",
                isCurrent
            );
        }
    );


    dom.navButtons.forEach(
        button => {

            const isCurrent =
                button.dataset.page ===
                page;


            button.classList.toggle(
                "is-active",
                isCurrent
            );
        }
    );


    if (page === "settings") {
        updateSettingsUI();
    }

    if (page === "analytics") {
        renderAnalytics();
    }

    if (page === "history") {
        renderHistory();
    }


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


/* =====================================================================
   DASHBOARD RENDERING
   ===================================================================== */

function renderDashboard() {

    recomputeState();


    const current =
        state.currentEnergy;

    const max =
        config.maxEnergy;


    /* -------------------------------------------------------------
       Energy
       ------------------------------------------------------------- */

    dom.dashboardCurrentEnergy.textContent =
        current;

    dom.dashboardMaxEnergy.textContent =
        max;


    dom.energyInput.max =
        max;

    dom.energyInputSuffix.textContent =
        `/ ${max}`;


    /* -------------------------------------------------------------
       Progress
       ------------------------------------------------------------- */

    const percentage =
        max > 0
            ? (current / max) * 100
            : 0;


    const safePercentage =
        clamp(
            percentage,
            0,
            100
        );


    dom.energyProgressBar.style.width =
        `${safePercentage}%`;


    dom.energyProgressPercentage.textContent =
        `${Math.round(safePercentage)}%`;


    dom.energyProgressMax.textContent =
        max;


    /* -------------------------------------------------------------
       Accessibility
       ------------------------------------------------------------- */

    dom.energyProgressBar
        .setAttribute(
            "aria-valuenow",
            String(current)
        );


    /* -------------------------------------------------------------
       Current state
       ------------------------------------------------------------- */

    if (
        state.waitingForCheck
    ) {

        renderFullState();

    } else if (
        state.fullAt !== null &&
        state.fullAt > now()
    ) {

        renderChargingState();

    } else {

        renderIdleState();
    }


    /* -------------------------------------------------------------
       Info
       ------------------------------------------------------------- */

    renderRechargeInfo();


    /* -------------------------------------------------------------
       Today's statistics
       ------------------------------------------------------------- */

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


function renderChargingState() {

    const remainingSeconds =
        Math.max(
            0,
            (
                state.fullAt -
                now()
            ) / 1000
        );


    const progress =
        config.maxEnergy > 0
            ? (
                state.currentEnergy /
                config.maxEnergy
            ) * 100
            : 0;


    dom.energyStateBadge.textContent =
        "Recharging";

    dom.energyStateBadge.className =
        "status-badge status-badge--counting";


    dom.energyStatusText.textContent =
        "⏳ Energy is recharging.";


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


    dom.energyProgressBar.style.width =
        `${clamp(
            progress,
            0,
            100
        )}%`;
}


function renderFullState() {

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

    dom.startingEnergy.textContent =
        state.trackingStartedAt !== null
            ? `${state.startingEnergy} / ${config.maxEnergy}`
            : "—";


    dom.remainingEnergy.textContent =
        state.trackingStartedAt !== null
            ? `${getRemainingEnergy()} ⚡`
            : "—";


    dom.rechargeRate.textContent =
        `${config.secPerEnergy}s / energy`;


    dom.fullRechargeDuration.textContent =
        formatHumanDuration(
            getFullRechargeSeconds()
        );


    dom.vaultEnergyCost.textContent =
        `${config.vaultEnergyCost} ⚡`;


    dom.vaultsPossible.textContent =
        getPossibleVaults();
}


function renderTodayStats() {

    const todayRecords =
        getRecordsForPeriod(
            "today"
        );


    const checks =
        todayRecords.length;


    const overdue =
        todayRecords.filter(
            record =>
                record.overdueSeconds > 1
        ).length;


    const totalEarnings =
        sum(
            todayRecords,
            record =>
                record.earnings
        );


    const totalLate =
        sum(
            todayRecords,
            record =>
                record.overdueSeconds
        );


    const averageReward =
        checks > 0
            ? totalEarnings / checks
            : 0;


    dom.todayChecks.textContent =
        checks;

    dom.todayVaults.textContent =
        checks;

    dom.todayEarnings.textContent =
        formatMoney(
            totalEarnings
        );

    dom.todayOverdue.textContent =
        overdue;

    dom.todayLateTime.textContent =
        formatHumanDuration(
            totalLate
        );

    dom.todayAverageReward.textContent =
        formatMoney(
            averageReward
        );
}


function sum(array, selector) {

    return array.reduce(
        (
            total,
            item
        ) =>
            total +
            (
                Number(
                    selector(item)
                ) || 0
            ),
        0
    );
}


/* =====================================================================
   ANALYTICS
   ===================================================================== */

function getRecordsForPeriod(period) {

    const currentTime =
        now();


    let startTime;


    switch (period) {

        case "today":

            startTime =
                getStartOfDay(
                    currentTime
                );

            break;


        case "7days":

            startTime =
                getDaysAgoStart(
                    6
                );

            break;


        case "30days":

            startTime =
                getDaysAgoStart(
                    29
                );

            break;


        case "all":

            return [
                ...state.history
            ];

        default:

            startTime =
                getStartOfDay(
                    currentTime
                );
    }


    return state.history.filter(
        record =>
            record.checkedAt >=
            startTime
    );
}


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


    const averageReward =
        checks > 0
            ? earnings / checks
            : 0;


    const rewards =
        records
            .map(
                record =>
                    Number(
                        record.earnings
                    ) || 0
            );


    const highestReward =
        rewards.length > 0
            ? Math.max(...rewards)
            : 0;


    const lowestReward =
        rewards.length > 0
            ? Math.min(...rewards)
            : 0;


    const overdueRecords =
        records.filter(
            record =>
                record.overdueSeconds > 1
        );


    const onTime =
        checks -
        overdueRecords.length;


    const totalLate =
        sum(
            records,
            record =>
                record.overdueSeconds
        );


    const averageLate =
        overdueRecords.length > 0
            ? totalLate /
              overdueRecords.length
            : 0;


    dom.analyticsTotalEarnings.textContent =
        formatMoney(
            earnings
        );


    dom.analyticsAverageReward.textContent =
        formatMoney(
            averageReward
        );


    dom.analyticsHighestReward.textContent =
        formatSignedMoney(
            highestReward
        );


    dom.analyticsLowestReward.textContent =
        formatSignedMoney(
            lowestReward
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
            totalLate
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


/* =====================================================================
   ANALYTICS CALCULATIONS
   ===================================================================== */

function calculateBestOnTimeStreak(
    records
) {

    if (records.length === 0) {
        return 0;
    }


    const sorted =
        [...records]
            .sort(
                (a, b) =>
                    a.checkedAt -
                    b.checkedAt
            );


    let current = 0;

    let best = 0;


    for (const record of sorted) {

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

    const uniqueDays =
        new Set();


    for (const record of records) {

        uniqueDays.add(
            getStartOfDay(
                record.checkedAt
            )
        );
    }


    return uniqueDays.size;
}


/* =====================================================================
   ANALYTICS CHARTS
   ===================================================================== */

function groupRecordsByDay(
    records
) {

    const map = new Map();


    for (const record of records) {

        const day =
            getStartOfDay(
                record.checkedAt
            );


        if (!map.has(day)) {

            map.set(
                day,
                {
                    date: day,
                    earnings: 0,
                    vaults: 0,
                    overdue: 0,
                    lateSeconds: 0
                }
            );
        }


        const item =
            map.get(day);


        item.earnings +=
            Number(
                record.earnings
            ) || 0;

        item.vaults++;

        if (
            record.overdueSeconds > 1
        ) {
            item.overdue++;
        }

        item.lateSeconds +=
            Number(
                record.overdueSeconds
            ) || 0;
    }


    return [...map.values()]
        .sort(
            (a, b) =>
                a.date - b.date
        );
}


function renderAnalyticsCharts(
    records
) {

    const days =
        groupRecordsByDay(
            records
        );


    renderSimpleChart(
        dom.earningsChart,
        days,
        item =>
            item.earnings,
        item =>
            formatMoney(item.earnings),
        "Earnings"
    );


    renderSimpleChart(
        dom.vaultChart,
        days,
        item =>
            item.vaults,
        item =>
            String(item.vaults),
        "Vaults"
    );


    renderSimpleChart(
        dom.overdueChart,
        days,
        item =>
            item.lateSeconds,
        item =>
            formatHumanDuration(
                item.lateSeconds
            ),
        "Late"
    );
}


function renderSimpleChart(
    container,
    data,
    valueSelector,
    valueFormatter,
    label
) {

    if (!container) {
        return;
    }


    if (data.length === 0) {

        container.innerHTML =
            `
                <div
                    style="
                        display:flex;
                        align-items:center;
                        justify-content:center;
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


    const values =
        data.map(
            valueSelector
        );


    const maximum =
        Math.max(
            ...values,
            1
        );


    const items =
        data
            .slice(-14)
            .map(item => {

                const value =
                    valueSelector(
                        item
                    );


                const percentage =
                    (
                        value /
                        maximum
                    ) *
                    100;


                return `
                    <div
                        style="
                            flex:1;
                            min-width:16px;
                            display:flex;
                            flex-direction:column;
                            justify-content:flex-end;
                            align-items:center;
                            gap:5px;
                            height:145px;
                        "
                        title="${escapeHtml(
                            formatDateLong(
                                item.date
                            )
                        )}: ${escapeHtml(
                            valueFormatter(item)
                        )}"
                    >

                        <span
                            style="
                                color:var(--text-muted);
                                font-size:.55rem;
                                white-space:nowrap;
                            "
                        >
                            ${escapeHtml(
                                valueFormatter(item)
                            )}
                        </span>

                        <div
                            style="
                                width:100%;
                                max-width:27px;
                                min-height:2px;
                                height:${Math.max(
                                    4,
                                    percentage * 0.95
                                )}px;
                                border-radius:6px 6px 3px 3px;
                                background:linear-gradient(
                                    to top,
                                    var(--accent-dark),
                                    var(--accent)
                                );
                            "
                        ></div>

                        <span
                            style="
                                color:var(--text-muted);
                                font-size:.52rem;
                                white-space:nowrap;
                            "
                        >
                            ${escapeHtml(
                                new Date(
                                    item.date
                                ).toLocaleDateString(
                                    [],
                                    {
                                        month: "short",
                                        day: "numeric"
                                    }
                                )
                            )}
                        </span>

                    </div>
                `;
            })
            .join("");


    container.innerHTML =
        `
            <div
                style="
                    width:100%;
                    display:flex;
                    align-items:flex-end;
                    gap:5px;
                    padding:5px 3px 3px;
                    overflow-x:auto;
                "
                aria-label="${label} chart"
            >
                ${items}
            </div>
        `;
}


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
            ) * 100
            : 0;


    dom.checkEfficiency.textContent =
        `${Math.round(
            efficiency
        )}%`;


    dom.checkEfficiencyBar.style.width =
        `${efficiency}%`;


    /*
     * The theoretical capacity metric:
     *
     * Every completed check represents one full recharge.
     * We compare actual number of checks against the maximum number
     * of full recharge cycles that can theoretically fit into the
     * selected period.
     *
     * This is deliberately an estimate rather than a claim about
     * actual game limits.
     */

    const estimatedCycles =
        calculateTheoreticalCycles(
            state.analyticsPeriod
        );


    const capacity =
        estimatedCycles > 0
            ? Math.min(
                100,
                (
                    checks /
                    estimatedCycles
                ) * 100
            )
            : 0;


    dom.vaultCapacityEfficiency.textContent =
        `${Math.round(
            capacity
        )}%`;


    dom.vaultCapacityEfficiencyBar.style.width =
        `${capacity}%`;
}


function calculateTheoreticalCycles(
    period
) {

    const fullRecharge =
        getFullRechargeSeconds();


    if (
        !Number.isFinite(
            fullRecharge
        ) ||
        fullRecharge <= 0
    ) {
        return 0;
    }


    let seconds;


    switch (period) {

        case "today":
            seconds = 86400;
            break;

        case "7days":
            seconds = 86400 * 7;
            break;

        case "30days":
            seconds = 86400 * 30;
            break;

        case "all":

            if (
                state.history.length === 0
            ) {
                return 0;
            }


            const earliest =
                Math.min(
                    ...state.history.map(
                        record =>
                            record.checkedAt
                    )
                );


            seconds =
                Math.max(
                    86400,
                    now() -
                    getStartOfDay(
                        earliest
                    )
                );

            break;

        default:
            seconds = 86400;
    }


    return Math.floor(
        seconds /
        fullRecharge
    );
}


/* =====================================================================
   HISTORY
   ===================================================================== */

function getFilteredHistory() {

    let records =
        [...state.history];


    /* -------------------------------------------------------------
       Date filter
       ------------------------------------------------------------- */

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


    /* -------------------------------------------------------------
       Status filter
       ------------------------------------------------------------- */

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


    /* -------------------------------------------------------------
       Search
       ------------------------------------------------------------- */

    const search =
        state.historySearch
            .trim()
            .toLowerCase();


    if (search) {

        records =
            records.filter(
                record => {

                    const searchable =
                        [
                            formatDate(
                                record.checkedAt
                            ),

                            formatDate(
                                record.fullAt
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
                                record.earnings
                            )
                        ]
                        .join(" ")
                        .toLowerCase();


                    return searchable
                        .includes(search);
                }
            );
    }


    return records
        .sort(
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
                        Change your filters or complete a vault check.
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


    const earningsClass =
        record.earnings > 0
            ? "text-success"
            : record.earnings < 0
                ? "text-danger"
                : "text-muted";


    const statusClass =
        overdue
            ? "history-item__status--overdue"
            : "history-item__status--on-time";


    const statusText =
        overdue
            ? `⚠ ${formatHumanDuration(
                record.overdueSeconds
            )} late`
            : "✓ On time";


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
                    ${statusText}
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

            </div>

        </article>
    `;
}


/* =====================================================================
   SETTINGS
   ===================================================================== */

function updateSettingsUI() {

    dom.settingMaxEnergy.value =
        config.maxEnergy;


    dom.settingSecondsPerEnergy.value =
        config.secPerEnergy;


    dom.settingVaultEnergyCost.value =
        config.vaultEnergyCost;


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


function updateNotificationUI() {

    if (
        !("Notification" in window)
    ) {

        dom.notificationPermissionButton.textContent =
            "Unsupported";

        dom.notificationPermissionButton.disabled =
            true;

        dom.notificationStatus.textContent =
            "This browser does not support notifications.";

        return;
    }


    const permission =
        Notification.permission;


    if (
        permission === "granted"
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
        permission === "denied"
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


function applySettings() {

    recomputeState();


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


    let vaultEnergyCost =
        sanitizeInteger(
            dom.settingVaultEnergyCost.value,
            config.vaultEnergyCost,
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
        maxReward < minReward
    ) {

        maxReward =
            minReward;
    }


    const currentEnergy =
        clamp(
            state.currentEnergy,
            0,
            maxEnergy
        );


    config.maxEnergy =
        maxEnergy;

    config.secPerEnergy =
        secPerEnergy;

    config.vaultEnergyCost =
        vaultEnergyCost;

    config.minReward =
        minReward;

    config.maxReward =
        maxReward;


    state.currentEnergy =
        currentEnergy;


    if (
        state.waitingForCheck
    ) {

        state.currentEnergy =
            config.maxEnergy;

        state.startingEnergy =
            config.maxEnergy;

        state.trackingStartedAt =
            now();

        state.fullAt =
            now();
    }

    else if (
        state.fullAt !== null &&
        state.trackingStartedAt !== null
    ) {

        /*
         * Preserve current displayed energy,
         * then rebuild the remaining recharge
         * using the new settings.
         */

        state.startingEnergy =
            state.currentEnergy;

        state.trackingStartedAt =
            now();

        const remaining =
            config.maxEnergy -
            state.currentEnergy;


        state.fullAt =
            now() +
            (
                remaining *
                config.secPerEnergy *
                1000
            );
    }


    saveState();

    renderAll();
}


function toggleTestMode() {

    state.testMode =
        !state.testMode;


    /*
     * Test mode deliberately resets the active
     * recharge so that a normal 250-energy timer
     * cannot accidentally turn into a 10-energy
     * timer with inconsistent timestamps.
     */

    if (state.testMode) {

        config.maxEnergy =
            TEST_CONFIG.maxEnergy;

        config.secPerEnergy =
            TEST_CONFIG.secPerEnergy;

    } else {

        config.maxEnergy =
            DEFAULT_CONFIG.maxEnergy;

        config.secPerEnergy =
            DEFAULT_CONFIG.secPerEnergy;

        config.vaultEnergyCost =
            DEFAULT_CONFIG.vaultEnergyCost;

        config.minReward =
            DEFAULT_CONFIG.minReward;

        config.maxReward =
            DEFAULT_CONFIG.maxReward;
    }


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

    state.notificationShownForCycle =
        false;


    saveState();

    updateSettingsUI();

    renderAll();
}


/* =====================================================================
   NOTIFICATIONS
   ===================================================================== */

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


        if (
            permission ===
            "granted"
        ) {

            state.notificationsEnabled =
                true;

            saveState();
        }


        updateNotificationUI();

    } catch (error) {

        console.error(
            "Notification permission failed:",
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
            "Could not show notification:",
            error
        );
    }
}


/* =====================================================================
   EXPORT / IMPORT
   ===================================================================== */

function exportData() {

    const payload = {

        exportedAt:
            new Date().toISOString(),

        version:
            APP_VERSION,

        config:
            { ...config },

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


    const anchor =
        document.createElement(
            "a"
        );


    anchor.href =
        url;

    anchor.download =
        `vault-energy-backup-${
            new Date()
                .toISOString()
                .slice(0, 10)
        }.json`;


    document.body.appendChild(
        anchor
    );


    anchor.click();

    anchor.remove();


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
            JSON.parse(text);


        if (
            !payload ||
            typeof payload !==
                "object"
        ) {

            throw new Error(
                "Invalid file."
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

            config.vaultEnergyCost =
                sanitizeInteger(
                    payload.config.vaultEnergyCost,
                    DEFAULT_CONFIG.vaultEnergyCost,
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
                clamp(
                    sanitizeInteger(
                        tracker.currentEnergy,
                        0,
                        0,
                        config.maxEnergy
                    ),
                    0,
                    config.maxEnergy
                );


            state.startingEnergy =
                clamp(
                    sanitizeInteger(
                        tracker.startingEnergy,
                        state.currentEnergy,
                        0,
                        config.maxEnergy
                    ),
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
            "Could not import this file."
        );

    } finally {

        event.target.value =
            "";
    }
}


/* =====================================================================
   CONFIRMATION MODAL
   ===================================================================== */

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


/* =====================================================================
   DATA OPERATIONS
   ===================================================================== */

function clearHistory() {

    state.history = [];

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


    renderAll();

    navigateTo(
        "dashboard"
    );
}


/* =====================================================================
   MODAL / PAGE CLICK HANDLING
   ===================================================================== */

function handleModalBackdropClick(
    event
) {

    if (
        event.target.classList.contains(
            "modal__backdrop"
        )
    ) {

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
}


/* =====================================================================
   EVENT LISTENERS
   ===================================================================== */


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
   Header settings button
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
   Start tracking
   ------------------------------------------------------------- */

dom.startTrackingButton.addEventListener(
    "click",
    () => {

        const raw =
            dom.energyInput.value
                .trim();


        if (raw === "") {

            dom.energyInputError.hidden =
                false;

            dom.energyInputError.textContent =
                "Enter your current energy.";

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


        startTracking(
            value
        );


        dom.energyInput.value =
            "";
    }
);


/* -------------------------------------------------------------
   Enter key
   ------------------------------------------------------------- */

dom.energyInput.addEventListener(
    "keydown",
    event => {

        if (
            event.key ===
            "Enter"
        ) {

            event.preventDefault();

            dom.startTrackingButton.click();
        }
    }
);


/* -------------------------------------------------------------
   Input validation
   ------------------------------------------------------------- */

dom.energyInput.addEventListener(
    "input",
    () => {

        dom.energyInputError.hidden =
            true;
    }
);


/* -------------------------------------------------------------
   Check vault
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
   Confirmation modal
   ------------------------------------------------------------- */

dom.confirmationModal
    .querySelector(".modal__backdrop")
    ?.addEventListener(
        "click",
        handleModalBackdropClick
    );


dom.checkResultModal
    .querySelector(".modal__backdrop")
    ?.addEventListener(
        "click",
        handleModalBackdropClick
    );


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
   Analytics period
   ------------------------------------------------------------- */

dom.periodButtons.forEach(
    button => {

        button.addEventListener(
            "click",
            () => {

                state.analyticsPeriod =
                    button.dataset.period;


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


        renderHistory();
    }
);


dom.historyStatusFilter.addEventListener(
    "change",
    event => {

        state.historyStatusFilter =
            event.target.value;


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


dom.settingVaultEnergyCost.addEventListener(
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

dom.notificationPermissionButton
    .addEventListener(
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
                : "Turn test mode on? The current recharge will be reset.",
            toggleTestMode
        );
    }
);


/* -------------------------------------------------------------
   Export
   ------------------------------------------------------------- */

dom.exportDataButton.addEventListener(
    "click",
    exportData
);


/* -------------------------------------------------------------
   Import
   ------------------------------------------------------------- */

dom.importDataButton.addEventListener(
    "click",
    importData
);


dom.importFileInput.addEventListener(
    "change",
    handleImportFile
);


/* -------------------------------------------------------------
   Clear history
   ------------------------------------------------------------- */

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


/* -------------------------------------------------------------
   Reset everything
   ------------------------------------------------------------- */

dom.resetApplicationButton.addEventListener(
    "click",
    () => {

        openConfirmation(
            "Reset the entire application and delete all saved data?",
            resetApplication
        );
    }
);


/* -------------------------------------------------------------
   Escape closes modals
   ------------------------------------------------------------- */

document.addEventListener(
    "keydown",
    event => {

        if (
            event.key ===
            "Escape"
        ) {

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
    }
);


/* =====================================================================
   RENDER ALL
   ===================================================================== */

function renderAll() {

    renderDashboard();

    renderAnalytics();

    renderHistory();

    updateSettingsUI();

    updateCheckModalPreview();
}


/* =====================================================================
   TIMER
   ===================================================================== */

let timer = null;

let lastSecond = null;


function startTimer() {

    if (timer !== null) {

        clearInterval(
            timer
        );
    }


    timer =
        setInterval(
            () => {

                const second =
                    Math.floor(
                        Date.now() /
                        1000
                    );


                if (
                    second ===
                    lastSecond
                ) {
                    return;
                }


                lastSecond =
                    second;


                const wasWaiting =
                    state.waitingForCheck;


                recomputeState();


                /*
                 * If a recharge became full during this tick,
                 * save the transition immediately.
                 */

                if (
                    !wasWaiting &&
                    state.waitingForCheck
                ) {

                    saveState();
                }


                renderDashboard();


                /*
                 * Only rerender the other pages when they are visible.
                 */

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


/* =====================================================================
   VISIBILITY / PAGE LIFECYCLE
   ===================================================================== */

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


/* =====================================================================
   INITIALIZATION
   ===================================================================== */

function initialize() {

    loadState();


    /*
     * Recover state if the app was closed
     * while the timer was running.
     */

    recomputeState();


    /*
     * If energy became full while the app was
     * closed, the FULL state is restored.
     */

    if (
        state.fullAt !== null &&
        now() >= state.fullAt
    ) {

        state.currentEnergy =
            config.maxEnergy;

        state.waitingForCheck =
            true;
    }


    /*
     * Recover impossible combinations.
     */

    if (
        state.waitingForCheck &&
        state.fullAt === null
    ) {

        state.waitingForCheck =
            false;
    }


    if (
        state.fullAt !== null &&
        state.trackingStartedAt === null
    ) {

        state.trackingStartedAt =
            now();
    }


    state.initialized =
        true;


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


/* =====================================================================
   START APPLICATION
   ===================================================================== */

initialize();


/* =====================================================================
   OPTIONAL DEBUG API
   ===================================================================== */

window.VaultTracker = {

    state,

    config,

    startTracking,

    recomputeState,

    renderAll,

    saveState,

    openCheckResultModal,

    navigateTo
};
