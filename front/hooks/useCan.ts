import { validateUserPermissions } from "../utils/validateUserPermissions";
import { useAuth } from "./useAuth";

type UseCanParams = {
  permissions?: string[];
  roles?: string[];
};

export function useCan({ permissions, roles }: UseCanParams) {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user) return false;

  return validateUserPermissions({ user, permissions, roles });
}
