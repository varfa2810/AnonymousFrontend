import { firstValueFrom } from "rxjs";
import { UserAuth } from "../services/user-auth";

export function initAuth(auth: UserAuth) {
    return () => firstValueFrom(auth.checkSession());
}