import { CurrentUser } from "../../domain.types/miscellaneous/current.user";
import { CurrentClient } from "../../domain.types/miscellaneous/current.client";

declare global{
    namespace Express {
        interface Request {
            currentUser: CurrentUser,
            currentClient: CurrentClient
            context: string,
            resourceOwnerUserId: string
        }
    }
}
