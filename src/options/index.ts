import type {CurrentUser} from "./current-user.ts";
import type {Icons} from "./icons.ts";
import type {Labels} from "./labels.ts";
import type {Misc} from "./misc.ts";
import {Functionalities} from "./functionalities.ts";

export interface CommentsOptions extends CurrentUser, Icons, Labels, Misc, Functionalities {
}