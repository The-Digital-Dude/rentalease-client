export type UserType = "admin" | "agent";

export interface UserTypeConfig {
  loginPath: string;
  displayName: string;
  apiUserType: "admin" | "agent";
}

export const getUserTypeConfig = (userType: UserType): UserTypeConfig => {
  const configs: Record<UserType, UserTypeConfig> = {
    admin: {
      loginPath: "/login/admin",
      displayName: "Admin",
      apiUserType: "admin",
    },
    agent: {
      loginPath: "/login/agent",
      displayName: "Agent",
      apiUserType: "agent",
    },
  };

  return configs[userType];
};

export const getUserTypeFromUrl = (searchParams: URLSearchParams): UserType => {
  const type = searchParams.get("type") as UserType;
  return type && ["admin", "agent"].includes(type) ? type : "admin";
};

export const buildPasswordResetUrl = (
  page: "forgot-password" | "reset-password",
  userType: UserType
): string => {
  return `/${page}?type=${userType}`;
};
