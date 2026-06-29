import { http } from "./http";
import type { AppSetting } from "./types";

export const getSettings = () => {
  return http.get<AppSetting[]>("/api/settings");
};

export const updateSetting = (
  code: string,
  payload: Pick<AppSetting, "enabled" | "config">,
) => {
  return http.patch<AppSetting>(`/api/settings/${code}`, payload);
};
