// AdMob service — web simulation that mirrors the mobile SDK contract.
// On native (Capacitor / RN), swap the body of loadAd / showAd to use the
// real AdMob SDK; the public API stays identical.

export const ADMOB_CONFIG = {
  // Web build can override via Vite env; defaults to the production IDs.
  appId:
    import.meta.env.VITE_ADMOB_APP_ID ||
    "ca-app-pub-6668827390288726~3495165098",
  rewardedAdUnitId:
    import.meta.env.VITE_ADMOB_REWARDED_AD_UNIT_ID ||
    "ca-app-pub-6668827390288726/9018954510",
};

export const FREE_HABIT_LIMIT = 2;
export const SIMULATED_AD_DURATION_SECONDS = 5;

export type RewardedAdReward = { type: "habit_slot"; amount: 1 };

let adLoaded = false;

/** Preload a rewarded video ad. On web, resolves instantly. */
export async function loadAd(): Promise<void> {
  // TODO mobile: await AdMob.prepareRewardVideoAd({ adId: ADMOB_CONFIG.rewardedAdUnitId });
  adLoaded = true;
}

/**
 * Show the rewarded ad. Resolves with the reward when the user has watched
 * the full ad, rejects if the ad is dismissed early.
 *
 * On web we delegate the UI (countdown) to a modal that calls back into
 * this function via the provided `onTick` callback.
 */
export async function showAd(options?: {
  onTick?: (secondsRemaining: number) => void;
  onDismiss?: () => void;
}): Promise<RewardedAdReward> {
  if (!adLoaded) await loadAd();
  // TODO mobile: const r = await AdMob.showRewardVideoAd(); return { type: "habit_slot", amount: 1 };
  return new Promise((resolve) => {
    let remaining = SIMULATED_AD_DURATION_SECONDS;
    options?.onTick?.(remaining);
    const interval = setInterval(() => {
      remaining -= 1;
      options?.onTick?.(remaining);
      if (remaining <= 0) {
        clearInterval(interval);
        adLoaded = false;
        resolve({ type: "habit_slot", amount: 1 });
      }
    }, 1000);
  });
}
