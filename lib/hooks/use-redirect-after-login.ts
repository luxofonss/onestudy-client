import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLocalStorage } from "./use-local-storage";
import { useAuth } from "./use-auth";

export const useRedirectAfterLogin = () => {
     const router = useRouter();
     const { isAuthenticated } = useAuth();
     const [redirectPath, setRedirectPath] = useLocalStorage<string | null>("redirectAfterLogin", null);

     useEffect(() => {
          if (isAuthenticated && redirectPath) {
               router.push(redirectPath);
               setRedirectPath(null);
          }
     }, [isAuthenticated, redirectPath, router, setRedirectPath]);

     return { redirectPath, setRedirectPath };
}; 