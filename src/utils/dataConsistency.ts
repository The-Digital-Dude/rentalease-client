export interface UserDataStructure {
  id: string;
  email: string;
  name: string;
  userType: string;
  avatar?: string | null;
  phone?: string | null;
}

export const validateUserData = (
  userData: any
): userData is UserDataStructure => {
  return (
    userData &&
    typeof userData === "object" &&
    typeof userData.id === "string" &&
    typeof userData.email === "string" &&
    typeof userData.name === "string" &&
    typeof userData.userType === "string" &&
    userData.id.length > 0 &&
    userData.email.length > 0 &&
    userData.name.length > 0 &&
    userData.userType.length > 0
  );
};

export const normalizeUserData = (userData: any): UserDataStructure | null => {
  if (!validateUserData(userData)) {
    console.error("Invalid user data structure:", userData);
    return null;
  }

  return {
    id: userData.id,
    email: userData.email,
    name: userData.name,
    userType: userData.userType,
    avatar: userData.avatar || null,
    phone: userData.phone || null,
  };
};

export const syncUserDataToLocalStorage = (
  userData: UserDataStructure
): boolean => {
  try {
    const normalizedData = normalizeUserData(userData);
    if (!normalizedData) {
      return false;
    }

    localStorage.setItem("userData", JSON.stringify(normalizedData));
    console.log("User data synced to localStorage:", normalizedData);
    return true;
  } catch (error) {
    console.error("Failed to sync user data to localStorage:", error);
    return false;
  }
};

export const getUserDataFromLocalStorage = (): UserDataStructure | null => {
  try {
    const userData = localStorage.getItem("userData");
    if (!userData) {
      return null;
    }

    const parsedData = JSON.parse(userData);
    return normalizeUserData(parsedData);
  } catch (error) {
    console.error("Failed to get user data from localStorage:", error);
    return null;
  }
};

export const clearUserDataFromStorage = (): void => {
  try {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userData");
    console.log("User data cleared from storage");
  } catch (error) {
    console.error("Failed to clear user data from storage:", error);
  }
};

export const logUserDataState = (context: string): void => {
  const token = localStorage.getItem("authToken");
  const userData = getUserDataFromLocalStorage();

  console.group(`User Data State - ${context}`);
  console.log("Auth Token:", token ? "Present" : "Missing");
  console.log("User Data:", userData);
  console.log("Is Valid:", validateUserData(userData));
  console.groupEnd();
};
