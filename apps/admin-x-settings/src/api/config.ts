import {createQuery} from '../utils/apiRequests';

export type JSONValue = string|number|boolean|null|Date|JSONObject|JSONArray;
export interface JSONObject { [key: string]: JSONValue }
export interface JSONArray extends Array<string|number|boolean|Date|JSONObject|JSONValue> {}

export type Config = {
    version: string;
    environment: string;
    editor: {
        url: string
        version: string
    };
    labs: Record<string, boolean>;
    stripeDirect: boolean;
    hostSettings?: {
        limits?: {
            // Partially typed, see https://github.com/TryGhost/SDK/tree/main/packages/limit-service
            customIntegrations?: {
                disabled: boolean;
            }
            staff?: {
                max?: number
                error?: string
            }
            members?: {
                max?: number
                error?: string
            }
            newsletters?: {
                max?: number
                error?: string
            }
        }
        billing?: {
            enabled?: boolean
            url?: string
        }
    }

    // Config is relatively fluid, so we only type used properties above and still support arbitrary property access when needed
    [key: string]: JSONValue | undefined;
};

export interface ConfigResponseType {
    config: Config;
}

const dataType = 'ConfigResponseType';

export const useBrowseConfig = createQuery<ConfigResponseType>({
    dataType,
    path: '/config/'
});
